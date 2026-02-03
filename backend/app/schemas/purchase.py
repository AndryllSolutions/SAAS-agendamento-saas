"""
Purchase and Supplier Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from decimal import Decimal

from app.models.purchase import PurchaseStatus


class SupplierBase(BaseModel):
    """Base supplier schema"""
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cellphone: Optional[str] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    notes: Optional[str] = None


class SupplierCreate(SupplierBase):
    """Schema for creating a supplier (internal - requires company_id)"""
    company_id: int


class SupplierCreatePublic(SupplierBase):
    """Schema for creating a supplier via API (company_id auto-filled from auth)"""
    pass


class SupplierUpdate(BaseModel):
    """Schema for updating a supplier"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cellphone: Optional[str] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    notes: Optional[str] = None


class SupplierResponse(SupplierBase):
    """Schema for supplier response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PurchaseItemBase(BaseModel):
    """Base purchase item schema"""
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_cost: Decimal = Field(..., gt=0)
    total_cost: Decimal = Field(..., gt=0)


class PurchaseItemCreate(PurchaseItemBase):
    """Schema for creating a purchase item"""
    pass


class PurchaseItemResponse(PurchaseItemBase):
    """Schema for purchase item response"""
    id: int
    purchase_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PurchaseBase(BaseModel):
    """Base purchase schema"""
    supplier_id: int
    purchase_date: datetime
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class PurchaseCreate(PurchaseBase):
    """Schema for creating a purchase (internal - requires company_id)"""
    company_id: int
    items: List[PurchaseItemCreate] = Field(..., min_items=1)


class PurchaseCreatePublic(PurchaseBase):
    """Schema for creating a purchase via API (company_id auto-filled from auth)"""
    items: List[PurchaseItemCreate] = Field(..., min_items=1)


class PurchaseUpdate(BaseModel):
    """Schema for updating a purchase"""
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[PurchaseStatus] = None


class PurchaseResponse(PurchaseBase):
    """Schema for purchase response"""
    id: int
    company_id: int
    number: str
    status: PurchaseStatus
    total_value: Decimal
    xml_imported: bool
    xml_url: Optional[str] = None
    items: List[PurchaseItemResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

