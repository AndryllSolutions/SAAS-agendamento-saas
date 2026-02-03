"""
SaaS Admin Endpoints - Global SaaS Management

This router provides endpoints for SaaS-level administration:
- List and manage all companies
- View SaaS-wide metrics
- Impersonate companies (enter as a company)

All endpoints require SaaS admin roles (SAAS_OWNER or SAAS_STAFF).
These endpoints DO NOT filter by company_id (global access).
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from datetime import datetime, timedelta
from decimal import Decimal

from app.core.database import get_db
from app.core.rbac import (
    CurrentUserContext,
    require_saas_admin,
    require_saas_owner,
    SaaSRole,
    CompanyRole,
    Scope
)
from app.core.security import create_access_token
from app.models.user import User
from app.models.company import Company
from app.models.company_subscription import CompanySubscription
from app.models.plan import Plan

from app.models.company_user import CompanyUser
from app.models.financial import FinancialTransaction, TransactionType
from app.models.addon import AddOn, CompanyAddOn
from app.schemas.company import CompanyResponse
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/saas-admin",
    redirect_slashes=False
)

FEATURE_LABELS = {
    "clients": "Cadastro de clientes",
    "services": "Gestão de serviços",
    "products": "Gestão de produtos",
    "appointments": "Agendamento completo",
    "commands": "Comandas",
    "financial_basic": "Módulo financeiro básico",
    "financial_complete": "Módulo financeiro completo",
    "reports_basic": "Relatórios básicos",
    "reports_complete": "Relatórios avançados",
    "whatsapp_marketing": "WhatsApp Marketing",
    "commissions": "Comissões automáticas",
    "goals": "Metas e bonificações",
    "cashback": "Cashback",
    "promotions": "Promoções",
    "subscription_sales": "Vendas por assinatura",
    "document_generator": "Gerador de documentos",
    "invoices": "Notas fiscais",
    "online_booking": "Agendamento online",
    "pricing_intelligence": "Precificação inteligente",
    "advanced_reports": "Relatórios avançados",
    "crm_advanced": "CRM avançado",
    "priority_support": "Suporte prioritário",
    "programa_crescer": "Programa Crescer",
    "multi_unit_reports": "Relatórios multi-unidade"
}

PLAN_ALIASES = {
    "essencial": ["ESSENCIAL", "BASIC", "FREE"],
    "pro": ["PRO"],
    "premium": ["PREMIUM"],
    "scale": ["SCALE"]
}


def _build_plan_features(plan: Plan) -> List[str]:
    features: List[str] = []

    if plan.max_professionals == -1:
        features.append("Profissionais ilimitados")
    elif plan.max_professionals > 0:
        features.append(f"Até {plan.max_professionals} profissionais")

    if plan.max_units == -1:
        features.append("Unidades ilimitadas")
    elif plan.max_units > 0:
        features.append(f"Até {plan.max_units} unidade(s)")

    if plan.max_clients == -1:
        features.append("Clientes ilimitados")
    elif plan.max_clients > 0:
        features.append(f"Até {plan.max_clients} clientes")

    if plan.max_appointments_per_month == -1:
        features.append("Agendamentos ilimitados")
    elif plan.max_appointments_per_month > 0:
        features.append(f"Até {plan.max_appointments_per_month} agendamentos/mês")

    for feature_key in plan.features or []:
        label = FEATURE_LABELS.get(feature_key)
        if label and label not in features:
            features.append(label)

    return features


def _get_plan_aliases(plan: Plan) -> List[str]:
    return PLAN_ALIASES.get(plan.slug.lower(), [plan.slug.upper()])


# ========== COMPANIES MANAGEMENT ==========

@router.get("/companies", response_model=List[CompanyResponse])
async def list_all_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    List all companies in the SaaS platform.
    
    Only accessible to SAAS_OWNER or SAAS_STAFF.
    This endpoint does NOT filter by company_id (global access).
    """
    query = db.query(Company)
    
    # Search filter
    if search:
        query = query.filter(
            (Company.name.ilike(f"%{search}%")) |
            (Company.email.ilike(f"%{search}%")) |
            (Company.slug.ilike(f"%{search}%"))
        )
    
    # Active filter
    if is_active is not None:
        query = query.filter(Company.is_active == is_active)
    
    # Order by creation date (newest first)
    companies = query.order_by(desc(Company.created_at)).offset(skip).limit(limit).all()
    
    return [CompanyResponse.model_validate(c) for c in companies]


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company_details(
    company_id: int,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific company.
    
    Returns:
    - Company basic info
    - Subscription status
    - Active users count
    - Recent activity metrics
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Get subscription info
    subscription = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id
    ).first()
    
    # Get active users count
    active_users_count = db.query(func.count(User.id)).filter(
        User.company_id == company_id,
        User.is_active == True
    ).scalar() or 0
    
    # Get total users count
    total_users_count = db.query(func.count(User.id)).filter(
        User.company_id == company_id
    ).scalar() or 0
    
    # Build response with additional info
    company_dict = CompanyResponse.model_validate(company).model_dump()
    company_dict["subscription"] = {
        "plan_type": subscription.plan_type if subscription else None,
        "trial_end_date": subscription.trial_end_date.isoformat() if subscription and subscription.trial_end_date else None,
        "is_active": company.is_active  # Use company's is_active status
    } if subscription else None
    company_dict["stats"] = {
        "active_users": active_users_count,
        "total_users": total_users_count
    }
    
    return company_dict


