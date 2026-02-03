"""
Google Calendar Integration Model - OAuth tokens e configurações
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from typing import Dict, Any, Optional

from app.models.base import BaseModel


class GoogleCalendarIntegration(BaseModel):
    """
    Modelo para armazenar tokens OAuth e configurações do Google Calendar por usuário
    """
    
    __tablename__ = "google_calendar_integrations"
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # OAuth Tokens (encrypted)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    # Calendar Settings
    calendar_id = Column(String(255), nullable=True)  # ID do calendário do Google
    calendar_name = Column(String(255), nullable=True)  # Nome do calendário
    
    # Sync Settings
    sync_enabled = Column(Boolean, default=True, nullable=False)
    sync_direction = Column(String(20), default="bidirectional", nullable=False)  # "to_google", "from_google", "bidirectional"
    auto_sync = Column(Boolean, default=True, nullable=False)
    
    # Sync Status
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_status = Column(String(20), default="pending", nullable=False)  # "success", "error", "pending"
    last_sync_error = Column(Text, nullable=True)
    
    # Sync Configuration
    sync_config = Column(JSON, nullable=True, default=lambda: {
        "sync_past_days": 7,      # Sincronizar eventos dos últimos X dias
        "sync_future_days": 30,   # Sincronizar eventos dos próximos X dias
        "conflict_resolution": "manual",  # "manual", "local_wins", "google_wins"
        "event_prefix": "[Agendamento]",  # Prefixo nos eventos do Google
        "include_client_info": True,      # Incluir info do cliente no evento
        "include_notes": True,            # Incluir observações
        "reminder_minutes": [15, 60],     # Lembretes no Google Calendar
    })
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships  
    user = relationship("User", back_populates="google_calendar_integration")
    company = relationship("Company")
    
    def is_token_expired(self) -> bool:
        """Verifica se o token OAuth está expirado"""
        if not self.token_expires_at:
            return True
        return datetime.utcnow() >= self.token_expires_at
    
    def get_sync_config_value(self, key: str, default=None):
        """Obtém valor específico da configuração de sincronização"""
        if not self.sync_config:
            return default
        return self.sync_config.get(key, default)
    
    def update_sync_status(self, status: str, error: Optional[str] = None):
        """Atualiza status da última sincronização"""
        self.last_sync_at = datetime.utcnow()
        self.last_sync_status = status
        self.last_sync_error = error
    
    def can_sync(self) -> bool:
        """Verifica se a integração pode sincronizar"""
        return (
            self.is_active and
            self.sync_enabled and
            self.access_token and
            not self.is_token_expired() and
            self.calendar_id
        )
    
    def __repr__(self):
        return f"<GoogleCalendarIntegration user_id={self.user_id} calendar_id={self.calendar_id}>"


class CalendarSyncLog(BaseModel):
    """
    Log de sincronizações do Google Calendar
    """
    
    __tablename__ = "calendar_sync_logs"
    
    # Foreign Keys
    integration_id = Column(Integer, ForeignKey("google_calendar_integrations.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Sync Details
    sync_direction = Column(String(20), nullable=False)  # "to_google", "from_google"
    action = Column(String(20), nullable=False)  # "create", "update", "delete"
    status = Column(String(20), nullable=False)  # "success", "error", "skipped"
    
    # Google Calendar Event Info
    google_event_id = Column(String(255), nullable=True)
    google_calendar_id = Column(String(255), nullable=True)
    
    # Sync Data
    sync_data = Column(JSON, nullable=True)  # Dados sincronizados
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    synced_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    integration = relationship("GoogleCalendarIntegration")
    appointment = relationship("Appointment")
    
    def __repr__(self):
        return f"<CalendarSyncLog integration_id={self.integration_id} action={self.action} status={self.status}>"
