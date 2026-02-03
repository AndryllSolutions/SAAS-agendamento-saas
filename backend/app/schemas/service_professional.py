"""
Service Professional Schemas for API serialization
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserResponse
from app.schemas.service import ServiceResponse


# Base Schema
class ServiceProfessionalBase(BaseModel):
    service_id: int
    professional_id: int
    is_active: bool = True


# Create Schema
class ServiceProfessionalCreate(ServiceProfessionalBase):
    pass


# Update Schema
class ServiceProfessionalUpdate(BaseModel):
    is_active: Optional[bool] = None


# Response Schema
class ServiceProfessionalResponse(ServiceProfessionalBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    assigned_at: datetime
    removed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Response with nested objects
class ServiceProfessionalWithDetailsResponse(ServiceProfessionalResponse):
    professional: UserResponse
    service: ServiceResponse


# Bulk assignment schema
class ServiceProfessionalBulkAssign(BaseModel):
    service_id: int
    professional_ids: list[int]
    replace_existing: bool = False  # If True, removes other assignments


# List response
class ServiceProfessionalListResponse(BaseModel):
    assignments: list[ServiceProfessionalWithDetailsResponse]
    total: int
