"""
Invoice Model - Notas Fiscais (NFS-e, NF-e, NFC-e)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class InvoiceType(str, enum.Enum):
    """Invoice type"""
    NFSE = "nfse"  # Nota Fiscal de Serviços Eletrônica
    NFE = "nfe"  # Nota Fiscal Eletrônica
    NFCE = "nfce"  # Nota Fiscal de Consumidor Eletrônica


class InvoiceStatus(str, enum.Enum):
    """Invoice status"""
    PENDING = "pending"
    GENERATED = "generated"
    SENT = "sent"
    CANCELLED = "cancelled"
    ERROR = "error"


class InvoiceProvider(str, enum.Enum):
    """Invoice provider"""
    FOCUS = "focus"
    BLING = "bling"
    TINY = "tiny"
    OTHER = "other"


class Invoice(BaseModel):
    """Invoice model - Notas Fiscais"""
    
    __tablename__ = "invoices"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relations
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="SET NULL"), nullable=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)  # ATUALIZADO: client_id -> client_crm_id
    
    # Invoice Info
    invoice_type = Column(SQLEnum(InvoiceType), nullable=False, index=True)
    number = Column(String(50), nullable=True, index=True)  # Número da nota
    access_key = Column(String(50), nullable=True, unique=True, index=True)  # Chave de acesso
    
    # Provider
    provider = Column(String(50), nullable=True)  # Provedor usado (focus, bling, etc.)
    provider_invoice_id = Column(String(255), nullable=True)  # ID no provedor
    
    # Status
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.PENDING, nullable=False, index=True)
    
    # Financial
    total_value = Column(Numeric(10, 2), nullable=False)
    
    # Dates
    issue_date = Column(DateTime, nullable=True)
    sent_date = Column(DateTime, nullable=True)
    
    # Files
    xml_url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    
    # Error
    error_message = Column(Text, nullable=True)
    
    # Provider Response
    provider_response = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="invoices")
    command = relationship("Command", foreign_keys=[command_id])  # Removido post_update (nao ha ciclo)
    client = relationship("Client", foreign_keys=[client_crm_id])  # ATUALIZADO: client_id -> client_crm_id
    packages = relationship("Package", foreign_keys="Package.invoice_id", post_update=True)  # Mantido (Package tem FK invoice_id)
    financial_transaction = relationship("FinancialTransaction", back_populates="invoice", uselist=False)
    
    def __repr__(self):
        return f"<Invoice {self.invoice_type} - {self.number}>"


class FiscalConfiguration(BaseModel):
    """Fiscal Configuration model - Configurações fiscais"""
    
    __tablename__ = "fiscal_configurations"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Provider Configuration
    nfse_provider = Column(String(50), nullable=True)
    nfe_provider = Column(String(50), nullable=True)
    nfce_provider = Column(String(50), nullable=True)
    
    # API Keys
    provider_api_key = Column(String(255), nullable=True)
    provider_api_secret = Column(String(255), nullable=True)
    
    # Environment
    environment = Column(String(20), default="production")  # production, sandbox
    
    # Settings
    auto_generate_nfse = Column(Boolean, default=False)
    auto_generate_nfe = Column(Boolean, default=False)
    auto_generate_nfce = Column(Boolean, default=False)
    
    # Additional Settings (JSON)
    settings = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="fiscal_configuration", uselist=False)
    
    def __repr__(self):
        return f"<FiscalConfiguration Company {self.company_id}>"

