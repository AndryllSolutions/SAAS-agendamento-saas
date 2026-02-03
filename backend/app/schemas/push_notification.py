"""
Push Notification Schemas

Schemas Pydantic para validação de dados de Web Push Notifications.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime


# ====== Subscription Schemas ======

class PushSubscriptionKeys(BaseModel):
    """
    Chaves de criptografia da subscription (vem do navegador).
    """
    p256dh: str = Field(..., description="Public key (base64)")
    auth: str = Field(..., description="Auth secret (base64)")


class PushSubscriptionData(BaseModel):
    """
    Dados completos da subscription (formato padrão do navegador).
    """
    endpoint: str = Field(..., description="Push service endpoint URL")
    keys: PushSubscriptionKeys
    
    class Config:
        json_schema_extra = {
            "example": {
                "endpoint": "https://fcm.googleapis.com/fcm/send/...",
                "keys": {
                    "p256dh": "BEl62iUYgUivxIkv69yViEu...",
                    "auth": "8eDyX_uCN0XRhSbY5hs4zA"
                }
            }
        }


class UserPushSubscriptionCreate(BaseModel):
    """
    Criar nova subscription (vem do frontend).
    """
    subscription: PushSubscriptionData
    browser: Optional[str] = Field(None, max_length=50, description="chrome, firefox, edge, safari")
    device_name: Optional[str] = Field(None, max_length=100, description="Windows, Android, MacOS, etc")
    user_agent: Optional[str] = Field(None, description="User agent completo do navegador")
    
    @validator('browser')
    def browser_lowercase(cls, v):
        """Converter browser para lowercase."""
        return v.lower() if v else None
    
    class Config:
        json_schema_extra = {
            "example": {
                "subscription": {
                    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
                    "keys": {
                        "p256dh": "BEl62iUYgUivxIkv69yViEu...",
                        "auth": "8eDyX_uCN0XRhSbY5hs4zA"
                    }
                },
                "browser": "chrome",
                "device_name": "Windows",
                "user_agent": "Mozilla/5.0..."
            }
        }


class UserPushSubscriptionUpdate(BaseModel):
    """
    Atualizar subscription existente.
    """
    is_active: Optional[bool] = None
    device_name: Optional[str] = Field(None, max_length=100)


class UserPushSubscriptionResponse(BaseModel):
    """
    Resposta com dados da subscription.
    """
    id: int
    user_id: int
    company_id: int
    endpoint: str
    browser: Optional[str]
    device_name: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_used_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ====== Notification Schemas ======

class PushNotificationPayload(BaseModel):
    """
    Payload da notificação (conteúdo que será exibido).
    """
    title: str = Field(..., max_length=255, description="Título da notificação")
    body: Optional[str] = Field(None, description="Corpo da notificação")
    url: Optional[str] = Field(None, max_length=500, description="URL para abrir ao clicar")
    icon: Optional[str] = Field(None, max_length=500, description="URL do ícone")
    badge: Optional[str] = Field(None, max_length=500, description="URL do badge")
    image: Optional[str] = Field(None, max_length=500, description="URL da imagem grande")
    tag: Optional[str] = Field(None, max_length=100, description="Tag para agrupar notificações")
    
    # Metadata
    notification_type: Optional[str] = Field(None, max_length=50, description="appointment, reminder, alert")
    reference_id: Optional[int] = Field(None, description="ID do objeto relacionado")
    reference_type: Optional[str] = Field(None, max_length=50, description="appointment, command, etc")
    
    # Dados adicionais (não visíveis, mas acessíveis no service worker)
    data: Optional[Dict[str, Any]] = Field(None, description="Dados extras para o service worker")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Novo Agendamento",
                "body": "Você tem um agendamento amanhã às 14h",
                "url": "/appointments/123",
                "icon": "/logo.png",
                "notification_type": "appointment",
                "reference_id": 123,
                "reference_type": "appointment"
            }
        }


class SendPushToUserRequest(BaseModel):
    """
    Request para enviar notificação para um usuário específico.
    """
    user_id: int = Field(..., description="ID do usuário destinatário")
    notification: PushNotificationPayload
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 5,
                "notification": {
                    "title": "Lembrete de Agendamento",
                    "body": "Seu agendamento é amanhã às 10h",
                    "url": "/appointments/456"
                }
            }
        }


class SendPushToCompanyRequest(BaseModel):
    """
    Request para enviar notificação para todos usuários de uma empresa.
    """
    notification: PushNotificationPayload
    user_ids: Optional[list[int]] = Field(None, description="IDs específicos (opcional)")
    roles: Optional[list[str]] = Field(None, description="Filtrar por roles (opcional)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "notification": {
                    "title": "Atualização do Sistema",
                    "body": "Nova funcionalidade disponível!",
                    "url": "/updates"
                },
                "roles": ["OWNER", "MANAGER"]
            }
        }


class SendPushResponse(BaseModel):
    """
    Resposta do envio de notificação.
    """
    success: bool
    sent_count: int
    failed_count: int
    log_ids: list[int] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "sent_count": 3,
                "failed_count": 1,
                "log_ids": [1, 2, 3, 4],
                "errors": ["Subscription expired for user 5"]
            }
        }


# ====== Log Schemas ======

class PushNotificationLogResponse(BaseModel):
    """
    Resposta com dados do log.
    """
    id: int
    company_id: int
    user_id: Optional[int]
    subscription_id: Optional[int]
    title: str
    body: Optional[str]
    url: Optional[str]
    notification_type: Optional[str]
    status: str
    error_message: Optional[str]
    sent_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


# ====== Test Schemas ======

class TestPushNotificationRequest(BaseModel):
    """
    Request para testar notificação (envia para o usuário atual).
    """
    title: str = Field(default="Teste de Notificação", max_length=255)
    body: str = Field(default="Esta é uma notificação de teste", max_length=500)
    url: Optional[str] = Field(default="/", max_length=500)
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "🔔 Teste de Notificação",
                "body": "Se você está vendo isso, as notificações estão funcionando!",
                "url": "/notifications"
            }
        }
