"""
Purchase and Supplier Models - Compras e Fornecedores
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class PurchaseStatus(str, enum.Enum):
    """Purchase status"""
    OPEN = "open"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class Supplier(BaseModel):
    """Supplier model - Fornecedores"""
    
    __tablename__ = "suppliers"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    cellphone = Column(String(20), nullable=True)
    
    # Document
    cpf = Column(String(20), nullable=True)  # Aumentado para 20
    cnpj = Column(String(20), nullable=True, index=True)  # Aumentado para 20
    
    # Address
    address = Column(String(500), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    zip_code = Column(String(10), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="suppliers")
    purchases = relationship("Purchase", back_populates="supplier", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Supplier {self.name}>"


class Purchase(BaseModel):
    """Purchase model - Compras"""
    
    __tablename__ = "purchases"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Purchase Info
    number = Column(String(50), nullable=False, index=True)
    purchase_date = Column(DateTime, nullable=False, index=True)
    
    # Financial
    total_value = Column(Numeric(10, 2), default=0)
    
    # Status
    status = Column(SQLEnum(PurchaseStatus), default=PurchaseStatus.OPEN, nullable=False, index=True)
    
    # Payment
    payment_method = Column(String(50), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # XML Import (stub for future NF-e import)
    xml_imported = Column(Boolean, default=False)
    xml_url = Column(String(500), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="purchases")
    supplier = relationship("Supplier", back_populates="purchases")
    items = relationship("PurchaseItem", back_populates="purchase", cascade="all, delete-orphan")
    financial_transactions = relationship("FinancialTransaction", back_populates="purchase")
    
    def __repr__(self):
        return f"<Purchase {self.number} - {self.status}>"


class PurchaseItem(BaseModel):
    """Purchase Item model - Itens da compra"""
    
    __tablename__ = "purchase_items"
    
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    total_cost = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    purchase = relationship("Purchase", back_populates="items")
    product = relationship("Product", back_populates="purchase_items")
    
    def __repr__(self):
        return f"<PurchaseItem {self.product_id} - {self.quantity}x>"

