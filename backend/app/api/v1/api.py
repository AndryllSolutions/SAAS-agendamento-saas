"""
API Router - Combines all endpoint routers
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    companies,
    services,
    appointments,
    payments,
    resources,
    notifications,
    reviews,
    dashboard,
    professionals,
)

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(services.router, prefix="/services", tags=["Services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["Professionals"])