# ========== METRICS ==========

@router.get("/metrics/overview")
async def get_saas_metrics_overview(
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get SaaS-wide metrics overview.
    
    Returns:
    - Total companies
    - Active companies
    - Companies created in last 30 days
    - Total users
    - Active users
    - MRR (Monthly Recurring Revenue) - if available
    - Churn rate - if available
    """
    today = datetime.utcnow()
    thirty_days_ago = today - timedelta(days=30)
    
    # Total companies
    total_companies = db.query(func.count(Company.id)).scalar() or 0
    
    # Active companies
    active_companies = db.query(func.count(Company.id)).filter(
        Company.is_active == True
    ).scalar() or 0
    
    # Companies created in last 30 days
    new_companies = db.query(func.count(Company.id)).filter(
        Company.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Active users
    active_users = db.query(func.count(User.id)).filter(
        User.is_active == True
    ).scalar() or 0
    
    # SaaS admins count
    saas_admins = db.query(func.count(User.id)).filter(
        User.saas_role.in_([SaaSRole.SAAS_OWNER.value, SaaSRole.SAAS_STAFF.value])
    ).scalar() or 0
    
    # Calculate MRR (simplified - sum of subscription plans)
    # This is a placeholder - adjust based on your subscription model
    # CompanySubscription doesn't have is_active field
    subscriptions = db.query(CompanySubscription).all()
    
    mrr = Decimal(0)
    plan_prices = {
        "FREE": Decimal(0),
        "BASIC": Decimal(49.90),  # Adjust based on your pricing
        "PRO": Decimal(99.90),
        "PREMIUM": Decimal(199.90)
    }
    
    for sub in subscriptions:
        plan_type = sub.plan_type or "FREE"
        mrr += plan_prices.get(plan_type, Decimal(0))
    
    # Calculate churn rate (companies that became inactive in last 30 days)
    # This is simplified - adjust based on your churn definition
    churned_companies = db.query(func.count(Company.id)).filter(
        Company.is_active == False,
        Company.updated_at >= thirty_days_ago
    ).scalar() or 0
    
    churn_rate = 0.0
    if total_companies > 0:
        churn_rate = (churned_companies / total_companies) * 100
    
    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "new_companies_30d": new_companies,
        "total_users": total_users,
        "active_users": active_users,
        "saas_admins": saas_admins,
        "mrr": float(mrr),
        "churn_rate": round(churn_rate, 2),
        "period": {
            "start": thirty_days_ago.isoformat(),
            "end": today.isoformat()
        }
    }


# ========== IMPERSONATION ==========

@router.post("/impersonate/{company_id}")
async def impersonate_company(
    company_id: int,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Impersonate a company - generate a new JWT token with company scope.
    
    This allows SaaS admins to "enter as" a specific company, accessing
    the normal company app with that company's context.
    
    Flow:
    1. SaaS admin calls this endpoint with a company_id
    2. Backend generates a new JWT with:
       - Same user_id (sub)
       - Same saas_role (preserved)
       - company_id set to the target company
       - company_role set based on CompanyUser or default to COMPANY_OWNER
       - scope set to "company"
    3. Frontend receives the new token and redirects to /dashboard
    
    Security:
    - Only SAAS_OWNER or SAAS_STAFF can impersonate
    - All actions taken while impersonating are logged (if audit log exists)
    - The original saas_role is preserved in the token
    """
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Get user from context
    user = db.query(User).filter(User.id == context.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Get company role for this user in this company
    company_user = db.query(CompanyUser).filter(
        CompanyUser.user_id == user.id,
        CompanyUser.company_id == company_id
    ).first()
    
    # Determine company role
    company_role = CompanyRole.COMPANY_OWNER.value  # Default
    
    if company_user:
        # Get role from CompanyUser (now uses CompanyRole enum)
        if isinstance(company_user.role, CompanyRole):
            company_role = company_user.role.value
        elif isinstance(company_user.role, str):
            try:
                company_role = CompanyRole(company_user.role).value
            except ValueError:
                # Map legacy role strings to CompanyRole
                role_mapping = {
                    "OWNER": CompanyRole.COMPANY_OWNER.value,
                    "MANAGER": CompanyRole.COMPANY_MANAGER.value,
                    "PROFESSIONAL": CompanyRole.COMPANY_PROFESSIONAL.value,
                    "RECEPTIONIST": CompanyRole.COMPANY_RECEPTIONIST.value,
                    "FINANCE": CompanyRole.COMPANY_FINANCE.value,
                    "CLIENT": CompanyRole.COMPANY_CLIENT.value,
                    "READ_ONLY": CompanyRole.COMPANY_READ_ONLY.value,
                }
                company_role = role_mapping.get(company_user.role, CompanyRole.COMPANY_OWNER.value)
        else:
            company_role = CompanyRole.COMPANY_OWNER.value
    else:
        # User doesn't have a CompanyUser entry - create one with COMPANY_OWNER role
        # This allows SaaS admins to impersonate any company
        from datetime import datetime
        company_user = CompanyUser(
            company_id=company_id,
            user_id=user.id,
            role=CompanyRole.COMPANY_OWNER,
            is_active="active",
            invited_at=datetime.utcnow(),
            joined_at=datetime.utcnow(),
        )
        db.add(company_user)
        db.commit()
    
    # Generate new token with company scope
    impersonation_token = create_access_token(
        data={"sub": str(user.id)},
        saas_role=context.saas_role.value if context.saas_role else None,
        company_role=company_role,
        company_id=company_id,
        scope=Scope.COMPANY.value
    )
    
    # TODO: Log impersonation action in audit log
    # audit_log_service.log_action(
    #     user_id=user.id,
    #     action="impersonate_company",
    #     company_id=company_id,
    #     metadata={"original_scope": context.scope.value}
    # )
    
    return {
        "access_token": impersonation_token,
        "token_type": "bearer",
        "company": {
            "id": company.id,
            "name": company.name,
            "slug": company.slug
        },
        "scope": Scope.COMPANY.value,
        "message": "Token de impersonação gerado. Use este token para acessar o app da empresa."
    }


# ========== USER MANAGEMENT ==========

@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    company_id: Optional[int] = None,
    saas_role: Optional[str] = None,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    List all users in the SaaS platform.
    
    Can filter by company_id or saas_role.
    """
    query = db.query(User)
    
    if company_id:
        query = query.filter(User.company_id == company_id)
    
    if saas_role:
        query = query.filter(User.saas_role == saas_role)
    
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    return [UserResponse.model_validate(u) for u in users]


@router.post("/users/{user_id}/promote-saas")
async def promote_user_to_saas(
    user_id: int,
    saas_role: str = Query(..., description="SAAS_OWNER or SAAS_STAFF"),
    context: CurrentUserContext = Depends(require_saas_owner),  # Only SAAS_OWNER can promote
    db: Session = Depends(get_db)
):
    """
    Promote a user to SaaS admin role.
    
    Only SAAS_OWNER can promote users.
    """
    if saas_role not in [SaaSRole.SAAS_OWNER.value, SaaSRole.SAAS_STAFF.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="saas_role deve ser SAAS_OWNER ou SAAS_STAFF"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    user.saas_role = saas_role
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"Usuário promovido para {saas_role}",
        "user": UserResponse.model_validate(user)
    }


# ========== COMPANY MANAGEMENT ==========

@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    company_data: dict,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Update company information.
    
    Allows updating:
    - Basic info (name, email, phone, etc.)
    - Activation status
    - Settings
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Update fields
    allowed_fields = [
        'name', 'email', 'phone', 'cellphone', 'cpf', 'cnpj',
        'address', 'address_number', 'address_complement',
        'neighborhood', 'city', 'state', 'zip_code',
        'is_active', 'logo_url'
    ]
    
    for field, value in company_data.items():
        if field in allowed_fields:
            setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.post("/companies/{company_id}/toggle-status")
async def toggle_company_status(
    company_id: int,
    is_active: bool,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Activate or deactivate a company.
    
    When deactivating:
    - Users cannot log in
    - API access is blocked
    - Company appears as suspended in admin panel
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    company.is_active = is_active
    db.commit()
    db.refresh(company)
    
    return {
        "message": f"Empresa {'ativada' if is_active else 'desativada'} com sucesso",
        "company": CompanyResponse.model_validate(company)
    }


# ========== SUBSCRIPTION MANAGEMENT ==========

@router.get("/companies/{company_id}/subscription")
async def get_company_subscription(
    company_id: int,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """Get company subscription details"""
    subscription = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id
    ).first()
    
    if not subscription:
        return {
            "company_id": company_id,
            "plan_type": "FREE",
            "is_active": True,
            "trial_end_date": None,
            "message": "Empresa sem assinatura cadastrada (usando plano FREE)"
        }
    
    return {
        "id": subscription.id,
        "company_id": subscription.company_id,
        "plan_type": subscription.plan_type,
        "is_active": subscription.is_active,
        "trial_end_date": subscription.trial_end_date.isoformat() if subscription.trial_end_date else None,
        "created_at": subscription.created_at.isoformat(),
        "updated_at": subscription.updated_at.isoformat()
    }


@router.put("/companies/{company_id}/subscription")
async def update_company_subscription(
    company_id: int,
    plan_type: str = Query(..., description="FREE, BASIC, PRO, PREMIUM"),
    trial_days: Optional[int] = Query(None, description="Dias de trial (opcional)"),
    is_active: bool = Query(True),
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Update or create company subscription.
    
    Sets:
    - Plan type (FREE, BASIC, PRO, PREMIUM)
    - Trial period
    - Active status
    """
    from datetime import datetime, timedelta
    
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Validate plan type
    valid_plans = ["FREE", "BASIC", "PRO", "PREMIUM"]
    if plan_type not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plano inválido. Opções: {', '.join(valid_plans)}"
        )
    
    # Get or create subscription
    subscription = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id
    ).first()
    
    if subscription:
        # Update existing
        subscription.plan_type = plan_type
        subscription.is_active = is_active
        
        if trial_days is not None:
            subscription.trial_end_date = datetime.utcnow() + timedelta(days=trial_days)
    else:
        # Create new
        trial_end_date = None
        if trial_days is not None:
            trial_end_date = datetime.utcnow() + timedelta(days=trial_days)
        
        subscription = CompanySubscription(
            company_id=company_id,
            plan_type=plan_type,
            is_active=is_active,
            trial_end_date=trial_end_date
        )
        db.add(subscription)
    
    db.commit()
    db.refresh(subscription)
    
    return {
        "message": f"Assinatura atualizada para plano {plan_type}",
        "subscription": {
            "id": subscription.id,
            "company_id": subscription.company_id,
            "plan_type": subscription.plan_type,
            "is_active": subscription.is_active,
            "trial_end_date": subscription.trial_end_date.isoformat() if subscription.trial_end_date else None
        }
    }


