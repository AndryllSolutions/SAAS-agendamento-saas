"""
User Model with Role-based Access Control
"""
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """
    Legacy UserRole enum - DEPRECATED
    
    This enum is kept for backward compatibility.
    New code should use:
    - SaaSRole (from app.core.rbac) for global SaaS roles
    - CompanyRole (from app.core.rbac) for company roles
    
    Migration path:
    - SAAS_ADMIN -> SaaSRole.SAAS_OWNER
    - OWNER -> CompanyRole.COMPANY_OWNER
    - MANAGER -> CompanyRole.COMPANY_MANAGER
    - etc.
    """
    # Global Roles (deprecated - use SaaSRole)
    SAAS_ADMIN = "SAAS_ADMIN"  # Use SaaSRole.SAAS_OWNER instead
    
    # Tenant Roles (deprecated - use CompanyRole)
    OWNER = "OWNER"  # Use CompanyRole.COMPANY_OWNER instead
    MANAGER = "MANAGER"  # Use CompanyRole.COMPANY_MANAGER instead
    PROFESSIONAL = "PROFESSIONAL"  # Use CompanyRole.COMPANY_PROFESSIONAL instead
    RECEPTIONIST = "RECEPTIONIST"  # Use CompanyRole.COMPANY_RECEPTIONIST instead
    FINANCE = "FINANCE"  # Use CompanyRole.COMPANY_FINANCE instead
    CLIENT = "CLIENT"  # Use CompanyRole.COMPANY_CLIENT instead
    READ_ONLY = "READ_ONLY"  # Use CompanyRole.COMPANY_READ_ONLY instead
    
    # Legacy aliases (compatibilidade)
    ADMIN = "ADMIN"  # Alias para SAAS_ADMIN
    STAFF = "STAFF"  # Alias para MANAGER


class User(BaseModel):
    """User model with multi-tenant support"""
    
    __tablename__ = "users"
    
    # Company (Tenant) relationship
    # NOTE: company_id is nullable for SaaS admins who don't belong to a specific company
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Basic Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    cpf_cnpj = Column(String(20), nullable=True)  # CPF or CNPJ for professionals
    
    # Roles - Two-Layer Architecture
    # saas_role: Global SaaS role (SAAS_OWNER, SAAS_STAFF) - nullable, only for SaaS admins
    saas_role = Column(String(50), nullable=True, index=True)  # "SAAS_OWNER", "SAAS_STAFF", or NULL
    
    # role: Legacy company role field (kept for backward compatibility)
    # For new code, use CompanyUser.role instead
    role = Column(SQLEnum(UserRole), default=UserRole.CLIENT, nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Profile
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    
    # Address
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Professional specific fields
    specialties = Column(JSON, nullable=True)  # For professionals: ["Corte", "Barba", ...]
    working_hours = Column(JSON, nullable=True)  # {"monday": {"start": "09:00", "end": "18:00"}, ...}
    commission_rate = Column(Integer, default=0)  # Percentage (0-100)
    
    # OAuth
    oauth_provider = Column(String(50), nullable=True)  # google, facebook, apple
    oauth_id = Column(String(255), nullable=True)
    
    # Notifications preferences
    notification_preferences = Column(JSON, nullable=True)  # {"email": true, "sms": false, "whatsapp": true}
    
    # Client specific fields
    notes = Column(Text, nullable=True)  # Internal notes about the client
    tags = Column(JSON, nullable=True)  # ["VIP", "Regular", ...]
    
    # Relationships
    company = relationship("Company", back_populates="users")
    # Removed duplicate: company_user (use company_users instead)
    client_crm = relationship("Client", back_populates="user", uselist=False)  # Link to Client CRM record
    appointments_as_professional = relationship("Appointment", back_populates="professional", foreign_keys="[Appointment.professional_id]")
    cash_registers = relationship("CashRegister", back_populates="user", cascade="all, delete-orphan")
    financial_transactions = relationship("FinancialTransaction", back_populates="user")
    commands_as_professional = relationship("Command", back_populates="professional")
    commissions = relationship("Commission", back_populates="professional")
    command_items = relationship("CommandItem", back_populates="professional")
    goals = relationship("Goal", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews_received = relationship("Review", foreign_keys="Review.professional_id", back_populates="professional", cascade="all, delete-orphan")
    push_subscriptions = relationship("UserPushSubscription", back_populates="user", cascade="all, delete-orphan")
    push_notification_logs = relationship("PushNotificationLog", back_populates="user", cascade="all, delete-orphan")
    google_calendar_integration = relationship("GoogleCalendarIntegration", back_populates="user", uselist=False, cascade="all, delete-orphan")
    calendly_integration = relationship("CalendlyIntegration", back_populates="user", uselist=False, cascade="all, delete-orphan")
    anamneses = relationship("Anamnesis", foreign_keys="Anamnesis.professional_id", post_update=True)
    evaluations_received = relationship("Evaluation", foreign_keys="Evaluation.professional_id", post_update=True)
    company_users = relationship("CompanyUser", foreign_keys="CompanyUser.user_id", back_populates="user", cascade="all, delete-orphan")
    financial_transactions_as_professional = relationship("FinancialTransaction", foreign_keys="FinancialTransaction.professional_id", back_populates="professional")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    service_assignments = relationship("ServiceProfessional", back_populates="professional", cascade="all, delete-orphan")
    
    # New relationships added to fix SQLAlchemy errors
    professional_vouchers = relationship("ProfessionalVoucher", foreign_keys="ProfessionalVoucher.professional_id", back_populates="professional", cascade="all, delete-orphan")
    vouchers_created = relationship("ProfessionalVoucher", foreign_keys="ProfessionalVoucher.created_by", back_populates="creator")
    schedule_overrides = relationship("ProfessionalScheduleOverride", foreign_keys="ProfessionalScheduleOverride.professional_id", back_populates="professional", cascade="all, delete-orphan")
    schedule_overrides_created = relationship("ProfessionalScheduleOverride", foreign_keys="ProfessionalScheduleOverride.created_by", back_populates="creator")
    service_overrides = relationship("ProfessionalServiceOverride", foreign_keys="ProfessionalServiceOverride.professional_id", back_populates="professional", cascade="all, delete-orphan")
    service_overrides_created = relationship("ProfessionalServiceOverride", foreign_keys="ProfessionalServiceOverride.created_by", back_populates="creator")
    commission_rules = relationship("ProfessionalCommissionRule", foreign_keys="ProfessionalCommissionRule.professional_id", back_populates="professional", cascade="all, delete-orphan")
    commission_rules_created = relationship("ProfessionalCommissionRule", foreign_keys="ProfessionalCommissionRule.created_by", back_populates="creator")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    package_subscriptions = relationship("PackageSubscription", back_populates="user", cascade="all, delete-orphan")
    waitlist_as_professional = relationship("WaitList", foreign_keys="WaitList.professional_id", back_populates="professional")
    leads_created = relationship("Lead", foreign_keys="Lead.created_by_user_id", back_populates="created_by")
    audit_logs = relationship("AuditLog", foreign_keys="AuditLog.user_id", back_populates="user")
    
    # Helper properties
    @property
    def assigned_services(self):
        """Get active services assigned to this professional"""
        return [sa.service for sa in self.service_assignments if sa.is_active]
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
