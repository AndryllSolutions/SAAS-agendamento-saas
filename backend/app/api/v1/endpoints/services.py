"""
Services Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.service import Service, ServiceCategory
from app.models.user import User
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ServiceCategoryCreate,
    ServiceCategoryUpdate,
    ServiceCategoryResponse,
)

router = APIRouter()


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
    
    return category


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
    
    return categories


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
    
    return category


# Services
@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a service (Manager/Admin only)
    """
    service = Service(
        **service_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service


@router.get("/", response_model=List[ServiceResponse])
async def list_services(
    category_id: int = None,
    is_active: bool = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List services
    """
    query = db.query(Service).filter(Service.company_id == current_user.company_id)
    
    if category_id:
        query = query.filter(Service.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    
    services = query.offset(skip).limit(limit).all()
    return services


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
    
    return service


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
    
    return service


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