# ========== ANALYTICS ==========

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    days: int = Query(30, description="Número de dias para análise"),
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get revenue analytics (MRR, growth, etc.)
    """
    from datetime import datetime, timedelta
    
    today = datetime.utcnow()
    period_start = today - timedelta(days=days)
    
    # Plan prices (adjust to your pricing)
    plan_prices = {
        "FREE": Decimal(0),
        "BASIC": Decimal(49.90),
        "PRO": Decimal(99.90),
        "PREMIUM": Decimal(199.90)
    }
    
    # Current MRR
    # Get all subscriptions (CompanySubscription doesn't have is_active field)
    active_subscriptions = db.query(CompanySubscription).all()
    
    current_mrr = sum(
        plan_prices.get(sub.plan_type or "FREE", Decimal(0))
        for sub in active_subscriptions
    )
    
    # MRR by plan
    mrr_by_plan = {}
    subscription_count_by_plan = {}
    
    for plan in plan_prices.keys():
        count = len([s for s in active_subscriptions if (s.plan_type or "FREE") == plan])
        subscription_count_by_plan[plan] = count
        mrr_by_plan[plan] = float(plan_prices[plan] * count)
    
    # New subscriptions in period
    new_subscriptions = db.query(CompanySubscription).filter(
        CompanySubscription.created_at >= period_start
    ).count()
    
    # Churned subscriptions - CompanySubscription doesn't have is_active
    # For now, we consider subscriptions where trial_end_date has passed
    from datetime import datetime
    now = datetime.utcnow()
    churned_subscriptions = db.query(CompanySubscription).filter(
        CompanySubscription.trial_end_date.isnot(None),
        CompanySubscription.trial_end_date < now,
        CompanySubscription.updated_at >= period_start
    ).count()
    
    # Calculate churn rate
    total_subs = len(active_subscriptions) + churned_subscriptions
    churn_rate = (churned_subscriptions / total_subs * 100) if total_subs > 0 else 0
    
    return {
        "current_mrr": float(current_mrr),
        "mrr_by_plan": mrr_by_plan,
        "subscription_count_by_plan": subscription_count_by_plan,
        "total_active_subscriptions": len(active_subscriptions),
        "new_subscriptions": new_subscriptions,
        "churned_subscriptions": churned_subscriptions,
        "churn_rate": round(churn_rate, 2),
        "period_days": days
    }


@router.get("/analytics/growth")
async def get_growth_analytics(
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get growth analytics (companies, users, revenue over time)
    """
    from datetime import datetime, timedelta
    from sqlalchemy import extract
    
    today = datetime.utcnow()
    
    # Last 12 months of company growth
    months_data = []
    
    for i in range(12):
        month_date = today - timedelta(days=30 * i)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Companies created in this month
        companies_count = db.query(func.count(Company.id)).filter(
            extract('year', Company.created_at) == month_start.year,
            extract('month', Company.created_at) == month_start.month
        ).scalar() or 0
        
        # Users created in this month
        users_count = db.query(func.count(User.id)).filter(
            extract('year', User.created_at) == month_start.year,
            extract('month', User.created_at) == month_start.month
        ).scalar() or 0
        
        months_data.append({
            "month": month_start.strftime("%Y-%m"),
            "companies": companies_count,
            "users": users_count
        })
    
    months_data.reverse()  # Oldest to newest
    
    # Calculate growth rates
    if len(months_data) >= 2:
        last_month_companies = months_data[-1]["companies"]
        previous_month_companies = months_data[-2]["companies"]
        
        company_growth_rate = 0
        if previous_month_companies > 0:
            company_growth_rate = ((last_month_companies - previous_month_companies) / previous_month_companies) * 100
    else:
        company_growth_rate = 0
    
    return {
        "monthly_data": months_data,
        "company_growth_rate": round(company_growth_rate, 2),
        "period": "Last 12 months"
    }


