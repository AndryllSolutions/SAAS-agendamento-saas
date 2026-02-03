"""
Anamnesis Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.anamnesis import AnamnesisStatus


class AnamnesisModelBase(BaseModel):
    """Base anamnesis model schema"""
    name: str = Field(..., min_length=1, max_length=255)
    fields: Dict = Field(..., min_items=1)  # Estrutura dos campos
    related_services: Optional[List[int]] = None


class AnamnesisModelCreate(AnamnesisModelBase):
    """Schema for creating an anamnesis model"""
    company_id: int


class AnamnesisModelUpdate(BaseModel):
    """Schema for updating an anamnesis model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    fields: Optional[Dict] = None
    related_services: Optional[List[int]] = None


class AnamnesisModelResponse(AnamnesisModelBase):
    """Schema for anamnesis model response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnamnesisBase(BaseModel):
    """Base anamnesis schema"""
    client_id: int
    model_id: int
    professional_id: Optional[int] = None
    responses: Dict = Field(..., min_items=1)


class AnamnesisCreate(AnamnesisBase):
    """Schema for creating an anamnesis"""
    company_id: int


class AnamnesisUpdate(BaseModel):
    """Schema for updating an anamnesis"""
    responses: Optional[Dict] = None
    status: Optional[str] = None


class AnamnesisResponse(AnamnesisBase):
    """Schema for anamnesis response"""
    id: int
    company_id: int
    status: str
    is_signed: bool
    signature_date: Optional[datetime] = None
    signature_image_url: Optional[str] = None
    signature_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnamnesisSign(BaseModel):
    """Schema for signing an anamnesis"""
    signature_image_url: Optional[str] = None
    signature_name: str = Field(..., min_length=1)
    signature_ip: Optional[str] = None

