"""
Goal Model - Metas
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class GoalType(str, enum.Enum):
    """Goal type"""
    REVENUE = "revenue"  # Faturamento
    APPOINTMENTS = "appointments"  # Quantidade de atendimentos
    PRODUCT_SALES = "product_sales"  # Vendas de produto
    SERVICES = "services"  # Quantidade de serviços
    OTHER = "other"


class Goal(BaseModel):
    """Goal model - Metas por profissional ou empresa"""
    
    __tablename__ = "goals"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Goal Info
    type = Column(SQLEnum(GoalType), nullable=False, index=True)
    target_value = Column(Numeric(10, 2), nullable=False)  # Valor da meta
    
    # Period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Calculated Progress (updated by background task)
    current_value = Column(Numeric(10, 2), default=0)
    progress_percentage = Column(Integer, default=0)  # 0-100
    
    # Relationships
    company = relationship("Company", back_populates="goals")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="goals")
    
    def __repr__(self):
        return f"<Goal {self.type} - {self.target_value}>"

