"""
AddOn Models - Sistema de Add-ons do ATENDO
"""
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Text, JSON, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel


class AddOn(BaseModel):
    """
    Add-ons disponíveis para assinatura.
    
    Add-ons oficiais:
    1. Precificação Inteligente - R$ 49/mês
    2. Relatórios Avançados - R$ 39/mês
    3. Metas & Bonificação - R$ 39/mês
    4. Marketing & Reativação WhatsApp - R$ 59/mês
    5. Unidade Extra - R$ 69/mês
    6. Assinatura Digital - R$ 19/mês
    7. Anamnese Inteligente - R$ 29/mês
    8. Cashback & Fidelização - R$ 29/mês
    9. Fiscal Pro - R$ 69/mês
    """
    
    __tablename__ = "add_ons"
    
    # Identificação
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Preço
    price_monthly = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL", nullable=False)
    
    # Tipo de add-on
    addon_type = Column(String(50), nullable=False)
    # Tipos: 'feature', 'limit_override', 'service'
    
    # Configuração (JSON)
    config = Column(JSON, nullable=False, default=dict)
    # Exemplos:
    # - Feature: {"feature": "pricing_intelligence"}
    # - Limit Override: {"limit_override": {"professionals": 5, "units": 1}}
    # - Service: {"service_type": "consulting"}
    
    # Features desbloqueadas
    unlocks_features = Column(JSON, nullable=True)  # ["pricing_intelligence", "advanced_reports"]
    
    # Limites que sobrescreve
    override_limits = Column(JSON, nullable=True)  # {"professionals": 5, "units": 1}
    
    # Display
    icon = Column(String(50), nullable=True)  # Nome do ícone (lucide-react)
    color = Column(String(7), default="#3B82F6")
    category = Column(String(50), nullable=True)  # "analytics", "marketing", "operations"
    display_order = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_visible = Column(Boolean, default=True, nullable=False)
    
    # Incluso em planos (JSON)
    included_in_plans = Column(JSON, nullable=True)  # ["premium", "scale"]
    
    # Relationships
    company_addons = relationship("CompanyAddOn", back_populates="addon", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<AddOn {self.slug} - R$ {self.price_monthly}>"
    
    def is_included_in_plan(self, plan_slug: str) -> bool:
        """Verifica se add-on está incluso em um plano específico"""
        return plan_slug in (self.included_in_plans or [])


class CompanyAddOn(BaseModel):
    """
    Add-ons contratados por empresa.
    
    Controla quais add-ons estão ativos para cada empresa e
    gerencia o billing.
    """
    
    __tablename__ = "company_add_ons"
    __table_args__ = (
        UniqueConstraint('company_id', 'addon_id', name='uq_company_addon'),
    )
    
    # Relacionamentos
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    addon_id = Column(Integer, ForeignKey("add_ons.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Datas
    activated_at = Column(DateTime, nullable=True)
    deactivated_at = Column(DateTime, nullable=True)
    
    # Billing
    next_billing_date = Column(DateTime, nullable=True)
    auto_renew = Column(Boolean, default=True, nullable=False)
    
    # Origem (como foi adicionado)
    source = Column(String(50), nullable=True)  # "manual", "plan_upgrade", "trial"
    
    # Trial (se aplicável)
    trial_end_date = Column(DateTime, nullable=True)
    is_trial = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    company = relationship("Company", back_populates="company_addons")
    addon = relationship("AddOn", back_populates="company_addons")
    
    def __repr__(self):
        return f"<CompanyAddOn company_id={self.company_id} addon_id={self.addon_id} active={self.is_active}>"
    
    def is_trial_active(self) -> bool:
        """Verifica se está em período de trial ativo"""
        if not self.is_trial or not self.trial_end_date:
            return False
        return datetime.utcnow() < self.trial_end_date

