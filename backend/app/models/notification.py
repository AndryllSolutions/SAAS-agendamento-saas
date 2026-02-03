"""
Notification Models - Complete System with Templates and Triggers

Sistema completo para gerenciar notificações automatizadas e manuais.
Inclui templates reutilizáveis, triggers baseados em eventos e fila de envio.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

from app.models.base import BaseModel


class NotificationChannel(str, enum.Enum):
    """Canais de notificação"""
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    IN_APP = "in_app"


# Alias para compatibilidade
NotificationType = NotificationChannel


class NotificationEventType(str, enum.Enum):
    """Tipos de eventos que disparam notificações"""
    APPOINTMENT_CREATED = "appointment_created"
    APPOINTMENT_UPDATED = "appointment_updated"
    APPOINTMENT_CANCELLED = "appointment_cancelled"
    APPOINTMENT_REMINDER = "appointment_reminder"
    APPOINTMENT_CONFIRMED = "appointment_confirmed"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    COMMAND_CREATED = "command_created"
    COMMAND_CLOSED = "command_closed"
    PACKAGE_EXPIRING = "package_expiring"
    PACKAGE_EXPIRED = "package_expired"
    WELCOME_MESSAGE = "welcome_message"
    BIRTHDAY = "birthday"
    REVIEW_REQUEST = "review_request"
    CUSTOM = "custom"


class TriggerCondition(str, enum.Enum):
    """Condições para disparar triggers"""
    IMMEDIATE = "immediate"  # Imediato após evento
    BEFORE_EVENT = "before_event"  # X minutos/horas antes
    AFTER_EVENT = "after_event"  # X minutos/horas depois
    DAILY = "daily"  # Todo dia em horário específico
    WEEKLY = "weekly"  # Toda semana
    MONTHLY = "monthly"  # Todo mês


class NotificationStatus(str, enum.Enum):
    """Notification status"""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"


class Notification(BaseModel):
    """Notification model"""
    
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Type and Status
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Metadata
    data = Column(String(1000), nullable=True)  # JSON string with additional data
    
    # Recipient
    recipient = Column(String(255), nullable=False)  # email, phone, etc.
    
    # Dates
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification {self.notification_type} - {self.status}>"


# ============================================================================
# NOTIFICATION TEMPLATE - Templates reutilizáveis
# ============================================================================

class NotificationTemplate(BaseModel):
    """
    Template de notificação reutilizável.
    
    Permite criar templates padronizados para diferentes tipos
    de notificação com placeholders dinâmicos.
    
    Placeholders disponíveis:
    - {client_name} - Nome do cliente
    - {professional_name} - Nome do profissional
    - {service_name} - Nome do serviço
    - {appointment_date} - Data do agendamento
    - {appointment_time} - Hora do agendamento
    - {company_name} - Nome da empresa
    - {total_value} - Valor total
    """
    
    __tablename__ = "notification_templates"
    
    # Relations
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(SQLEnum(NotificationEventType), nullable=False, index=True)
    channel = Column(SQLEnum(NotificationChannel), default=NotificationChannel.PUSH, nullable=False)
    
    # Content Templates (com placeholders)
    title_template = Column(String(255), nullable=False)
    body_template = Column(Text, nullable=False)
    url_template = Column(String(500), nullable=True)  # URL com placeholders
    icon_url = Column(String(500), nullable=True)
    
    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_default = Column(Boolean, default=False, nullable=False)  # Template padrão para o tipo
    
    # Placeholders documentation (JSON)
    available_placeholders = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company")
    creator = relationship("User", foreign_keys=[created_by])
    triggers = relationship("NotificationTrigger", back_populates="template", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<NotificationTemplate {self.name} type={self.event_type}>"
    
    def render(self, context: dict) -> dict:
        """Renderiza template com context"""
        def safe_format(template: str, ctx: dict) -> str:
            if not template:
                return template
            try:
                return template.format(**ctx)
            except KeyError:
                return template
        
        return {
            "title": safe_format(self.title_template, context),
            "body": safe_format(self.body_template, context),
            "url": safe_format(self.url_template, context) if self.url_template else None,
            "icon": self.icon_url
        }


# ============================================================================
# NOTIFICATION TRIGGER - Triggers automáticos
# ============================================================================

class NotificationTrigger(BaseModel):
    """
    Trigger automático para enviar notificações baseado em eventos.
    
    Conecta eventos do sistema (criação de agendamento, pagamento, etc.)
    com templates de notificação e condições específicas.
    """
    
    __tablename__ = "notification_triggers"
    
    # Relations
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("notification_templates.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Trigger Configuration
    name = Column(String(255), nullable=False)
    event_type = Column(SQLEnum(NotificationEventType), nullable=False, index=True)
    trigger_condition = Column(SQLEnum(TriggerCondition), nullable=False, default=TriggerCondition.IMMEDIATE)
    
    # Timing Configuration
    trigger_offset_minutes = Column(Integer, nullable=True)  # Para BEFORE_EVENT/AFTER_EVENT
    trigger_time = Column(String(10), nullable=True)  # HH:MM para DAILY/WEEKLY/MONTHLY
    trigger_day_of_week = Column(Integer, nullable=True)  # 0-6 para WEEKLY (Domingo=0)
    trigger_day_of_month = Column(Integer, nullable=True)  # 1-31 para MONTHLY
    
    # Filters (JSON) - condições específicas
    filters = Column(JSON, nullable=True)  # {"service_id": 1, "professional_id": 2, "min_value": 100}
    
    # Target Configuration
    target_roles = Column(JSON, nullable=True)  # ["client", "professional", "manager"]
    send_to_client = Column(Boolean, default=True, nullable=False)
    send_to_professional = Column(Boolean, default=False, nullable=False)
    send_to_manager = Column(Boolean, default=False, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_triggered_at = Column(DateTime, nullable=True)
    trigger_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    company = relationship("Company")
    template = relationship("NotificationTemplate", back_populates="triggers")
    creator = relationship("User", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<NotificationTrigger {self.name} event={self.event_type}>"
    
    def should_trigger(self, event_data: dict) -> bool:
        """Verifica se o trigger deve ser executado baseado nos filtros"""
        if not self.is_active:
            return False
        
        if not self.filters:
            return True
        
        for key, expected_value in self.filters.items():
            if event_data.get(key) != expected_value:
                return False
        
        return True
    
    def calculate_send_time(self, event_time: datetime = None) -> datetime:
        """Calcula quando a notificação deve ser enviada"""
        now = datetime.utcnow()
        
        if self.trigger_condition == TriggerCondition.IMMEDIATE:
            return now
        
        if event_time is None:
            return now
        
        if self.trigger_condition == TriggerCondition.BEFORE_EVENT:
            offset = self.trigger_offset_minutes or 60  # Default 1 hora antes
            return event_time - timedelta(minutes=offset)
        
        if self.trigger_condition == TriggerCondition.AFTER_EVENT:
            offset = self.trigger_offset_minutes or 30  # Default 30 minutos depois
            return event_time + timedelta(minutes=offset)
        
        return now


# ============================================================================
# NOTIFICATION QUEUE - Fila de envio
# ============================================================================

class NotificationQueue(BaseModel):
    """
    Fila de notificações agendadas.
    
    Armazena notificações que precisam ser enviadas no futuro,
    permitindo retry e gerenciamento de falhas.
    """
    
    __tablename__ = "notification_queue"
    
    # Relations
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_id = Column(Integer, ForeignKey("notification_triggers.id", ondelete="SET NULL"), nullable=True)
    template_id = Column(Integer, ForeignKey("notification_templates.id", ondelete="SET NULL"), nullable=True)
    
    # Notification Content (já renderizado)
    channel = Column(SQLEnum(NotificationChannel), default=NotificationChannel.PUSH, nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    url = Column(String(500), nullable=True)
    icon = Column(String(500), nullable=True)
    
    # Scheduling
    scheduled_at = Column(DateTime, nullable=False, index=True)
    max_retries = Column(Integer, default=3, nullable=False)
    retry_count = Column(Integer, default=0, nullable=False)
    
    # Status
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, processing, sent, failed, cancelled
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    event_type = Column(String(50), nullable=True, index=True)
    reference_id = Column(Integer, nullable=True)  # ID do objeto relacionado
    reference_type = Column(String(50), nullable=True)  # appointment, command, etc.
    context_data = Column(JSON, nullable=True)  # Dados originais do evento
    
    # Relationships
    company = relationship("Company")
    user = relationship("User")
    trigger = relationship("NotificationTrigger")
    template = relationship("NotificationTemplate")
    
    def __repr__(self):
        return f"<NotificationQueue {self.title} scheduled={self.scheduled_at} status={self.status}>"
    
    def can_retry(self) -> bool:
        """Verifica se pode tentar novamente"""
        return self.retry_count < self.max_retries and self.status == "failed"
    
    def mark_as_sent(self):
        """Marca como enviada"""
        self.status = "sent"
        self.sent_at = datetime.utcnow()
    
    def mark_as_failed(self, error: str):
        """Marca como falha"""
        self.status = "failed"
        self.error_message = error
        self.retry_count += 1
