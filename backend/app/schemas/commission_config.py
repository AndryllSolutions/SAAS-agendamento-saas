"""
Commission Configuration Schemas
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.commission_config import CommissionConfig


class CommissionConfigBase(BaseModel):
    """Base commission configuration schema"""
    date_filter_type: str = Field("competence", description="competence or availability")
    command_type_filter: str = Field("finished", description="all or finished")
    fees_responsibility: str = Field("proportional", description="proportional, company_100, or professional_100")
    discounts_responsibility: str = Field("proportional", description="proportional, company_100, or professional_100")
    deduct_additional_service_cost: bool = Field(False)
    product_discount_origin: str = Field("professional_commission", description="professional_commission or service")
    discount_products_from: Optional[str] = None


class CommissionConfigCreate(CommissionConfigBase):
    """Schema for creating commission configuration"""
    company_id: int


class CommissionConfigUpdate(CommissionConfigBase):
    """Schema for updating commission configuration"""
    pass


class CommissionConfigResponse(CommissionConfigBase):
    """Schema for commission configuration response"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

