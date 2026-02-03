"""
Commission Schemas
"""
from typing import Optional
from pydantic import BaseModel, computed_field
from datetime import datetime
from decimal import Decimal

from app.models.commission import CommissionStatus


class ProfessionalMinimal(BaseModel):
    """Minimal professional info for commission response"""
    id: int
    full_name: str
    
    class Config:
        from_attributes = True


class CommandMinimal(BaseModel):
    """Minimal command info for commission response"""
    id: int
    number: Optional[str] = None
    
    class Config:
        from_attributes = True


class CommissionResponse(BaseModel):
    """Schema for commission response"""
    id: int
    company_id: int
    command_id: int
    command_item_id: Optional[int] = None
    professional_id: int
    base_value: Decimal
    commission_percentage: int
    commission_value: Decimal
    status: CommissionStatus
    paid_at: Optional[datetime] = None
    payment_notes: Optional[str] = None
    financial_transaction_id: Optional[int] = None  # Link para transação financeira
    created_at: datetime
    updated_at: datetime
    
    # Nested objects (carregados via joinedload)
    professional: Optional[ProfessionalMinimal] = None
    command: Optional[CommandMinimal] = None
    
    class Config:
        from_attributes = True


class CommissionPay(BaseModel):
    """Schema for paying a commission"""
    notes: Optional[str] = None

