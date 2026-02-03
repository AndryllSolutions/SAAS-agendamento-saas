"""
Calendar Day Aggregated Endpoint
Retorna professionals + appointments + busy_blocks em 1 chamada
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.models.service import Service
from app.schemas.appointment import (
    CalendarDayResponse,
    CalendarProfessional,
    CalendarAppointment,
    BusyBlock,
    AppointmentItem,
    AppointmentCalendarClient
)

router = APIRouter(redirect_slashes=False)


@router.get("/day", response_model=CalendarDayResponse)
async def get_calendar_day(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all calendar data for a specific day in ONE call
    Returns: professionals + appointments + busy_blocks
    
    Optimized for calendar grid rendering
    """
    # Parse date
    try:
        target_date = datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Date range for the day
    start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # 1. Get all active professionals
    professionals_query = db.query(User).filter(
        User.company_id == current_user.company_id,
        User.role.in_([UserRole.PROFESSIONAL, UserRole.OWNER, UserRole.MANAGER]),
        User.is_active == True
    ).order_by(User.full_name)
    
    professionals = professionals_query.all()
    
    # 2. Get all appointments for the day (including blocks)
    appointments_query = db.query(Appointment).options(
        joinedload(Appointment.client_crm),
        joinedload(Appointment.professional),
        joinedload(Appointment.service)
    ).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.start_time >= start_of_day,
        Appointment.start_time <= end_of_day,
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED  # Include cancelled for busy blocks
        ])
    ).order_by(Appointment.start_time)
    
    all_appointments = appointments_query.all()
    
    # 3. Separate appointments from busy blocks
    calendar_appointments = []
    busy_blocks = []
    
    for apt in all_appointments:
        # Busy block: service_id is NULL OR status is CANCELLED
        if apt.service_id is None or apt.status == AppointmentStatus.CANCELLED:
            # Extract reason from internal_notes
            reason = "Ocupado"
            if apt.internal_notes:
                reason = apt.internal_notes.replace("BLOQUEIO: ", "").strip()
            elif apt.status == AppointmentStatus.CANCELLED:
                reason = apt.cancellation_reason or "Cancelado"
            
            busy_blocks.append(BusyBlock(
                id=apt.id,
                professional_id=apt.professional_id,
                start_time=apt.start_time,
                end_time=apt.end_time,
                reason=reason
            ))
        else:
            # Regular appointment - convert to CalendarAppointment with items
            client_data = None
            if apt.client_crm:
                client_data = AppointmentCalendarClient(
                    id=apt.client_crm.id,
                    full_name=apt.client_crm.full_name,
                    phone=apt.client_crm.phone,
                    cellphone=apt.client_crm.cellphone
                )
            
            # Create appointment item (single service for now, ready for multi-service)
            items = []
            if apt.service:
                duration = int((apt.end_time - apt.start_time).total_seconds() / 60)
                items.append(AppointmentItem(
                    service_id=apt.service.id,
                    service_name=apt.service.name,
                    professional_id=apt.professional_id,
                    start_time=apt.start_time,
                    end_time=apt.end_time,
                    duration_minutes=duration,
                    price=float(apt.service.price) if apt.service.price else None
                ))
            
            calendar_appointments.append(CalendarAppointment(
                id=apt.id,
                start_time=apt.start_time,
                end_time=apt.end_time,
                status=apt.status.value,
                color=None,  # Frontend will apply color based on status
                client=client_data,
                items=items,
                notes=apt.client_notes,
                professional_id=apt.professional_id
            ))
    
    # 4. Build response
    professionals_response = [
        CalendarProfessional(
            id=prof.id,
            full_name=prof.full_name,
            avatar_url=prof.avatar_url,
            email=prof.email,
            phone=prof.phone,
            working_hours=prof.working_hours
        )
        for prof in professionals
    ]
    
    return CalendarDayResponse(
        date=date,
        professionals=professionals_response,
        appointments=calendar_appointments,
        busy_blocks=busy_blocks
    )
