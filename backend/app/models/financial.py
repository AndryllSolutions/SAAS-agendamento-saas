"""
Financial Models - Sistema Financeiro Completo
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class TransactionType(str, enum.Enum):
    """Transaction type"""
    INCOME = "income"  # Receita
    EXPENSE = "expense"  # Despesa


class TransactionStatus(str, enum.Enum):
    """Transaction status"""
    PLANNED = "planned"  # Previsto
    LIQUIDATED = "liquidated"  # Liquidado
    CANCELLED = "cancelled"  # Cancelado
    BLOCKED = "blocked"  # Bloqueado


class TransactionOrigin(str, enum.Enum):
    """Transaction origin"""
    COMMAND = "command"
    PURCHASE = "purchase"
    MANUAL = "manual"
    SUBSCRIPTION = "subscription"
    OTHER = "other"


class FinancialAccount(BaseModel):
    """Financial Account model - Contas (Caixa, Banco)"""
    
    __tablename__ = "financial_accounts"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    account_type = Column(String(50), nullable=False, default="cash")  # cash, bank, credit_card
    balance = Column(Numeric(10, 2), default=0)  # Saldo atual da conta
    is_active = Column(Boolean, default=True, index=True)  # Conta ativa/inativa
    admin_only = Column(Boolean, default=False)  # Somente admin pode usar
    
    # Relationships
    company = relationship("Company", back_populates="financial_accounts")
    transactions = relationship("FinancialTransaction", back_populates="account")
    
    def __repr__(self):
        return f"<FinancialAccount {self.name}>"


class PaymentForm(BaseModel):
    """Payment Form model - Formas de pagamento"""
    
    __tablename__ = "payment_forms"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # cash, card, pix, boleto, etc.
    integrates_with_gateway = Column(Boolean, default=False)
    gateway_name = Column(String(50), nullable=True)  # mercadopago, stripe, etc.
    
    # Relationships
    company = relationship("Company", back_populates="payment_forms")
    
    def __repr__(self):
        return f"<PaymentForm {self.name}>"


class FinancialCategory(BaseModel):
    """Financial Category model - Categorias financeiras"""
    
    __tablename__ = "financial_categories"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("financial_categories.id", ondelete="SET NULL"), nullable=True)
    
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # income, expense
    description = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="financial_categories")
    parent = relationship("FinancialCategory", remote_side="FinancialCategory.id", backref="children")
    transactions = relationship("FinancialTransaction", back_populates="category")
    
    def __repr__(self):
        return f"<FinancialCategory {self.name}>"


class FinancialTransaction(BaseModel):
    """Financial Transaction model - Transações financeiras"""
    
    __tablename__ = "financial_transactions"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("financial_accounts.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(Integer, ForeignKey("financial_categories.id", ondelete="SET NULL"), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Origin
    origin = Column(String(50), nullable=False)  # command, purchase, manual, commission, subscription, payment_gateway, etc.
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="SET NULL"), nullable=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id", ondelete="SET NULL"), nullable=True)
    # Removido commission_id - a FK fica em Commission.financial_transaction_id (lado Many do relacionamento)
    subscription_sale_id = Column(Integer, ForeignKey("subscription_sales.id", ondelete="SET NULL"), nullable=True)
    payment_id = Column(Integer, ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # Para rastreamento
    
    # Transaction Info
    type = Column(String(20), nullable=False, index=True)  # income, expense
    value = Column(Numeric(10, 2), nullable=False)  # Valor bruto
    net_value = Column(Numeric(10, 2), nullable=True)  # Valor líquido (após taxas)
    fee_percentage = Column(Numeric(5, 2), nullable=True, default=0)  # Taxa percentual
    fee_value = Column(Numeric(10, 2), nullable=True, default=0)  # Valor da taxa
    date = Column(DateTime, nullable=False, index=True)
    description = Column(Text, nullable=True)
    payment_method = Column(String(50), nullable=True)  # cash, credit_card, pix, etc.
    
    # Status
    status = Column(String(20), default="planned", nullable=False, index=True)  # planned, liquidated, blocked
    is_paid = Column(Boolean, default=False, index=True)  # Campo Pago (toggle)
    
    # Relationships
    company = relationship("Company", back_populates="financial_transactions")
    account = relationship("FinancialAccount", back_populates="transactions")
    category = relationship("FinancialCategory", back_populates="transactions")
    client = relationship("Client", back_populates="financial_transactions")
    command = relationship("Command", back_populates="financial_transactions")
    purchase = relationship("Purchase", back_populates="financial_transactions")
    # One-to-Many: Uma transação pode ter várias comissões associadas
    commissions = relationship("Commission", back_populates="financial_transaction", cascade="all, delete-orphan")
    subscription_sale = relationship("SubscriptionSale", back_populates="financial_transactions")
    payment = relationship("Payment", back_populates="financial_transaction")
    invoice = relationship("Invoice", back_populates="financial_transaction")
    user = relationship("User", back_populates="financial_transactions")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="financial_transactions_as_professional")
    
    def __repr__(self):
        return f"<FinancialTransaction {self.type} - {self.value}>"


class CashRegister(BaseModel):
    """Cash Register model - Caixa (Abertura/Fechamento)"""
    
    __tablename__ = "cash_registers"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Opening
    opening_date = Column(DateTime, nullable=False, index=True)
    opening_balance = Column(Numeric(10, 2), default=0)
    
    # Closing
    closing_date = Column(DateTime, nullable=True)
    closing_balance = Column(Numeric(10, 2), nullable=True)
    
    # Payment Summary (JSON: {"cash": 1000, "card": 500, "pix": 300})
    payment_summary = Column(JSON, nullable=True)
    
    # Status
    is_open = Column(Boolean, default=True, index=True)
    
    # Relationships
    company = relationship("Company", back_populates="cash_registers")
    user = relationship("User", foreign_keys=[user_id], back_populates="cash_registers")
    
    def __repr__(self):
        return f"<CashRegister {self.id} - {'Open' if self.is_open else 'Closed'}>"

