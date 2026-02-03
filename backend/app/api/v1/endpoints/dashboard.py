"""
Dashboard Endpoints - Analytics and Metrics
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.cache import get_cache, set_cache, delete_pattern
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service
from app.models.review import Review
from app.models.command import Command, CommandStatus
# from app.models.service_category import ServiceCategory  # Model não existe ainda

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.get("/overview")
async def get_dashboard_overview(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get dashboard overview with key metrics (Cached for 5 minutes)
    """
    # Cache key
    cache_key = f"dashboard:overview:{current_user.company_id}:{start_date}:{end_date}"
    
    # Try cache first
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
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
    
    # ✅ CORREÇÃO: Total revenue de FinancialTransactions E Commands finalizadas
    from app.models.financial import FinancialTransaction, TransactionStatus
    from app.models.command import Command, CommandStatus
    
    # Revenue de transações financeiras liquidadas
    total_revenue_transactions = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "income",
        FinancialTransaction.status == "liquidated",
        FinancialTransaction.date >= start_date,
        FinancialTransaction.date <= end_date
    ).scalar() or 0
    
    # Revenue de comandas finalizadas (caso não tenha transação)
    total_revenue_commands = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= start_date,
        Command.date <= end_date
    ).scalar() or 0
    
    # Usar o maior valor (evitar duplicação se comanda já virou transação)
    total_revenue = max(float(total_revenue_transactions), float(total_revenue_commands))
    
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
    total_clients = db.query(func.count(func.distinct(Appointment.client_crm_id))).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date,
        Appointment.client_crm_id.isnot(None)
    ).scalar()
    
    result = {
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
    
    # Cache result for 5 minutes
    await set_cache(cache_key, result, ttl=300)
    
    return result


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
        User.role == UserRole.PROFESSIONAL,
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
        User.role == UserRole.PROFESSIONAL,
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


@router.get("/daily-sales")
async def get_daily_sales(
    target_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get sales for a specific day
    """
    if not target_date:
        target_date = datetime.utcnow()
    
    # Start and end of the day
    start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Revenue from financial transactions
    from app.models.financial import FinancialTransaction
    
    daily_revenue = db.query(func.sum(FinancialTransaction.value)).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.type == "income",
        FinancialTransaction.status == "liquidated",
        FinancialTransaction.date >= start_of_day,
        FinancialTransaction.date <= end_of_day
    ).scalar() or 0
    
    # Revenue from commands
    daily_revenue_commands = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= start_of_day,
        Command.date <= end_of_day
    ).scalar() or 0
    
    total_daily_sales = max(float(daily_revenue), float(daily_revenue_commands))
    
    return {
        "date": target_date.date().isoformat(),
        "total_sales": total_daily_sales,
        "transactions_count": db.query(func.count(FinancialTransaction.id)).filter(
            FinancialTransaction.company_id == current_user.company_id,
            FinancialTransaction.type == "income",
            FinancialTransaction.date >= start_of_day,
            FinancialTransaction.date <= end_of_day
        ).scalar()
    }


@router.get("/commands-stats")
async def get_commands_stats(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get commands statistics with conversion rate
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Total commands
    total_commands = db.query(func.count(Command.id)).filter(
        Command.company_id == current_user.company_id,
        Command.date >= start_date,
        Command.date <= end_date
    ).scalar()
    
    # Finished commands
    finished_commands = db.query(func.count(Command.id)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= start_date,
        Command.date <= end_date
    ).scalar()
    
    # Total appointments in period
    total_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    # Conversion rate (comandas / agendamentos)
    conversion_rate = (total_commands / total_appointments * 100) if total_appointments > 0 else 0
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "total_commands": total_commands,
        "finished_commands": finished_commands,
        "total_revenue": float(db.query(func.sum(Command.net_value)).filter(
            Command.company_id == current_user.company_id,
            Command.status == CommandStatus.FINISHED,
            Command.date >= start_date,
            Command.date <= end_date
        ).scalar() or 0),
        "conversion_rate": conversion_rate
    }


@router.get("/appointments-by-status")
async def get_appointments_by_status(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get appointments grouped by status
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    appointments_by_status = db.query(
        Appointment.status,
        func.count(Appointment.id).label('count')
    ).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).group_by(Appointment.status).all()
    
    total = sum([item.count for item in appointments_by_status])
    
    return {
        "total": total,
        "by_status": [
            {
                "status": item.status.value,
                "count": item.count,
                "percentage": (item.count / total * 100) if total > 0 else 0
            }
            for item in appointments_by_status
        ]
    }


@router.get("/average-ticket")
async def get_average_ticket(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get average ticket with comparison to previous period
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Current period
    from app.models.financial import FinancialTransaction
    
    current_revenue = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= start_date,
        Command.date <= end_date
    ).scalar() or 0
    
    current_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    current_avg = float(current_revenue) / current_appointments if current_appointments > 0 else 0
    
    # Previous period
    period_duration = (end_date - start_date).days
    prev_start = start_date - timedelta(days=period_duration)
    prev_end = start_date
    
    prev_revenue = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= prev_start,
        Command.date < prev_end
    ).scalar() or 0
    
    prev_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= prev_start,
        Appointment.created_at < prev_end
    ).scalar()
    
    prev_avg = float(prev_revenue) / prev_appointments if prev_appointments > 0 else 0
    
    # Calculate change percentage
    change_percentage = ((current_avg - prev_avg) / prev_avg * 100) if prev_avg > 0 else 0
    
    return {
        "current_period": {
            "average_ticket": current_avg,
            "total_revenue": float(current_revenue),
            "appointments": current_appointments
        },
        "previous_period": {
            "average_ticket": prev_avg,
            "total_revenue": float(prev_revenue),
            "appointments": prev_appointments
        },
        "change_percentage": change_percentage
    }


@router.get("/sales-by-category")
async def get_sales_by_category(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get sales grouped by service category
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get sales by service (ServiceCategory model doesn't exist yet)
    from app.models.command import CommandItem
    
    # Group by service directly since ServiceCategory doesn't exist
    sales_by_category = []  # Skip category query for now
    
    # Group by service directly since ServiceCategory doesn't exist
    try:
        sales_by_service = db.query(
            Service.name.label('category'),
            func.sum(Service.price).label('total')
        ).join(
            Appointment, Appointment.service_id == Service.id
        ).filter(
            Service.company_id == current_user.company_id,
            Appointment.status == AppointmentStatus.COMPLETED,
            Appointment.created_at >= start_date,
            Appointment.created_at <= end_date
        ).group_by(Service.name).all()
        
        total = sum([float(item.total or 0) for item in sales_by_service])
        
        return {
            "total": total,
            "by_category": [
                {
                    "category": item.category,
                    "total": float(item.total or 0),
                    "percentage": (float(item.total or 0) / total * 100) if total > 0 else 0
                }
                for item in sales_by_service
            ]
        }
    except Exception as e:
        # Return empty data if query fails
        return {
            "total": 0,
            "by_category": []
        }


@router.get("/appointments-funnel")
async def get_appointments_funnel(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get appointments funnel: All -> Confirmed -> Billed
    """
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
    
    # Confirmed (confirmed + completed)
    confirmed_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]),
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    # Billed (completed appointments with commands)
    # Use completed appointments as billed since CommandItem.appointment_id doesn't exist
    billed_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).scalar()
    
    return {
        "all": {
            "count": total_appointments,
            "percentage": 100
        },
        "confirmed": {
            "count": confirmed_appointments,
            "percentage": (confirmed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        },
        "billed": {
            "count": billed_appointments,
            "percentage": (billed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        }
    }


@router.get("/professional-occupancy")
async def get_professional_occupancy(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get occupancy rate per professional
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=7)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get all active professionals
    professionals = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL,
        User.is_active == True
    ).all()
    
    result = []
    days = (end_date - start_date).days
    
    for prof in professionals:
        # Count appointments for this professional
        appointments = db.query(func.count(Appointment.id)).filter(
            Appointment.company_id == current_user.company_id,
            Appointment.professional_id == prof.id,
            Appointment.start_time >= start_date,
            Appointment.start_time <= end_date,
            Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED])
        ).scalar()
        
        # Calculate available slots (8 hours * days)
        available_slots = 8 * days
        occupancy = (appointments / available_slots * 100) if available_slots > 0 else 0
        
        result.append({
            "professional_id": prof.id,
            "professional_name": prof.full_name,
            "appointments": appointments,
            "available_slots": available_slots,
            "occupancy_rate": occupancy,
            "status": "high" if occupancy >= 70 else "moderate" if occupancy >= 40 else "low"
        })
    
    # Sort by occupancy rate
    result.sort(key=lambda x: x["occupancy_rate"], reverse=True)
    
    return result


