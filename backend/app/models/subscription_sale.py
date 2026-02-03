"""
Subscription Sale Model - Vendas por Assinatura
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class SubscriptionSaleStatus(str, enum.Enum):
    """Subscription sale status"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SubscriptionSaleModel(BaseModel):
    """Subscription Sale Model - Modelos de assinatura"""
    
    __tablename__ = "subscription_sale_models"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Pricing
    monthly_value = Column(Numeric(10, 2), nullable=False)
    
    # What's included
    services_included = Column(JSON, nullable=True)  # Lista de IDs de serviços
    credits_included = Column(Numeric(10, 2), nullable=True)  # Créditos mensais
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="subscription_sale_models")
    subscriptions = relationship("SubscriptionSale", back_populates="model", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SubscriptionSaleModel {self.name}>"


class SubscriptionSale(BaseModel):
    """Subscription Sale model - Assinaturas vendidas"""
    
    __tablename__ = "subscription_sales"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)  # ATUALIZADO: client_id -> client_crm_id
    model_id = Column(Integer, ForeignKey("subscription_sale_models.id", ondelete="CASCADE"), nullable=False)
    
    # Subscription Info
    start_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=True)  # Null se ativa indefinidamente
    
    # Status
    status = Column(SQLEnum(SubscriptionSaleStatus), default=SubscriptionSaleStatus.ACTIVE, nullable=False, index=True)
    
    # Current month usage
    current_month_credits_used = Column(Numeric(10, 2), default=0)
    current_month_services_used = Column(JSON, nullable=True)  # {"service_id": count}
    
    # Payment
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True, index=True)
    
    # Relationships
    company = relationship("Company", back_populates="subscription_sales")
    client = relationship("Client")
    model = relationship("SubscriptionSaleModel", back_populates="subscriptions")
    financial_transactions = relationship("FinancialTransaction", back_populates="subscription_sale")
    
    def __repr__(self):
        return f"<SubscriptionSale {self.id} - {self.status}>"

