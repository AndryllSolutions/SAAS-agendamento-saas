"""
StandaloneService Schemas - Pydantic models for Standalone Services API
"""
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_serializer


class StandaloneServiceBase(BaseModel):
    """Base schema for StandaloneService"""
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    
    price: Decimal = Field(..., ge=0)
    price_min: Optional[Decimal] = Field(None, ge=0)
    price_max: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="BRL", max_length=3)
    
    service_type: str = Field(..., max_length=50)
    duration_days: Optional[int] = Field(None, ge=1)
    
    includes: Optional[List[str]] = None
    
    is_active: bool = Field(default=True)
    is_visible: bool = Field(default=True)
    display_order: int = Field(default=0)
    
    included_in_plans: Optional[List[str]] = None


class StandaloneServiceCreate(StandaloneServiceBase):
    """Schema for creating a StandaloneService"""
    pass


class StandaloneServiceUpdate(BaseModel):
    """Schema for updating a StandaloneService"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    price_min: Optional[Decimal] = Field(None, ge=0)
    price_max: Optional[Decimal] = Field(None, ge=0)
    duration_days: Optional[int] = Field(None, ge=1)
    includes: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_visible: Optional[bool] = None


class StandaloneServiceResponse(StandaloneServiceBase):
    """Schema for StandaloneService response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat() if dt else None
    
    @field_serializer('price', 'price_min', 'price_max')
    def serialize_decimal(self, value: Optional[Decimal], _info):
        return float(value) if value is not None else None
    
    class Config:
        from_attributes = True


class StandaloneServiceListResponse(BaseModel):
    """Schema for list of standalone services"""
    services: List[StandaloneServiceResponse]
    total: int
    
    class Config:
        from_attributes = True
