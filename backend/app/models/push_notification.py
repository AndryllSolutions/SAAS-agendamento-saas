"""
Web Push Notification Models

Suporte completo para Web Push Notifications nativo (sem serviços externos).
Usa VAPID (Voluntary Application Server Identification) para autenticação.
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel


class UserPushSubscription(BaseModel):
    """
    Armazena subscriptions de Web Push de usuarios.
    
    Cada subscription representa um device/browser onde o usuario
    aceitou receber notificações push.
    
    Um usuario pode ter multiplas subscriptions (desktop, mobile, etc).
    """
    
    __tablename__ = "user_push_subscriptions"
    
    # Relations
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Push API Subscription Data (vem do navegador)
    endpoint = Column(Text, nullable=False, unique=True)  # URL unica do push service (FCM, Mozilla, etc)
    p256dh = Column(Text, nullable=False)  # Public key para criptografia (base64)
    auth = Column(Text, nullable=False)  # Auth secret para criptografia (base64)
    
    # Device Information (para identificação)
    browser = Column(String(50), nullable=True)  # chrome, firefox, edge, safari
    device_name = Column(String(100), nullable=True)  # Windows, Android, iPhone, etc
    user_agent = Column(Text, nullable=True)  # User agent completo
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Timestamps
    last_used_at = Column(DateTime, nullable=True)  # Ultima notificacao enviada com sucesso
    
    # Relationships
    user = relationship("User", back_populates="push_subscriptions")
    company = relationship("Company", back_populates="push_subscriptions")
    logs = relationship("PushNotificationLog", back_populates="subscription", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UserPushSubscription user_id={self.user_id} browser={self.browser}>"
    
    @property
    def subscription_info(self):
        """
        Retorna dados no formato esperado pelo pywebpush.
        
        Returns:
            dict: {endpoint, keys: {p256dh, auth}}
        """
        return {
            "endpoint": self.endpoint,
            "keys": {
                "p256dh": self.p256dh,
                "auth": self.auth
            }
        }


class PushNotificationLog(BaseModel):
    """
    Log de todas as notificações push enviadas.
    
    Armazena histórico completo para:
    - Debug de problemas de entrega
    - Analytics de engajamento
    - Auditoria de comunicações
    """
    
    __tablename__ = "push_notification_logs"
    
    # Relations
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    subscription_id = Column(Integer, ForeignKey("user_push_subscriptions.id", ondelete="SET NULL"), nullable=True)
    
    # Notification Content
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)  # URL para abrir ao clicar
    icon = Column(String(500), nullable=True)  # URL do icone
    badge = Column(String(500), nullable=True)  # URL do badge (pequeno icone)
    image = Column(String(500), nullable=True)  # URL da imagem grande
    tag = Column(String(100), nullable=True)  # Tag para agrupar notificacoes
    
    # Metadata
    notification_type = Column(String(50), nullable=True, index=True)  # appointment, reminder, alert, campaign
    reference_id = Column(Integer, nullable=True)  # ID do objeto relacionado
    reference_type = Column(String(50), nullable=True)  # appointment, command, service, etc
    
    # Status
    status = Column(String(20), nullable=False, index=True)  # sent, failed, expired
    error_message = Column(Text, nullable=True)
    response_status = Column(Integer, nullable=True)  # HTTP status code (201, 410, etc)
    response_body = Column(Text, nullable=True)
    
    # Timestamps
    sent_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="push_notification_logs")
    user = relationship("User", back_populates="push_notification_logs")
    subscription = relationship("UserPushSubscription", back_populates="logs")
    
    def __repr__(self):
        return f"<PushNotificationLog {self.notification_type} status={self.status}>"
