"""
Service Schemas
"""
from typing import Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict
from datetime import datetime
from decimal import Decimal


class ServiceCategoryBase(BaseModel):
    """Base service category schema"""
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3B82F6"


class ServiceCategoryCreate(ServiceCategoryBase):
    """Schema for creating a service category"""
    pass


class ServiceCategoryUpdate(BaseModel):
    """Schema for updating a service category"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceCategoryResponse(ServiceCategoryBase):
    """Schema for service category response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ServiceBase(BaseModel):
    """Base service schema - accepts both duration and duration_minutes"""
    name: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=5.0, description="Preço mínimo: R$ 5,00")
    duration: Optional[int] = Field(None, ge=5, le=480, description="Duração de 5 a 480 minutos (8 horas)")
    duration_minutes: Optional[int] = Field(None, ge=5, le=480, description="Duração de 5 a 480 minutos (8 horas)")
    category_id: Optional[int] = None
    
    @model_validator(mode='after')
    def normalize_duration(self):
        """Normalize duration field - use duration if provided, otherwise duration_minutes"""
        if self.duration is not None:
            self.duration_minutes = self.duration
        elif self.duration_minutes is None:
            raise ValueError('duration (or duration_minutes) is required')
        return self


class ServiceCreate(ServiceBase):
    """Schema for creating a service"""
    company_id: Optional[int] = None
    currency: str = "BRL"
    requires_professional: bool = True
    commission_rate: int = Field(0, ge=0, le=100)
    available_online: bool = True
    online_booking_enabled: bool = True
    is_favorite: bool = False
    lead_time_minutes: int = Field(0, ge=0, le=1440)
    extra_cost: Optional[Decimal] = Field(None, ge=0)


class ServiceUpdate(BaseModel):
    """Schema for updating a service"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=5.0, description="Preço mínimo: R$ 5,00")
    duration_minutes: Optional[int] = Field(None, ge=5, le=480, description="Duração de 5 a 480 minutos (8 horas)")
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    requires_professional: Optional[bool] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    commission_rate: Optional[int] = Field(None, ge=0, le=100)
    available_online: Optional[bool] = None
    online_booking_enabled: Optional[bool] = None
    is_favorite: Optional[bool] = None
    lead_time_minutes: Optional[int] = Field(None, ge=0, le=1440)
    extra_cost: Optional[Decimal] = Field(None, ge=0)


class ServiceResponse(BaseModel):
    """Schema for service response"""
    id: int
    company_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    duration_minutes: int
    category_id: Optional[int] = None
    currency: str
    is_active: bool
    is_favorite: bool
    requires_professional: bool
    available_online: bool = True  # 🔥 FIX: Default to True if None
    online_booking_enabled: bool = True  # 🔥 FIX: Default to True if None
    lead_time_minutes: int
    extra_cost: Optional[Decimal] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    commission_rate: Optional[int] = 0
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_model(cls, service):
        """Create response from Service model"""
        return cls(
            id=service.id,
            company_id=service.company_id,
            name=service.name,
            description=service.description,
            price=service.price,
            duration_minutes=service.duration_minutes,
            category_id=service.category_id,
            currency=service.currency,
            is_active=service.is_active,
            is_favorite=service.is_favorite,
            requires_professional=service.requires_professional,
            available_online=service.available_online if service.available_online is not None else True,  # 🔥 FIX
            online_booking_enabled=service.online_booking_enabled if service.online_booking_enabled is not None else True,  # 🔥 FIX
            lead_time_minutes=service.lead_time_minutes or 0,
            extra_cost=service.extra_cost,
            image_url=service.image_url,
            color=service.color,
            commission_rate=service.commission_rate,
            created_at=service.created_at,
            updated_at=service.updated_at
        )
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
