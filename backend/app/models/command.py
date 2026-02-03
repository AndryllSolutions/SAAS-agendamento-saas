"""
Command Model - Comandas (Atendimentos/Vendas)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class CommandStatus(str, enum.Enum):
    """Command status"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class CommandItemType(str, enum.Enum):
    """Command item type"""
    SERVICE = "service"
    PRODUCT = "product"
    PACKAGE = "package"


class Command(BaseModel):
    """Command model - Comandas de atendimento"""
    
    __tablename__ = "commands"
    
    # Tenant
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relations
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    # Command Info
    number = Column(String(50), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    
    # Status
    status = Column(SQLEnum(CommandStatus), default=CommandStatus.OPEN, nullable=False, index=True)
    
    # Financial
    total_value = Column(Numeric(10, 2), default=0)
    discount_value = Column(Numeric(10, 2), default=0)
    net_value = Column(Numeric(10, 2), default=0)
    payment_summary = Column(String(255), nullable=True)  # Resumo das formas de pagamento
    
    # Payment
    payment_blocked = Column(Boolean, default=False)
    payment_received = Column(Boolean, default=False)
    
    # Invoices
    has_nfse = Column(Boolean, default=False)  # NFS-e gerada
    has_nfe = Column(Boolean, default=False)  # NF-e gerada
    has_nfce = Column(Boolean, default=False)  # NFC-e gerada
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="commands")
    client = relationship("Client", back_populates="commands")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="commands_as_professional")
    appointment = relationship("Appointment", foreign_keys=[appointment_id], back_populates="command")
    items = relationship("CommandItem", back_populates="command", cascade="all, delete-orphan")
    financial_transactions = relationship("FinancialTransaction", back_populates="command")
    commissions = relationship("Commission", back_populates="command")
    
    def __repr__(self):
        return f"<Command {self.number} - {self.status}>"


class CommandItem(BaseModel):
    """Command Item model - Itens da comanda"""
    
    __tablename__ = "command_items"
    
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Item Type
    item_type = Column(SQLEnum(CommandItemType), nullable=False)
    reference_id = Column(Integer, nullable=False)  # ID do serviço, produto ou pacote
    
    # Service/Product/Package
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    package_id = Column(Integer, ForeignKey("packages.id", ondelete="SET NULL"), nullable=True)
    
    # Professional responsible
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Quantities and Values
    quantity = Column(Integer, default=1)
    unit_value = Column(Numeric(10, 2), nullable=False)
    total_value = Column(Numeric(10, 2), nullable=False)
    
    # Commission
    commission_percentage = Column(Integer, default=0)
    
    # Relationships
    command = relationship("Command", back_populates="items")
    service = relationship("Service")
    product = relationship("Product") 
    package = relationship("Package")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="command_items")
    
    def __repr__(self):
        return f"<CommandItem {self.item_type} - {self.quantity}x>"
