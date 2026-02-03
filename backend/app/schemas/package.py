"""
Package Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_serializer, ConfigDict
from datetime import datetime, date
from decimal import Decimal

from app.models.package import PackageStatus


class PredefinedPackageBase(BaseModel):
    """Base predefined package schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    services_included: List[Dict] = Field(..., min_items=1)  # [{"service_id": 1, "sessions": 5}, ...]
    validity_days: int = Field(..., gt=0)
    total_value: Decimal = Field(..., gt=0)


class PredefinedPackageCreate(PredefinedPackageBase):
    """Schema for creating a predefined package (internal - requires company_id)"""
    company_id: int


class PredefinedPackageCreatePublic(PredefinedPackageBase):
    """Schema for creating a predefined package via API (company_id auto-filled from auth)"""
    pass


class PredefinedPackageUpdate(BaseModel):
    """Schema for updating a predefined package"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    services_included: Optional[List[Dict]] = None
    validity_days: Optional[int] = Field(None, gt=0)
    total_value: Optional[Decimal] = Field(None, gt=0)
    is_active: Optional[bool] = None


class PredefinedPackageResponse(PredefinedPackageBase):
    """Schema for predefined package response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PackageBase(BaseModel):
    """Base package schema - IMPORTANT: Model uses client_crm_id"""
    client_id: int  # API field name (maps to model's client_crm_id)
    predefined_package_id: int
    sale_date: datetime
    expiry_date: datetime


class PackageCreate(PackageBase):
    """Schema for creating a package (internal - requires company_id)"""
    company_id: int
    paid_value: Decimal = Field(..., gt=0)


class PackageCreatePublic(PackageBase):
    """Schema for creating a package via API (company_id auto-filled from auth)"""
    paid_value: Decimal = Field(..., gt=0)


class PackageUpdate(BaseModel):
    """Schema for updating a package"""
    status: Optional[PackageStatus] = None
    sessions_balance: Optional[Dict] = None


class PackageResponse(BaseModel):
    """Schema for package response - Maps client_crm_id to client_id"""
    id: int
    company_id: int
    client_id: int  # Will be populated from model's client_crm_id
    predefined_package_id: int
    sale_date: datetime
    expiry_date: datetime
    status: PackageStatus
    sessions_balance: Dict
    paid_value: Decimal
    invoice_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    @classmethod
    def from_model(cls, package):
        """Create response from Package model (maps client_crm_id to client_id)"""
        return cls(
            id=package.id,
            company_id=package.company_id,
            client_id=package.client_crm_id,  # Map client_crm_id to client_id
            predefined_package_id=package.predefined_package_id,
            sale_date=package.sale_date,
            expiry_date=package.expiry_date,
            status=package.status,
            sessions_balance=package.sessions_balance,
            paid_value=package.paid_value,
            invoice_id=package.invoice_id,
            created_at=package.created_at,
            updated_at=package.updated_at
        )


class PackageUseSession(BaseModel):
    """Schema for using a package session"""
    service_id: int
    quantity: int = Field(1, gt=0)

