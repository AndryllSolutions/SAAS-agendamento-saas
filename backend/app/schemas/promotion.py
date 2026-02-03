"""
Promotion Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.promotion import PromotionType
from decimal import Decimal


class PromotionBase(BaseModel):
    """Base promotion schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: PromotionType
    discount_value: Optional[Decimal] = None
    applies_to_services: Optional[List[int]] = None
    applies_to_products: Optional[List[int]] = None
    applies_to_clients: Optional[Dict] = None
    valid_from: datetime
    valid_until: datetime
    max_uses: Optional[int] = Field(None, gt=0)
    max_uses_per_client: Optional[int] = Field(None, gt=0)


class PromotionCreate(PromotionBase):
    """Schema for creating a promotion"""
    company_id: int


class PromotionUpdate(BaseModel):
    """Schema for updating a promotion"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    type: Optional[PromotionType] = None
    discount_value: Optional[Decimal] = None
    applies_to_services: Optional[List[int]] = None
    applies_to_products: Optional[List[int]] = None
    applies_to_clients: Optional[Dict] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    max_uses: Optional[int] = Field(None, gt=0)
    max_uses_per_client: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class PromotionResponse(PromotionBase):
    """Schema for promotion response"""
    id: int
    company_id: int
    current_uses: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PromotionApply(BaseModel):
    """Schema for applying a promotion"""
    command_id: int

