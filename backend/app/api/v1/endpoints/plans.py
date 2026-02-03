"""
Plans Endpoints - Gerenciamento de Planos e Assinaturas
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.core.rbac import require_saas_admin, require_company_owner
from app.models.user import User
from app.models.plan import Plan
from app.models.company import Company
from app.schemas.plan import PlanResponse, PlanCreate, PlanLimits
from app.schemas.subscription import (
    SubscriptionResponse,
    SubscriptionUpgradeRequest,
    SubscriptionDetailsResponse,
    UsageResponse
)
from app.services.plan_service import PlanService
from app.services.limit_validator import LimitValidator
from app.services.subscription_service import SubscriptionService


router = APIRouter()


@router.get("", response_model=List[PlanResponse])
@router.get("/", response_model=List[PlanResponse], include_in_schema=False)
async def list_plans(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    Lista todos os planos disponíveis.
    
    Público: Qualquer usuário pode ver os planos.
    """
    plans = db.query(Plan).filter(Plan.is_visible == True)
    
    if not include_inactive:
        plans = plans.filter(Plan.is_active == True)
    
    plans = plans.order_by(Plan.display_order).all()
    
    return plans


@router.get("/{plan_slug}", response_model=PlanResponse)
async def get_plan(
    plan_slug: str,
    db: Session = Depends(get_db)
):
    """Retorna detalhes de um plano específico"""
    plan = PlanService.get_plan_by_slug(db, plan_slug)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plano '{plan_slug}' não encontrado"
        )
    
    return plan


