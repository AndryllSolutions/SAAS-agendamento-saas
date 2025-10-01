"""
Dashboard Endpoints - Analytics and Metrics
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service
from app.models.review import Review

router = APIRouter()


@router.get("/overview")
async def get_dashboard_overview(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get dashboard overview with key metrics
    """
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Total appointments
    total_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    # Completed appointments
    completed_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    # Cancelled appointments
    cancelled_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.CANCELLED,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    # Total revenue
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == current_user.company_id,
        Payment.status == PaymentStatus.COMPLETED,
        Payment.created_at >= start_date,
        Payment.created_at <= end_date
    ).scalar() or 0
    
    # Pending payments
    pending_payments = db.query(func.sum(Payment.amount)).filter(
        Payment.company_id == current_user.company_id,
        Payment.status == PaymentStatus.PENDING,
        Payment.created_at >= start_date,
        Payment.created_at <= end_date
    ).scalar() or 0
    
    # Average rating
    avg_rating = db.query(func.avg(Review.rating)).filter(
        Review.company_id == current_user.company_id,
        Review.created_at >= start_date,
        Review.created_at <= end_date
    ).scalar() or 0
    
    # Total clients
    total_clients = db.query(func.count(func.distinct(Appointment.client_id))).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "appointments": {
            "total": total_appointments,
            "completed": completed_appointments,
            "cancelled": cancelled_appointments,
            "completion_rate": (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        },
        "revenue": {
            "total": float(total_revenue),
            "pending": float(pending_payments),
            "average_per_appointment": float(total_revenue / completed_appointments) if completed_appointments > 0 else 0
        },
        "clients": {
            "total": total_clients
        },
        "satisfaction": {
            "average_rating": float(avg_rating)
        }
    }


@router.get("/top-services")
async def get_top_services(
    limit: int = 10,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get top services by number of appointments
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    top_services = db.query(
        Service.id,
        Service.name,
        func.count(Appointment.id).label("appointment_count"),
        func.sum(Payment.amount).label("total_revenue")
    ).join(
        Appointment, Appointment.service_id == Service.id
    ).outerjoin(
        Payment, Payment.appointment_id == Appointment.id
    ).filter(
        Service.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).group_by(
        Service.id, Service.name
    ).order_by(
        func.count(Appointment.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "service_id": service.id,
            "service_name": service.name,
            "appointment_count": service.appointment_count,
            "total_revenue": float(service.total_revenue or 0)
        }
        for service in top_services
    ]


@router.get("/top-professionals")
async def get_top_professionals(
    limit: int = 10,
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get top professionals by number of appointments and ratings
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    top_professionals = db.query(
        User.id,
        User.full_name,
        func.count(Appointment.id).label("appointment_count"),
        func.avg(Review.rating).label("average_rating"),
        func.sum(Payment.amount).label("total_revenue")
    ).join(
        Appointment, Appointment.professional_id == User.id
    ).outerjoin(
        Review, Review.professional_id == User.id
    ).outerjoin(
        Payment, Payment.appointment_id == Appointment.id
    ).filter(
        User.company_id == current_user.company_id,
        User.role == "professional",
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).group_by(
        User.id, User.full_name
    ).order_by(
        func.count(Appointment.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "professional_id": prof.id,
            "professional_name": prof.full_name,
            "appointment_count": prof.appointment_count,
            "average_rating": float(prof.average_rating or 0),
            "total_revenue": float(prof.total_revenue or 0)
        }
        for prof in top_professionals
    ]


@router.get("/revenue-chart")
async def get_revenue_chart(
    period: str = "daily",  # daily, weekly, monthly
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get revenue data for charts
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # This is a simplified version - in production, you'd use date_trunc or similar
    revenue_data = db.query(
        func.date(Payment.created_at).label("date"),
        func.sum(Payment.amount).label("revenue")
    ).filter(
        Payment.company_id == current_user.company_id,
        Payment.status == PaymentStatus.COMPLETED,
        Payment.created_at >= start_date,
        Payment.created_at <= end_date
    ).group_by(
        func.date(Payment.created_at)
    ).order_by(
        func.date(Payment.created_at)
    ).all()
    
    return [
        {
            "date": data.date.isoformat(),
            "revenue": float(data.revenue)
        }
        for data in revenue_data
    ]


@router.get("/occupancy-rate")
async def get_occupancy_rate(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Calculate occupancy rate (appointments vs available slots)
    """
    if not start_date:
        start_date = datetime.utcnow()
    if not end_date:
        end_date = start_date + timedelta(days=7)
    
    # Count total appointments
    total_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.start_time >= start_date,
        Appointment.start_time <= end_date,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED])
    ).scalar()
    
    # Count professionals
    total_professionals = db.query(func.count(User.id)).filter(
        User.company_id == current_user.company_id,
        User.role == "professional",
        User.is_active == True
    ).scalar()
    
    # Calculate available slots (simplified: 8 hours * 60 min / 60 min slots = 8 slots per day per professional)
    days = (end_date - start_date).days
    available_slots = total_professionals * 8 * days
    
    occupancy_rate = (total_appointments / available_slots * 100) if available_slots > 0 else 0
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_appointments": total_appointments,
        "available_slots": available_slots,
        "occupancy_rate": occupancy_rate
    }
