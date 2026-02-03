"""
Calendly Integration Schemas
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class CalendlyAuthResponse(BaseModel):
    """Response para URL de autorização OAuth"""
    auth_url: str
    user_id: int


class CalendlyIntegrationBase(BaseModel):
    """Base schema para Calendly Integration"""
    sync_enabled: bool = True
    sync_direction: str = Field(default="bidirectional", pattern="^(to_calendly|from_calendly|bidirectional)$")
    auto_sync: bool = True
    sync_config: Optional[Dict[str, Any]] = None


class CalendlyIntegrationCreate(CalendlyIntegrationBase):
    """Schema para criação de integração"""
    pass


class CalendlyIntegrationUpdate(BaseModel):
    """Schema para atualização de integração"""
    sync_enabled: Optional[bool] = None
    sync_direction: Optional[str] = Field(None, pattern="^(to_calendly|from_calendly|bidirectional)$")
    auto_sync: Optional[bool] = None
    sync_config: Optional[Dict[str, Any]] = None


class CalendlyIntegrationResponse(CalendlyIntegrationBase):
    """Response completo da integração"""
    id: int
    user_id: int
    company_id: int
    calendly_user_uri: Optional[str]
    calendly_user_name: Optional[str]
    calendly_user_email: Optional[str]
    scheduling_url: Optional[str]
    last_sync_at: Optional[datetime]
    last_sync_status: str
    last_sync_error: Optional[str]
    is_active: bool
    webhook_uri: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CalendlyStatusResponse(BaseModel):
    """Status da integração Calendly"""
    connected: bool
    active: bool = False
    sync_enabled: bool = False
    calendly_user_name: Optional[str] = None
    calendly_user_email: Optional[str] = None
    scheduling_url: Optional[str] = None
    last_sync: Optional[datetime] = None
    last_sync_status: str = "pending"
    can_sync: bool = False
    token_expired: bool = True
    event_types_count: int = 0
    webhook_configured: bool = False


class CalendlySyncResponse(BaseModel):
    """Response de sincronização"""
    success: bool
    created_count: int = 0
    updated_count: int = 0
    error_count: int = 0
    message: str


class CalendlyEventTypeBase(BaseModel):
    """Base schema para Calendly Event Type"""
    name: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    scheduling_url: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True
    auto_create_appointment: bool = True


class CalendlyEventTypeResponse(CalendlyEventTypeBase):
    """Response para tipo de evento"""
    id: int
    integration_id: int
    service_id: Optional[int]
    calendly_event_type_uri: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CalendlyEventTypeMappingUpdate(BaseModel):
    """Schema para atualizar mapeamento de tipo de evento"""
    service_id: Optional[int] = None
    is_active: Optional[bool] = None
    auto_create_appointment: Optional[bool] = None


class CalendlySyncLogResponse(BaseModel):
    """Response para log de sincronização"""
    id: int
    appointment_id: Optional[int]
    sync_direction: str
    action: str
    status: str
    calendly_event_uri: Optional[str]
    calendly_invitee_uri: Optional[str]
    error_message: Optional[str]
    synced_at: datetime

    class Config:
        from_attributes = True


class CalendlySyncConfig(BaseModel):
    """Configurações de sincronização"""
    sync_past_days: int = Field(7, ge=0, le=365, description="Dias no passado para sincronizar")
    sync_future_days: int = Field(60, ge=1, le=365, description="Dias no futuro para sincronizar")
    event_types_to_sync: List[str] = Field(default=[], description="URIs de tipos de evento para sincronizar")
    auto_confirm_bookings: bool = Field(True, description="Confirmar automaticamente agendamentos")
    create_client_if_not_exists: bool = Field(True, description="Criar cliente se não existir")
    default_service_id: Optional[int] = Field(None, description="Serviço padrão para agendamentos")
    notification_on_booking: bool = Field(True, description="Notificar quando houver novo agendamento")
