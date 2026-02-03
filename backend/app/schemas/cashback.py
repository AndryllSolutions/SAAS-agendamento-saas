"""
Cashback Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.cashback import CashbackRuleType


class CashbackRuleBase(BaseModel):
    """Base cashback rule schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    rule_type: CashbackRuleType
    value: Decimal = Field(..., gt=0)
    applies_to_products: bool = False
    applies_to_services: bool = False
    specific_items: Optional[Dict] = None
    client_filters: Optional[Dict] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class CashbackRuleCreate(CashbackRuleBase):
    """Schema for creating a cashback rule (internal - requires company_id)"""
    company_id: int


class CashbackRuleCreatePublic(CashbackRuleBase):
    """Schema for creating a cashback rule via API (company_id auto-filled from auth)"""
    pass


class CashbackRuleUpdate(BaseModel):
    """Schema for updating a cashback rule"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    rule_type: Optional[CashbackRuleType] = None
    value: Optional[Decimal] = Field(None, gt=0)
    applies_to_products: Optional[bool] = None
    applies_to_services: Optional[bool] = None
    specific_items: Optional[Dict] = None
    client_filters: Optional[Dict] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class CashbackRuleResponse(CashbackRuleBase):
    """Schema for cashback rule response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CashbackBalanceResponse(BaseModel):
    """Schema for cashback balance response"""
    id: int
    company_id: int
    client_id: int
    balance: Decimal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CashbackTransactionResponse(BaseModel):
    """Schema for cashback transaction response"""
    id: int
    company_id: int
    balance_id: int
    rule_id: Optional[int] = None
    command_id: Optional[int] = None
    value: Decimal
    transaction_type: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