@router.get("/heatmap")
async def get_appointments_heatmap(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get appointments heatmap (day of week x hour)
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get appointments grouped by day of week and hour
    heatmap_data = db.query(
        extract('dow', Appointment.start_time).label('day_of_week'),
        extract('hour', Appointment.start_time).label('hour'),
        func.count(Appointment.id).label('count')
    ).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.start_time >= start_date,
        Appointment.start_time <= end_date
    ).group_by('day_of_week', 'hour').all()
    
    # Initialize heatmap matrix (7 days x 24 hours)
    heatmap = [[0 for _ in range(24)] for _ in range(7)]
    
    # Fill the matrix
    for item in heatmap_data:
        day = int(item.day_of_week)  # 0 = Sunday, 6 = Saturday
        hour = int(item.hour)
        count = item.count
        heatmap[day][hour] = count
    
    return {
        "heatmap": heatmap,
        "days": ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
        "hours": list(range(24))
    }


@router.get("/appointments-trend")
async def get_appointments_trend(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get appointments trend over time (daily)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily appointments count
    daily_data = db.query(
        func.date(Appointment.created_at).label('date'),
        func.count(Appointment.id).label('count')
    ).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= start_date,
        Appointment.created_at <= end_date
    ).group_by(func.date(Appointment.created_at)).order_by('date').all()
    
    # Fill missing dates with 0
    date_dict = {item.date: item.count for item in daily_data}
    result = []
    current = start_date.date()
    
    while current <= end_date.date():
        result.append({
            "date": current.isoformat(),
            "label": current.strftime("%d/%m"),
            "value": date_dict.get(current, 0)
        })
        current += timedelta(days=1)
    
    return {
        "period": {
            "start_date": start_date.date().isoformat(),
            "end_date": end_date.date().isoformat(),
            "days": days
        },
        "data": result
    }


