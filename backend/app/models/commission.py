"""
Commission Model - Comissões
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class CommissionStatus(str, enum.Enum):
    """Commission status"""
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


class Commission(BaseModel):
    """Commission model - Comissões de profissionais"""
    
    __tablename__ = "commissions"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="CASCADE"), nullable=False, index=True)
    command_item_id = Column(Integer, ForeignKey("command_items.id", ondelete="CASCADE"), nullable=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Commission Info
    base_value = Column(Numeric(10, 2), nullable=False)  # Valor base do item
    commission_percentage = Column(Integer, nullable=False)  # Percentual de comissão
    commission_value = Column(Numeric(10, 2), nullable=False)  # Valor da comissão calculada
    
    # Status
    status = Column(SQLEnum(CommissionStatus), default=CommissionStatus.PENDING, nullable=False, index=True)
    
    # Payment
    paid_at = Column(DateTime, nullable=True)
    payment_notes = Column(Text, nullable=True)
    financial_transaction_id = Column(Integer, ForeignKey("financial_transactions.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="commissions")
    command = relationship("Command", back_populates="commissions")
    command_item = relationship("CommandItem")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="commissions")
    # Many-to-One: Várias comissões pertencem a uma transação financeira
    financial_transaction = relationship("FinancialTransaction", back_populates="commissions")
    
    def __repr__(self):
        return f"<Commission {self.id} - {self.commission_value}>"

