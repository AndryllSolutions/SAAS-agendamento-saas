"""
StandaloneService Model - Serviços Avulsos do sistema ATENDO
"""
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Text, JSON
from app.models.base import BaseModel


class StandaloneService(BaseModel):
    """
    Serviços avulsos (pagamento único) do sistema ATENDO.
    
    Serviços oficiais:
    - Consultoria de Precificação: R$ 497
    - Programa Crescer 30 dias: R$ 1.497
    - Programa Crescer 60 dias: R$ 2.497
    """
    
    __tablename__ = "standalone_services"
    
    # Identificação
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Preços
    price = Column(Numeric(10, 2), nullable=False)
    price_min = Column(Numeric(10, 2), nullable=True)
    price_max = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="BRL", nullable=False)
    
    # Tipo e duração
    service_type = Column(String(50), nullable=False)  # consulting, consulting_program
    duration_days = Column(Integer, nullable=True)  # Ex: 30, 60 para Programa Crescer
    
    # O que inclui (JSON array)
    includes = Column(JSON, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_visible = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    
    # Incluso em planos (gratuito para esses planos)
    included_in_plans = Column(JSON, nullable=True)  # ["scale"]
    
    def __repr__(self):
        return f"<StandaloneService {self.slug} - R$ {self.price}>"
    
    def is_included_in_plan(self, plan_slug: str) -> bool:
        """Verifica se serviço está incluso gratuitamente em um plano"""
        return plan_slug in (self.included_in_plans or [])
