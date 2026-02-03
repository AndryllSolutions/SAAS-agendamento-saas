"""
Cashback Model - Sistema de Cashback
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class CashbackRuleType(str, enum.Enum):
    """Cashback rule type"""
    PERCENTAGE = "percentage"
    FIXED = "fixed"


class CashbackRule(BaseModel):
    """Cashback Rule model - Regras de cashback"""
    
    __tablename__ = "cashback_rules"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Rule Info
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Rule Type
    rule_type = Column(SQLEnum(CashbackRuleType), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)  # Percentual ou valor fixo
    
    # Applicable to
    applies_to_products = Column(Boolean, default=False)
    applies_to_services = Column(Boolean, default=False)
    
    # Specific items (JSON: {"product_ids": [1,2], "service_ids": [3,4]})
    specific_items = Column(JSON, nullable=True)
    
    # Client filters (JSON: {"client_ids": [1,2], "tags": ["VIP"]})
    client_filters = Column(JSON, nullable=True)
    
    # Validity
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="cashback_rules")
    transactions = relationship("CashbackTransaction", back_populates="rule")
    
    def __repr__(self):
        return f"<CashbackRule {self.name}>"


class CashbackBalance(BaseModel):
    """Cashback Balance model - Saldo de cashback por cliente"""
    
    __tablename__ = "cashback_balances"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)  # ATUALIZADO: client_id -> client_crm_id
    
    balance = Column(Numeric(10, 2), default=0)  # Saldo atual
    
    # Relationships
    company = relationship("Company", back_populates="cashback_balances")
    client = relationship("Client", back_populates="cashback_balance")
    transactions = relationship("CashbackTransaction", back_populates="balance")
    
    def __repr__(self):
        return f"<CashbackBalance Client {self.client_crm_id} - {self.balance}>"


class CashbackTransaction(BaseModel):
    """Cashback Transaction model - Transações de cashback"""
    
    __tablename__ = "cashback_transactions"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    balance_id = Column(Integer, ForeignKey("cashback_balances.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(Integer, ForeignKey("cashback_rules.id", ondelete="SET NULL"), nullable=True)
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="SET NULL"), nullable=True)
    
    # Transaction Info
    value = Column(Numeric(10, 2), nullable=False)  # Valor ganho ou usado
    transaction_type = Column(String(20), nullable=False)  # earned, used
    description = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="cashback_transactions")
    balance = relationship("CashbackBalance", back_populates="transactions")
    rule = relationship("CashbackRule", back_populates="transactions")
    command = relationship("Command")
    
    def __repr__(self):
        return f"<CashbackTransaction {self.transaction_type} - {self.value}>"

