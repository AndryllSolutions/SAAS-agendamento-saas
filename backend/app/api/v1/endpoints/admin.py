"""
Admin Endpoints - System Configuration and Management
"""
import os
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client
import requests
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.company_settings import CompanySettings
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.services.notification_service import NotificationService
from app.core.security import get_current_active_user, require_saas_admin
from app.core.config import settings
from app.schemas.company import CompanyResponse, CompanyManagementResponse, AnalyticsResponse
from sqlalchemy import func, and_, or_, desc, case

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)

# ============================================================================
# SAAS ADMIN - COMPANY MANAGEMENT (CRITICAL)
# ============================================================================

@router.get("/companies", response_model=List[CompanyManagementResponse])
async def list_companies(
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    plan_filter: str = None,
    status_filter: str = None,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    List all companies with metrics (SAAS Admin only)
    """
    # Subquery for appointment count per company
    appointment_subq = db.query(
        User.company_id,
        func.count(Appointment.id).label("appointment_count")
    ).join(
        Appointment, Appointment.professional_id == User.id
    ).group_by(
        User.company_id
    ).subquery()
    
    # Subquery for payment total per company
    payment_subq = db.query(
        User.company_id,
        func.sum(Payment.amount).label("revenue_total")
    ).join(
        Payment, Payment.appointment_id == Appointment.id
    ).join(
        Appointment, Appointment.professional_id == User.id
    ).group_by(
        User.company_id
    ).subquery()
    
    query = db.query(
        Company.id,
        Company.name,
        Company.slug,
        Company.email,
        Company.subscription_plan,
        Company.subscription_expires_at,
        Company.is_active,
        Company.created_at,
        func.count(User.id).label("user_count"),
        func.coalesce(appointment_subq.c.appointment_count, 0).label("appointment_count"),
        func.coalesce(payment_subq.c.revenue_total, 0).label("revenue_total")
    ).outerjoin(
        User, User.company_id == Company.id
    ).outerjoin(
        appointment_subq, appointment_subq.c.company_id == Company.id
    ).outerjoin(
        payment_subq, payment_subq.c.company_id == Company.id
    ).group_by(
        Company.id,
        appointment_subq.c.appointment_count,
        payment_subq.c.revenue_total
    )
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Company.name.ilike(f"%{search}%"),
                Company.email.ilike(f"%{search}%"),
                Company.slug.ilike(f"%{search}%")
            )
        )
    
    if plan_filter:
        query = query.filter(Company.subscription_plan == plan_filter)
    
    if status_filter:
        if status_filter == "active":
            query = query.filter(
                Company.is_active == True,
                or_(
                    Company.subscription_expires_at > datetime.utcnow(),
                    Company.subscription_expires_at.is_(None)
                )
            )
        elif status_filter == "expired":
            query = query.filter(
                Company.subscription_expires_at < datetime.utcnow()
            )
        elif status_filter == "suspended":
            query = query.filter(Company.is_active == False)
    
    companies = query.order_by(desc(Company.created_at)).offset(skip).limit(limit).all()
    
    # Determine status for each company
    result = []
    for company in companies:
        if not company.is_active:
            status = "suspended"
        elif company.subscription_expires_at and company.subscription_expires_at < datetime.utcnow():
            status = "expired"
        elif company.subscription_plan == "BASIC" and not company.subscription_expires_at:
            status = "trialing"
        else:
            status = "active"
        
        result.append({
            "id": company.id,
            "name": company.name,
            "slug": company.slug,
            "email": company.email,
            "subscription_plan": company.subscription_plan,
            "subscription_expires_at": company.subscription_expires_at,
            "is_active": company.is_active,
            "created_at": company.created_at,
            "user_count": company.user_count,
            "appointment_count": company.appointment_count,
            "revenue_total": float(company.revenue_total or 0),
            "status": status
        })
    
    return result


@router.put("/companies/{company_id}/status")
async def toggle_company_status(
    company_id: int,
    is_active: bool,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Toggle company active status (SAAS Admin only)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.is_active = is_active
    db.commit()
    
    action = "activated" if is_active else "suspended"
    return {"message": f"Company {action} successfully"}


@router.put("/companies/{company_id}/subscription")
async def update_company_subscription(
    company_id: int,
    plan: str,
    expires_at: Optional[datetime] = None,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Update company subscription plan and expiration (SAAS Admin only)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.subscription_plan = plan
    company.subscription_expires_at = expires_at
    db.commit()
    
    return {"message": "Subscription updated successfully"}


# ============================================================================
# SAAS ADMIN - ANALYTICS (CRITICAL)
# ============================================================================

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_saas_analytics(
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive SaaS analytics (SAAS Admin only)
    """
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    # Company metrics
    total_companies = db.query(func.count(Company.id)).scalar()
    active_companies = db.query(func.count(Company.id)).filter(
        Company.is_active == True,
        or_(
            Company.subscription_expires_at > now,
            Company.subscription_expires_at.is_(None)
        )
    ).scalar()
    
    trial_companies = db.query(func.count(Company.id)).filter(
        Company.subscription_plan == "BASIC",
        Company.subscription_expires_at.is_(None)
    ).scalar()
    
    expired_companies = db.query(func.count(Company.id)).filter(
        Company.subscription_expires_at < now
    ).scalar()
    
    # New companies in last 30 days
    new_companies_30d = db.query(func.count(Company.id)).filter(
        Company.created_at >= thirty_days_ago
    ).scalar()
    
    # Revenue calculations
    monthly_recurring_revenue = db.query(
        func.sum(case(
            (Company.subscription_plan == "BASIC", 99),
            (Company.subscription_plan == "PRO", 199),
            (Company.subscription_plan == "PREMIUM", 399),
            else_=0
        ))
    ).filter(
        Company.is_active == True,
        or_(
            Company.subscription_expires_at > now,
            Company.subscription_expires_at.is_(None)
        )
    ).scalar() or 0
    
    annual_recurring_revenue = monthly_recurring_revenue * 12
    
    # Churn rate (companies that expired in last 30 days)
    churned_companies = db.query(func.count(Company.id)).filter(
        Company.subscription_expires_at.between(thirty_days_ago, now),
        Company.is_active == False
    ).scalar()
    
    churn_rate_30d = (churned_companies / total_companies * 100) if total_companies > 0 else 0
    
    # User and appointment metrics
    total_users = db.query(func.count(User.id)).scalar()
    total_appointments = db.query(func.count(func.distinct(User.appointments))).scalar() or 0
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "trial_companies": trial_companies,
        "expired_companies": expired_companies,
        "monthly_recurring_revenue": float(monthly_recurring_revenue),
        "annual_recurring_revenue": float(annual_recurring_revenue),
        "churn_rate_30d": float(churn_rate_30d),
        "new_companies_30d": new_companies_30d,
        "total_users": total_users,
        "total_appointments": total_appointments
    }

