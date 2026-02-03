"""
Invoice Schemas
"""
from typing import Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.invoice import InvoiceType, InvoiceStatus, InvoiceProvider


class FiscalConfigurationBase(BaseModel):
    """Base fiscal configuration schema"""
    nfse_provider: Optional[str] = None
    nfe_provider: Optional[str] = None
    nfce_provider: Optional[str] = None
    provider_api_key: Optional[str] = None
    provider_api_secret: Optional[str] = None
    environment: str = "production"
    auto_generate_nfse: bool = False
    auto_generate_nfe: bool = False
    auto_generate_nfce: bool = False
    settings: Optional[Dict] = None


class FiscalConfigurationCreate(FiscalConfigurationBase):
    """Schema for creating fiscal configuration"""
    company_id: int


class FiscalConfigurationUpdate(BaseModel):
    """Schema for updating fiscal configuration"""
    nfse_provider: Optional[str] = None
    nfe_provider: Optional[str] = None
    nfce_provider: Optional[str] = None
    provider_api_key: Optional[str] = None
    provider_api_secret: Optional[str] = None
    environment: Optional[str] = None
    auto_generate_nfse: Optional[bool] = None
    auto_generate_nfe: Optional[bool] = None
    auto_generate_nfce: Optional[bool] = None
    settings: Optional[Dict] = None


class FiscalConfigurationResponse(FiscalConfigurationBase):
    """Schema for fiscal configuration response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    """Base invoice schema"""
    invoice_type: InvoiceType
    command_id: Optional[int] = None
    client_id: Optional[int] = None
    total_value: Decimal = Field(..., gt=0)


class InvoiceCreate(InvoiceBase):
    """Schema for creating an invoice"""
    company_id: int


class InvoiceResponse(InvoiceBase):
    """Schema for invoice response"""
    id: int
    company_id: int
    number: Optional[str] = None
    access_key: Optional[str] = None
    provider: Optional[str] = None
    provider_invoice_id: Optional[str] = None
    status: InvoiceStatus
    issue_date: Optional[datetime] = None
    sent_date: Optional[datetime] = None
    xml_url: Optional[str] = None
    pdf_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InvoiceGenerate(BaseModel):
    """Schema for generating an invoice"""
    command_id: int
    invoice_type: InvoiceType

