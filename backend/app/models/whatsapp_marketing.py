"""
WhatsApp Marketing Model - Sistema de Marketing via WhatsApp
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class CampaignType(str, enum.Enum):
    """Campaign type"""
    BIRTHDAY = "birthday"  # Parabenize seus clientes
    RECONQUER = "reconquer"  # Reconquiste clientes
    REMINDER = "reminder"  # Evite esquecimentos
    CARE = "care"  # Cuidados
    RETURN = "return"  # Garanta retornos
    INFORMED = "informed"  # Clientes bem informados
    WELCOME = "welcome"  # Boas-vindas
    INVITE_ONLINE = "invite_online"  # Convide para agendar online
    CUSTOM = "custom"  # Campanha personalizada


class CampaignStatus(str, enum.Enum):
    """Campaign status"""
    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"
    CANCELLED = "cancelled"


class LogStatus(str, enum.Enum):
    """Log status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    ERROR = "error"


class WhatsAppProvider(BaseModel):
    """WhatsApp Provider model - Configuração do provedor WhatsApp"""
    
    __tablename__ = "whatsapp_providers"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Provider Info
    provider_name = Column(String(50), nullable=False)  # evolution, twilio, etc.
    api_url = Column(String(500), nullable=False)
    api_key = Column(String(255), nullable=True)
    api_secret = Column(String(255), nullable=True)
    instance_id = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=False)
    is_connected = Column(Boolean, default=False)
    
    # Settings
    settings = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="whatsapp_provider", uselist=False)
    
    def __repr__(self):
        return f"<WhatsAppProvider {self.provider_name}>"


class WhatsAppTemplate(BaseModel):
    """WhatsApp Template model - Templates de mensagens"""
    
    __tablename__ = "whatsapp_templates"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Template Info
    name = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)  # Conteúdo com variáveis {nome_cliente}, etc.
    
    # Variables available
    available_variables = Column(JSON, nullable=True)  # Lista de variáveis disponíveis
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="whatsapp_templates")
    campaigns = relationship("WhatsAppCampaign", back_populates="template")
    
    def __repr__(self):
        return f"<WhatsAppTemplate {self.name}>"


class WhatsAppCampaign(BaseModel):
    """WhatsApp Campaign model - Campanhas de marketing"""
    
    __tablename__ = "whatsapp_campaigns"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("whatsapp_templates.id", ondelete="SET NULL"), nullable=True)
    
    # Campaign Info
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    campaign_type = Column(SQLEnum(CampaignType), nullable=False, index=True)
    
    # Content (pode sobrescrever template)
    content = Column(Text, nullable=True)
    
    # Auto Send
    auto_send_enabled = Column(Boolean, default=False)
    
    # Schedule/Triggers (JSON)
    schedule_config = Column(JSON, nullable=True)  # Configuração de agendamento/gatilhos
    
    # Client Filters (JSON)
    client_filters = Column(JSON, nullable=True)  # Filtros de clientes
    
    # Status
    status = Column(SQLEnum(CampaignStatus), default=CampaignStatus.ACTIVE, nullable=False, index=True)
    
    # Statistics
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    total_read = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)
    
    # Relationships
    company = relationship("Company", back_populates="whatsapp_campaigns")
    template = relationship("WhatsAppTemplate", back_populates="campaigns")
    logs = relationship("WhatsAppCampaignLog", back_populates="campaign", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WhatsAppCampaign {self.name}>"


class WhatsAppCampaignLog(BaseModel):
    """WhatsApp Campaign Log model - Logs de envio"""
    
    __tablename__ = "whatsapp_campaign_logs"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(Integer, ForeignKey("whatsapp_campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)  # ATUALIZADO: client_id -> client_crm_id
    
    # Message Info
    phone_number = Column(String(20), nullable=False, index=True)
    message_content = Column(Text, nullable=False)
    
    # Status
    status = Column(SQLEnum(LogStatus), default=LogStatus.PENDING, nullable=False, index=True)
    
    # Dates
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    
    # Error
    error_message = Column(Text, nullable=True)
    
    # Provider Response
    provider_response = Column(JSON, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="whatsapp_campaign_logs")
    campaign = relationship("WhatsAppCampaign", back_populates="logs")
    client = relationship("Client", back_populates="whatsapp_campaign_logs")
    
    def __repr__(self):
        return f"<WhatsAppCampaignLog {self.id} - {self.status}>"

