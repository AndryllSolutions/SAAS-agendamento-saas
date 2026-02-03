"""
AddOns API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.user import User
from app.models.addon import AddOn, CompanyAddOn
from app.models.company import Company
from app.schemas.addon import (
    AddOnResponse, AddOnCreate, AddOnUpdate, CompanyAddOnCreate, CompanyAddOnResponse, CompanyAddOnsListResponse
)

router = APIRouter()


@router.get("/", response_model=List[AddOnResponse])
async def list_addons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available add-ons"""
    addons = db.query(AddOn).filter(
        AddOn.is_active == True,
        AddOn.is_visible == True
    ).order_by(AddOn.display_order).all()
    
    return addons


@router.get("/company", response_model=CompanyAddOnsListResponse)
async def get_company_addons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get add-ons for current company"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Get active add-ons for company
    active_company_addons = db.query(CompanyAddOn).filter(
        CompanyAddOn.company_id == company.id,
        CompanyAddOn.is_active == True
    ).all()
    
    # Get all available add-ons
    all_addons = db.query(AddOn).filter(
        AddOn.is_active == True,
        AddOn.is_visible == True
    ).order_by(AddOn.display_order).all()
    
    # Filter available (not yet subscribed)
    active_addon_ids = [ca.addon_id for ca in active_company_addons]
    available_addons = [a for a in all_addons if a.id not in active_addon_ids]
    
    # Calculate total monthly cost
    total_cost = sum(
        float(ca.addon.price_monthly) 
        for ca in active_company_addons 
        if ca.addon and not ca.is_trial
    )
    
    return CompanyAddOnsListResponse(
        active_addons=active_company_addons,
        available_addons=available_addons,
        total_monthly_cost=total_cost
    )


@router.post("/activate", response_model=CompanyAddOnResponse)
async def activate_addon(
    addon_data: CompanyAddOnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Activate an add-on for current company"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Find addon by slug
    addon = db.query(AddOn).filter(
        AddOn.slug == addon_data.addon_slug,
        AddOn.is_active == True
    ).first()
    
    if not addon:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    # Check if already active
    existing = db.query(CompanyAddOn).filter(
        CompanyAddOn.company_id == company.id,
        CompanyAddOn.addon_id == addon.id,
        CompanyAddOn.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Add-on already active")
    
    # Check if included in plan (free)
    company_plan_slug = company.subscription_plan.lower() if company.subscription_plan else "essencial"
    is_included = addon.is_included_in_plan(company_plan_slug)
    
    # Create company addon
    from datetime import datetime, timedelta
    
    company_addon = CompanyAddOn(
        company_id=company.id,
        addon_id=addon.id,
        is_active=True,
        activated_at=datetime.utcnow(),
        source="plan_included" if is_included else "manual",
        is_trial=addon_data.trial_days is not None and addon_data.trial_days > 0,
        trial_end_date=(
            datetime.utcnow() + timedelta(days=addon_data.trial_days)
            if addon_data.trial_days
            else None
        ),
        auto_renew=True
    )
    
    db.add(company_addon)
    db.commit()
    db.refresh(company_addon)
    
    return company_addon


@router.post("/deactivate/{addon_slug}")
async def deactivate_addon(
    addon_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate an add-on for current company"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Find addon
    addon = db.query(AddOn).filter(AddOn.slug == addon_slug).first()
    if not addon:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    # Find company addon
    company_addon = db.query(CompanyAddOn).filter(
        CompanyAddOn.company_id == company.id,
        CompanyAddOn.addon_id == addon.id,
        CompanyAddOn.is_active == True
    ).first()
    
    if not company_addon:
        raise HTTPException(status_code=404, detail="Add-on not active for this company")
    
    # Deactivate
    from datetime import datetime
    company_addon.is_active = False
    company_addon.deactivated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Add-on deactivated successfully", "addon_slug": addon_slug}


@router.get("/{addon_id}", response_model=AddOnResponse)
async def get_addon(
    addon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific add-on by ID"""
    addon = db.query(AddOn).filter(
        AddOn.id == addon_id,
        AddOn.is_active == True
    ).first()
    
    if not addon:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    return addon


@router.post("/", response_model=AddOnResponse, status_code=status.HTTP_201_CREATED)
async def create_addon(
    addon_data: AddOnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Create a new add-on (manager only)"""
    # Check if slug already exists
    existing = db.query(AddOn).filter(AddOn.slug == addon_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Add-on with this slug already exists")
    
    addon = AddOn(**addon_data.model_dump())
    db.add(addon)
    db.commit()
    db.refresh(addon)
    
    return addon


@router.put("/{addon_id}", response_model=AddOnResponse)
async def update_addon(
    addon_id: int,
    addon_data: AddOnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Update an add-on (manager only)"""
    addon = db.query(AddOn).filter(AddOn.id == addon_id).first()
    
    if not addon:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    # Update fields
    update_data = addon_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(addon, field, value)
    
    db.commit()
    db.refresh(addon)
    
    return addon


@router.delete("/{addon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_addon(
    addon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Delete an add-on (manager only)"""
    addon = db.query(AddOn).filter(AddOn.id == addon_id).first()
    
    if not addon:
        raise HTTPException(status_code=404, detail="Add-on not found")
    
    # Check if add-on is active for any company
    active_company_addons = db.query(CompanyAddOn).filter(
        CompanyAddOn.addon_id == addon_id,
        CompanyAddOn.is_active == True
    ).count()
    
    if active_company_addons > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete add-on that is active for companies. Deactivate it first."
        )
    
    # Soft delete by marking as inactive
    addon.is_active = False
    db.commit()
    
    return None
