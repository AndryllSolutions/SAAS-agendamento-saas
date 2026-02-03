"""
Plan Schemas - Pydantic models for Plan API
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_serializer


class PlanBase(BaseModel):
    """Base schema for Plan"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    
    price_monthly: Decimal = Field(..., ge=0)
    price_yearly: Optional[Decimal] = Field(None, ge=0)
    price_min: Optional[Decimal] = Field(None, ge=0)
    price_max: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="BRL", max_length=3)
    
    max_professionals: int = Field(..., ge=-1)  # -1 = unlimited
    max_units: int = Field(default=1, ge=-1)
    max_clients: int = Field(default=-1, ge=-1)
    max_appointments_per_month: int = Field(default=-1, ge=-1)
    
    features: List[str] = Field(default_factory=list)
    
    highlight_label: Optional[str] = Field(None, max_length=50)
    display_order: int = Field(default=0)
    color: str = Field(default="#3B82F6", max_length=7)
    
    is_active: bool = Field(default=True)
    is_visible: bool = Field(default=True)
    
    trial_days: int = Field(default=14, ge=0)


class PlanCreate(PlanBase):
    """Schema for creating a Plan"""
    pass


class PlanUpdate(BaseModel):
    """Schema for updating a Plan"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    
    price_monthly: Optional[Decimal] = Field(None, ge=0)
    price_yearly: Optional[Decimal] = Field(None, ge=0)
    
    max_professionals: Optional[int] = Field(None, ge=-1)
    max_units: Optional[int] = Field(None, ge=-1)
    max_clients: Optional[int] = Field(None, ge=-1)
    max_appointments_per_month: Optional[int] = Field(None, ge=-1)
    
    features: Optional[List[str]] = None
    
    highlight_label: Optional[str] = Field(None, max_length=50)
    display_order: Optional[int] = None
    color: Optional[str] = Field(None, max_length=7)
    
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None
    
    trial_days: Optional[int] = Field(None, ge=0)


class PlanResponse(PlanBase):
    """Schema for Plan response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat() if dt else None
    
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }


class PlanListResponse(BaseModel):
    """Schema for list of plans"""
    plans: List[PlanResponse]
    total: int


class PlanLimits(BaseModel):
    """Schema for plan limits"""
    max_professionals: int
    max_units: int
    max_clients: int
    max_appointments_per_month: int
    
    is_unlimited_professionals: bool
    is_unlimited_units: bool
    is_unlimited_clients: bool
    is_unlimited_appointments: bool