@router.post("/", response_model=PlanResponse)
async def create_plan(
    plan_data: PlanCreate,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Cria novo plano (apenas SAAS_ADMIN).
    
    Uso: Criar planos customizados no futuro.
    """
    # Verificar se slug já existe
    existing = db.query(Plan).filter(Plan.slug == plan_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plano com slug '{plan_data.slug}' já existe"
        )
    
    plan = Plan(**plan_data.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return plan


@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: int,
    plan_data: dict,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """Atualiza plano existente (apenas SAAS_ADMIN)"""
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    # Atualizar campos
    for key, value in plan_data.items():
        if hasattr(plan, key):
            setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    current_user: User = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Desativa plano (soft delete).
    
    Não deleta fisicamente, apenas marca como inativo.
    """
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    plan.is_active = False
    plan.is_visible = False
    
    db.commit()
    
    return {"message": f"Plano '{plan.name}' desativado com sucesso"}


# ==================== SUBSCRIPTION ENDPOINTS ====================

@router.get("/subscription/current", response_model=SubscriptionDetailsResponse)
@router.get("/subscription/current/", response_model=SubscriptionDetailsResponse, include_in_schema=False)
async def get_current_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retorna detalhes da assinatura atual da empresa.
    
    Inclui:
    - Plano atual
    - Limites
    - Uso atual
    - Data de expiração
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    plan = PlanService.get_company_current_plan(db, company)
    usage = LimitValidator.get_current_usage(db, company)
    
    return SubscriptionDetailsResponse(
        company_id=company.id,
        plan={
            "id": plan.id if plan else None,
            "name": plan.name if plan else "Sem Plano",
            "slug": plan.slug if plan else None,
            "price_monthly": float(plan.price_monthly) if plan else 0,
            "max_professionals": plan.max_professionals if plan else 0,
            "max_units": plan.max_units if plan else 0,
            "features": plan.features if plan else [],
        },
        expires_at=company.subscription_expires_at.isoformat() if company.subscription_expires_at else None,
        is_active=company.is_active,
        usage=usage
    )


@router.get("/subscription/usage")
@router.get("/subscription/usage/", include_in_schema=False)
async def get_subscription_usage(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retorna uso atual de recursos da empresa.
    
    Útil para exibir barras de progresso de uso.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    usage = LimitValidator.get_current_usage(db, company)
    plan = PlanService.get_company_current_plan(db, company)
    
    return {
        "plan_name": plan.name if plan else "Sem Plano",
        "plan_slug": plan.slug if plan else None,
        **usage
    }


@router.get("/subscription/limits", response_model=PlanLimits)
@router.get("/subscription/limits/", response_model=PlanLimits, include_in_schema=False)
async def get_subscription_limits(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retorna limites do plano atual da empresa.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    plan = PlanService.get_company_current_plan(db, company)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    return PlanLimits(
        max_professionals=plan.max_professionals,
        max_units=plan.max_units,
        max_clients=plan.max_clients,
        max_appointments_per_month=plan.max_appointments_per_month,
        is_unlimited_professionals=plan.is_unlimited_professionals(),
        is_unlimited_units=plan.is_unlimited_units(),
        is_unlimited_clients=plan.max_clients == -1,
        is_unlimited_appointments=plan.max_appointments_per_month == -1
    )


@router.post("/subscription/upgrade")
@router.post("/subscription/upgrade/", include_in_schema=False)
async def upgrade_subscription(
    request: SubscriptionUpgradeRequest,
    current_user: User = Depends(require_company_owner),
    db: Session = Depends(get_db)
):
    """
    Faz upgrade do plano da empresa.
    
    Apenas COMPANY_OWNER pode fazer upgrade.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Verificar se é realmente upgrade
    current_plan = PlanService.get_company_current_plan(db, company)
    new_plan = PlanService.get_plan_by_slug(db, request.new_plan_slug)
    
    if not new_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plano '{request.new_plan_slug}' não encontrado"
        )
    
    if current_plan and new_plan.price_monthly <= current_plan.price_monthly:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Para fazer downgrade, use o endpoint /subscription/downgrade"
        )
    
    try:
        subscription = SubscriptionService.upgrade_plan(
            db=db,
            company=company,
            new_plan_slug=request.new_plan_slug,
            immediate=request.immediate
        )
        
        return {
            "message": f"Upgrade para plano {new_plan.name} realizado com sucesso!",
            "new_plan": new_plan.name,
            "subscription_id": subscription.id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/subscription/downgrade")
@router.post("/subscription/downgrade/", include_in_schema=False)
async def downgrade_subscription(
    request: SubscriptionUpgradeRequest,
    current_user: User = Depends(require_company_owner),
    db: Session = Depends(get_db)
):
    """
    Faz downgrade do plano da empresa.
    
    Verifica se a empresa está dentro dos limites do novo plano.
    Apenas COMPANY_OWNER pode fazer downgrade.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    try:
        subscription = SubscriptionService.downgrade_plan(
            db=db,
            company=company,
            new_plan_slug=request.new_plan_slug
        )
        
        new_plan = PlanService.get_plan_by_slug(db, request.new_plan_slug)
        
        return {
            "message": f"Downgrade para plano {new_plan.name} agendado para o próximo ciclo de faturamento.",
            "new_plan": new_plan.name,
            "subscription_id": subscription.id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/subscription/can-add-professional")
@router.get("/subscription/can-add-professional/", include_in_schema=False)
async def can_add_professional(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Verifica se a empresa pode adicionar mais profissionais.
    
    Retorna:
    - can_add: bool
    - message: str (se não pode, explica o motivo)
    - current: int (quantidade atual)
    - limit: int ou "Ilimitado"
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    can_add, message = LimitValidator.check_professionals_limit(db, company)
    usage = LimitValidator.get_current_usage(db, company)
    
    return {
        "can_add": can_add,
        "message": message if not can_add else "Você pode adicionar mais profissionais",
        "current": usage["professionals"]["current"],
        "limit": usage["professionals"]["limit"]
    }


@router.get("/subscription/check-feature/{feature}")
@router.get("/subscription/check-feature/{feature}/", include_in_schema=False)
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Verifica se a empresa tem acesso a uma feature específica.
    
    Útil para mostrar/esconder funcionalidades no frontend.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não está vinculado a uma empresa"
        )
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    has_access = PlanService.check_feature_access(db, company, feature)
    required_plan = PlanService.get_required_plan_for_feature(feature)
    
    return {
        "feature": feature,
        "has_access": has_access,
        "required_plan": required_plan if not has_access else None,
        "message": None if has_access else f"Esta funcionalidade requer o plano {required_plan.upper()} ou superior"
    }

