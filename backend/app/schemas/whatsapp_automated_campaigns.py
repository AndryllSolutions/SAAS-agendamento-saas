"""
WhatsApp Automated Campaigns Schemas
"""
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.whatsapp_automated_campaigns import AutomatedCampaignType


class WhatsAppAutomatedCampaignBase(BaseModel):
    """Base automated campaign schema"""
    campaign_type: AutomatedCampaignType
    is_enabled: bool = False
    config: Optional[Dict] = None
    message_template: Optional[str] = None
    filters: Optional[Dict] = None
    send_time_start: str = Field(default="09:00", pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    send_time_end: str = Field(default="18:00", pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    send_weekdays_only: bool = True


class WhatsAppAutomatedCampaignCreate(WhatsAppAutomatedCampaignBase):
    """Schema for creating an automated campaign"""
    pass


class WhatsAppAutomatedCampaignUpdate(BaseModel):
    """Schema for updating an automated campaign"""
    is_enabled: Optional[bool] = None
    config: Optional[Dict] = None
    message_template: Optional[str] = None
    filters: Optional[Dict] = None
    send_time_start: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    send_time_end: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    send_weekdays_only: Optional[bool] = None


class WhatsAppAutomatedCampaignResponse(WhatsAppAutomatedCampaignBase):
    """Schema for automated campaign response"""
    id: int
    company_id: int
    is_configured: bool = False  # Se já foi configurada pela empresa
    total_triggered: int
    total_sent: int
    total_failed: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WhatsAppAutomatedCampaignInfo(BaseModel):
    """Schema com informações completas da campanha automática (incluindo metadados)"""
    id: Optional[int] = None
    campaign_type: AutomatedCampaignType
    name: str
    description: str
    is_enabled: bool = False
    is_configured: bool = False  # Se já foi configurada pela empresa
    config: Optional[Dict] = None
    message_template: Optional[str] = None
    default_message_template: str  # Template padrão do sistema
    available_variables: List[str]  # Variáveis disponíveis
    filters: Optional[Dict] = None
    send_time_start: str = "09:00"
    send_time_end: str = "18:00"
    send_weekdays_only: bool = True
    total_triggered: int = 0
    total_sent: int = 0
    total_failed: int = 0
    
    class Config:
        from_attributes = True


class WhatsAppCampaignTriggerCreate(BaseModel):
    """Schema for creating a campaign trigger"""
    automated_campaign_id: int
    event_type: str
    event_data: Optional[Dict] = None
    client_id: int
    phone_number: str
    scheduled_for: Optional[str] = None


class WhatsAppCampaignTriggerResponse(BaseModel):
    """Schema for campaign trigger response"""
    id: int
    company_id: int
    automated_campaign_id: int
    event_type: str
    event_data: Optional[Dict] = None
    client_id: int
    phone_number: str
    is_processed: bool
    is_sent: bool
    scheduled_for: Optional[str] = None
    campaign_log_id: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignTemplateVariables(BaseModel):
    """Variáveis disponíveis para templates"""
    nome_cliente: str = "Nome do cliente"
    nome_empresa: str = "Nome da empresa"
    data_agendamento: str = "Data do agendamento"
    hora_agendamento: str = "Hora do agendamento"
    servico: str = "Nome do serviço"
    profissional: str = "Nome do profissional"
    valor: str = "Valor do serviço"
    endereco: str = "Endereço da empresa"
    telefone: str = "Telefone da empresa"
    link_agendamento: str = "Link para agendamento online"
    saldo_cashback: str = "Saldo de cashback"
    dias_inativo: str = "Dias desde último atendimento"
    data_vencimento: str = "Data de vencimento"
    valor_fatura: str = "Valor da fatura"
