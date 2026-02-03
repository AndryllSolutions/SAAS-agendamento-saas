"""
AddOn Schemas - Pydantic models for AddOn API
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_serializer


class AddOnBase(BaseModel):
    """Base schema for AddOn"""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    
    price_monthly: Decimal = Field(..., ge=0)
    currency: str = Field(default="BRL", max_length=3)
    
    addon_type: str = Field(..., max_length=50)
    config: Dict[str, Any] = Field(default_factory=dict)
    
    unlocks_features: Optional[List[str]] = None
    override_limits: Optional[Dict[str, int]] = None
    
    icon: Optional[str] = Field(None, max_length=50)
    color: str = Field(default="#3B82F6", max_length=7)
    category: Optional[str] = Field(None, max_length=50)
    display_order: int = Field(default=0)
    
    is_active: bool = Field(default=True)
    is_visible: bool = Field(default=True)
    
    included_in_plans: Optional[List[str]] = None


class AddOnCreate(AddOnBase):
    """Schema for creating an AddOn"""
    pass


class AddOnUpdate(BaseModel):
    """Schema for updating an AddOn"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price_monthly: Optional[Decimal] = Field(None, ge=0)
    config: Optional[Dict[str, Any]] = None
    unlocks_features: Optional[List[str]] = None
    override_limits: Optional[Dict[str, int]] = None
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None


class AddOnResponse(AddOnBase):
    """Schema for AddOn response"""
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


class CompanyAddOnBase(BaseModel):
    """Base schema for CompanyAddOn"""
    company_id: int
    addon_id: int
    is_active: bool = True


class CompanyAddOnCreate(BaseModel):
    """Schema for activating an add-on"""
    addon_slug: str
    trial_days: Optional[int] = None


class CompanyAddOnResponse(BaseModel):
    """Schema for CompanyAddOn response"""
    id: int
    company_id: int
    addon_id: int
    is_active: bool
    activated_at: Optional[datetime] = None
    deactivated_at: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    auto_renew: bool
    source: Optional[str] = None
    is_trial: bool
    trial_end_date: Optional[datetime] = None
    
    # Nested addon info
    addon: AddOnResponse
    
    @field_serializer('activated_at', 'deactivated_at', 'next_billing_date', 'trial_end_date')
    def serialize_datetime(self, dt: Optional[datetime], _info):
        return dt.isoformat() if dt else None
    
    class Config:
        from_attributes = True


class CompanyAddOnsListResponse(BaseModel):
    """Schema for list of company add-ons"""
    active_addons: List[CompanyAddOnResponse]
    available_addons: List[AddOnResponse]
    total_monthly_cost: float
    
    class Config:
        from_attributes = True

