"""
Professional Schedule Override Schemas
"""
from datetime import date, time
from typing import List, Optional
from pydantic import BaseModel, Field, validator

from app.schemas.user import UserResponse


class ScheduleOverrideBase(BaseModel):
    """Base schema for schedule override"""
    start_date: date
    end_date: date
    description: str
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    break_start_time: Optional[time] = None
    break_end_time: Optional[time] = None
    week_days: List[str] = Field(..., description="List of week days: ['monday', 'tuesday', etc.]")
    is_active: bool = True

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

    @validator('week_days')
    def validate_week_days(cls, v):
        valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        for day in v:
            if day not in valid_days:
                raise ValueError(f'Invalid week day: {day}. Must be one of: {valid_days}')
        return v

    @validator('start_time', 'end_time')
    def validate_time_range(cls, v, values):
        if v is None:
            return v
        
        # If it's a day off (no times), that's valid
        if values.get('start_time') is None and values.get('end_time') is None:
            return v
            
        # If one time is set, both must be set
        if (values.get('start_time') is None) != (values.get('end_time') is None):
            raise ValueError('Both start_time and end_time must be set together')
            
        return v


class ScheduleOverrideCreate(ScheduleOverrideBase):
    """Schema for creating schedule override"""
    pass


class ScheduleOverrideUpdate(BaseModel):
    """Schema for updating schedule override"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    break_start_time: Optional[time] = None
    break_end_time: Optional[time] = None
    week_days: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ScheduleOverrideResponse(ScheduleOverrideBase):
    """Schema for schedule override response"""
    id: int
    professional_id: int
    company_id: int
    created_at: str
    updated_at: str
    created_by: Optional[int] = None
    
    # Optional relationships
    professional: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class ServiceOverrideBase(BaseModel):
    """Base schema for service override"""
    service_id: Optional[int] = None
    start_date: date
    end_date: date
    original_price: Optional[int] = None
    override_price: Optional[int] = None
    original_duration: Optional[int] = None
    override_duration: Optional[int] = None
    is_available: bool = True
    description: Optional[str] = None

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class ServiceOverrideCreate(ServiceOverrideBase):
    """Schema for creating service override"""
    pass


class ServiceOverrideUpdate(BaseModel):
    """Schema for updating service override"""
    service_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    original_price: Optional[int] = None
    override_price: Optional[int] = None
    original_duration: Optional[int] = None
    override_duration: Optional[int] = None
    is_available: Optional[bool] = None
    description: Optional[str] = None


class ServiceOverrideResponse(ServiceOverrideBase):
    """Schema for service override response"""
    id: int
    professional_id: int
    company_id: int
    created_at: str
    updated_at: str
    created_by: Optional[int] = None

    class Config:
        from_attributes = True


class CommissionRuleBase(BaseModel):
    """Base schema for commission rule"""
    service_id: Optional[int] = None
    commission_type: str = "percentage"
    commission_value: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True
    description: Optional[str] = None

    @validator('commission_type')
    def validate_commission_type(cls, v):
        if v not in ['percentage', 'fixed']:
            raise ValueError('commission_type must be either "percentage" or "fixed"')
        return v

    @validator('commission_value')
    def validate_commission_value(cls, v, values):
        if values.get('commission_type') == 'percentage' and (v < 0 or v > 100):
            raise ValueError('Percentage commission must be between 0 and 100')
        if v < 0:
            raise ValueError('Commission value must be positive')
        return v


class CommissionRuleCreate(CommissionRuleBase):
    """Schema for creating commission rule"""
    pass


class CommissionRuleUpdate(BaseModel):
    """Schema for updating commission rule"""
    service_id: Optional[int] = None
    commission_type: Optional[str] = None
    commission_value: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None


class CommissionRuleResponse(CommissionRuleBase):
    """Schema for commission rule response"""
    id: int
    professional_id: int
    company_id: int
    created_at: str
    updated_at: str
    created_by: Optional[int] = None

    class Config:
        from_attributes = True
