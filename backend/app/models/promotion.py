"""
Promotion Model - Promoções
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class PromotionType(str, enum.Enum):
    """Promotion type"""
    DISCOUNT_PERCENTAGE = "discount_percentage"
    DISCOUNT_FIXED = "discount_fixed"
    BUY_ONE_GET_ONE = "buy_one_get_one"
    FREE_SERVICE = "free_service"
    OTHER = "other"


class Promotion(BaseModel):
    """Promotion model - Promoções"""
    
    __tablename__ = "promotions"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Promotion Type
    type = Column(SQLEnum(PromotionType), nullable=False)
    discount_value = Column(Numeric(10, 2), nullable=True)  # Valor ou percentual
    
    # Applicable to
    applies_to_services = Column(JSON, nullable=True)  # Lista de IDs de serviços
    applies_to_products = Column(JSON, nullable=True)  # Lista de IDs de produtos
    applies_to_clients = Column(JSON, nullable=True)  # Lista de IDs de clientes ou tags
    
    # Validity
    valid_from = Column(DateTime, nullable=False, index=True)
    valid_until = Column(DateTime, nullable=False, index=True)
    
    # Usage Limits
    max_uses = Column(Integer, nullable=True)  # Limite de usos total
    max_uses_per_client = Column(Integer, nullable=True)  # Limite de usos por cliente
    current_uses = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    company = relationship("Company", back_populates="promotions")
    
    def __repr__(self):
        return f"<Promotion {self.name}>"

