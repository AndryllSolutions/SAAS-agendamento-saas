"""Database models"""
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.company_subscription import CompanySubscription
from app.models.company_user import CompanyUser
from app.models.api_key import APIKey
from app.models.plan import Plan as SaasPlan
from app.models.audit_log import AuditLog
from app.models.user import User, UserRole
from app.models.service import Service, ServiceCategory
from app.models.service_professional import ServiceProfessional
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentMethod, PaymentStatus, PackagePlan, PackageSubscription
from app.models.resource import Resource, ResourceType
from app.models.notification import (
    Notification, NotificationChannel, NotificationEventType, NotificationStatus,
    TriggerCondition, NotificationTemplate, NotificationTrigger, NotificationQueue
)
from app.models.review import Review
from app.models.waitlist import WaitList
from app.models.client import Client
from app.models.lead import Lead
from app.models.product import Product, Brand, ProductCategory
from app.models.command import Command, CommandStatus, CommandItem, CommandItemType
from app.models.package import Package, PackageStatus, PredefinedPackage
from app.models.anamnesis import Anamnesis, AnamnesisStatus, AnamnesisModel
from app.models.purchase import Purchase, PurchaseStatus, Supplier, PurchaseItem
from app.models.financial import (
    FinancialAccount, PaymentForm, FinancialCategory, 
    FinancialTransaction, TransactionType, TransactionStatus, TransactionOrigin,
    CashRegister
)
from app.models.commission import Commission, CommissionStatus
from app.models.commission_config import CommissionConfig
from app.models.goal import Goal, GoalType
from app.models.cashback import (
    CashbackRule, CashbackRuleType, CashbackBalance, CashbackTransaction
)
from app.models.promotion import Promotion, PromotionType
from app.models.subscription_sale import (
    SubscriptionSale, SubscriptionSaleStatus, SubscriptionSaleModel
)
from app.models.document_generator import DocumentTemplate, GeneratedDocument
from app.models.invoice import (
    Invoice, InvoiceType, InvoiceStatus, InvoiceProvider, FiscalConfiguration
)
from app.models.whatsapp_marketing import (
    WhatsAppProvider, WhatsAppTemplate, WhatsAppCampaign, WhatsAppCampaignLog,
    CampaignType, CampaignStatus, LogStatus
)
from app.models.whatsapp_automated_campaigns import (
    WhatsAppAutomatedCampaign, AutomatedCampaignType
)
from app.models.evaluation import Evaluation, EvaluationOrigin
# from app.models.professional import Professional  # REMOVIDO - tabela eliminada
from app.models.push_notification import UserPushSubscription, PushNotificationLog
from app.models.addon import AddOn, CompanyAddOn
from app.models.standalone_service import StandaloneService
from app.models.online_booking_config import OnlineBookingConfig
from app.models.company_configurations import (
    CompanyDetails, CompanyFinancialSettings, CompanyNotificationSettings,
    CompanyThemeSettings, CompanyAdminSettings
)

__all__ = [
    "Company",
    "CompanySettings",
    "CompanySubscription",
    "CompanyUser",
    "APIKey",
    "SaasPlan",
    "AuditLog",
    "User",
    "UserRole",
    "Service",
    "ServiceCategory",
    "ServiceProfessional",
    "Appointment",
    "AppointmentStatus",
    "Payment",
    "PaymentMethod",
    "PaymentStatus",
    "PackagePlan",
    "PackageSubscription",
    "Resource",
    "ResourceType",
    "Notification",
    "Review",
    "WaitList",
    "Client",
    "Lead",
    "Product",
    "Brand",
    "ProductCategory",
    "Command",
    "CommandStatus",
    "CommandItem",
    "CommandItemType",
    "Package",
    "PackageStatus",
    "PredefinedPackage",
    "Anamnesis",
    "AnamnesisStatus",
    "AnamnesisModel",
    "Purchase",
    "PurchaseStatus",
    "Supplier",
    "PurchaseItem",
    "FinancialAccount",
    "PaymentForm",
    "FinancialCategory",
    "FinancialTransaction",
    "TransactionType",
    "TransactionStatus",
    "TransactionOrigin",
    "CashRegister",
    "Commission",
    "CommissionStatus",
    "CommissionConfig",
    "Goal",
    "GoalType",
    "CashbackRule",
    "CashbackRuleType",
    "CashbackBalance",
    "CashbackTransaction",
    "Promotion",
    "PromotionType",
    "SubscriptionSale",
    "SubscriptionSaleStatus",
    "SubscriptionSaleModel",
    "DocumentTemplate",
    "GeneratedDocument",
    "Invoice",
    "InvoiceType",
    "InvoiceStatus",
    "InvoiceProvider",
    "FiscalConfiguration",
    "WhatsAppProvider",
    "WhatsAppTemplate",
    "WhatsAppCampaign",
    "WhatsAppCampaignLog",
    "CampaignType",
    "CampaignStatus",
    "LogStatus",
    "WhatsAppAutomatedCampaign",
    "AutomatedCampaignType",
    # "Evaluation",  # REMOVIDO - mesclado em reviews
    # "EvaluationOrigin",  # REMOVIDO - mesclado em reviews
    # "Professional",  # REMOVIDO - tabela eliminada
    "UserPushSubscription",
    "PushNotificationLog",
    # Notification System
    "NotificationChannel",
    "NotificationEventType",
    "NotificationStatus",
    "TriggerCondition",
    "NotificationTemplate",
    "NotificationTrigger",
    "NotificationQueue",
    # Add-ons e Serviços Avulsos
    "AddOn",
    "CompanyAddOn",
    "StandaloneService",
    "OnlineBookingConfig",
    # Company Configurations
    "CompanyDetails",
    "CompanyFinancialSettings",
    "CompanyNotificationSettings",
    "CompanyThemeSettings",
    "CompanyAdminSettings",
]
