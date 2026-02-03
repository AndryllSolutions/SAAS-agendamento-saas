"""
Companies Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_admin
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new company (public endpoint for registration)
    """
    # Check if slug already exists
    existing_company = db.query(Company).filter(Company.slug == company_data.slug).first()
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug já está em uso"
        )
    
    # Create company
    company = Company(**company_data.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.get("/me", response_model=CompanyResponse)
async def get_current_company(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's company
    """
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return CompanyResponse.model_validate(company)


@router.put("/me", response_model=CompanyResponse)
async def update_current_company(
    company_data: CompanyUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update current user's company (Admin only)
    """
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    update_data = company_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get company by ID (public endpoint)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return CompanyResponse.model_validate(company)


@router.get("/slug/{slug}", response_model=CompanyResponse)
async def get_company_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get company by slug (public endpoint)
    """
    company = db.query(Company).filter(Company.slug == slug).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    return CompanyResponse.model_validate(company)


@router.post("/{company_id}/upgrade-plan", response_model=CompanyResponse)
async def upgrade_company_plan(
    company_id: int,
    new_plan: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Upgrade company subscription plan"""
    from app.core.plans import SubscriptionPlan
    
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Only SAAS_ADMIN can upgrade other companies
    if company_id != current_user.company_id and current_user.role.value != "saas_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar esta empresa"
        )
    
    # Validate plan
    valid_plans = [plan.value for plan in SubscriptionPlan]
    if new_plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plano inválido. Planos disponíveis: {', '.join(valid_plans)}"
        )
    
    company.subscription_plan = new_plan
    
    # Update features based on plan
    from app.core.plans import get_plan_features
    company.features = get_plan_features(new_plan)
    
    # Extend subscription if upgrading
    if new_plan in ["PRO", "PREMIUM"]:
        from datetime import timedelta
        if not company.subscription_expires_at or company.subscription_expires_at < datetime.utcnow():
            company.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
        else:
            company.subscription_expires_at = company.subscription_expires_at + timedelta(days=30)
    
    db.commit()
    db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}/settings", response_model=dict)
async def get_company_settings(
    company_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get company settings"""
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Only company members or SAAS_ADMIN can view settings
    if company_id != current_user.company_id and current_user.role.value != "saas_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar estas configurações"
        )
    
    return {
        "company_id": company.id,
        "name": company.name,
        "subscription_plan": company.subscription_plan,
        "features": company.features,
        "settings": company.settings,
        "subscription_expires_at": company.subscription_expires_at.isoformat() if company.subscription_expires_at else None,
        "is_active": company.is_active,
        "online_booking_enabled": company.online_booking_enabled,
        "business_hours": company.business_hours,
        "timezone": company.timezone,
        "currency": company.currency
    }


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update company by ID (Admin only)
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Only SAAS_ADMIN can update other companies
    if company_id != current_user.company_id and current_user.role.value != "saas_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para atualizar esta empresa"
        )
    
    update_data = company_data.dict(exclude_unset=True)
    
    # Check if slug is being updated and if it's unique
    if "slug" in update_data:
        existing = db.query(Company).filter(
            Company.slug == update_data["slug"],
            Company.id != company_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug já está em uso"
            )
    
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete company (soft delete - SAAS_ADMIN only)
    """
    # Only SAAS_ADMIN can delete companies
    if current_user.role.value != "saas_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores do sistema podem deletar empresas"
        )
    
    company = db.query(Company).filter(Company.id == company_id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Soft delete
    company.is_active = False
    db.commit()
    
    return None