# ========== PLANS MANAGEMENT ==========

@router.get("/plans")
async def list_plans(
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    List all available plans with pricing and features.
    """
    plans_db = db.query(Plan).filter(
        Plan.is_active == True,
        Plan.is_visible == True
    ).order_by(Plan.display_order).all()

    if not plans_db:
        return {
            "plans": [],
            "total_plans": 0,
            "total_active_subscriptions": 0,
            "total_mrr": 0.0,
            "total_companies": 0,
            "active_companies": 0,
            "message": "Nenhum plano cadastrado. Execute o seed de planos para popular a tabela."
        }

    total_companies = db.query(func.count(Company.id)).scalar() or 0
    active_companies = db.query(func.count(Company.id)).filter(
        Company.is_active == True
    ).scalar() or 0

    plans_payload = []
    total_active_subscriptions = 0
    total_mrr = 0.0

    for plan in plans_db:
        alias_values = [alias.upper() for alias in _get_plan_aliases(plan)]
        plan_filter = func.upper(func.coalesce(CompanySubscription.plan_type, Company.subscription_plan))

        active_subscriptions = db.query(func.count(func.distinct(Company.id))).outerjoin(
            CompanySubscription,
            CompanySubscription.company_id == Company.id
        ).filter(
            plan_filter.in_(alias_values),
            Company.is_active == True,
            or_(CompanySubscription.id.is_(None), CompanySubscription.is_active == True)
        ).scalar() or 0

        mrr = float(plan.price_monthly) * active_subscriptions
        total_active_subscriptions += active_subscriptions
        total_mrr += mrr

        plans_payload.append({
            "id": plan.slug.upper(),
            "slug": plan.slug,
            "name": plan.name,
            "description": plan.description,
            "price": float(plan.price_monthly),
            "billing_period": "monthly",
            "trial_days": plan.trial_days,
            "is_active": plan.is_active,
            "highlight_label": plan.highlight_label,
            "color": plan.color,
            "features": _build_plan_features(plan),
            "limits": {
                "max_users": plan.max_professionals,
                "max_units": plan.max_units,
                "max_clients": plan.max_clients,
                "max_appointments_per_month": plan.max_appointments_per_month
            },
            "stats": {
                "active_subscriptions": active_subscriptions,
                "mrr": round(mrr, 2)
            }
        })

    return {
        "plans": plans_payload,
        "total_plans": len(plans_payload),
        "total_active_subscriptions": total_active_subscriptions,
        "total_mrr": round(total_mrr, 2),
        "total_companies": total_companies,
        "active_companies": active_companies
    }


@router.get("/plans/{plan_id}")
async def get_plan_details(
    plan_id: str,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific plan including companies using it.
    """
    plan = db.query(Plan).filter(
        func.lower(Plan.slug) == plan_id.lower()
    ).first()

    if not plan and plan_id.isdigit():
        plan = db.query(Plan).filter(Plan.id == int(plan_id)).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )

    alias_values = [alias.upper() for alias in _get_plan_aliases(plan)]
    plan_filter = func.upper(func.coalesce(CompanySubscription.plan_type, Company.subscription_plan))

    active_subscriptions = db.query(func.count(func.distinct(Company.id))).outerjoin(
        CompanySubscription,
        CompanySubscription.company_id == Company.id
    ).filter(
        plan_filter.in_(alias_values),
        Company.is_active == True,
        or_(CompanySubscription.id.is_(None), CompanySubscription.is_active == True)
    ).scalar() or 0

    companies = db.query(Company).outerjoin(
        CompanySubscription,
        CompanySubscription.company_id == Company.id
    ).filter(
        plan_filter.in_(alias_values),
        Company.is_active == True,
        or_(CompanySubscription.id.is_(None), CompanySubscription.is_active == True)
    ).order_by(desc(Company.created_at)).limit(20).all()

    mrr = float(plan.price_monthly) * active_subscriptions

    return {
        "id": plan.slug.upper(),
        "slug": plan.slug,
        "name": plan.name,
        "description": plan.description,
        "price": float(plan.price_monthly),
        "trial_days": plan.trial_days,
        "highlight_label": plan.highlight_label,
        "color": plan.color,
        "features": _build_plan_features(plan),
        "limits": {
            "max_users": plan.max_professionals,
            "max_units": plan.max_units,
            "max_clients": plan.max_clients,
            "max_appointments_per_month": plan.max_appointments_per_month
        },
        "active_subscriptions": active_subscriptions,
        "mrr": round(mrr, 2),
        "companies": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "created_at": c.created_at.isoformat()
            }
            for c in companies
        ]
    }


