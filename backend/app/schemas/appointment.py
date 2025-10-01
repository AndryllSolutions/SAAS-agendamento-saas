"""
Appointment Schemas
"""
from typing import Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime

from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    """Base appointment schema"""
    service_id: int
    professional_id: Optional[int] = None
    resource_id: Optional[int] = None
    start_time: datetime
    client_notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment"""
    client_id: Optional[int] = None  # Will be set from current user if not provided
    
    @validator('start_time')
    def validate_start_time(cls, v):
        if v < datetime.utcnow():
            raise ValueError('Start time must be in the future')
        return v


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment"""
    start_time: Optional[datetime] = None
    professional_id: Optional[int] = None
    resource_id: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    client_notes: Optional[str] = None
    professional_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class AppointmentCancel(BaseModel):
    """Schema for cancelling an appointment"""
    cancellation_reason: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response"""
    id: int
    company_id: int
    client_id: int
    end_time: datetime
    status: AppointmentStatus
    professional_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    checked_in_at: Optional[datetime] = None
    check_in_code: Optional[str] = None
    payment_status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AppointmentCheckIn(BaseModel):
    """Schema for appointment check-in"""
    check_in_code: str


class AppointmentListFilter(BaseModel):
    """Schema for filtering appointments"""
    status: Optional[AppointmentStatus] = None
    professional_id: Optional[int] = None
    client_id: Optional[int] = None
    service_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    skip: int = 0
    limit: int = 100
