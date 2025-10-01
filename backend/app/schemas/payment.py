"""
Payment Schemas
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.payment import PaymentStatus, PaymentMethod


class PaymentBase(BaseModel):
    """Base payment schema"""
    amount: Decimal = Field(..., gt=0)
    payment_method: PaymentMethod
    currency: str = "BRL"


class PaymentCreate(PaymentBase):
    """Schema for creating a payment"""
    appointment_id: Optional[int] = None
    user_id: int
    gateway: Optional[str] = None


class PaymentUpdate(BaseModel):
    """Schema for updating a payment"""
    status: Optional[PaymentStatus] = None
    gateway_transaction_id: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PaymentResponse(PaymentBase):
    """Schema for payment response"""
    id: int
    company_id: int
    appointment_id: Optional[int] = None
    user_id: int
    status: PaymentStatus
    gateway: Optional[str] = None
    gateway_transaction_id: Optional[str] = None
    pix_code: Optional[str] = None
    pix_qr_code: Optional[str] = None
    boleto_url: Optional[str] = None
    boleto_barcode: Optional[str] = None
    paid_at: Optional[datetime] = None
    commission_amount: Decimal
    commission_paid: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaymentWebhook(BaseModel):
    """Schema for payment webhook"""
    gateway: str
    transaction_id: str
    status: str
    data: Dict[str, Any]


class PlanBase(BaseModel):
    """Base plan schema"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    sessions_included: int = Field(..., gt=0)
    validity_days: int = Field(..., gt=0)


class PlanCreate(PlanBase):
    """Schema for creating a plan"""
    currency: str = "BRL"
    service_ids: Optional[List[int]] = None


class PlanUpdate(BaseModel):
    """Schema for updating a plan"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    sessions_included: Optional[int] = Field(None, gt=0)
    validity_days: Optional[int] = Field(None, gt=0)
    service_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None


class PlanResponse(PlanBase):
    """Schema for plan response"""
    id: int
    company_id: int
    currency: str
    service_ids: Optional[List[int]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    """Schema for creating a subscription"""
    user_id: int
    plan_id: int
    payment_id: Optional[int] = None


class SubscriptionResponse(BaseModel):
    """Schema for subscription response"""
    id: int
    company_id: int
    user_id: int
    plan_id: int
    is_active: bool
    sessions_remaining: int
    sessions_used: int
    start_date: datetime
    end_date: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
