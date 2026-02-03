"""
Subscription Schemas - Pydantic models for Subscription API
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class SubscriptionBase(BaseModel):
    """Base schema for Subscription"""
    company_id: int
    plan_type: str
    is_active: bool = True


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a Subscription"""
    trial_end_date: Optional[datetime] = None
    coupon_code: Optional[str] = None
    referral_code: Optional[str] = None


class SubscriptionUpdate(BaseModel):
    """Schema for updating a Subscription"""
    plan_type: Optional[str] = None
    is_active: Optional[bool] = None
    trial_end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    auto_renew: Optional[bool] = None


class SubscriptionResponse(SubscriptionBase):
    """Schema for Subscription response"""
    id: int
    plan_id: Optional[int] = None
    billing_cycle: str = "monthly"
    trial_end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    auto_renew: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionUpgradeRequest(BaseModel):
    """Schema for upgrade/downgrade request"""
    new_plan_slug: str = Field(..., description="Slug do novo plano (essencial, pro, premium, scale)")
    immediate: bool = Field(default=True, description="Se True, aplica imediatamente")


class SubscriptionDetailsResponse(BaseModel):
    """Schema for detailed subscription info"""
    company_id: int
    plan: dict
    expires_at: Optional[str] = None
    is_active: bool
    usage: dict
    
    class Config:
        from_attributes = True


class UsageResponse(BaseModel):
    """Schema for usage limits response"""
    professionals: dict
    units: dict
    
    class Config:
        from_attributes = True

