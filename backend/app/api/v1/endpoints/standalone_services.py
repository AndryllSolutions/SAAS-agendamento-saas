"""
Standalone Services API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.user import User
from app.models.standalone_service import StandaloneService
from app.models.company import Company
from app.schemas.standalone_service import (
    StandaloneServiceResponse, StandaloneServiceCreate, StandaloneServiceUpdate, StandaloneServiceListResponse
)

router = APIRouter()


@router.get("/", response_model=StandaloneServiceListResponse)
async def list_standalone_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available standalone services (consulting, programs)"""
    services = db.query(StandaloneService).filter(
        StandaloneService.is_active == True,
        StandaloneService.is_visible == True
    ).order_by(StandaloneService.display_order).all()
    
    return StandaloneServiceListResponse(
        services=services,
        total=len(services)
    )


@router.get("/{slug}", response_model=StandaloneServiceResponse)
async def get_standalone_service(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific standalone service"""
    service = db.query(StandaloneService).filter(
        StandaloneService.slug == slug,
        StandaloneService.is_active == True
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return service


@router.get("/check-included/{slug}")
async def check_service_included(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a service is included in the company's current plan"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    service = db.query(StandaloneService).filter(
        StandaloneService.slug == slug,
        StandaloneService.is_active == True
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    company_plan_slug = company.subscription_plan.lower() if company.subscription_plan else "essencial"
    is_included = service.is_included_in_plan(company_plan_slug)
    
    return {
        "service_slug": slug,
        "service_name": service.name,
        "company_plan": company_plan_slug,
        "is_included": is_included,
        "price": float(service.price) if not is_included else 0,
        "message": "Incluso no seu plano" if is_included else f"Disponível por R$ {service.price}"
    }


@router.post("/", response_model=StandaloneServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_standalone_service(
    service_data: StandaloneServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Create a new standalone service (manager only)"""
    # Check if slug already exists
    existing = db.query(StandaloneService).filter(StandaloneService.slug == service_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service with this slug already exists")
    
    service = StandaloneService(**service_data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service


@router.put("/{service_id}", response_model=StandaloneServiceResponse)
async def update_standalone_service(
    service_id: int,
    service_data: StandaloneServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Update a standalone service (manager only)"""
    service = db.query(StandaloneService).filter(StandaloneService.id == service_id).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Update fields
    update_data = service_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_standalone_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Delete a standalone service (manager only)"""
    service = db.query(StandaloneService).filter(StandaloneService.id == service_id).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Soft delete by marking as inactive
    service.is_active = False
    db.commit()
    
    return None
