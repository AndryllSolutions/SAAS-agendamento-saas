"""
WhatsApp Marketing Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.whatsapp_marketing import CampaignType, CampaignStatus, LogStatus


class WhatsAppProviderBase(BaseModel):
    """Base WhatsApp provider schema"""
    provider_name: str
    api_url: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    instance_id: Optional[str] = None
    settings: Optional[Dict] = None


class WhatsAppProviderCreate(WhatsAppProviderBase):
    """Schema for creating a WhatsApp provider"""
    company_id: int


class WhatsAppProviderUpdate(BaseModel):
    """Schema for updating a WhatsApp provider"""
    provider_name: Optional[str] = None
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    instance_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_connected: Optional[bool] = None
    settings: Optional[Dict] = None


class WhatsAppProviderResponse(WhatsAppProviderBase):
    """Schema for WhatsApp provider response"""
    id: int
    company_id: int
    is_active: bool
    is_connected: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WhatsAppTemplateBase(BaseModel):
    """Base WhatsApp template schema"""
    name: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    available_variables: Optional[List[str]] = None


class WhatsAppTemplateCreate(WhatsAppTemplateBase):
    """Schema for creating a WhatsApp template"""
    company_id: int


class WhatsAppTemplateUpdate(BaseModel):
    """Schema for updating a WhatsApp template"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    available_variables: Optional[List[str]] = None
    is_active: Optional[bool] = None


class WhatsAppTemplateResponse(WhatsAppTemplateBase):
    """Schema for WhatsApp template response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WhatsAppCampaignBase(BaseModel):
    """Base WhatsApp campaign schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    campaign_type: CampaignType
    content: Optional[str] = None
    auto_send_enabled: bool = False
    schedule_config: Optional[Dict] = None
    client_filters: Optional[Dict] = None


class WhatsAppCampaignCreate(WhatsAppCampaignBase):
    """Schema for creating a WhatsApp campaign"""
    company_id: int
    template_id: Optional[int] = None


class WhatsAppCampaignUpdate(BaseModel):
    """Schema for updating a WhatsApp campaign"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    auto_send_enabled: Optional[bool] = None
    schedule_config: Optional[Dict] = None
    client_filters: Optional[Dict] = None
    status: Optional[CampaignStatus] = None


class WhatsAppCampaignResponse(WhatsAppCampaignBase):
    """Schema for WhatsApp campaign response"""
    id: int
    company_id: int
    template_id: Optional[int] = None
    status: CampaignStatus
    total_sent: int
    total_delivered: int
    total_read: int
    total_failed: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WhatsAppCampaignLogResponse(BaseModel):
    """Schema for WhatsApp campaign log response"""
    id: int
    company_id: int
    campaign_id: int
    client_crm_id: int
    phone_number: str
    message_content: str
    status: LogStatus
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

