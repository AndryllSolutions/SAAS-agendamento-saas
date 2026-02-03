"""
Financial Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime
from decimal import Decimal

from app.models.financial import TransactionType, TransactionStatus, TransactionOrigin


class FinancialAccountBase(BaseModel):
    """Base financial account schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    admin_only: bool = False
    account_type: str = Field("cash", min_length=1, max_length=50)  # cash, bank, credit_card
    balance: Decimal = Field(0, ge=0)
    is_active: bool = True


class FinancialAccountCreate(FinancialAccountBase):
    """Schema for creating a financial account"""
    company_id: int


class FinancialAccountUpdate(BaseModel):
    """Schema for updating a financial account"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    admin_only: Optional[bool] = None
    account_type: Optional[str] = None
    balance: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class FinancialAccountResponse(FinancialAccountBase):
    """Schema for financial account response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PaymentFormBase(BaseModel):
    """Base payment form schema"""
    name: str = Field(..., min_length=1, max_length=255)
    type: str  # cash, card, pix, boleto, etc.
    integrates_with_gateway: bool = False
    gateway_name: Optional[str] = None


class PaymentFormCreate(PaymentFormBase):
    """Schema for creating a payment form"""
    company_id: int


class PaymentFormUpdate(BaseModel):
    """Schema for updating a payment form"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    integrates_with_gateway: Optional[bool] = None
    gateway_name: Optional[str] = None


class PaymentFormResponse(PaymentFormBase):
    """Schema for payment form response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FinancialCategoryBase(BaseModel):
    """Base financial category schema"""
    name: str = Field(..., min_length=1, max_length=255)
    type: str  # income, expense
    description: Optional[str] = None


class FinancialCategoryCreate(FinancialCategoryBase):
    """Schema for creating a financial category"""
    company_id: int
    parent_id: Optional[int] = None


class FinancialCategoryUpdate(BaseModel):
    """Schema for updating a financial category"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None


class FinancialCategoryResponse(FinancialCategoryBase):
    """Schema for financial category response"""
    id: int
    company_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FinancialAccountNested(BaseModel):
    """Lightweight nested account representation for transactions"""
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class FinancialCategoryNested(BaseModel):
    """Lightweight nested category representation for transactions"""
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ClientNested(BaseModel):
    """Lightweight nested client representation for transactions"""
    id: int
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class FinancialTransactionBase(BaseModel):
    """Base financial transaction schema"""
    type: TransactionType
    value: Decimal = Field(..., gt=0, validation_alias='amount')  # Valor bruto (accepts 'amount' as alias)
    net_value: Optional[Decimal] = None  # Valor líquido (após taxas)
    fee_percentage: Optional[Decimal] = Field(None, ge=0, le=100)  # Taxa percentual
    fee_value: Optional[Decimal] = Field(None, ge=0)  # Valor da taxa
    date: datetime
    description: Optional[str] = None
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    client_id: Optional[int] = None
    payment_method: Optional[str] = None
    
    model_config = ConfigDict(populate_by_name=True)  # Allow both 'value' and 'amount'


class FinancialTransactionCreate(FinancialTransactionBase):
    """Schema for creating a financial transaction"""
    company_id: int
    origin: TransactionOrigin = TransactionOrigin.MANUAL
    command_id: Optional[int] = None
    purchase_id: Optional[int] = None


class FinancialTransactionUpdate(BaseModel):
    """Schema for updating a financial transaction"""
    type: Optional[TransactionType] = None
    value: Optional[Decimal] = Field(None, gt=0)
    net_value: Optional[Decimal] = None
    fee_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    fee_value: Optional[Decimal] = Field(None, ge=0)
    date: Optional[datetime] = None
    description: Optional[str] = None
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    status: Optional[TransactionStatus] = None
    is_paid: Optional[bool] = None
    client_id: Optional[int] = None
    payment_method: Optional[str] = None


class FinancialTransactionResponse(FinancialTransactionBase):
    """Schema for financial transaction response"""
    id: int
    company_id: int
    origin: str
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    client_id: Optional[int] = None
    command_id: Optional[int] = None
    purchase_id: Optional[int] = None
    status: TransactionStatus
    is_paid: bool
    account: Optional[FinancialAccountNested] = None
    category: Optional[FinancialCategoryNested] = None
    client: Optional[ClientNested] = None
    payment_method: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CashRegisterBase(BaseModel):
    """Base cash register schema"""
    opening_balance: Decimal = Field(0, ge=0)


class CashRegisterCreate(CashRegisterBase):
    """Schema for creating a cash register"""
    company_id: int


class CashRegisterUpdate(BaseModel):
    """Schema for updating a cash register"""
    closing_balance: Optional[Decimal] = Field(None, ge=0)
    payment_summary: Optional[Dict] = None


class CashRegisterResponse(CashRegisterBase):
    """Schema for cash register response"""
    id: int
    company_id: int
    user_id: int
    opening_date: datetime
    closing_date: Optional[datetime] = None
    closing_balance: Optional[Decimal] = None
    payment_summary: Optional[Dict] = None
    is_open: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FinancialDashboard(BaseModel):
    """Schema for financial dashboard"""
    to_receive_today: Decimal
    to_pay_today: Decimal
    cash_position: Decimal
    bank_position: Decimal
    total_received_period: Decimal
    total_to_receive_period: Decimal  # A receber no período
    total_paid_period: Decimal
    total_to_pay_period: Decimal  # A pagar no período
    sales_by_day: List[Dict] = []
    cash_flow_by_day: List[Dict] = []  # Fluxo de caixa (entrada/saída/saldo acumulado)

