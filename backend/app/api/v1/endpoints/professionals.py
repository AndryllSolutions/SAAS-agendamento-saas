"""
Professional endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("", response_model=List[UserResponse])
def list_professionals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all professionals
    """
    query = db.query(User).filter(User.role == UserRole.PROFESSIONAL)
    
    if search:
        query = query.filter(User.full_name.ilike(f"%{search}%"))
    
    professionals = query.offset(skip).limit(limit).all()
    return professionals


@router.get("/{professional_id}", response_model=UserResponse)
def get_professional(
    professional_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get professional by ID
    """
    professional = db.query(User).filter(
        User.id == professional_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Professional not found")
    
    return professional
