"""
API Router - Combines all endpoint routers
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    auth_mobile,
    users,
    companies,
    services,
    plans,
    appointments,
    calendar,
    payments,
    resources,
    notifications,
    reviews,
    dashboard,
    professionals,
    clients,
    client_notes,
    leads,
    products,
    commands,
    financial,
    packages,
    purchases,
    suppliers,
    anamneses,
    commissions,
    goals,
    cashback,
    promotions,
    evaluations,
    whatsapp,
    invoices,
    subscription_sales,
    documents,
    uploads,
    push_notifications,
    admin,
    notification_system,
    saas_admin,
    reports,
    api_keys,
    addons,
    standalone_services,
    online_booking_config,
    whatsapp_automated_campaigns,
    company_configurations,
    google_calendar,
    calendly,
    evolution_webhook,
    evolution_whatsapp,
    professional_schedule_overrides,
    professional_vouchers,
)

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(auth_mobile.router, prefix="/auth", tags=["Mobile Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(plans.router, prefix="/plans", tags=["Plans"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["Professionals"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(client_notes.router, prefix="/clients", tags=["Client Notes"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(commands.router, prefix="/commands", tags=["Commands"])
api_router.include_router(financial.router, prefix="/financial", tags=["Financial"])
api_router.include_router(packages.router, prefix="/packages", tags=["Packages"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["Purchases"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(anamneses.router, prefix="/anamneses", tags=["Anamneses"])
api_router.include_router(commissions.router, prefix="/commissions", tags=["Commissions"])
api_router.include_router(goals.router, prefix="/goals", tags=["Goals"])
api_router.include_router(cashback.router, prefix="/cashback", tags=["Cashback"])
api_router.include_router(promotions.router, prefix="/promotions", tags=["Promotions"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["Evaluations"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp Marketing"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(subscription_sales.router, prefix="/subscription-sales", tags=["Subscription Sales"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Generator"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["File Uploads"])
api_router.include_router(push_notifications.router, prefix="/push", tags=["Push Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(
    notification_system.router,
    prefix="/notification-system",
    tags=["Notification System"]
)
api_router.include_router(saas_admin.router, prefix="/saas-admin", tags=["SaaS Admin"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["API Keys"])
api_router.include_router(addons.router, prefix="/addons", tags=["Addons"])
api_router.include_router(standalone_services.router, prefix="/standalone-services", tags=["Standalone Services"])
api_router.include_router(online_booking_config.router, prefix="/online-booking", tags=["Online Booking"])
api_router.include_router(whatsapp_automated_campaigns.router, prefix="/whatsapp-campaigns", tags=["WhatsApp Campaigns"])
api_router.include_router(company_configurations.router, prefix="/settings", tags=["Settings"])
api_router.include_router(google_calendar.router, prefix="/google-calendar", tags=["Google Calendar"])
api_router.include_router(calendly.router, prefix="/calendly", tags=["Calendly"])
api_router.include_router(evolution_webhook.router, prefix="/evolution/webhook", tags=["Evolution Webhook"])
api_router.include_router(evolution_whatsapp.router, prefix="/evolution/whatsapp", tags=["Evolution WhatsApp"])
api_router.include_router(professional_schedule_overrides.router, prefix="/schedule-overrides", tags=["Schedule Overrides"])
api_router.include_router(professional_vouchers.router, prefix="/vouchers", tags=["Vouchers"])
