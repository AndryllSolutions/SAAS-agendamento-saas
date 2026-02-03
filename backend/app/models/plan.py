"""
Plan Model - Planos SaaS do sistema ATENDO
"""
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Plan(BaseModel):
    """
    Planos de assinatura do sistema ATENDO.
    
    Planos oficiais:
    - ESSENCIAL: R$ 89/mês (2 profissionais, 1 unidade)
    - PRO: R$ 149/mês (5 profissionais, 1 unidade)
    - PREMIUM: R$ 249/mês (10 profissionais, 2 unidades)
    - SCALE: R$ 399-499/mês (ilimitado)
    """
    
    __tablename__ = "plans"
    
    # Identificação
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)  # essencial, pro, premium, scale
    description = Column(Text, nullable=True)
    
    # Preços
    price_monthly = Column(Numeric(10, 2), nullable=False)
    price_yearly = Column(Numeric(10, 2), nullable=True)  # Futuro: desconto anual
    price_min = Column(Numeric(10, 2), nullable=True)  # Para planos com variação (ex: SCALE R$ 399-499)
    price_max = Column(Numeric(10, 2), nullable=True)  # Para planos com variação
    currency = Column(String(3), default="BRL", nullable=False)
    
    # Limites
    max_professionals = Column(Integer, nullable=False)  # -1 = ilimitado
    max_units = Column(Integer, nullable=False, default=1)  # -1 = ilimitado
    max_clients = Column(Integer, nullable=False, default=-1)  # -1 = ilimitado
    max_appointments_per_month = Column(Integer, nullable=False, default=-1)  # -1 = ilimitado
    
    # Features (JSON array)
    features = Column(JSON, nullable=False, default=list)
    # Exemplo: ["clients", "services", "appointments", "financial_complete", ...]
    
    # Display
    highlight_label = Column(String(50), nullable=True)  # "Mais Popular", "Recomendado"
    display_order = Column(Integer, default=0, nullable=False)
    color = Column(String(7), default="#3B82F6")
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_visible = Column(Boolean, default=True, nullable=False)  # Visível no site de preços?
    
    # Trial
    trial_days = Column(Integer, default=14, nullable=False)
    
    def __repr__(self):
        return f"<Plan {self.slug} - R$ {self.price_monthly}>"
    
    def has_feature(self, feature: str) -> bool:
        """Verifica se o plano tem uma feature específica"""
        return feature in (self.features or [])
    
    def is_unlimited_professionals(self) -> bool:
        """Verifica se tem profissionais ilimitados"""
        return self.max_professionals == -1
    
    def is_unlimited_units(self) -> bool:
        """Verifica se tem unidades ilimitadas"""
        return self.max_units == -1

