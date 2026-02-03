"""
Appointment Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime, timezone, timedelta

from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    """Base appointment schema"""
    service_id: Optional[int] = None  # Permitir NULL - compatibilidade com dados existentes
    professional_id: Optional[int] = None
    resource_id: Optional[int] = None
    start_time: datetime
    client_notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment"""
    client_id: Optional[int] = None  # Will be set from current user if not provided
    end_time: Optional[datetime] = None
    internal_notes: Optional[str] = None
    force_overlap: bool = False  # Permite encaixar agendamento mesmo com conflito
    
    @field_validator('start_time')
    @classmethod
    def validate_start_time(cls, v):
        # CORREÇÃO: Compare naive datetimes to avoid timezone issues
        # Remove timezone info for comparison
        v_naive = v.replace(tzinfo=None) if v.tzinfo else v
        now_naive = datetime.now()
        
        if v_naive < now_naive:
            raise ValueError('Start time must be in the future')
        return v


class PublicAppointmentCreate(BaseModel):
    """Schema for creating a public appointment without authentication"""
    service_id: int
    professional_id: Optional[int] = None  # Optional - can be None for "no preference"
    start_time: datetime
    client_name: str = Field(..., min_length=1, max_length=100)
    client_email: Optional[str] = Field(None, max_length=100)
    client_phone: Optional[str] = Field(None, max_length=20)
    client_notes: Optional[str] = Field(None, max_length=500)
    
    @field_validator('start_time')
    @classmethod
    def validate_start_time(cls, v):
        # CORREÇÃO: Compare naive datetimes to avoid timezone issues
        v_naive = v.replace(tzinfo=None) if v.tzinfo else v
        now_naive = datetime.now()
        
        if v_naive < now_naive:
            raise ValueError('Start time must be in the future')
        return v
    
    @field_validator('client_email')
    @classmethod
    def validate_email(cls, v):
        if v:
            if '@' not in v or '.' not in v.split('@')[1]:
                raise ValueError('Formato de e-mail inválido')
        return v
    
    @field_validator('client_phone')
    @classmethod
    def validate_phone(cls, v):
        if v:
            # Remover caracteres não numéricos para validação
            phone_digits = ''.join(filter(str.isdigit, v))
            if len(phone_digits) < 10 or len(phone_digits) > 11:
                raise ValueError('Telefone deve ter 10 ou 11 dígitos (com DDD)')
        return v


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment"""
    start_time: Optional[datetime] = None
    professional_id: Optional[int] = None
    resource_id: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    client_notes: Optional[str] = None
    professional_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class AppointmentCancel(BaseModel):
    """Schema for cancelling an appointment"""
    cancellation_reason: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response"""
    id: int
    company_id: int
    client_id: Optional[int] = None  # DEPRECATED - nullable in model
    client_crm_id: Optional[int] = None  # NEW CRM integration
    end_time: datetime
    status: AppointmentStatus
    professional_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    checked_in_at: Optional[datetime] = None
    check_in_code: Optional[str] = None
    payment_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AppointmentCalendarClient(BaseModel):
    """Lightweight client payload for calendar view"""
    id: int
    full_name: str
    phone: Optional[str] = None
    cellphone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AppointmentCalendarService(BaseModel):
    """Lightweight service payload for calendar view"""
    id: int
    name: str
    duration_minutes: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class AppointmentCalendarProfessional(BaseModel):
    """Professional payload for calendar view with complete info"""
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    bio: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AppointmentCalendarResponse(AppointmentResponse):
    """Schema for calendar view with nested entities"""
    client: Optional[AppointmentCalendarClient] = Field(
        default=None,
        validation_alias="client_crm",
        serialization_alias="client"
    )
    service: Optional[AppointmentCalendarService] = None
    professional: Optional[AppointmentCalendarProfessional] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AppointmentCheckIn(BaseModel):
    """Schema for appointment check-in"""
    check_in_code: str = Field(..., min_length=4, max_length=10)


# ========== CALENDAR DAY AGGREGATED RESPONSE ==========

class CalendarProfessional(BaseModel):
    """Professional info for calendar grid"""
    id: int
    full_name: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    working_hours: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(from_attributes=True)


class AppointmentItem(BaseModel):
    """Item de serviço dentro de um agendamento (suporte multi-serviços)"""
    service_id: int
    service_name: str
    professional_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    price: Optional[float] = None


class CalendarAppointment(BaseModel):
    """Appointment for calendar grid with items support"""
    id: int
    start_time: datetime
    end_time: datetime
    status: str
    color: Optional[str] = None
    client: Optional[AppointmentCalendarClient] = None
    items: List[AppointmentItem] = []  # Multi-serviços
    notes: Optional[str] = None
    professional_id: Optional[int] = None  # Compatibilidade
    
    model_config = ConfigDict(from_attributes=True)


class BusyBlock(BaseModel):
    """Bloco de ocupação/indisponibilidade do profissional"""
    id: Optional[int] = None  # Pode ser derivado de appointment ou entidade própria
    professional_id: int
    start_time: datetime
    end_time: datetime
    reason: str  # Ex: "Folga", "Almoço", "Ver casa"
    
    model_config = ConfigDict(from_attributes=True)


class CalendarDayResponse(BaseModel):
    """Resposta agregada para GET /calendar/day - tudo em 1 chamada"""
    date: str  # YYYY-MM-DD
    professionals: List[CalendarProfessional]
    appointments: List[CalendarAppointment]
    busy_blocks: List[BusyBlock]


class AppointmentMoveRequest(BaseModel):
    """Request para mover agendamento (POST /appointments/{id}/move)"""
    start_time: datetime
    professional_id: Optional[int] = None
    
    @field_validator('start_time')
    @classmethod
    def validate_start_time(cls, v):
        v_naive = v.replace(tzinfo=None) if v.tzinfo else v
        now_naive = datetime.now()
        if v_naive < now_naive:
            raise ValueError('Start time must be in the future')
        return v


class AppointmentListFilter(BaseModel):
    """Schema for filtering appointments"""
    status: Optional[AppointmentStatus] = None
    professional_id: Optional[int] = None
    client_id: Optional[int] = None
    service_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    skip: int = 0
    limit: int = 100
