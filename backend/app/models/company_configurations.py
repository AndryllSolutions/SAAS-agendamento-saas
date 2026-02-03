"""
Company Configurations Model - Configurações completas da empresa
Centraliza todas as preferências operacionais, financeiras, visuais e administrativas
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class CompanyType(str, enum.Enum):
    """Tipo de pessoa"""
    pessoa_fisica = "pessoa_fisica"
    pessoa_juridica = "pessoa_juridica"


class Language(str, enum.Enum):
    """Idiomas suportados"""
    pt_BR = "pt_BR"
    es = "es"
    en = "en"


class Currency(str, enum.Enum):
    """Moedas suportadas"""
    BRL = "BRL"
    USD = "USD"
    EUR = "EUR"
    ARS = "ARS"
    CLP = "CLP"


class Country(str, enum.Enum):
    """Países suportados"""
    BR = "BR"
    AR = "AR"
    CL = "CL"
    US = "US"


class CompanyDetails(BaseModel):
    """
    Detalhes cadastrais e fiscais da empresa
    Aba: Detalhes da Empresa
    """
    
    __tablename__ = "company_details"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Identificação
    company_type = Column(SQLEnum(CompanyType), default=CompanyType.pessoa_fisica, nullable=False)
    document_number = Column(String(20), nullable=True)  # CPF ou CNPJ
    company_name = Column(String(255), nullable=True)  # Nome da empresa
    municipal_registration = Column(String(50), nullable=True)  # Inscrição Municipal
    state_registration = Column(String(50), nullable=True)  # Inscrição Estadual
    
    # Contato
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    
    # Endereço
    postal_code = Column(String(20), nullable=True)  # CEP
    address = Column(String(500), nullable=True)  # Logradouro
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    country = Column(String(2), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="details")
    
    def __repr__(self):
        return f"<CompanyDetails company_id={self.company_id}>"


class CompanyFinancialSettings(BaseModel):
    """
    Configurações financeiras e de caixa
    Aba: Financeiro
    """
    
    __tablename__ = "company_financial_settings"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Lançamentos retroativos
    allow_retroactive_entries = Column(Boolean, default=False, nullable=False)
    
    # Alterações após conferência
    allow_invoice_edit_after_conference = Column(Boolean, default=False, nullable=False)
    edit_only_value_after_conference = Column(Boolean, default=True, nullable=False)  # Se False, permite editar tudo
    
    # Caixa fechado
    allow_operations_with_closed_cash = Column(Boolean, default=False, nullable=False)
    
    # Configurações adicionais
    require_category_on_transaction = Column(Boolean, default=True, nullable=False)
    require_payment_form_on_transaction = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    company = relationship("Company", back_populates="financial_settings")
    
    def __repr__(self):
        return f"<CompanyFinancialSettings company_id={self.company_id}>"


class CompanyNotificationSettings(BaseModel):
    """
    Configurações de notificações web
    Aba: Notificações
    """
    
    __tablename__ = "company_notification_settings"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Notificações Web (Desktop)
    notify_new_appointment = Column(Boolean, default=True, nullable=False)
    notify_appointment_cancellation = Column(Boolean, default=True, nullable=False)
    notify_appointment_deletion = Column(Boolean, default=True, nullable=False)
    notify_new_review = Column(Boolean, default=True, nullable=False)
    notify_sms_response = Column(Boolean, default=False, nullable=False)
    notify_client_return = Column(Boolean, default=True, nullable=False)
    notify_goal_achievement = Column(Boolean, default=True, nullable=False)
    notify_client_waiting = Column(Boolean, default=True, nullable=False)
    
    # Configurações adicionais
    notification_sound_enabled = Column(Boolean, default=True, nullable=False)
    notification_duration_seconds = Column(Integer, default=5, nullable=False)
    
    # Relationships
    company = relationship("Company", back_populates="notification_settings")
    
    def __repr__(self):
        return f"<CompanyNotificationSettings company_id={self.company_id}>"


class CompanyThemeSettings(BaseModel):
    """
    Configurações de personalização visual
    Aba: Personalizar
    """
    
    __tablename__ = "company_theme_settings"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Idioma da interface
    interface_language = Column(SQLEnum(Language), default=Language.pt_BR, nullable=False)
    
    # Cor do menu lateral
    sidebar_color = Column(String(7), default="#6366f1", nullable=False)  # Hex color
    
    # Tema
    theme_mode = Column(String(20), default="light", nullable=False)  # light, dark, auto
    
    # Logo personalizada
    custom_logo_url = Column(String(500), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="theme_settings")
    
    def __repr__(self):
        return f"<CompanyThemeSettings company_id={self.company_id}>"


class CompanyAdminSettings(BaseModel):
    """
    Configurações administrativas globais
    Aba: Admin
    """
    
    __tablename__ = "company_admin_settings"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Idioma padrão (mensagens)
    default_message_language = Column(SQLEnum(Language), default=Language.pt_BR, nullable=False)
    
    # Moeda
    currency = Column(SQLEnum(Currency), default=Currency.BRL, nullable=False)
    
    # País
    country = Column(SQLEnum(Country), default=Country.BR, nullable=False)
    
    # Timezone
    timezone = Column(String(50), default="America/Sao_Paulo", nullable=False)
    
    # Formato de data
    date_format = Column(String(20), default="DD/MM/YYYY", nullable=False)
    
    # Formato de hora
    time_format = Column(String(20), default="HH:mm", nullable=False)
    
    # Configurações adicionais (JSON)
    additional_settings = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="admin_settings")
    
    def __repr__(self):
        return f"<CompanyAdminSettings company_id={self.company_id}>"