@router.get("/revenue-trend")
async def get_revenue_trend(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get revenue trend over time (daily)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily revenue from commands
    daily_data = db.query(
        func.date(Command.date).label('date'),
        func.sum(Command.net_value).label('revenue'),
        func.count(Command.id).label('count')
    ).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= start_date,
        Command.date <= end_date
    ).group_by(func.date(Command.date)).order_by('date').all()
    
    # Fill missing dates with 0
    date_dict = {item.date: {'revenue': float(item.revenue or 0), 'count': item.count} for item in daily_data}
    result = []
    current = start_date.date()
    
    while current <= end_date.date():
        data = date_dict.get(current, {'revenue': 0, 'count': 0})
        result.append({
            "date": current.isoformat(),
            "label": current.strftime("%d/%m"),
            "value": data['revenue'],
            "count": data['count']
        })
        current += timedelta(days=1)
    
    return {
        "period": {
            "start_date": start_date.date().isoformat(),
            "end_date": end_date.date().isoformat(),
            "days": days
        },
        "data": result
    }


@router.get("/commands-trend")
async def get_commands_trend(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get commands trend over time (daily)
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily commands count
    daily_data = db.query(
        func.date(Command.date).label('date'),
        func.count(Command.id).label('count')
    ).filter(
        Command.company_id == current_user.company_id,
        Command.date >= start_date,
        Command.date <= end_date
    ).group_by(func.date(Command.date)).order_by('date').all()
    
    # Fill missing dates with 0
    date_dict = {item.date: item.count for item in daily_data}
    result = []
    current = start_date.date()
    
    while current <= end_date.date():
        result.append({
            "date": current.isoformat(),
            "label": current.strftime("%d/%m"),
            "value": date_dict.get(current, 0)
        })
        current += timedelta(days=1)
    
    return {
        "period": {
            "start_date": start_date.date().isoformat(),
            "end_date": end_date.date().isoformat(),
            "days": days
        },
        "data": result
    }


@router.get("/growth-metrics")
async def get_growth_metrics(
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Get growth metrics comparing current period vs previous period
    """
    # Define periods (last 7 days vs previous 7 days)
    current_end = datetime.utcnow()
    current_start = current_end - timedelta(days=7)
    previous_end = current_start
    previous_start = previous_end - timedelta(days=7)
    
    # Current period metrics
    current_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= current_start,
        Appointment.created_at <= current_end
    ).scalar() or 0
    
    current_revenue = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= current_start,
        Command.date <= current_end
    ).scalar() or 0
    
    current_commands = db.query(func.count(Command.id)).filter(
        Command.company_id == current_user.company_id,
        Command.date >= current_start,
        Command.date <= current_end
    ).scalar() or 0
    
    current_completed = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= current_start,
        Appointment.created_at <= current_end
    ).scalar() or 0
    
    # Previous period metrics
    previous_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.created_at >= previous_start,
        Appointment.created_at < previous_end
    ).scalar() or 0
    
    previous_revenue = db.query(func.sum(Command.net_value)).filter(
        Command.company_id == current_user.company_id,
        Command.status == CommandStatus.FINISHED,
        Command.date >= previous_start,
        Command.date < previous_end
    ).scalar() or 0
    
    previous_commands = db.query(func.count(Command.id)).filter(
        Command.company_id == current_user.company_id,
        Command.date >= previous_start,
        Command.date < previous_end
    ).scalar() or 0
    
    previous_completed = db.query(func.count(Appointment.id)).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.status == AppointmentStatus.COMPLETED,
        Appointment.created_at >= previous_start,
        Appointment.created_at < previous_end
    ).scalar() or 0
    
    # Calculate growth percentages
    def calc_growth(current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return ((current - previous) / previous) * 100
    
    return {
        "appointments": {
            "current": current_appointments,
            "previous": previous_appointments,
            "growth_percentage": calc_growth(current_appointments, previous_appointments)
        },
        "revenue": {
            "current": float(current_revenue),
            "previous": float(previous_revenue),
            "growth_percentage": calc_growth(float(current_revenue), float(previous_revenue))
        },
        "commands": {
            "current": current_commands,
            "previous": previous_commands,
            "growth_percentage": calc_growth(current_commands, previous_commands)
        },
        "completed_appointments": {
            "current": current_completed,
            "previous": previous_completed,
            "growth_percentage": calc_growth(current_completed, previous_completed)
        }
    }
