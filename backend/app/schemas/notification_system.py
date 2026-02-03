"""
Notification System Schemas

Schemas Pydantic para Templates, Triggers e Queue de notificações.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ====== Enums ======

class NotificationChannelEnum(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationEventTypeEnum(str, Enum):
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


class TriggerConditionEnum(str, Enum):
    IMMEDIATE = "immediate"
    BEFORE_EVENT = "before_event"
    AFTER_EVENT = "after_event"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class QueueStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SENT = "sent"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ====== Template Schemas ======

class NotificationTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: NotificationEventTypeEnum
    channel: NotificationChannelEnum = NotificationChannelEnum.PUSH
    title_template: str = Field(..., min_length=1, max_length=255)
    body_template: str = Field(..., min_length=1)
    url_template: Optional[str] = Field(None, max_length=500)
    icon_url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True
    is_default: bool = False


class NotificationTemplateCreate(NotificationTemplateBase):
    pass


class NotificationTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: Optional[NotificationEventTypeEnum] = None
    channel: Optional[NotificationChannelEnum] = None
    title_template: Optional[str] = None
    body_template: Optional[str] = None
    url_template: Optional[str] = None
    icon_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class NotificationTemplateResponse(NotificationTemplateBase):
    id: int
    company_id: int
    created_by: Optional[int] = None
    available_placeholders: Optional[Dict[str, str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ====== Trigger Schemas ======

class NotificationTriggerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    template_id: int
    event_type: NotificationEventTypeEnum
    trigger_condition: TriggerConditionEnum = TriggerConditionEnum.IMMEDIATE
    trigger_offset_minutes: Optional[int] = Field(None, ge=0)
    trigger_time: Optional[str] = None
    trigger_day_of_week: Optional[int] = Field(None, ge=0, le=6)
    trigger_day_of_month: Optional[int] = Field(None, ge=1, le=31)
    filters: Optional[Dict[str, Any]] = None
    target_roles: Optional[List[str]] = None
    send_to_client: bool = True
    send_to_professional: bool = False
    send_to_manager: bool = False
    is_active: bool = True


class NotificationTriggerCreate(NotificationTriggerBase):
    pass


class NotificationTriggerUpdate(BaseModel):
    name: Optional[str] = None
    template_id: Optional[int] = None
    event_type: Optional[NotificationEventTypeEnum] = None
    trigger_condition: Optional[TriggerConditionEnum] = None
    trigger_offset_minutes: Optional[int] = None
    trigger_time: Optional[str] = None
    trigger_day_of_week: Optional[int] = None
    trigger_day_of_month: Optional[int] = None
    filters: Optional[Dict[str, Any]] = None
    target_roles: Optional[List[str]] = None
    send_to_client: Optional[bool] = None
    send_to_professional: Optional[bool] = None
    send_to_manager: Optional[bool] = None
    is_active: Optional[bool] = None


class NotificationTriggerResponse(NotificationTriggerBase):
    id: int
    company_id: int
    created_by: Optional[int] = None
    last_triggered_at: Optional[datetime] = None
    trigger_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ====== Queue Schemas ======

class NotificationQueueCreate(BaseModel):
    user_id: int
    channel: NotificationChannelEnum = NotificationChannelEnum.PUSH
    title: str
    body: str
    url: Optional[str] = None
    icon: Optional[str] = None
    scheduled_at: datetime
    trigger_id: Optional[int] = None
    template_id: Optional[int] = None
    event_type: Optional[str] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None


class NotificationQueueResponse(BaseModel):
    id: int
    company_id: int
    user_id: int
    channel: str
    title: str
    body: str
    url: Optional[str] = None
    icon: Optional[str] = None
    scheduled_at: datetime
    status: str
    max_retries: int
    retry_count: int
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ====== Send Notification ======

class SendNotificationRequest(BaseModel):
    user_ids: List[int] = Field(..., min_length=1)
    title: str
    body: str
    url: Optional[str] = None
    channel: NotificationChannelEnum = NotificationChannelEnum.PUSH
    schedule_at: Optional[datetime] = None


class SendNotificationResponse(BaseModel):
    success: bool
    message: str
    sent_count: int = 0
    failed_count: int = 0
    queued_count: int = 0


class TestNotificationRequest(BaseModel):
    template_id: int
    test_context: Optional[Dict[str, Any]] = {
        "client_name": "João Silva",
        "professional_name": "Maria Santos",
        "service_name": "Corte de Cabelo",
        "appointment_date": "15/12/2025",
        "appointment_time": "14:30",
        "company_name": "Salão Beleza",
        "total_value": "R$ 50,00"
    }


class TemplatePreviewResponse(BaseModel):
    title: str
    body: str
    url: Optional[str] = None
    icon: Optional[str] = None