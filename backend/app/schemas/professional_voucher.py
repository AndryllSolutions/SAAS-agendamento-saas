"""
Professional Voucher Schemas
"""
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, validator
from decimal import Decimal

from app.schemas.user import UserResponse


class VoucherCategory(str):
    ALIMENTACAO = "alimentacao"
    TRANSPORTE = "transporte"
    OUTROS = "outros"


class VoucherPaymentMethod(str):
    DINHEIRO = "dinheiro"
    PIX = "pix"
    TRANSFERENCIA = "transferencia"
    CARTAO = "cartao"


class VoucherFrequency(str):
    SEMANAL = "semanal"
    QUINZENAL = "quinzenal"
    MENSAL = "mensal"


class VoucherBase(BaseModel):
    """Base schema for voucher"""
    amount: Decimal = Field(..., gt=0, description="Voucher amount")
    due_date: date
    category: VoucherCategory
    payment_method: VoucherPaymentMethod
    account: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    observation: Optional[str] = None
    is_advance_commission: bool = False
    generate_financial_movement: bool = False
    is_recurring: bool = False
    recurring_frequency: Optional[VoucherFrequency] = None
    recurring_end_date: Optional[date] = None

    @validator('recurring_frequency')
    def recurring_frequency_required_if_recurring(cls, v, values):
        if values.get('is_recurring') and v is None:
            raise ValueError('recurring_frequency is required when is_recurring is True')
        return v

    @validator('recurring_end_date')
    def recurring_end_date_required_if_recurring(cls, v, values):
        if values.get('is_recurring') and v is None:
            raise ValueError('recurring_end_date is required when is_recurring is True')
        if v and values.get('start_date') and v <= values['start_date']:
            raise ValueError('recurring_end_date must be after start_date')
        return v


class VoucherCreate(VoucherBase):
    """Schema for creating voucher"""
    pass


class VoucherUpdate(BaseModel):
    """Schema for updating voucher"""
    amount: Optional[Decimal] = Field(None, gt=0)
    due_date: Optional[date] = None
    category: Optional[VoucherCategory] = None
    payment_method: Optional[VoucherPaymentMethod] = None
    account: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    observation: Optional[str] = None
    is_paid: Optional[bool] = None
    paid_date: Optional[date] = None
    is_advance_commission: Optional[bool] = None
    generate_financial_movement: Optional[bool] = None
    is_recurring: Optional[bool] = None
    recurring_frequency: Optional[VoucherFrequency] = None
    recurring_end_date: Optional[date] = None

    @validator('paid_date')
    def paid_date_required_if_paid(cls, v, values):
        if values.get('is_paid') and v is None:
            raise ValueError('paid_date is required when is_paid is True')
        return v


class VoucherResponse(VoucherBase):
    """Schema for voucher response"""
    id: int
    professional_id: int
    company_id: int
    is_paid: bool
    paid_date: Optional[date]
    financial_movement_id: Optional[int]
    created_at: str
    updated_at: str
    created_by: Optional[int]
    
    # Computed status
    status: str

    # Optional relationships
    professional: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class VoucherPayment(BaseModel):
    """Schema for voucher payment"""
    paid_date: date
    payment_method: Optional[VoucherPaymentMethod] = None
    observation: Optional[str] = None


class VoucherListResponse(BaseModel):
    """Schema for voucher list response"""
    vouchers: list[VoucherResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