# Pydantic Models
class SMTPConfig(BaseModel):
    host: str = "smtp.gmail.com"
    port: int = 587
    user: EmailStr
    password: str
    from_: str = "noreply@agendamento.com"  # Usando from_ pois from é palavra reservada
    from_name: str = "Agendamento SaaS"
    
    class Config:
        # Permitir alias para 'from'
        populate_by_name = True
        fields = {'from_': {'alias': 'from'}}

class TwilioConfig(BaseModel):
    account_sid: str
    auth_token: str
    phone_number: str

class WhatsAppConfig(BaseModel):
    api_url: str
    api_token: str
    phone_number: str

class VapidConfig(BaseModel):
    public_key: str
    private_key: str
    mailto: str = "mailto:admin@agendamento.com"

class NotificationConfigRequest(BaseModel):
    smtp: Optional[SMTPConfig] = None
    twilio: Optional[TwilioConfig] = None
    whatsapp: Optional[WhatsAppConfig] = None
    vapid: Optional[VapidConfig] = None

class NotificationConfigResponse(BaseModel):
    smtp: Optional[Dict[str, Any]] = None
    twilio: Optional[Dict[str, Any]] = None
    whatsapp: Optional[Dict[str, Any]] = None
    vapid: Optional[Dict[str, Any]] = None

def require_admin(current_user: User = Depends(get_current_active_user)):
    """Require admin, owner or saas_owner role"""
    # Normalizar role para uppercase
    user_role = str(current_user.role).upper() if current_user.role else ''
    user_saas_role = str(current_user.saas_role).upper() if current_user.saas_role else ''
    
    # Verificar se tem role adequado
    allowed_roles = ['SAAS_ADMIN', 'ADMIN', 'OWNER']
    allowed_saas_roles = ['SAAS_OWNER', 'SAAS_STAFF']
    
    # Permitir se tiver role adequado OU saas_role adequado
    if user_role in allowed_roles or user_saas_role in allowed_saas_roles:
        return current_user
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required. You need OWNER, ADMIN, or SAAS_OWNER role."
    )

