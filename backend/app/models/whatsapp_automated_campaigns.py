"""
WhatsApp Automated Campaigns Model - Campanhas Automáticas Predefinidas
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class AutomatedCampaignType(str, enum.Enum):
    """Tipos de campanhas automáticas predefinidas"""
    BIRTHDAY = "birthday"  # Parabenize seus clientes
    RECONQUER = "reconquer"  # Reconquiste clientes
    REMINDER = "reminder"  # Evite esquecimentos
    PRE_CARE = "pre_care"  # Cuidados pré-atendimento
    POST_CARE = "post_care"  # Cuidados pós-atendimento
    RETURN_GUARANTEE = "return_guarantee"  # Garanta retornos
    STATUS_UPDATE = "status_update"  # Clientes bem informados
    WELCOME = "welcome"  # Boas-vindas
    INVITE_ONLINE = "invite_online"  # Convide para agendar online
    CASHBACK = "cashback"  # Cashback
    PACKAGE_EXPIRING = "package_expiring"  # Pacote expirando
    BILLING = "billing"  # Realize cobranças


class WhatsAppAutomatedCampaign(BaseModel):
    """
    Campanhas automáticas predefinidas do sistema.
    Cada empresa pode ativar/desativar e personalizar.
    """
    
    __tablename__ = "whatsapp_automated_campaigns"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Campaign Type
    campaign_type = Column(SQLEnum(AutomatedCampaignType), nullable=False, index=True)
    
    # Status
    is_enabled = Column(Boolean, default=False, nullable=False)
    is_configured = Column(Boolean, default=False, nullable=False)  # Se já foi configurada pela empresa
    
    # Configuration (JSON)
    config = Column(JSON, nullable=True)  # Configurações específicas da campanha
    # Exemplos:
    # - reminder: {"hours_before": 24, "send_multiple": true}
    # - reconquer: {"days_inactive": 30}
    # - return_guarantee: {"days_after_service": 15, "service_ids": [1,2,3]}
    
    # Message Template
    message_template = Column(Text, nullable=True)  # Template personalizado (sobrescreve padrão)
    
    # Filters (JSON)
    filters = Column(JSON, nullable=True)  # Filtros adicionais
    # Exemplos:
    # - service_ids: [1, 2, 3]
    # - client_tags: ["vip", "premium"]
    # - min_purchase_value: 100
    
    # Schedule Settings
    send_time_start = Column(String(5), default="09:00")  # Horário início envio (HH:MM)
    send_time_end = Column(String(5), default="18:00")  # Horário fim envio (HH:MM)
    send_weekdays_only = Column(Boolean, default=True)  # Apenas dias úteis
    
    # Statistics
    total_triggered = Column(Integer, default=0)
    total_sent = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)
    
    # Relationships
    company = relationship("Company", back_populates="whatsapp_automated_campaigns")
    
    def __repr__(self):
        return f"<WhatsAppAutomatedCampaign {self.campaign_type} - Company {self.company_id}>"


class WhatsAppCampaignTrigger(BaseModel):
    """
    Triggers/Gatilhos que disparam campanhas automáticas.
    Registra quando um evento ocorre e precisa disparar uma campanha.
    """
    
    __tablename__ = "whatsapp_campaign_triggers"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    automated_campaign_id = Column(Integer, ForeignKey("whatsapp_automated_campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Trigger Info
    event_type = Column(String(100), nullable=False, index=True)  # appointment_created, client_birthday, etc.
    event_data = Column(JSON, nullable=True)  # Dados do evento
    
    # Target
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    
    # Status
    is_processed = Column(Boolean, default=False, index=True)
    is_sent = Column(Boolean, default=False)
    
    # Schedule
    scheduled_for = Column(String(19), nullable=True)  # Data/hora agendada (YYYY-MM-DD HH:MM:SS)
    
    # Result
    campaign_log_id = Column(Integer, ForeignKey("whatsapp_campaign_logs.id", ondelete="SET NULL"), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company")
    automated_campaign = relationship("WhatsAppAutomatedCampaign")
    client = relationship("Client")
    campaign_log = relationship("WhatsAppCampaignLog", foreign_keys=[campaign_log_id])
    
    def __repr__(self):
        return f"<WhatsAppCampaignTrigger {self.event_type} - Client {self.client_id}>"
