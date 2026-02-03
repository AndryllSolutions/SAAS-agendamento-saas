"""
Professional Schedule Override endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.company import Company
from app.models.professional_schedule_override import ProfessionalScheduleOverride
from app.schemas.professional_schedule_override import (
    ScheduleOverrideCreate,
    ScheduleOverrideUpdate,
    ScheduleOverrideResponse
)

router = APIRouter()


@router.get("/professionals/{professional_id}/schedule-overrides", response_model=List[ScheduleOverrideResponse])
async def list_schedule_overrides(
    professional_id: int,
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List schedule overrides for a professional
    """
    # Verify professional belongs to user's company
    professional = db.query(User).filter(
        and_(User.id == professional_id, User.company_id == current_user.company_id)
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    # Build query
    query = db.query(ProfessionalScheduleOverride).filter(
        ProfessionalScheduleOverride.professional_id == professional_id
    )
    
    # Apply filters
    if start_date:
        query = query.filter(ProfessionalScheduleOverride.start_date >= start_date)
    if end_date:
        query = query.filter(ProfessionalScheduleOverride.end_date <= end_date)
    if is_active is not None:
        query = query.filter(ProfessionalScheduleOverride.is_active == is_active)
    
    # Order by start date
    overrides = query.order_by(ProfessionalScheduleOverride.start_date).all()
    
    return overrides


@router.post("/professionals/{professional_id}/schedule-overrides", response_model=ScheduleOverrideResponse)
async def create_schedule_override(
    professional_id: int,
    override_data: ScheduleOverrideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new schedule override for a professional
    """
    # Verify professional belongs to user's company
    professional = db.query(User).filter(
        and_(User.id == professional_id, User.company_id == current_user.company_id)
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    # Check for overlapping overrides
    existing_override = db.query(ProfessionalScheduleOverride).filter(
        and_(
            ProfessionalScheduleOverride.professional_id == professional_id,
            ProfessionalScheduleOverride.is_active == True,
            or_(
                # New override starts during existing override
                and_(
                    ProfessionalScheduleOverride.start_date <= override_data.start_date,
                    ProfessionalScheduleOverride.end_date >= override_data.start_date
                ),
                # New override ends during existing override
                and_(
                    ProfessionalScheduleOverride.start_date <= override_data.end_date,
                    ProfessionalScheduleOverride.end_date >= override_data.end_date
                ),
                # New override completely contains existing override
                and_(
                    ProfessionalScheduleOverride.start_date >= override_data.start_date,
                    ProfessionalScheduleOverride.end_date <= override_data.end_date
                )
            )
        )
    ).first()
    
    if existing_override:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Schedule override conflicts with existing active override"
        )
    
    # Create override
    db_override = ProfessionalScheduleOverride(
        professional_id=professional_id,
        company_id=current_user.company_id,
        created_by=current_user.id,
        **override_data.dict()
    )
    
    db.add(db_override)
    db.commit()
    db.refresh(db_override)
    
    return db_override


@router.get("/professionals/{professional_id}/schedule-overrides/{override_id}", response_model=ScheduleOverrideResponse)
async def get_schedule_override(
    professional_id: int,
    override_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific schedule override
    """
    override = db.query(ProfessionalScheduleOverride).filter(
        and_(
            ProfessionalScheduleOverride.id == override_id,
            ProfessionalScheduleOverride.professional_id == professional_id,
            ProfessionalScheduleOverride.company_id == current_user.company_id
        )
    ).first()
    
    if not override:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule override not found"
        )
    
    return override


@router.put("/professionals/{professional_id}/schedule-overrides/{override_id}", response_model=ScheduleOverrideResponse)
async def update_schedule_override(
    professional_id: int,
    override_id: int,
    override_data: ScheduleOverrideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a schedule override
    """
    override = db.query(ProfessionalScheduleOverride).filter(
        and_(
            ProfessionalScheduleOverride.id == override_id,
            ProfessionalScheduleOverride.professional_id == professional_id,
            ProfessionalScheduleOverride.company_id == current_user.company_id
        )
    ).first()
    
    if not override:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule override not found"
        )
    
    # Update fields
    update_data = override_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(override, field, value)
    
    db.commit()
    db.refresh(override)
    
    return override


@router.delete("/professionals/{professional_id}/schedule-overrides/{override_id}")
async def delete_schedule_override(
    professional_id: int,
    override_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a schedule override
    """
    override = db.query(ProfessionalScheduleOverride).filter(
        and_(
            ProfessionalScheduleOverride.id == override_id,
            ProfessionalScheduleOverride.professional_id == professional_id,
            ProfessionalScheduleOverride.company_id == current_user.company_id
        )
    ).first()
    
    if not override:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule override not found"
        )
    
    db.delete(override)
    db.commit()
    
    return {"message": "Schedule override deleted successfully"}


@router.get("/professionals/{professional_id}/schedule-overrides/calendar/{date}", response_model=List[ScheduleOverrideResponse])
async def get_schedule_overrides_for_date(
    professional_id: int,
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get schedule overrides for a specific date
    """
    # Verify professional belongs to user's company
    professional = db.query(User).filter(
        and_(User.id == professional_id, User.company_id == current_user.company_id)
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professional not found"
        )
    
    # Get overrides that include this date
    overrides = db.query(ProfessionalScheduleOverride).filter(
        and_(
            ProfessionalScheduleOverride.professional_id == professional_id,
            ProfessionalScheduleOverride.is_active == True,
            ProfessionalScheduleOverride.start_date <= date,
            ProfessionalScheduleOverride.end_date >= date
        )
    ).all()
    
    return overrides
