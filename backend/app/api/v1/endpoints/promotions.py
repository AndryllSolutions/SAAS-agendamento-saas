"""
Promotions Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.feature_flags import get_feature_checker
from app.models.user import User
from app.models.promotion import Promotion, PromotionType
from app.models.command import Command
from app.schemas.promotion import (
    PromotionCreate, PromotionUpdate, PromotionResponse, PromotionApply
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.post("", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PromotionResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_promotion(
    promotion_data: PromotionCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("promotions"))
):
    """Create a new promotion"""
    if promotion_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    promotion = Promotion(**promotion_data.dict())
    promotion.current_uses = 0
    db.add(promotion)
    db.commit()
    db.refresh(promotion)
    return promotion


@router.get("", response_model=List[PromotionResponse])
@router.get("/", response_model=List[PromotionResponse], include_in_schema=False)
async def list_promotions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List promotions"""
    query = db.query(Promotion).filter(Promotion.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.filter(Promotion.is_active == is_active)
    
    promotions = query.order_by(Promotion.valid_from.desc()).offset(skip).limit(limit).all()
    return promotions


@router.get("/{promotion_id}", response_model=PromotionResponse)
async def get_promotion(
    promotion_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get promotion by ID"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return promotion


@router.put("/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: int,
    promotion_data: PromotionUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update promotion"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = promotion_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(promotion, field, value)
    
    db.commit()
    db.refresh(promotion)
    return promotion


@router.delete("/{promotion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promotion(
    promotion_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete promotion"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(promotion)
    db.commit()
    return None


@router.post("/{promotion_id}/apply", response_model=dict)
async def apply_promotion(
    promotion_id: int,
    apply_data: PromotionApply,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Apply promotion to a command"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if not promotion.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promoção não está ativa"
        )
    
    # Check validity
    now = datetime.now()
    if now < promotion.valid_from or now > promotion.valid_until:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promoção fora do período de validade"
        )
    
    # Check max uses
    if promotion.max_uses and promotion.current_uses >= promotion.max_uses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Promoção atingiu o limite de usos"
        )
    
    # Get command
    command = db.query(Command).filter(
        Command.id == apply_data.command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Calculate discount
    discount_value = 0
    if promotion.type == PromotionType.DISCOUNT_PERCENTAGE and promotion.discount_value:
        discount_value = (command.total_value * promotion.discount_value) / 100
    elif promotion.type == PromotionType.DISCOUNT_FIXED and promotion.discount_value:
        discount_value = promotion.discount_value
    
    # Apply discount
    command.discount_value = discount_value
    command.net_value = command.total_value - discount_value
    
    # Update promotion uses
    promotion.current_uses += 1
    
    db.commit()
    
    return {
        "message": "Promoção aplicada com sucesso",
        "discount_value": float(discount_value),
        "new_total": float(command.net_value)
    }


@router.post("/{promotion_id}/activate", response_model=PromotionResponse)
async def activate_promotion(
    promotion_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Activate promotion"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    promotion.is_active = True
    
    db.commit()
    db.refresh(promotion)
    return promotion


@router.post("/{promotion_id}/deactivate", response_model=PromotionResponse)
async def deactivate_promotion(
    promotion_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Deactivate promotion"""
    promotion = db.query(Promotion).filter(
        Promotion.id == promotion_id,
        Promotion.company_id == current_user.company_id
    ).first()
    
    if not promotion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    promotion.is_active = False
    
    db.commit()
    db.refresh(promotion)
    return promotion

