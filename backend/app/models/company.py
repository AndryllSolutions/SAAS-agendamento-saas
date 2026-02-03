"""
Company (Tenant) Model - Multi-tenant support
"""
from sqlalchemy import Column, String, Boolean, Text, JSON, DateTime, Integer, ForeignKey, event
from sqlalchemy.orm import relationship
from unidecode import unidecode
import re

from app.models.base import BaseModel


def slugify(text):
    """Generate slug from text"""
    if not text:
        return ""
    # Remove accents
    text = unidecode(text)
    # Convert to lowercase
    text = text.lower()
    # Replace spaces and special chars with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    # Remove leading/trailing hyphens
    return text.strip('-')


class Company(BaseModel):
    """Company/Tenant model for multi-tenant architecture"""
    
    __tablename__ = "companies"
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Contact Information
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Address
    address = Column(String(500), nullable=True)
    address_number = Column(String(20), nullable=True)
    address_complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Fiscal Information
    company_type = Column(String(20), nullable=True)  # PF (Pessoa Física) ou PJ (Pessoa Jurídica)
    cpf = Column(String(20), nullable=True)  # Aumentado para 20
    cnpj = Column(String(18), nullable=True, index=True)
    trade_name = Column(String(255), nullable=True)  # Nome fantasia
    municipal_registration = Column(String(50), nullable=True)  # Inscrição Municipal
    state_registration = Column(String(50), nullable=True)  # Inscrição Estadual
    whatsapp = Column(String(20), nullable=True)
    
    # Business Settings
    business_hours = Column(JSON, nullable=True)  # {"monday": {"start": "09:00", "end": "18:00"}, ...}
    timezone = Column(String(50), default="America/Sao_Paulo")
    currency = Column(String(3), default="BRL")
    business_type = Column(String(50), nullable=True)  # barbearia, salao_de_beleza, etc.
    team_size = Column(String(20), nullable=True)  # 1, 2-5, 6-10, 10+
    
    # Branding
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#3B82F6")
    secondary_color = Column(String(7), default="#10B981")
    
    # Subscription & Status
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(String(50), default="ESSENCIAL")  # ESSENCIAL, PRO, PREMIUM, SCALE
    subscription_plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    subscription_expires_at = Column(DateTime, nullable=True)
    
    # Relacionamento com Plan
    plan = relationship("Plan", foreign_keys=[subscription_plan_id])
    
    # Features enabled
    features = Column(JSON, nullable=True)  # {"whatsapp": true, "sms": false, ...}
    
    # Settings
    settings = Column(JSON, nullable=True)  # Custom settings per company
    
    # Online Booking Settings
    online_booking_enabled = Column(Boolean, default=False)
    online_booking_url = Column(String(255), nullable=True)
    online_booking_description = Column(Text, nullable=True)
    online_booking_gallery = Column(JSON, nullable=True)  # Lista de URLs de fotos
    online_booking_social_media = Column(JSON, nullable=True)  # Redes sociais
    
    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    subscriptions = relationship("CompanySubscription", back_populates="company", cascade="all, delete-orphan")
    company_users = relationship("CompanyUser", back_populates="company", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="company", cascade="all, delete-orphan")
    # professionals removido - agora usa users.role = 'PROFESSIONAL'
    services = relationship("Service", back_populates="company", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="company", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="company", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="company", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")
    brands = relationship("Brand", back_populates="company", cascade="all, delete-orphan")
    product_categories = relationship("ProductCategory", back_populates="company", cascade="all, delete-orphan")
    commands = relationship("Command", back_populates="company", cascade="all, delete-orphan")
    settings_obj = relationship("CompanySettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    predefined_packages = relationship("PredefinedPackage", back_populates="company", cascade="all, delete-orphan")
    packages = relationship("Package", back_populates="company", cascade="all, delete-orphan")
    anamnesis_models = relationship("AnamnesisModel", back_populates="company", cascade="all, delete-orphan")
    anamneses = relationship("Anamnesis", back_populates="company", cascade="all, delete-orphan")
    suppliers = relationship("Supplier", back_populates="company", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="company", cascade="all, delete-orphan")
    financial_accounts = relationship("FinancialAccount", back_populates="company", cascade="all, delete-orphan")
    payment_forms = relationship("PaymentForm", back_populates="company", cascade="all, delete-orphan")
    financial_categories = relationship("FinancialCategory", back_populates="company", cascade="all, delete-orphan")
    financial_transactions = relationship("FinancialTransaction", back_populates="company", cascade="all, delete-orphan")
    cash_registers = relationship("CashRegister", back_populates="company", cascade="all, delete-orphan")
    commissions = relationship("Commission", back_populates="company", cascade="all, delete-orphan")
    commission_config = relationship("CommissionConfig", back_populates="company", uselist=False, cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="company", cascade="all, delete-orphan")
    cashback_rules = relationship("CashbackRule", back_populates="company", cascade="all, delete-orphan")
    cashback_balances = relationship("CashbackBalance", back_populates="company", cascade="all, delete-orphan")
    cashback_transactions = relationship("CashbackTransaction", back_populates="company", cascade="all, delete-orphan")
    promotions = relationship("Promotion", back_populates="company", cascade="all, delete-orphan")
    subscription_sale_models = relationship("SubscriptionSaleModel", back_populates="company", cascade="all, delete-orphan")
    subscription_sales = relationship("SubscriptionSale", back_populates="company", cascade="all, delete-orphan")
    document_templates = relationship("DocumentTemplate", back_populates="company", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="company", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="company", cascade="all, delete-orphan")
    fiscal_configuration = relationship("FiscalConfiguration", back_populates="company", uselist=False, cascade="all, delete-orphan")
    whatsapp_provider = relationship("WhatsAppProvider", back_populates="company", uselist=False, cascade="all, delete-orphan")
    whatsapp_templates = relationship("WhatsAppTemplate", back_populates="company", cascade="all, delete-orphan")
    whatsapp_campaigns = relationship("WhatsAppCampaign", back_populates="company", cascade="all, delete-orphan")
    whatsapp_campaign_logs = relationship("WhatsAppCampaignLog", back_populates="company", cascade="all, delete-orphan")
    whatsapp_automated_campaigns = relationship("WhatsAppAutomatedCampaign", back_populates="company", cascade="all, delete-orphan")
    # evaluations removido - agora usa reviews com origin filter
    push_subscriptions = relationship("UserPushSubscription", back_populates="company", cascade="all, delete-orphan")
    push_notification_logs = relationship("PushNotificationLog", back_populates="company", cascade="all, delete-orphan")
    company_addons = relationship("CompanyAddOn", back_populates="company", cascade="all, delete-orphan")
    online_booking_config = relationship("OnlineBookingConfig", back_populates="company", uselist=False, cascade="all, delete-orphan")
    
    # Configurações completas
    details = relationship("CompanyDetails", back_populates="company", uselist=False, cascade="all, delete-orphan")
    financial_settings = relationship("CompanyFinancialSettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    notification_settings = relationship("CompanyNotificationSettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    theme_settings = relationship("CompanyThemeSettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    admin_settings = relationship("CompanyAdminSettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    scheduling_settings = relationship("SchedulingSettings", back_populates="company", uselist=False, cascade="all, delete-orphan")
    
    def __init__(self, **kwargs):
        """Initialize company with auto-generated slug"""
        # Generate slug from name if not provided
        if 'slug' not in kwargs and 'name' in kwargs:
            kwargs['slug'] = slugify(kwargs['name'])
        super().__init__(**kwargs)
    
    def __repr__(self):
        return f"<Company {self.name}>"

    @property
    def professionals(self):
        """
        Retorna usuários com role='PROFESSIONAL' para compatibilidade.
        Substitui o relacionamento com tabela professionals removida.
        """
        return [user for user in self.users if user.role == UserRole.PROFESSIONAL]

    @property
    def evaluations(self):
        """
        Retorna reviews com origin != 'post_service' para compatibilidade.
        Substitui o relacionamento com tabela evaluations removida.
        """
        return [review for review in self.reviews if review.origin in ['link', 'app', 'other']]


@event.listens_for(Company, 'before_insert')
@event.listens_for(Company, 'before_update')
def generate_slug(mapper, connection, target):
    """Auto-generate slug before insert/update if not set"""
    if not target.slug and target.name:
        target.slug = slugify(target.name)
