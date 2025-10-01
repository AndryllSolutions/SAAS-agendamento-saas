"""
Appointments Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from app.core.database import get_db
from app.core.security import get_current_active_user, require_professional
from app.core.config import settings
from app.models.appointment import Appointment, AppointmentStatus
from app.models.service import Service
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentCancel,
    AppointmentCheckIn,
)
from app.services.appointment_notifications import AppointmentNotificationService

router = APIRouter()


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment
    """
    # Get service to calculate end time
    service = db.query(Service).filter(
        Service.id == appointment_data.service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    # Calculate end time
    end_time = appointment_data.start_time + timedelta(minutes=service.duration_minutes)
    
    # Check for conflicts
    conflicts = db.query(Appointment).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.professional_id == appointment_data.professional_id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
        Appointment.start_time < end_time,
        Appointment.end_time > appointment_data.start_time
    ).first()
    
    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário não disponível"
        )
    
    # Set client_id
    client_id = appointment_data.client_id or current_user.id
    
    # Generate check-in code
    check_in_code = secrets.token_urlsafe(8)
    
    # Create appointment
    appointment = Appointment(
        company_id=current_user.company_id,
        client_id=client_id,
        professional_id=appointment_data.professional_id,
        service_id=appointment_data.service_id,
        resource_id=appointment_data.resource_id,
        start_time=appointment_data.start_time,
        end_time=end_time,
        client_notes=appointment_data.client_notes,
        check_in_code=check_in_code,
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Enviar notificações lindas de confirmação
    try:
        # Buscar dados completos
        client = db.query(User).filter(User.id == client_id).first()
        professional = db.query(User).filter(User.id == appointment_data.professional_id).first()
        
        if client and professional:
            AppointmentNotificationService.send_booking_confirmation(
                db=db,
                client_name=client.full_name,
                client_email=client.email,
                client_phone=client.phone,
                service_name=service.name,
                service_price=float(service.price),
                professional_name=professional.full_name,
                appointment_datetime=appointment_data.start_time,
                user_id=client_id
            )
    except Exception as e:
        print(f"Erro ao enviar notificações: {e}")
        # Não falhar o agendamento se notificação falhar
    
    return appointment


@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    status_filter: str = None,
    professional_id: int = None,
    client_id: int = None,
    start_date: datetime = None,
    end_date: datetime = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List appointments
    """
    query = db.query(Appointment).filter(Appointment.company_id == current_user.company_id)
    
    # Filter by user role
    if current_user.role == "professional":
        query = query.filter(Appointment.professional_id == current_user.id)
    elif current_user.role == "client":
        query = query.filter(Appointment.client_id == current_user.id)
    
    # Apply filters
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    
    if professional_id:
        query = query.filter(Appointment.professional_id == professional_id)
    
    if client_id:
        query = query.filter(Appointment.client_id == client_id)
    
    if start_date:
        query = query.filter(Appointment.start_time >= start_date)
    
    if end_date:
        query = query.filter(Appointment.start_time <= end_date)
    
    appointments = query.order_by(Appointment.start_time.desc()).offset(skip).limit(limit).all()
    return appointments


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get appointment by ID
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Check permissions
    if current_user.role == "client" and appointment.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este agendamento"
        )
    
    if current_user.role == "professional" and appointment.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este agendamento"
        )
    
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update appointment
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Check permissions
    if current_user.role == "client" and appointment.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar este agendamento"
        )
    
    update_data = appointment_data.dict(exclude_unset=True)
    
    # Recalculate end_time if start_time changed
    if "start_time" in update_data:
        service = db.query(Service).filter(Service.id == appointment.service_id).first()
        update_data["end_time"] = update_data["start_time"] + timedelta(minutes=service.duration_minutes)
    
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    
    return appointment


@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: int,
    cancel_data: AppointmentCancel,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Cancel appointment
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Check cancellation deadline
    hours_until_appointment = (appointment.start_time - datetime.utcnow()).total_seconds() / 3600
    
    if hours_until_appointment < settings.CANCELLATION_DEADLINE_HOURS and current_user.role == "client":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cancelamento deve ser feito com pelo menos {settings.CANCELLATION_DEADLINE_HOURS} horas de antecedência"
        )
    
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.utcnow()
    appointment.cancelled_by = current_user.id
    appointment.cancellation_reason = cancel_data.cancellation_reason
    
    db.commit()
    db.refresh(appointment)
    
    # TODO: Notify waitlist
    
    return appointment


@router.post("/{appointment_id}/check-in", response_model=AppointmentResponse)
async def check_in_appointment(
    appointment_id: int,
    check_in_data: AppointmentCheckIn,
    current_user: User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """
    Check-in appointment with QR code (Professional only)
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id,
        Appointment.check_in_code == check_in_data.check_in_code
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado ou código inválido"
        )
    
    appointment.status = AppointmentStatus.CHECKED_IN
    appointment.checked_in_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    
    return appointment
