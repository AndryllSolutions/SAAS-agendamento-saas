"""
Appointments Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Response

from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
import secrets

from app.core.database import get_db
from app.core.security import get_current_active_user, require_professional
from app.core.config import settings
from app.core.cache import get_cache, set_cache
from app.models.appointment import Appointment, AppointmentStatus
from app.models.service import Service
from app.models.user import User, UserRole
from app.models.client import Client
from app.models.company import Company
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentCalendarResponse,
    AppointmentCancel,
    AppointmentCheckIn,
    PublicAppointmentCreate,
    AppointmentMoveRequest,
)
from app.services.appointment_notifications import AppointmentNotificationService
from app.services.notification_helper import NotificationHelper

router = APIRouter(
    redirect_slashes=False  # DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== VALIDATION HELPERS ==========

def validate_business_hours(company: Company, start_time: datetime):
    """Validate appointment is within business hours"""
    if not company.business_hours:
        return  # No restriction if business hours not configured
    
    # Get weekday name (monday, tuesday, etc.)
    weekday = start_time.strftime('%A').lower()
    hours = company.business_hours.get(weekday)
    
    if not hours or hours.get('closed'):
        weekday_pt = {
            'monday': 'segunda-feira',
            'tuesday': 'terça-feira',
            'wednesday': 'quarta-feira',
            'thursday': 'quinta-feira',
            'friday': 'sexta-feira',
            'saturday': 'sábado',
            'sunday': 'domingo'
        }.get(weekday, weekday)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Empresa fechada em {weekday_pt}"
        )
    
    # Check if time is within business hours
    start_str = start_time.strftime('%H:%M')
    if start_str < hours.get('start', '00:00') or start_str >= hours.get('end', '23:59'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Horário fora do expediente. Funcionamento: {hours.get('start')} às {hours.get('end')}"
        )


def validate_professional_hours(professional: User, start_time: datetime):
    """Validate professional is available at requested time"""
    if not professional.working_hours:
        return  # No restriction if working hours not configured
    
    # Get weekday name
    weekday = start_time.strftime('%A').lower()
    hours = professional.working_hours.get(weekday)
    
    if not hours:
        weekday_pt = {
            'monday': 'segunda-feira',
            'tuesday': 'terça-feira',
            'wednesday': 'quarta-feira',
            'thursday': 'quinta-feira',
            'friday': 'sexta-feira',
            'saturday': 'sábado',
            'sunday': 'domingo'
        }.get(weekday, weekday)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profissional {professional.full_name} não trabalha em {weekday_pt}"
        )
    
    # Check if time is within working hours
    start_str = start_time.strftime('%H:%M')
    if start_str < hours.get('start', '00:00') or start_str >= hours.get('end', '23:59'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profissional indisponível. Horários de {professional.full_name}: {hours.get('start')} às {hours.get('end')}"
        )


def apply_company_timezone(company: Company, start_time: datetime) -> datetime:
    """Apply company timezone to datetime - returns naive datetime for DB compatibility"""
    try:
        from zoneinfo import ZoneInfo
        company_tz = ZoneInfo(company.timezone or 'America/Sao_Paulo')
        
        # If datetime has timezone, convert to company timezone first
        if start_time.tzinfo is not None:
            start_time = start_time.astimezone(company_tz)
        
        # CORREÇÃO: Always return naive datetime for DB compatibility
        # Remove timezone info to avoid "can't compare offset-naive and offset-aware" errors
        return start_time.replace(tzinfo=None)
    except Exception as e:
        # Fallback: if timezone conversion fails, use naive datetime
        print(f"Warning: Timezone conversion failed: {str(e)}")
        return start_time.replace(tzinfo=None) if start_time.tzinfo else start_time


def _parse_datetime_query(value: Optional[str], field_name: str) -> Optional[datetime]:
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    try:
        normalized = value.strip()
        if normalized.endswith('Z'):
            normalized = normalized[:-1] + '+00:00'
        return datetime.fromisoformat(normalized)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name} inválido. Use ISO-8601 (ex.: 2026-01-23T03:00:00.000Z)"
        )


@router.post("/public", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_public_appointment(
    appointment_data: PublicAppointmentCreate,
    response: Response,
    request: Request,
    company_slug: str = Query(None, description="Company slug for filtering"),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment without authentication (public booking)
    Supports filtering by company slug
    """
    # Get company by slug or default to first company
    if company_slug:
        company = db.query(Company).filter(Company.slug == company_slug).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa não encontrada"
            )
    else:
        # Fallback to first company for backward compatibility
        company = db.query(Company).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhuma empresa encontrada"
            )
    
    # Get service
    service = db.query(Service).filter(
        Service.id == appointment_data.service_id,
        Service.company_id == company.id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    # Get professional (optional - can be None for "no preference")
    professional = None
    if appointment_data.professional_id:
        professional = db.query(User).filter(
            User.id == appointment_data.professional_id,
            User.company_id == company.id,
            User.role.in_([UserRole.PROFESSIONAL, UserRole.OWNER, UserRole.MANAGER])
        ).first()
        
        if not professional:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profissional não encontrado"
            )
    
    # CORREÇÃO: Apply company timezone
    start_time_local = apply_company_timezone(company, appointment_data.start_time)
    
    # CORREÇÃO: Validate business hours
    validate_business_hours(company, start_time_local)
    
    # CORREÇÃO: Validate professional hours (only if professional is selected)
    if professional:
        validate_professional_hours(professional, start_time_local)
    
    # Calculate end time
    end_time = start_time_local + timedelta(minutes=service.duration_minutes)
    
    # Create or get client
    client = None
    if appointment_data.client_email or appointment_data.client_phone:
        # Try to find existing client
        client = db.query(Client).filter(
            Client.company_id == company.id,
            (Client.email == appointment_data.client_email) | (Client.phone == appointment_data.client_phone)
        ).first()
        
        if not client:
            # Create new client
            client = Client(
                company_id=company.id,
                full_name=appointment_data.client_name,
                email=appointment_data.client_email,
                phone=appointment_data.client_phone
            )
            db.add(client)
            db.commit()
            db.refresh(client)
    
    existing_appointment = db.query(Appointment).filter(
        Appointment.company_id == company.id,
        Appointment.professional_id == appointment_data.professional_id,
        Appointment.service_id == appointment_data.service_id,
        Appointment.start_time == start_time_local,
        Appointment.end_time == end_time,
        Appointment.client_crm_id == (client.id if client else None),
        Appointment.client_notes == appointment_data.client_notes,
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS
        ])
    ).first()

    if existing_appointment:
        response.status_code = status.HTTP_200_OK
        return AppointmentResponse.model_validate(existing_appointment)
    
    # CORREÇÃO: Check for conflicts (only if professional is selected)
    if professional:
        conflicts = db.query(Appointment).filter(
            Appointment.company_id == company.id,
            Appointment.professional_id == appointment_data.professional_id,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_PROGRESS
            ]),
            Appointment.start_time < end_time,
            Appointment.end_time > start_time_local
        ).first()
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Horário não disponível. Profissional já possui compromisso neste horário."
            )
    
    # Generate check-in code
    check_in_code = secrets.token_urlsafe(8)
    
    # Create appointment
    appointment = Appointment(
        company_id=company.id,
        client_crm_id=client.id if client else None,
        professional_id=appointment_data.professional_id,
        service_id=appointment_data.service_id,
        start_time=start_time_local,
        end_time=end_time,
        client_notes=appointment_data.client_notes,
        check_in_code=check_in_code,
        status=AppointmentStatus.PENDING
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Send notifications
    try:
        AppointmentNotificationService.send_booking_confirmation(
            db=db,
            client_name=appointment_data.client_name,
            client_email=appointment_data.client_email,
            client_phone=appointment_data.client_phone,
            professional_name=professional.full_name if professional else "",
            service_name=service.name,
            start_time=appointment_data.start_time,
            company_name=company.name,
            company_id=company.id,
            check_in_code=check_in_code,
            user_id=client.user_id if client and client.user_id else None
        )
    except Exception as e:
        # Log error but don't fail the booking
        print(f"Error sending notification: {e}")
        import traceback
        traceback.print_exc()
    
    return AppointmentResponse.model_validate(appointment)


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_appointment(
    appointment_data: AppointmentCreate,
    response: Response,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment
    """
    # Get company
    company = db.query(Company).filter(
        Company.id == current_user.company_id
    ).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    if not appointment_data.professional_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="professional_id é obrigatório"
        )
    
    # Get professional
    professional = db.query(User).filter(
        User.id == appointment_data.professional_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    # CORREÇÃO: Apply company timezone
    start_time_local = apply_company_timezone(company, appointment_data.start_time)
    
    service = None
    end_time = None
    
    # Normal appointment (requires service)
    if appointment_data.service_id is not None:
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
        
        # CORREÇÃO: Validate business hours
        validate_business_hours(company, start_time_local)
        
        # CORREÇÃO: Validate professional hours
        validate_professional_hours(professional, start_time_local)
        
        # Calculate end time
        end_time = start_time_local + timedelta(minutes=service.duration_minutes)
    else:
        # Block appointment (service_id is NULL)
        if not appointment_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="end_time é obrigatório quando service_id é null"
            )
        
        end_time_local = apply_company_timezone(company, appointment_data.end_time)
        if end_time_local <= start_time_local:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="end_time deve ser maior que start_time"
            )
        
        end_time = end_time_local
        
        # Validar horários também para bloqueios
        validate_business_hours(company, start_time_local)
        validate_professional_hours(professional, start_time_local)
    
    existing_appointment = db.query(Appointment).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.professional_id == appointment_data.professional_id,
        Appointment.service_id == appointment_data.service_id,
        Appointment.resource_id == appointment_data.resource_id,
        Appointment.start_time == start_time_local,
        Appointment.end_time == end_time,
        Appointment.client_crm_id == (appointment_data.client_id or None),
        Appointment.client_notes == appointment_data.client_notes,
        Appointment.internal_notes == appointment_data.internal_notes,
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS
        ])
    ).first()
    
    if existing_appointment:
        response.status_code = status.HTTP_200_OK
        return AppointmentResponse.model_validate(existing_appointment)
    
    # CORREÇÃO: Check for conflicts (including CHECKED_IN and IN_PROGRESS)
    # Apenas verifica conflitos se force_overlap=False
    if not appointment_data.force_overlap:
        conflicts = db.query(Appointment).filter(
            Appointment.company_id == current_user.company_id,
            Appointment.professional_id == appointment_data.professional_id,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_PROGRESS
            ]),
            Appointment.start_time < end_time,
            Appointment.end_time > start_time_local
        ).first()
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Horário não disponível. Profissional já possui compromisso neste horário."
            )
    
    # Set client_id
    client_crm_id = appointment_data.client_id or None
    
    # Generate check-in code
    check_in_code = secrets.token_urlsafe(8)
    
    # Create appointment
    appointment = Appointment(
        company_id=current_user.company_id,
        client_crm_id=client_crm_id,
        professional_id=appointment_data.professional_id,
        service_id=appointment_data.service_id,
        resource_id=appointment_data.resource_id,
        start_time=start_time_local,
        end_time=end_time,
        client_notes=appointment_data.client_notes,
        internal_notes=appointment_data.internal_notes,
        check_in_code=check_in_code,
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Enviar notificações de confirmação
    try:
        # Verificar se deve enviar notificacao de novo agendamento
        if service and NotificationHelper.should_send_notification(db, current_user.company_id, 'new_appointment'):
            # Buscar dados do cliente
            client = None
            if client_crm_id:
                client = db.query(Client).filter(Client.id == client_crm_id).first()
            
            if client and client.email:
                AppointmentNotificationService.send_booking_confirmation(
                    db=db,
                    client_name=client.full_name,
                    client_email=client.email,
                    client_phone=client.phone or client.cellphone,
                    professional_name=professional.full_name,
                    service_name=service.name,
                    start_time=start_time_local,
                    company_name=company.name,
                    company_id=company.id,
                    check_in_code=check_in_code,
                    user_id=client.user_id
                )
    except Exception as e:
        print(f"Erro ao enviar notificações: {e}")
        import traceback
        traceback.print_exc()
        # Não falhar o agendamento se notificação falhar
    
    return appointment


@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: int,
    new_start_time: datetime,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Reschedule appointment to a new time
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
    if current_user.role == "client":
        from app.models.client import Client
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or appointment.client_crm_id != client.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este agendamento"
            )
    
    # Get company for timezone
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # Apply company timezone
    new_start_time_local = apply_company_timezone(company, new_start_time)
    
    # Validate business hours
    validate_business_hours(company, new_start_time_local)
    
    # Validate professional hours
    professional = db.query(User).filter(User.id == appointment.professional_id).first()
    validate_professional_hours(professional, new_start_time_local)
    
    # Get service to calculate new end time
    service = None
    if appointment.service_id is None:
        duration = appointment.end_time - appointment.start_time
        new_end_time = new_start_time_local + duration
    else:
        service = db.query(Service).filter(Service.id == appointment.service_id).first()
        new_end_time = new_start_time_local + timedelta(minutes=service.duration_minutes)
    
    # Check for conflicts (excluding current appointment)
    conflicts = db.query(Appointment).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.professional_id == appointment.professional_id,
        Appointment.id != appointment_id,  # Exclude current appointment
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS
        ]),
        Appointment.start_time < new_end_time,
        Appointment.end_time > new_start_time_local
    ).first()
    
    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário não disponível. Profissional já possui compromisso neste horário."
        )
    
    # Update appointment times
    old_start_time = appointment.start_time
    appointment.start_time = new_start_time_local
    appointment.end_time = new_end_time
    
    # Reset status to PENDING if it was CONFIRMED
    if appointment.status == AppointmentStatus.CONFIRMED:
        appointment.status = AppointmentStatus.PENDING
    
    db.commit()
    db.refresh(appointment)
    
    # Send rescheduling notification
    try:
        if appointment.client_crm:
            client = appointment.client_crm
            
            AppointmentNotificationService.send_booking_confirmation(
                db=db,
                client_name=client.full_name,
                client_email=client.email,
                client_phone=client.phone or client.cellphone,
                professional_name=professional.full_name,
                service_name=service.name if service else "",
                start_time=new_start_time_local,
                company_name=company.name,
                company_id=company.id,
                check_in_code=appointment.check_in_code,
                user_id=client.user_id
            )
    except Exception as e:
        print(f"Erro ao enviar notificação de reagendamento: {e}")
    
    return appointment

@router.get("/calendar", response_model=List[AppointmentCalendarResponse])
async def get_appointments_calendar(
    start_date: str,
    end_date: str,
    professional_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get appointments for calendar view (filtered by date range)
    Optimized for calendar rendering with date range filtering
    """
    start_date_dt = _parse_datetime_query(start_date, 'start_date')
    end_date_dt = _parse_datetime_query(end_date, 'end_date')

    query = db.query(Appointment).options(
        joinedload(Appointment.client_crm),
        joinedload(Appointment.professional),
        joinedload(Appointment.service),
        joinedload(Appointment.resource)
    ).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.start_time >= start_date_dt,
        Appointment.start_time <= end_date_dt,
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS
        ])
    )
    
    # Filter by user role
    if current_user.role == UserRole.PROFESSIONAL:
        query = query.filter(Appointment.professional_id == current_user.id)
    elif current_user.role == UserRole.CLIENT:
        from app.models.client import Client
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if client:
            query = query.filter(Appointment.client_crm_id == client.id)
        else:
            query = query.filter(Appointment.id == -1)
    
    # Filter by professional if specified
    if professional_id:
        query = query.filter(Appointment.professional_id == professional_id)
    
    appointments = query.order_by(Appointment.start_time).all()
    
    return [AppointmentCalendarResponse.model_validate(apt) for apt in appointments]


