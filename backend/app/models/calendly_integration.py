"""
Calendly Integration Model - OAuth tokens e configurações
Integração com Calendly para sincronização de agendamentos
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any, Optional, List

from app.models.base import BaseModel


class CalendlyIntegration(BaseModel):
    """
    Modelo para armazenar tokens OAuth e configurações do Calendly por usuário
    """
    
    __tablename__ = "calendly_integrations"
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # OAuth Tokens
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    token_type = Column(String(50), default="Bearer", nullable=True)
    
    # Calendly User Info
    calendly_user_uri = Column(String(255), nullable=True)  # URI do usuário no Calendly
    calendly_user_name = Column(String(255), nullable=True)
    calendly_user_email = Column(String(255), nullable=True)
    calendly_organization_uri = Column(String(255), nullable=True)  # URI da organização
    
    # Scheduling Page
    scheduling_url = Column(String(500), nullable=True)  # URL pública de agendamento
    
    # Sync Settings
    sync_enabled = Column(Boolean, default=True, nullable=False)
    sync_direction = Column(String(20), default="bidirectional", nullable=False)  # "to_calendly", "from_calendly", "bidirectional"
    auto_sync = Column(Boolean, default=True, nullable=False)
    
    # Webhook Configuration
    webhook_uri = Column(String(255), nullable=True)  # URI do webhook no Calendly
    webhook_signing_key = Column(String(255), nullable=True)  # Chave para validar webhooks
    
    # Sync Status
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_status = Column(String(20), default="pending", nullable=False)
    last_sync_error = Column(Text, nullable=True)
    
    # Sync Configuration
    sync_config = Column(JSON, nullable=True, default=lambda: {
        "sync_past_days": 7,
        "sync_future_days": 60,
        "event_types_to_sync": [],  # Lista de event_type URIs para sincronizar
        "auto_confirm_bookings": True,  # Confirmar automaticamente agendamentos do Calendly
        "create_client_if_not_exists": True,  # Criar cliente se não existir
        "default_service_id": None,  # Serviço padrão para agendamentos do Calendly
        "notification_on_booking": True,  # Notificar quando houver novo agendamento
    })
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="calendly_integration")
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
            self.calendly_user_uri
        )
    
    def __repr__(self):
        return f"<CalendlyIntegration user_id={self.user_id} calendly_user={self.calendly_user_email}>"


class CalendlyEventType(BaseModel):
    """
    Modelo para armazenar tipos de evento do Calendly mapeados para serviços
    """
    
    __tablename__ = "calendly_event_types"
    
    # Foreign Keys
    integration_id = Column(Integer, ForeignKey("calendly_integrations.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Calendly Event Type Info
    calendly_event_type_uri = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    scheduling_url = Column(String(500), nullable=True)
    color = Column(String(20), nullable=True)
    
    # Mapping Settings
    is_active = Column(Boolean, default=True, nullable=False)
    auto_create_appointment = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    integration = relationship("CalendlyIntegration")
    service = relationship("Service")
    
    def __repr__(self):
        return f"<CalendlyEventType name={self.name} service_id={self.service_id}>"


class CalendlySyncLog(BaseModel):
    """
    Log de sincronizações do Calendly
    """
    
    __tablename__ = "calendly_sync_logs"
    
    # Foreign Keys
    integration_id = Column(Integer, ForeignKey("calendly_integrations.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Sync Details
    sync_direction = Column(String(20), nullable=False)  # "to_calendly", "from_calendly"
    action = Column(String(20), nullable=False)  # "create", "update", "delete", "cancel"
    status = Column(String(20), nullable=False)  # "success", "error", "skipped"
    
    # Calendly Event Info
    calendly_event_uri = Column(String(255), nullable=True)
    calendly_invitee_uri = Column(String(255), nullable=True)
    
    # Sync Data
    sync_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    synced_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    integration = relationship("CalendlyIntegration")
    appointment = relationship("Appointment")
    
    def __repr__(self):
        return f"<CalendlySyncLog integration_id={self.integration_id} action={self.action} status={self.status}>"


class CalendlyWebhookEvent(BaseModel):
    """
    Modelo para armazenar eventos de webhook recebidos do Calendly
    """
    
    __tablename__ = "calendly_webhook_events"
    
    # Foreign Keys
    integration_id = Column(Integer, ForeignKey("calendly_integrations.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Webhook Event Info
    event_type = Column(String(100), nullable=False)  # "invitee.created", "invitee.canceled", etc
    event_uri = Column(String(255), nullable=True)
    
    # Payload
    payload = Column(JSON, nullable=False)
    
    # Processing Status
    processed = Column(Boolean, default=False, nullable=False)
    processed_at = Column(DateTime, nullable=True)
    processing_error = Column(Text, nullable=True)
    
    # Timestamps
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    integration = relationship("CalendlyIntegration")
    
    def mark_processed(self, error: Optional[str] = None):
        """Marca o evento como processado"""
        self.processed = True
        self.processed_at = datetime.utcnow()
        self.processing_error = error
    
    def __repr__(self):
        return f"<CalendlyWebhookEvent event_type={self.event_type} processed={self.processed}>"
