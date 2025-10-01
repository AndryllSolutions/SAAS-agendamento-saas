"""
Company Schemas
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class CompanyBase(BaseModel):
    """Base company schema"""
    name: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    description: Optional[str] = None


class CompanyCreate(CompanyBase):
    """Schema for creating a company"""
    slug: str = Field(..., min_length=3, max_length=100)
    timezone: str = "America/Sao_Paulo"
    currency: str = "BRL"


class CompanyUpdate(BaseModel):
    """Schema for updating a company"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    features: Optional[Dict[str, bool]] = None
    settings: Optional[Dict[str, Any]] = None


class CompanyResponse(CompanyBase):
    """Schema for company response"""
    id: int
    slug: str
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    timezone: str
    currency: str
    logo_url: Optional[str] = None
    primary_color: str
    secondary_color: str
    is_active: bool
    subscription_plan: str
    features: Optional[Dict[str, bool]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
