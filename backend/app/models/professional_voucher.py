"""
Professional Voucher Model
"""
from datetime import date
from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey, Numeric, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.user import User


class VoucherCategory(str, Enum):
    ALIMENTACAO = "alimentacao"
    TRANSPORTE = "transporte"
    OUTROS = "outros"


class VoucherPaymentMethod(str, Enum):
    DINHEIRO = "dinheiro"
    PIX = "pix"
    TRANSFERENCIA = "transferencia"
    CARTAO = "cartao"


class VoucherFrequency(str, Enum):
    SEMANAL = "semanal"
    QUINZENAL = "quinzenal"
    MENSAL = "mensal"


class ProfessionalVoucher(Base):
    """Professional voucher model for advances and loans."""
    __tablename__ = "professional_vouchers"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    # Voucher details
    amount = Column(Numeric(10, 2), nullable=False)  # Decimal for money
    due_date = Column(Date, nullable=False)
    category = Column(Enum("alimentacao", "transporte", "outros", name="voucher_category"), nullable=False)
    payment_method = Column(Enum("dinheiro", "pix", "transferencia", "cartao", name="voucher_payment_method"), nullable=False)
    account = Column(String(50), nullable=True)
    
    # Status
    is_paid = Column(Boolean, default=False, nullable=False)
    paid_date = Column(Date, nullable=True)
    
    # Description and notes
    description = Column(Text, nullable=True)
    observation = Column(Text, nullable=True)
    
    # Flags
    is_advance_commission = Column(Boolean, default=False, nullable=False)
    generate_financial_movement = Column(Boolean, default=False, nullable=False)
    is_recurring = Column(Boolean, default=False, nullable=False)
    
    # Recurring details
    recurring_frequency = Column(Enum("semanal", "quinzenal", "mensal", name="voucher_frequency"), nullable=True)
    recurring_end_date = Column(Date, nullable=True)
    
    # Financial movement reference (if generated) - TODO: Implement when financial_movements table exists
    # financial_movement_id = Column(Integer, ForeignKey("financial_movements.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    professional = relationship("User", foreign_keys=[professional_id])
    company = relationship("Company", foreign_keys=[company_id])
    creator = relationship("User", foreign_keys=[created_by])
    # financial_movement = relationship("FinancialMovement", foreign_keys=[financial_movement_id])  # TODO: Uncomment when table exists

    @property
    def status(self) -> str:
        """Get voucher status as string"""
        if self.is_paid:
            return "Pago"
        elif self.due_date < date.today():
            return "Vencido"
        else:
            return "Pendente"

    def __repr__(self):
        return f"<ProfessionalVoucher(id={self.id}, professional_id={self.professional_id}, amount={self.amount}, status={self.status})>"


class ProfessionalCommissionRule(Base):
    """Professional commission rules and overrides."""
    __tablename__ = "professional_commission_rules"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True, index=True)
    
    # Commission settings
    commission_type = Column(String(20), nullable=False, default="percentage")  # percentage or fixed
    commission_value = Column(Numeric(10, 2), nullable=False)  # percentage or fixed amount
    
    # Override period (optional - for temporary changes)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    professional = relationship("User", foreign_keys=[professional_id])
    company = relationship("Company", foreign_keys=[company_id])
    service = relationship("Service", foreign_keys=[service_id])
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<ProfessionalCommissionRule(id={self.id}, professional_id={self.professional_id}, commission_value={self.commission_value})>"
