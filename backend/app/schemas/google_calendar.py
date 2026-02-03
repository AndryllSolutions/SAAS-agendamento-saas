"""
Google Calendar Integration Schemas
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class GoogleCalendarAuthResponse(BaseModel):
    """Response para URL de autorização OAuth"""
    auth_url: str
    user_id: int


class GoogleCalendarIntegrationBase(BaseModel):
    """Base schema para Google Calendar Integration"""
    sync_enabled: bool = True
    sync_direction: str = Field(default="bidirectional", pattern="^(to_google|from_google|bidirectional)$")
    auto_sync: bool = True
    calendar_name: Optional[str] = None
    sync_config: Optional[Dict[str, Any]] = None


class GoogleCalendarIntegrationCreate(GoogleCalendarIntegrationBase):
    """Schema para criação de integração"""
    pass


class GoogleCalendarIntegrationUpdate(BaseModel):
    """Schema para atualização de integração"""
    sync_enabled: Optional[bool] = None
    sync_direction: Optional[str] = Field(None, pattern="^(to_google|from_google|bidirectional)$")
    auto_sync: Optional[bool] = None
    sync_config: Optional[Dict[str, Any]] = None


class GoogleCalendarIntegrationResponse(GoogleCalendarIntegrationBase):
    """Response completo da integração"""
    id: int
    user_id: int
    company_id: int
    calendar_id: Optional[str]
    last_sync_at: Optional[datetime]
    last_sync_status: str
    last_sync_error: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoogleCalendarStatusResponse(BaseModel):
    """Status da integração Google Calendar"""
    connected: bool
    active: bool = False
    sync_enabled: bool = False
    calendar_name: Optional[str] = None
    last_sync: Optional[datetime] = None
    last_sync_status: str = "pending"
    can_sync: bool = False
    token_expired: bool = True


class GoogleCalendarSyncResponse(BaseModel):
    """Response de sincronização"""
    success: bool
    synced_count: int = 0
    error_count: int = 0
    skipped_count: int = 0
    message: str


class CalendarSyncLogResponse(BaseModel):
    """Response para log de sincronização"""
    id: int
    appointment_id: Optional[int]
    sync_direction: str
    action: str
    status: str
    google_event_id: Optional[str]
    google_calendar_id: Optional[str]
    error_message: Optional[str]
    synced_at: datetime

    class Config:
        from_attributes = True


class GoogleCalendarSyncConfig(BaseModel):
    """Configurações de sincronização"""
    sync_past_days: int = Field(7, ge=0, le=365, description="Dias no passado para sincronizar")
    sync_future_days: int = Field(30, ge=1, le=365, description="Dias no futuro para sincronizar")
    conflict_resolution: str = Field("manual", pattern="^(manual|local_wins|google_wins)$")
    event_prefix: str = Field("[Agendamento]", max_length=50)
    include_client_info: bool = True
    include_notes: bool = True
    reminder_minutes: List[int] = Field(default=[15, 60], description="Lembretes em minutos")
    timezone: str = Field("America/Sao_Paulo", description="Timezone para eventos")
