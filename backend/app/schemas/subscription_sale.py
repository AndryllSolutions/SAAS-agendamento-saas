"""
Subscription Sale Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.subscription_sale import SubscriptionSaleStatus


class SubscriptionSaleModelBase(BaseModel):
    """Base subscription sale model schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    monthly_value: Decimal = Field(..., gt=0)
    services_included: Optional[List[int]] = None
    credits_included: Optional[Decimal] = None


class SubscriptionSaleModelCreate(SubscriptionSaleModelBase):
    """Schema for creating a subscription sale model"""
    company_id: int


class SubscriptionSaleModelUpdate(BaseModel):
    """Schema for updating a subscription sale model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    monthly_value: Optional[Decimal] = Field(None, gt=0)
    services_included: Optional[List[int]] = None
    credits_included: Optional[Decimal] = None
    is_active: Optional[bool] = None


class SubscriptionSaleModelResponse(SubscriptionSaleModelBase):
    """Schema for subscription sale model response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionSaleBase(BaseModel):
    """Base subscription sale schema"""
    client_crm_id: int
    model_id: int
    start_date: datetime
    end_date: Optional[datetime] = None


class SubscriptionSaleCreate(SubscriptionSaleBase):
    """Schema for creating a subscription sale"""
    company_id: int


class SubscriptionSaleUpdate(BaseModel):
    """Schema for updating a subscription sale"""
    status: Optional[SubscriptionSaleStatus] = None
    end_date: Optional[datetime] = None


class SubscriptionSaleResponse(SubscriptionSaleBase):
    """Schema for subscription sale response"""
    id: int
    company_id: int
    status: SubscriptionSaleStatus
    current_month_credits_used: Decimal
    current_month_services_used: Optional[Dict] = None
    last_payment_date: Optional[datetime] = None
    next_payment_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionSaleRenew(BaseModel):
    """Schema for renewing a subscription"""
    payment_received: bool = True

