"""
Professional Voucher endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.company import Company
from app.models.professional_voucher import ProfessionalVoucher, VoucherCategory, VoucherPaymentMethod
from app.schemas.professional_voucher import (
    VoucherCreate,
    VoucherUpdate,
    VoucherResponse,
    VoucherListResponse,
    VoucherPayment
)

router = APIRouter()


@router.get("/professionals/{professional_id}/vouchers", response_model=VoucherListResponse)
async def list_vouchers(
    professional_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: Optional[VoucherCategory] = Query(None),
    is_paid: Optional[bool] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List vouchers for a professional with pagination and filters
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
    
    # Build base query
    query = db.query(ProfessionalVoucher).filter(
        ProfessionalVoucher.professional_id == professional_id
    )
    
    # Apply filters
    if category:
        query = query.filter(ProfessionalVoucher.category == category)
    if is_paid is not None:
        query = query.filter(ProfessionalVoucher.is_paid == is_paid)
    if start_date:
        query = query.filter(ProfessionalVoucher.due_date >= start_date)
    if end_date:
        query = query.filter(ProfessionalVoucher.due_date <= end_date)
    
    # Count total
    total = query.count()
    
    # Apply pagination and ordering
    vouchers = query.order_by(desc(ProfessionalVoucher.created_at)).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return VoucherListResponse(
        vouchers=vouchers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/professionals/{professional_id}/vouchers", response_model=VoucherResponse)
async def create_voucher(
    professional_id: int,
    voucher_data: VoucherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new voucher for a professional
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
    
    # Create voucher
    db_voucher = ProfessionalVoucher(
        professional_id=professional_id,
        company_id=current_user.company_id,
        created_by=current_user.id,
        **voucher_data.dict()
    )
    
    db.add(db_voucher)
    db.commit()
    db.refresh(db_voucher)
    
    # Generate financial movement if requested
    if voucher_data.generate_financial_movement:
        # TODO: Implement financial movement generation
        pass
    
    return db_voucher


@router.get("/professionals/{professional_id}/vouchers/{voucher_id}", response_model=VoucherResponse)
async def get_voucher(
    professional_id: int,
    voucher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific voucher
    """
    voucher = db.query(ProfessionalVoucher).filter(
        and_(
            ProfessionalVoucher.id == voucher_id,
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.company_id == current_user.company_id
        )
    ).first()
    
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    return voucher


@router.put("/professionals/{professional_id}/vouchers/{voucher_id}", response_model=VoucherResponse)
async def update_voucher(
    professional_id: int,
    voucher_id: int,
    voucher_data: VoucherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a voucher
    """
    voucher = db.query(ProfessionalVoucher).filter(
        and_(
            ProfessionalVoucher.id == voucher_id,
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.company_id == current_user.company_id
        )
    ).first()
    
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    # Update fields
    update_data = voucher_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(voucher, field, value)
    
    db.commit()
    db.refresh(voucher)
    
    return voucher


@router.delete("/professionals/{professional_id}/vouchers/{voucher_id}")
async def delete_voucher(
    professional_id: int,
    voucher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a voucher
    """
    voucher = db.query(ProfessionalVoucher).filter(
        and_(
            ProfessionalVoucher.id == voucher_id,
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.company_id == current_user.company_id
        )
    ).first()
    
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    db.delete(voucher)
    db.commit()
    
    return {"message": "Voucher deleted successfully"}


@router.post("/professionals/{professional_id}/vouchers/{voucher_id}/pay", response_model=VoucherResponse)
async def pay_voucher(
    professional_id: int,
    voucher_id: int,
    payment_data: VoucherPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a voucher as paid
    """
    voucher = db.query(ProfessionalVoucher).filter(
        and_(
            ProfessionalVoucher.id == voucher_id,
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.company_id == current_user.company_id
        )
    ).first()
    
    if not voucher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voucher not found"
        )
    
    if voucher.is_paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voucher is already paid"
        )
    
    # Mark as paid
    voucher.is_paid = True
    voucher.paid_date = payment_data.paid_date
    
    if payment_data.payment_method:
        voucher.payment_method = payment_data.payment_method
    
    if payment_data.observation:
        voucher.observation = f"{voucher.observation or ''}\n\nPagamento: {payment_data.observation}".strip()
    
    db.commit()
    db.refresh(voucher)
    
    return voucher


@router.get("/professionals/{professional_id}/vouchers/summary")
async def get_vouchers_summary(
    professional_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get summary of vouchers (total, paid, pending)
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
    
    # Calculate summaries
    total_query = db.query(func.sum(ProfessionalVoucher.amount)).filter(
        ProfessionalVoucher.professional_id == professional_id
    )
    
    paid_query = db.query(func.sum(ProfessionalVoucher.amount)).filter(
        and_(
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.is_paid == True
        )
    )
    
    pending_query = db.query(func.sum(ProfessionalVoucher.amount)).filter(
        and_(
            ProfessionalVoucher.professional_id == professional_id,
            ProfessionalVoucher.is_paid == False
        )
    )
    
    total_amount = total_query.scalar() or 0
    paid_amount = paid_query.scalar() or 0
    pending_amount = pending_query.scalar() or 0
    
    return {
        "total_amount": float(total_amount),
        "paid_amount": float(paid_amount),
        "pending_amount": float(pending_amount),
        "total_count": db.query(ProfessionalVoucher).filter(
            ProfessionalVoucher.professional_id == professional_id
        ).count(),
        "paid_count": db.query(ProfessionalVoucher).filter(
            and_(
                ProfessionalVoucher.professional_id == professional_id,
                ProfessionalVoucher.is_paid == True
            )
        ).count(),
        "pending_count": db.query(ProfessionalVoucher).filter(
            and_(
                ProfessionalVoucher.professional_id == professional_id,
                ProfessionalVoucher.is_paid == False
            )
        ).count(),
    }
