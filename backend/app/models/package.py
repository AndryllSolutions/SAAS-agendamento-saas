"""
Package Model - Pacotes e Pacotes Predefinidos
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class PackageStatus(str, enum.Enum):
    """Package status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    EXHAUSTED = "exhausted"


class PredefinedPackage(BaseModel):
    """Predefined Package model - Modelos de pacotes"""
    
    __tablename__ = "predefined_packages"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Services included (JSON: [{"service_id": 1, "sessions": 5}, ...])
    services_included = Column(JSON, nullable=False)
    
    # Validity
    validity_days = Column(Integer, nullable=False)  # Validade em dias
    
    # Pricing
    total_value = Column(Numeric(10, 2), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="predefined_packages")
    packages = relationship("Package", back_populates="predefined_package", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PredefinedPackage {self.name}>"


class Package(BaseModel):
    """Package model - Pacotes vendidos para clientes"""
    
    __tablename__ = "packages"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)  # ATUALIZADO: client_id -> client_crm_id
    predefined_package_id = Column(Integer, ForeignKey("predefined_packages.id", ondelete="CASCADE"), nullable=False)
    
    # Sale Info
    sale_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False, index=True)
    
    # Status
    status = Column(SQLEnum(PackageStatus), default=PackageStatus.ACTIVE, nullable=False, index=True)
    
    # Sessions balance (JSON: {"service_id": remaining_sessions, ...})
    sessions_balance = Column(JSON, nullable=False)
    
    # Financial
    paid_value = Column(Numeric(10, 2), nullable=False)
    
    # Invoice
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="packages")
    client = relationship("Client", back_populates="packages")
    predefined_package = relationship("PredefinedPackage", back_populates="packages")
    invoice = relationship("Invoice", foreign_keys=[invoice_id], post_update=True)
    command_items = relationship("CommandItem", back_populates="package")
    
    def __repr__(self):
        return f"<Package {self.id} - {self.status}>"

