"""
Goal Schemas
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal

from app.models.goal import GoalType


class GoalBase(BaseModel):
    """Base goal schema"""
    type: GoalType
    target_value: Decimal = Field(..., gt=0)
    period_start: datetime
    period_end: datetime
    description: Optional[str] = None


class GoalCreate(GoalBase):
    """Schema for creating a goal (internal - requires company_id)"""
    company_id: int
    professional_id: Optional[int] = None


class GoalCreatePublic(GoalBase):
    """Schema for creating a goal via API (company_id auto-filled from auth)"""
    professional_id: Optional[int] = None


class GoalUpdate(BaseModel):
    """Schema for updating a goal"""
    type: Optional[GoalType] = None
    target_value: Optional[Decimal] = Field(None, gt=0)
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class GoalResponse(GoalBase):
    """Schema for goal response"""
    id: int
    company_id: int
    professional_id: Optional[int] = None
    is_active: bool
    current_value: Decimal
    progress_percentage: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

