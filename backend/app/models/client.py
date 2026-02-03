"""
Client Model - Clientes do sistema (separado de Users)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, Date, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Client(BaseModel):
    """Client model - Clientes das empresas"""
    
    __tablename__ = "clients"
    
    # Tenant
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # User Link (optional - para clientes que tem login)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True, unique=True)
    
    # Basic Information
    full_name = Column(String(255), nullable=False, index=True)
    nickname = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True, index=True)
    cellphone = Column(String(20), nullable=True, index=True)
    
    # Personal Data
    date_of_birth = Column(Date, nullable=True)
    cpf = Column(String(20), nullable=True, index=True)  # Aumentado para 20 (formatação: XXX.XXX.XXX-XX)
    cnpj = Column(String(20), nullable=True, index=True)  # Aumentado para 20 (formatação: XX.XXX.XXX/XXXX-XX)
    
    # Address
    address = Column(String(500), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    zip_code = Column(String(10), nullable=True)
    
    # Financial
    credits = Column(Numeric(10, 2), default=0)  # Saldo de créditos
    
    # Marketing Opt-in
    marketing_whatsapp = Column(Boolean, default=False)
    marketing_email = Column(Boolean, default=False)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="clients")
    user = relationship("User", back_populates="client_crm", uselist=False)  # Ponte para usuario com login
    appointments = relationship("Appointment", foreign_keys="Appointment.client_crm_id", back_populates="client_crm")  # NOVO
    reviews = relationship("Review", foreign_keys="Review.client_crm_id", back_populates="client_crm")  # NOVO
    waitlist_entries = relationship("WaitList", foreign_keys="WaitList.client_crm_id", back_populates="client_crm")  # NOVO
    commands = relationship("Command", back_populates="client", cascade="all, delete-orphan")
    packages = relationship("Package", back_populates="client", cascade="all, delete-orphan")
    anamneses = relationship("Anamnesis", back_populates="client", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="client", cascade="all, delete-orphan")
    cashback_balance = relationship("CashbackBalance", back_populates="client", uselist=False)
    whatsapp_campaign_logs = relationship("WhatsAppCampaignLog", back_populates="client")
    financial_transactions = relationship("FinancialTransaction", back_populates="client")
    
    def __repr__(self):
        return f"<Client {self.full_name}>"