# ========== ADDONS STATS ==========

@router.get("/addons/stats")
async def get_addons_stats(
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Get statistics about all add-ons for SaaS admin dashboard
    """
    # Total add-ons available
    total_addons = db.query(func.count(AddOn.id)).filter(
        AddOn.is_active == True
    ).scalar() or 0
    
    # Active subscriptions across all companies
    active_subscriptions = db.query(func.count(CompanyAddOn.id)).filter(
        CompanyAddOn.is_active == True
    ).scalar() or 0
    
    # Calculate monthly revenue from add-ons
    active_company_addons = db.query(CompanyAddOn).filter(
        CompanyAddOn.is_active == True,
        CompanyAddOn.is_trial == False  # Exclude trial add-ons
    ).all()
    
    monthly_revenue = 0.0
    for company_addon in active_company_addons:
        addon = db.query(AddOn).filter(AddOn.id == company_addon.addon_id).first()
        if addon and addon.price_monthly:
            monthly_revenue += float(addon.price_monthly)
    
    # Find top add-on by subscriptions
    top_addon_data = db.query(
        AddOn.name,
        func.count(CompanyAddOn.id).label('subscription_count')
    ).join(
        CompanyAddOn, CompanyAddOn.addon_id == AddOn.id
    ).filter(
        CompanyAddOn.is_active == True
    ).group_by(
        AddOn.id, AddOn.name
    ).order_by(
        func.count(CompanyAddOn.id).desc()
    ).first()
    
    top_addon = top_addon_data.name if top_addon_data else 'Nenhum'
    
    return {
        "total_addons": total_addons,
        "active_subscriptions": active_subscriptions,
        "monthly_revenue": round(monthly_revenue, 2),
        "top_addon": top_addon
    }


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    context: CurrentUserContext = Depends(require_saas_owner),
    db: Session = Depends(get_db)
):
    """
    Delete a company (SAAS OWNER only)
    
    ⚠️ DANGER: This will permanently delete the company and all associated data!
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if company has active subscriptions or financial transactions
    active_subscriptions = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id,
        CompanySubscription.status == "active"
    ).count()
    
    financial_transactions = db.query(FinancialTransaction).filter(
        FinancialTransaction.company_id == company_id
    ).count()
    
    if active_subscriptions > 0 or financial_transactions > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete company with active subscriptions or financial transactions"
        )
    
    # Soft delete by marking as inactive
    company.is_active = False
    company.deleted_at = datetime.utcnow()
    company.deleted_by = context.user.id
    
    db.commit()
    
    return None


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user (SAAS admin only)
    
    ⚠️ DANGER: This will permanently delete the user account!
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot delete SaaS owners
    if user.role == "SAAS_OWNER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete SaaS owner users"
        )
    
    # Check if user is the only owner of any company
    companies_where_owner = db.query(CompanyUser).filter(
        CompanyUser.user_id == user_id,
        CompanyUser.role == "OWNER"
    ).count()
    
    if companies_where_owner > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user who is owner of companies"
        )
    
    # Soft delete by marking as inactive
    user.is_active = False
    user.deleted_at = datetime.utcnow()
    user.deleted_by = context.user.id
    
    db.commit()
    
    return None