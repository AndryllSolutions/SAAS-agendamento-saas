"""
Commission Configuration Model
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Numeric, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class CommissionConfig(BaseModel):
    """Commission Configuration model - Configurações padrão de comissões"""
    
    __tablename__ = "commission_configs"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Date Filter
    date_filter_type = Column(String(50), default="competence", nullable=False)  # competence, availability
    
    # Command Type Filter
    command_type_filter = Column(String(50), default="finished", nullable=False)  # all, finished
    
    # Fees Configuration
    fees_responsibility = Column(String(50), default="proportional", nullable=False)  # proportional, company_100, professional_100
    
    # Discounts Configuration
    discounts_responsibility = Column(String(50), default="proportional", nullable=False)  # proportional, company_100, professional_100
    
    # Additional Service Cost
    deduct_additional_service_cost = Column(Boolean, default=False, nullable=False)
    
    # Product Discount Origin
    product_discount_origin = Column(String(50), default="professional_commission", nullable=False)  # professional_commission, service
    
    # Discount consumed products from
    discount_products_from = Column(String(50), nullable=True)  # Pode ser uma data ou outro critério
    
    # Relationships
    company = relationship("Company", back_populates="commission_config")
    
    def __repr__(self):
        return f"<CommissionConfig {self.company_id}>"

