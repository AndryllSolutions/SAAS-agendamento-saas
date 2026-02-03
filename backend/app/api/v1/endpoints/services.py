"""
Services Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.service import Service, ServiceCategory
from app.models.user import User
from app.models.company import Company
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ServiceCategoryCreate,
    ServiceCategoryUpdate,
    ServiceCategoryResponse,
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.get("/public", response_model=List[ServiceResponse])
async def list_public_services(
    company_slug: str = Query(None, description="Company slug for filtering"),
    db: Session = Depends(get_db)
):
    """
    List active services for public booking (no authentication required)
    Supports filtering by company slug
    """
    # Get company by slug or default to first company
    if company_slug:
        company = db.query(Company).filter(Company.slug == company_slug).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa não encontrada"
            )
    else:
        # Fallback to first company for backward compatibility
        company = db.query(Company).first()
        if not company:
            return []
    
    # Get only active services
    services = db.query(Service).filter(
        Service.company_id == company.id,
        Service.is_active == True
    ).all()
    
    return services


# Service Categories
@router.post("/categories", response_model=ServiceCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_service_category(
    category_data: ServiceCategoryCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a service category (Manager/Admin only)
    """
    category = ServiceCategory(
        **category_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return ServiceCategoryResponse.model_validate(category)


@router.get("/categories", response_model=List[ServiceCategoryResponse])
async def list_service_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List service categories
    """
    categories = db.query(ServiceCategory).filter(
        ServiceCategory.company_id == current_user.company_id,
        ServiceCategory.is_active == True
    ).all()
    
    return [ServiceCategoryResponse.model_validate(cat) for cat in categories]


@router.get("/categories/{category_id}", response_model=ServiceCategoryResponse)
async def get_service_category(
    category_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get service category by ID
    """
    category = db.query(ServiceCategory).filter(
        ServiceCategory.id == category_id,
        ServiceCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    return ServiceCategoryResponse.model_validate(category)


@router.put("/categories/{category_id}", response_model=ServiceCategoryResponse)
async def update_service_category(
    category_id: int,
    category_data: ServiceCategoryUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update service category (Manager/Admin only)
    """
    category = db.query(ServiceCategory).filter(
        ServiceCategory.id == category_id,
        ServiceCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    update_data = category_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return ServiceCategoryResponse.model_validate(category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_category(
    category_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete service category (Manager/Admin only)
    """
    category = db.query(ServiceCategory).filter(
        ServiceCategory.id == category_id,
        ServiceCategory.company_id == current_user.company_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    db.delete(category)
    db.commit()
    
    return None


# Services
@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_service(
    service_data: ServiceCreate,
    response: Response,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a service (Manager/Admin only)
    """
    from app.core.cache import delete_pattern
    from app.core.tenant_context import set_tenant_context
    
    # Set tenant context for RLS
    if current_user.company_id:
        set_tenant_context(db, current_user.company_id)
    
    # ServiceCreate already normalizes duration->duration_minutes
    # Exclude company_id to avoid duplicate argument error
    service_dict = service_data.model_dump(exclude={'duration', 'company_id'}, exclude_none=True)
    service_dict['duration_minutes'] = service_data.duration_minutes

    existing = db.query(Service).filter(
        Service.company_id == current_user.company_id,
        func.lower(Service.name) == service_data.name.lower()
    ).first()

    if existing:
        existing_price = Decimal(str(existing.price)).quantize(Decimal("0.01"))
        incoming_price = Decimal(str(service_dict.get('price'))).quantize(Decimal("0.01"))
        same = (
            (existing.description or None) == service_dict.get('description')
            and existing_price == incoming_price
            and existing.duration_minutes == service_dict.get('duration_minutes')
            and (existing.category_id or None) == service_dict.get('category_id')
            and (existing.currency or None) == service_dict.get('currency', 'BRL')
            and bool(existing.is_active) == bool(service_dict.get('is_active', True))
            and bool(existing.requires_professional) == bool(service_dict.get('requires_professional', True))
            and int(existing.commission_rate or 0) == int(service_dict.get('commission_rate', 0) or 0)
        )

        if same:
            response.status_code = status.HTTP_200_OK
            return ServiceResponse.from_model(existing)

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Serviço já existe com dados diferentes"
        )
    
    service = Service(
        **service_dict,
        company_id=current_user.company_id
    )
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    # Invalidate cache
    delete_pattern(f"services:list:{current_user.company_id}:*")
    
    return ServiceResponse.from_model(service)


@router.get("", response_model=List[ServiceResponse])
@router.get("/", response_model=List[ServiceResponse], include_in_schema=False)
async def list_services(
    category_id: int = None,
    is_active: bool = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List services (Cached for 2 minutes, optimized with eager loading)
    """
    from app.core.cache import get_cache, set_cache, delete_pattern
    from app.core.tenant_context import set_tenant_context
    
    # Set tenant context for RLS
    if current_user.company_id:
        set_tenant_context(db, current_user.company_id)
    
    # Cache key
    cache_key = f"services:list:{current_user.company_id}:{skip}:{limit}:{category_id}:{is_active}"
    
    # Try cache first (only for first page without filters)
    if skip == 0 and category_id is None and is_active is None:
        cached = await get_cache(cache_key)
        if cached:
            # ✅ CORREÇÃO: Retornar lista de ServiceResponse do cache
            return [ServiceResponse(**item) for item in cached]
    
    # Optimized query with eager loading
    from sqlalchemy.orm import joinedload
    query = db.query(Service).options(
        joinedload(Service.category)
    ).filter(Service.company_id == current_user.company_id)
    
    if category_id:
        query = query.filter(Service.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    
    services = query.order_by(Service.name).offset(skip).limit(limit).all()
    
    # Convert to Pydantic models
    result = [ServiceResponse.from_model(service) for service in services]
    
    # ✅ CORREÇÃO: Cache reativado com serialização correta
    # Cache result (only for first page without filters)
    if skip == 0 and category_id is None and is_active is None:
        cache_data = [r.model_dump() for r in result]
        await set_cache(cache_key, cache_data, ttl=120)  # 2 minutes
    
    return result


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get service by ID
    """
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    return ServiceResponse.from_model(service)


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update service (Manager/Admin only)
    """
    from app.core.cache import delete_pattern
    
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    update_data = service_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    
    # Invalidate cache
    delete_pattern(f"services:list:{current_user.company_id}:*")
    
    return ServiceResponse.from_model(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Delete service (Manager/Admin only)
    """
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    # Soft delete
    service.is_active = False
    db.commit()
    
    return None
