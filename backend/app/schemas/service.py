"""
Service Schemas
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


class ServiceCategoryBase(BaseModel):
    """Base service category schema"""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3B82F6"


class ServiceCategoryCreate(ServiceCategoryBase):
    """Schema for creating a service category"""
    pass


class ServiceCategoryUpdate(BaseModel):
    """Schema for updating a service category"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceCategoryResponse(ServiceCategoryBase):
    """Schema for service category response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    """Base service schema"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    duration_minutes: int = Field(..., gt=0, le=480)
    category_id: Optional[int] = None


class ServiceCreate(ServiceBase):
    """Schema for creating a service"""
    currency: str = "BRL"
    requires_professional: bool = True
    commission_rate: int = Field(0, ge=0, le=100)


class ServiceUpdate(BaseModel):
    """Schema for updating a service"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    duration_minutes: Optional[int] = Field(None, gt=0, le=480)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    requires_professional: Optional[bool] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    commission_rate: Optional[int] = Field(None, ge=0, le=100)


class ServiceResponse(ServiceBase):
    """Schema for service response"""
    id: int
    company_id: int
    currency: str
    is_active: bool
    requires_professional: bool
    image_url: Optional[str] = None
    color: str
    commission_rate: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