@router.get("/notification-config", response_model=NotificationConfigResponse)
async def get_notification_config(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get notification configuration for the current user's company"""
    
    # Get or create company settings
    settings_obj = db.query(CompanySettings).filter(
        CompanySettings.company_id == current_user.company_id
    ).first()
    
    if not settings_obj:
        # Create default settings
        settings_obj = CompanySettings(company_id=current_user.company_id)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    
    return NotificationConfigResponse(
        smtp=settings_obj.get_email_config(),
        twilio=settings_obj.get_sms_config(),
        whatsapp=settings_obj.get_whatsapp_config(),
        vapid=settings_obj.get_vapid_config()
    )

@router.post("/notification-config", response_model=Dict[str, str])
async def save_notification_config(
    config: NotificationConfigRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Save notification configuration for the current user's company"""
    
    # Get or create company settings
    settings_obj = db.query(CompanySettings).filter(
        CompanySettings.company_id == current_user.company_id
    ).first()
    
    if not settings_obj:
        settings_obj = CompanySettings(company_id=current_user.company_id)
        db.add(settings_obj)
    
    # Save configurations (only non-None values)
    config_dict = config.dict(exclude_none=True)
    settings_obj.set_all_notification_configs(config_dict)
    
    db.commit()
    
    return {"message": "Configuration saved successfully"}

@router.post("/test-notification/{service}")
async def test_notification(
    service: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Test notification service connection"""
    
    # Get company settings
    settings_obj = db.query(CompanySettings).filter(
        CompanySettings.company_id == current_user.company_id
    ).first()
    
    if not settings_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No configuration found"
        )
    
    success = False
    error_message = None
    
    try:
        if service == "smtp":
            config = settings_obj.get_email_config()
            if not config or not config.get('user') or not config.get('password'):
                raise ValueError("SMTP configuration incomplete")
            
            # Test SMTP connection
            msg = MIMEText("Test email from Agendamento SaaS")
            msg['Subject'] = 'Test Notification'
            from_email = config.get('from') or config.get('from_email', 'noreply@agendamento.com')
            msg['From'] = f"{config.get('from_name', 'Agendamento SaaS')} <{from_email}>"
            msg['To'] = config.get('user')  # Send to configured email
            
            with smtplib.SMTP(config.get('host', 'smtp.gmail.com'), config.get('port', 587)) as server:
                server.starttls()
                server.login(config.get('user'), config.get('password'))
                server.send_message(msg)
            
            success = True
            
        elif service == "twilio":
            config = settings_obj.get_sms_config()
            if not config or not config.get('account_sid') or not config.get('auth_token'):
                raise ValueError("Twilio configuration incomplete")
            
            # Test Twilio connection (just check if we can create client)
            client = Client(config.get('account_sid'), config.get('auth_token'))
            # Try to get account info as a test
            account = client.api.accounts(config.get('account_sid')).fetch()
            success = True
            
        elif service == "whatsapp":
            config = settings_obj.get_whatsapp_config()
            if not config or not config.get('api_token'):
                raise ValueError("WhatsApp configuration incomplete")
            
            # Test WhatsApp API (just check if token is valid format)
            if len(config.get('api_token', '')) < 10:
                raise ValueError("Invalid API token format")
            
            success = True
            
        elif service == "vapid":
            config = settings_obj.get_vapid_config()
            if not config or not config.get('public_key') or not config.get('private_key'):
                raise ValueError("VAPID configuration incomplete")
            
            # Test VAPID keys format
            if len(config.get('public_key', '')) < 50 or len(config.get('private_key', '')) < 50:
                raise ValueError("Invalid VAPID key format")
            
            success = True
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid service"
            )
        
    except Exception as e:
        error_message = str(e)
    
    return {
        "service": service,
        "success": success,
        "error_message": error_message,
        "tested_at": datetime.utcnow().isoformat()
    }

@router.get("/system-status")
async def get_system_status(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get system status and configuration overview"""
    
    # Get company settings
    settings_obj = db.query(CompanySettings).filter(
        CompanySettings.company_id == current_user.company_id
    ).first()
    
    status = {
        "company_id": current_user.company_id,
        "company_name": current_user.company.name if current_user.company else None,
        "configured_services": [],
        "encryption_enabled": bool(os.environ.get('SETTINGS_ENCRYPTION_KEY')),
        "last_updated": None
    }
    
    if settings_obj:
        configs = settings_obj.get_all_notification_configs()
        
        for service, config in configs.items():
            if config and config.get('user') or config.get('account_sid') or config.get('api_token') or config.get('public_key'):
                status["configured_services"].append(service)
        
        status["last_updated"] = settings_obj.updated_at.isoformat() if settings_obj.updated_at else None
    
    return status

# Add import for os
import os


# ========== SUBSCRIPTION RENEWAL JOB ==========

@router.post("/jobs/subscription-renewal")
async def run_subscription_renewal_job(
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Executar job de renovação de assinaturas manualmente (SaaS Admin only)
    Processa todas as assinaturas pendentes de renovação
    """
    from app.jobs.subscription_renewal import process_subscription_renewals
    
    try:
        result = process_subscription_renewals(db)
        return {
            "success": True,
            "message": "Job de renovação executado com sucesso",
            "stats": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao executar job: {str(e)}"
        )