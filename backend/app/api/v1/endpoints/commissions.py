"""
Commissions Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.commission import Commission, CommissionStatus
from app.models.commission_config import CommissionConfig
from app.schemas.commission import (
    CommissionResponse, CommissionPay
)
from app.schemas.commission_config import (
    CommissionConfigResponse, CommissionConfigCreate, CommissionConfigUpdate
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== ROTAS ESTÁTICAS PRIMEIRO (antes de /{commission_id}) ==========

@router.get("", response_model=List[CommissionResponse])
@router.get("/", response_model=List[CommissionResponse], include_in_schema=False)
async def list_commissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    professional_id: Optional[int] = None,
    status: Optional[CommissionStatus] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List commissions (Optimized with eager loading)"""
    from sqlalchemy.orm import joinedload
    
    # Optimized query with eager loading to avoid N+1 queries
    query = db.query(Commission).options(
        joinedload(Commission.professional),
        joinedload(Commission.command),
        joinedload(Commission.command_item)
    ).filter(Commission.company_id == current_user.company_id)
    
    if professional_id:
        query = query.filter(Commission.professional_id == professional_id)
    
    if status:
        query = query.filter(Commission.status == status)
    
    if start_date:
        query = query.filter(Commission.created_at >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.filter(Commission.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    # Use index for ordering
    commissions = query.order_by(Commission.created_at.desc()).offset(skip).limit(limit).all()
    return commissions


@router.get("/summary", response_model=dict)
async def get_commissions_summary(
    professional_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get commissions summary by professional (Cached for 5 minutes)"""
    from sqlalchemy import func
    from app.core.cache import get_cache, set_cache
    
    # Cache key
    cache_key = f"commissions:summary:{current_user.company_id}:{professional_id}:{start_date}:{end_date}"
    
    # Try cache first
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    # Optimized query using indexes
    query = db.query(
        Commission.professional_id,
        func.sum(Commission.commission_value).label("total"),
        func.count(Commission.id).label("count")
    ).filter(Commission.company_id == current_user.company_id)
    
    if professional_id:
        query = query.filter(Commission.professional_id == professional_id)
    
    if start_date:
        query = query.filter(Commission.created_at >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.filter(Commission.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    if professional_id:
        result = query.first()
        if result:
            response = {
                "professional_id": result.professional_id,
                "total_commissions": float(result.total or 0),
                "total_items": result.count
            }
        else:
            response = {"professional_id": professional_id, "total_commissions": 0, "total_items": 0}
    else:
        results = query.group_by(Commission.professional_id).all()
        response = {
            "summary": [
                {
                    "professional_id": r.professional_id,
                    "total_commissions": float(r.total or 0),
                    "total_items": r.count
                }
                for r in results
            ]
        }
    
    # Cache result for 5 minutes
    await set_cache(cache_key, response, ttl=300)
    
    return response


# ========== COMMISSION CONFIGURATION (ANTES de /{commission_id}) ==========

@router.get("/config", response_model=CommissionConfigResponse)
async def get_commission_config(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get commission configuration for company"""
    config = db.query(CommissionConfig).filter(
        CommissionConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        # Create default config
        config = CommissionConfig(
            company_id=current_user.company_id,
            date_filter_type="competence",
            command_type_filter="finished",
            fees_responsibility="proportional",
            discounts_responsibility="proportional",
            deduct_additional_service_cost=False,
            product_discount_origin="professional_commission"
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return CommissionConfigResponse.model_validate(config)


@router.put("/config", response_model=CommissionConfigResponse)
async def update_commission_config(
    config_data: CommissionConfigUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update commission configuration"""
    config = db.query(CommissionConfig).filter(
        CommissionConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        # Create if doesn't exist
        config = CommissionConfig(
            company_id=current_user.company_id,
            **config_data.dict()
        )
        db.add(config)
    else:
        # Update existing
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return CommissionConfigResponse.model_validate(config)


# ========== ROTAS DINÂMICAS (/{commission_id}) POR ÚLTIMO ==========

@router.get("/{commission_id}", response_model=CommissionResponse)
async def get_commission(
    commission_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get commission by ID"""
    commission = db.query(Commission).filter(
        Commission.id == commission_id,
        Commission.company_id == current_user.company_id
    ).first()
    
    if not commission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return commission


@router.post("/{commission_id}/pay", response_model=CommissionResponse)
async def pay_commission(
    commission_id: int,
    pay_data: CommissionPay,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Mark commission as paid and create financial transaction"""
    from app.models.financial import FinancialTransaction
    
    commission = db.query(Commission).filter(
        Commission.id == commission_id,
        Commission.company_id == current_user.company_id
    ).first()
    
    if not commission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if commission.status == CommissionStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comissão já está paga"
        )
    
    # Get professional name for description
    professional = commission.professional
    command_number = commission.command.number if commission.command else commission.command_id
    
    # ✅ CRIAR TRANSAÇÃO FINANCEIRA
    # Nota: commission_id foi removido de FinancialTransaction
    # O relacionamento é: Commission.financial_transaction_id → FinancialTransaction
    financial_transaction = FinancialTransaction(
        company_id=current_user.company_id,
        type="expense",
        origin="commission",
        professional_id=commission.professional_id,
        value=commission.commission_value,
        net_value=commission.commission_value,
        date=datetime.now(),
        description=f"Comissão - {professional.full_name} - Comanda {command_number}",
        status="liquidated",
        is_paid=True
    )
    db.add(financial_transaction)
    db.flush()  # Get the transaction ID
    
    # Update commission - vincula à transação financeira criada
    commission.status = CommissionStatus.PAID
    commission.paid_at = datetime.now()
    commission.payment_notes = pay_data.notes
    commission.financial_transaction_id = financial_transaction.id
    
    db.commit()
    db.refresh(commission)
    return commission


@router.delete("/{commission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_commission(
    commission_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete a commission (manager only)"""
    commission = db.query(Commission).filter(
        Commission.id == commission_id,
        Commission.company_id == current_user.company_id
    ).first()
    
    if not commission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Check if commission is already paid
    if commission.status == CommissionStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete paid commission"
        )
    
    # Check if there's a related financial transaction
    if commission.financial_transaction_id:
        # Delete the financial transaction first
        from app.models.financial import FinancialTransaction
        financial_transaction = db.query(FinancialTransaction).filter(
            FinancialTransaction.id == commission.financial_transaction_id
        ).first()
        
        if financial_transaction:
            db.delete(financial_transaction)
    
    # Delete the commission
    db.delete(commission)
    db.commit()
    
    return None