@router.get("/conflicts", response_model=dict)
async def check_appointment_conflicts(
    professional_id: int,
    start_time: str,
    duration_minutes: int = 60,
    exclude_appointment_id: int = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Check if there are any conflicts for a given time slot
    Useful for real-time validation before creating/updating appointments
    """
    # Get company for timezone
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # Apply company timezone
    start_time_local = apply_company_timezone(company, _parse_datetime_query(start_time, 'start_time'))
    end_time_local = start_time_local + timedelta(minutes=duration_minutes)
    
    # Get professional
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    # Check business hours
    try:
        validate_business_hours(company, start_time_local)
    except HTTPException as e:
        return {
            "has_conflict": True,
            "conflict_type": "business_hours",
            "message": e.detail
        }
    
    # Check professional hours
    try:
        validate_professional_hours(professional, start_time_local)
    except HTTPException as e:
        return {
            "has_conflict": True,
            "conflict_type": "professional_hours",
            "message": e.detail
        }
    
    # Check for appointment conflicts
    query = db.query(Appointment).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.professional_id == professional_id,
        Appointment.status.in_([
            AppointmentStatus.PENDING,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS
        ]),
        Appointment.start_time < end_time_local,
        Appointment.end_time > start_time_local
    )
    
    # Exclude specific appointment (useful for rescheduling)
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)
    
    conflicts = query.all()
    
    if conflicts:
        conflict_details = []
        for apt in conflicts:
            conflict_details.append({
                "id": apt.id,
                "start_time": apt.start_time.isoformat(),
                "end_time": apt.end_time.isoformat(),
                "service_name": apt.service.name if apt.service else None,
                "client_name": apt.client_crm.full_name if apt.client_crm else None
            })
        
        return {
            "has_conflict": True,
            "conflict_type": "appointment",
            "message": "Profissional já possui compromisso neste horário",
            "conflicts": conflict_details
        }
    
    return {
        "has_conflict": False,
        "message": "Horário disponível"
    }

@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific appointment by ID
    """
    appointment = db.query(Appointment).options(
        joinedload(Appointment.client_crm),
        joinedload(Appointment.professional),
        joinedload(Appointment.service),
        joinedload(Appointment.resource)
    ).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Check permissions
    if current_user.role == UserRole.PROFESSIONAL:
        if appointment.professional_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este agendamento"
            )
    elif current_user.role == UserRole.CLIENT:
        from app.models.client import Client
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or appointment.client_crm_id != client.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este agendamento"
            )
    
    return AppointmentResponse.model_validate(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an appointment
    """
    appointment = db.query(Appointment).options(
        joinedload(Appointment.client_crm),
        joinedload(Appointment.professional),
        joinedload(Appointment.service),
        joinedload(Appointment.resource)
    ).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Check permissions
    if current_user.role == UserRole.PROFESSIONAL:
        if appointment.professional_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este agendamento"
            )
    elif current_user.role == UserRole.CLIENT:
        from app.models.client import Client
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or appointment.client_crm_id != client.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para atualizar este agendamento"
            )
    
    # Get company for timezone
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # Update fields
    update_data = appointment_data.model_dump(exclude_unset=True)
    
    # Validate start_time if provided
    if "start_time" in update_data:
        start_time = update_data["start_time"]
        start_time_naive = start_time.replace(tzinfo=None) if start_time.tzinfo else start_time
        now_naive = datetime.now()
        
        if start_time_naive < now_naive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start time must be in the future"
            )
        
        # Apply company timezone
        start_time_local = apply_company_timezone(company, start_time)
        
        # Check business hours
        validate_business_hours(company, start_time_local)
        
        # Check professional hours if professional is set
        if appointment.professional_id:
            professional = db.query(User).filter(
                User.id == appointment.professional_id,
                User.company_id == current_user.company_id
            ).first()
            if professional:
                validate_professional_hours(professional, start_time_local)
        
        # Calculate end_time if not provided
        if "end_time" not in update_data and appointment.service:
            from app.models.service import Service
            service = db.query(Service).filter(Service.id == appointment.service_id).first()
            if service:
                update_data["end_time"] = start_time + timedelta(minutes=service.duration_minutes)
        elif "end_time" not in update_data:
            update_data["end_time"] = start_time + timedelta(minutes=60)  # Default duration
    
    # Check for conflicts if time is being updated
    if "start_time" in update_data or "professional_id" in update_data:
        professional_id = update_data.get("professional_id", appointment.professional_id)
        start_time = update_data.get("start_time", appointment.start_time)
        end_time = update_data.get("end_time", appointment.end_time)
        
        if professional_id and start_time and end_time:
            conflicts = db.query(Appointment).filter(
                Appointment.company_id == current_user.company_id,
                Appointment.professional_id == professional_id,
                Appointment.status.in_([
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.CHECKED_IN,
                    AppointmentStatus.IN_PROGRESS
                ]),
                Appointment.start_time < end_time,
                Appointment.end_time > start_time,
                Appointment.id != appointment_id  # Exclude current appointment
            ).all()
            
            if conflicts:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Profissional já possui compromisso neste horário"
                )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    
    return AppointmentResponse.model_validate(appointment)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an appointment
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
    
    # Check permissions - only managers or the professional/owner can delete
    if current_user.role not in [UserRole.MANAGER, UserRole.OWNER]:
        if current_user.role == UserRole.PROFESSIONAL:
            if appointment.professional_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Sem permissão para deletar este agendamento"
                )
        elif current_user.role == UserRole.CLIENT:
            from app.models.client import Client
            client = db.query(Client).filter(Client.user_id == current_user.id).first()
            if not client or appointment.client_crm_id != client.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Sem permissão para deletar este agendamento"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para deletar agendamentos"
            )
    
    # Check if appointment can be deleted (not completed or already cancelled)
    if appointment.status == AppointmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar agendamentos já concluídos"
        )
    
    # Soft delete by marking as cancelled
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancelled_at = datetime.utcnow()
    appointment.cancelled_by = current_user.id
    appointment.cancellation_reason = "Agendamento deletado"
    
    db.commit()
    
    return None


@router.post("/{appointment_id}/move", response_model=AppointmentResponse)
async def move_appointment(
    appointment_id: int,
    move_data: AppointmentMoveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Move appointment to new time/professional (wrapper incremental do PUT)
    Usado pelo drag & drop do calendário
    """
    # Get appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Permission check
    if current_user.role == UserRole.PROFESSIONAL:
        if appointment.professional_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para mover este agendamento"
            )
    elif current_user.role == UserRole.CLIENT:
        from app.models.client import Client
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or appointment.client_crm_id != client.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para mover este agendamento"
            )
    
    # Get company for timezone
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # Apply company timezone
    new_start_time = apply_company_timezone(company, move_data.start_time)
    
    # Calculate duration and new end time
    duration = appointment.end_time - appointment.start_time
    new_end_time = new_start_time + duration
    
    # Get professional (use existing if not changed)
    professional_id = move_data.professional_id or appointment.professional_id
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    # Validate business hours
    validate_business_hours(company, new_start_time)
    
    # Validate professional hours
    validate_professional_hours(professional, new_start_time)
    
    # Check conflicts (only if not a busy block)
    if appointment.service_id is not None:
        conflicts = db.query(Appointment).filter(
            Appointment.company_id == current_user.company_id,
            Appointment.professional_id == professional_id,
            Appointment.id != appointment_id,
            Appointment.start_time < new_end_time,
            Appointment.end_time > new_start_time,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_PROGRESS
            ])
        ).first()
        
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conflito de horário com outro agendamento"
            )
    
    # Update appointment
    appointment.start_time = new_start_time
    appointment.end_time = new_end_time
    appointment.professional_id = professional_id
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    
    return appointment