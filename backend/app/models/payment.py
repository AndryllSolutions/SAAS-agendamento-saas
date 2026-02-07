"""
Payment, Plan, and Subscription Models
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class PaymentStatus(str, enum.Enum):
    """Payment status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, enum.Enum):
    """Payment methods"""
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PIX = "pix"
    BOLETO = "boleto"
    PAYPAL = "paypal"
    MERCADOPAGO = "mercadopago"
    STRIPE = "stripe"


class Payment(BaseModel):
    """Payment model"""
    
    __tablename__ = "payments"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Payment Information
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL")
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    
    # Gateway Information
    gateway = Column(String(50), nullable=True)  # mercadopago, stripe, paypal
    gateway_transaction_id = Column(String(255), nullable=True, unique=True)
    gateway_response = Column(JSON, nullable=True)
    
    # Pix specific
    pix_code = Column(Text, nullable=True)
    pix_qr_code = Column(Text, nullable=True)
    
    # Boleto specific
    boleto_url = Column(String(500), nullable=True)
    boleto_barcode = Column(String(255), nullable=True)
    
    # Dates
    paid_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    
    # Commission
    commission_amount = Column(Numeric(10, 2), default=0)
    commission_paid = Column(Boolean, default=False)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="payment")
    financial_transaction = relationship("FinancialTransaction", back_populates="payment", uselist=False)
    
    def __repr__(self):
        return f"<Payment {self.id} - {self.amount} {self.currency}>"


class PackagePlan(BaseModel):
    """Subscription plans for packages (renamed from Plan to avoid conflict with SaaS Plan)"""
    
    __tablename__ = "package_plans"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Plan Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL")
    
    # Sessions
    sessions_included = Column(Integer, nullable=False)  # Number of sessions
    validity_days = Column(Integer, nullable=False)  # Validity in days
    
    # Services
    service_ids = Column(JSON, nullable=True)  # List of service IDs included
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    subscriptions = relationship("PackageSubscription", back_populates="plan")
    
    def __repr__(self):
        return f"<PackagePlan {self.name}>"


class PackageSubscription(BaseModel):
    """User subscriptions to package plans (renamed from Subscription to avoid confusion)"""
    
    __tablename__ = "subscriptions"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("package_plans.id", ondelete="CASCADE"), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Sessions
    sessions_remaining = Column(Integer, nullable=False)
    sessions_used = Column(Integer, default=0)
    
    # Dates
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Payment
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    plan = relationship("PackagePlan", back_populates="subscriptions")
    
    def __repr__(self):
        return f"<PackageSubscription {self.id} - {self.sessions_remaining} sessions>"
