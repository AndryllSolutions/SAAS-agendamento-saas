"""
Online Booking Configuration Models
Sistema completo de configuração de agendamento online por empresa
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class BookingFlowType(str, enum.Enum):
    """Tipo de fluxo de agendamento"""
    SERVICE_FIRST = "service_first"  # Serviço → Profissional → Data
    PROFESSIONAL_FIRST = "professional_first"  # Profissional → Serviço → Data


class ThemeType(str, enum.Enum):
    """Tipo de tema da página"""
    LIGHT = "light"
    DARK = "dark"
    OPTIONAL = "optional"  # Cliente escolhe


class OnlineBookingConfig(BaseModel):
    """
    Configurações de Agendamento Online por empresa
    Centraliza todas as configurações do módulo
    """
    
    __tablename__ = "online_booking_configs"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # ========== DETALHES DA EMPRESA ==========
    public_name = Column(String(255), nullable=True)  # Nome público (pode ser diferente do cadastro)
    public_description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    
    # Endereço público
    use_company_address = Column(Boolean, default=True)  # Se True, usa endereço do cadastro
    public_address = Column(String(500), nullable=True)
    public_address_number = Column(String(20), nullable=True)
    public_address_complement = Column(String(100), nullable=True)
    public_neighborhood = Column(String(100), nullable=True)
    public_city = Column(String(100), nullable=True)
    public_state = Column(String(2), nullable=True)
    public_postal_code = Column(String(20), nullable=True)
    
    # Contatos públicos
    public_whatsapp = Column(String(20), nullable=True)
    public_phone = Column(String(20), nullable=True)
    public_instagram = Column(String(255), nullable=True)
    public_facebook = Column(String(255), nullable=True)
    public_website = Column(String(255), nullable=True)
    
    # ========== CONFIGURAÇÕES DE APARÊNCIA ==========
    primary_color = Column(String(7), default="#6366f1")  # Cor primária (hex)
    theme = Column(SQLEnum(ThemeType), default=ThemeType.LIGHT)
    
    # ========== CONFIGURAÇÕES DE FLUXO ==========
    booking_flow = Column(SQLEnum(BookingFlowType), default=BookingFlowType.SERVICE_FIRST)
    
    # ========== CONFIGURAÇÕES DE LOGIN ==========
    require_login = Column(Boolean, default=False)  # Se True, cliente precisa fazer login
    
    # ========== CONFIGURAÇÕES DE ANTECEDÊNCIA ==========
    min_advance_time_minutes = Column(Integer, default=0)  # Tempo mínimo de antecedência em minutos
    
    # ========== CONFIGURAÇÕES DE CANCELAMENTO ==========
    allow_cancellation = Column(Boolean, default=True)
    cancellation_min_hours = Column(Integer, default=24)  # Horas mínimas de antecedência para cancelar
    
    # ========== CONFIGURAÇÕES DE PAGAMENTO ==========
    enable_payment_local = Column(Boolean, default=True)  # Pagamento no local
    enable_payment_card = Column(Boolean, default=False)  # Cartão online
    enable_payment_pix = Column(Boolean, default=False)  # PIX online
    
    # Pagamento por sinal
    enable_deposit_payment = Column(Boolean, default=False)
    deposit_percentage = Column(Float, default=50.0)  # Percentual do sinal (0-100)
    
    # ========== STATUS ==========
    is_active = Column(Boolean, default=True)  # Se False, agendamento online desativado
    
    # ========== METADATA ==========
    settings = Column(JSON, nullable=True)  # Configurações extras em JSON
    
    # Relationships
    company = relationship("Company", back_populates="online_booking_config", uselist=False)
    gallery_images = relationship("OnlineBookingGallery", back_populates="config", cascade="all, delete-orphan")
    business_hours = relationship("OnlineBookingBusinessHours", back_populates="config", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<OnlineBookingConfig company_id={self.company_id}>"


class OnlineBookingGallery(BaseModel):
    """
    Galeria de fotos do agendamento online
    """
    
    __tablename__ = "online_booking_gallery"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    config_id = Column(Integer, ForeignKey("online_booking_configs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)  # Ordem de exibição
    is_active = Column(Boolean, default=True)
    
    # Relationships
    config = relationship("OnlineBookingConfig", back_populates="gallery_images")
    
    def __repr__(self):
        return f"<OnlineBookingGallery {self.id}>"


class OnlineBookingBusinessHours(BaseModel):
    """
    Horários de atendimento para agendamento online
    Configuração por dia da semana
    """
    
    __tablename__ = "online_booking_business_hours"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    config_id = Column(Integer, ForeignKey("online_booking_configs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
    day_of_week = Column(Integer, nullable=False)  # 0-6
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Horários
    start_time = Column(String(5), nullable=True)  # HH:MM (ex: "09:00")
    break_start_time = Column(String(5), nullable=True)  # HH:MM (ex: "12:00")
    break_end_time = Column(String(5), nullable=True)  # HH:MM (ex: "13:00")
    end_time = Column(String(5), nullable=True)  # HH:MM (ex: "18:00")
    
    # Relationships
    config = relationship("OnlineBookingConfig", back_populates="business_hours")
    
    def __repr__(self):
        return f"<OnlineBookingBusinessHours day={self.day_of_week}>"
    
    class Config:
        """Pydantic config"""
        from_attributes = True
