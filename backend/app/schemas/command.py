"""
Command Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.command import CommandStatus, CommandItemType


class CommandItemBase(BaseModel):
    """Base command item schema"""
    item_type: CommandItemType
    service_id: Optional[int] = None
    product_id: Optional[int] = None
    package_id: Optional[int] = None
    professional_id: Optional[int] = None
    quantity: int = Field(1, gt=0)
    unit_value: Decimal = Field(..., gt=0)
    commission_percentage: int = Field(0, ge=0, le=100)


class CommandItemCreate(CommandItemBase):
    """Schema for creating a command item"""
    pass


class CommandItemResponse(CommandItemBase):
    """Schema for command item response"""
    id: int
    command_id: int
    total_value: Decimal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CommandBase(BaseModel):
    """Base command schema"""
    client_crm_id: int
    professional_id: Optional[int] = None
    appointment_id: Optional[int] = None
    date: datetime
    notes: Optional[str] = None


class CommandCreate(CommandBase):
    """Schema for creating a command (internal - requires company_id)"""
    company_id: int
    items: List[CommandItemCreate] = []


class CommandCreatePublic(CommandBase):
    """Schema for creating a command via API (company_id auto-filled from auth)"""
    items: List[CommandItemCreate] = []


class CommandUpdate(BaseModel):
    """Schema for updating a command"""
    professional_id: Optional[int] = None
    status: Optional[CommandStatus] = None
    discount_value: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    payment_received: Optional[bool] = None


class CommandResponse(BaseModel):
    """Schema for command response"""
    id: int
    company_id: int
    client_crm_id: int
    number: str
    status: CommandStatus
    total_value: Decimal
    discount_value: Decimal
    net_value: Decimal
    payment_summary: Optional[str] = None
    payment_blocked: bool
    payment_received: bool
    has_nfse: bool
    has_nfe: bool
    has_nfce: bool
    items: List[CommandItemResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CommandFinish(BaseModel):
    """Schema for finishing a command"""
    payment_methods: List[dict] = []  # [{"method": "cash", "value": 100.00}, ...]
    generate_invoice: bool = False

