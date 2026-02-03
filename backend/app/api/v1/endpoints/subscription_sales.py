"""
Subscription Sales Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.feature_flags import get_feature_checker
from app.models.user import User
from app.models.subscription_sale import (
    SubscriptionSaleModel, SubscriptionSale, SubscriptionSaleStatus
)
from app.models.client import Client
from app.schemas.subscription_sale import (
    SubscriptionSaleModelCreate, SubscriptionSaleModelUpdate, SubscriptionSaleModelResponse,
    SubscriptionSaleCreate, SubscriptionSaleUpdate, SubscriptionSaleResponse,
    SubscriptionSaleRenew
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== SUBSCRIPTION SALE MODELS ==========

@router.post("/models", response_model=SubscriptionSaleModelResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription_sale_model(
    model_data: SubscriptionSaleModelCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("subscription_sales"))
):
    """Create a new subscription sale model"""
    if model_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    model = SubscriptionSaleModel(**model_data.dict())
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.get("/models", response_model=List[SubscriptionSaleModelResponse])
async def list_subscription_sale_models(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List subscription sale models"""
    query = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.company_id == current_user.company_id
    )
    
    if is_active is not None:
        query = query.filter(SubscriptionSaleModel.is_active == is_active)
    
    models = query.all()
    return [SubscriptionSaleModelResponse.model_validate(m) for m in models]


@router.get("/models/{model_id}", response_model=SubscriptionSaleModelResponse)
async def get_subscription_sale_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get subscription sale model by ID"""
    model = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.id == model_id,
        SubscriptionSaleModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return SubscriptionSaleModelResponse.model_validate(model)


@router.put("/models/{model_id}", response_model=SubscriptionSaleModelResponse)
async def update_subscription_sale_model(
    model_id: int,
    model_data: SubscriptionSaleModelUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update subscription sale model"""
    model = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.id == model_id,
        SubscriptionSaleModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = model_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)
    
    db.commit()
    db.refresh(model)
    return model


@router.delete("/models/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription_sale_model(
    model_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete subscription sale model"""
    model = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.id == model_id,
        SubscriptionSaleModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(model)
    db.commit()
    return None


# ========== SUBSCRIPTION SALES ==========

@router.post("/", response_model=SubscriptionSaleResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription_sale(
    sale_data: SubscriptionSaleCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new subscription sale"""
    if sale_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Verify client exists
    client = db.query(Client).filter(
        Client.id == sale_data.client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Get model
    model = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.id == sale_data.model_id,
        SubscriptionSaleModel.company_id == current_user.company_id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modelo de assinatura não encontrado"
        )
    
    # Initialize current month usage
    current_month_services_used = {}
    if model.services_included:
        for service_id in model.services_included:
            current_month_services_used[str(service_id)] = 0
    
    subscription = SubscriptionSale(
        company_id=current_user.company_id,
        client_id=sale_data.client_id,
        model_id=sale_data.model_id,
        start_date=sale_data.start_date,
        end_date=sale_data.end_date,
        status=SubscriptionSaleStatus.ACTIVE,
        current_month_credits_used=0,
        current_month_services_used=current_month_services_used,
        next_payment_date=sale_data.start_date + timedelta(days=30)
    )
    db.add(subscription)
    
    # Create financial transaction
    from app.models.financial import FinancialTransaction, TransactionType, TransactionOrigin, TransactionStatus
    transaction = FinancialTransaction(
        company_id=current_user.company_id,
        type=TransactionType.INCOME,
        origin=TransactionOrigin.SUBSCRIPTION,
        value=model.monthly_value,
        date=sale_data.start_date,
        description=f"Assinatura {model.name}",
        status=TransactionStatus.LIQUIDATED
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(subscription)
    return SubscriptionSaleResponse.model_validate(subscription)


@router.get("", response_model=List[SubscriptionSaleResponse])
@router.get("/", response_model=List[SubscriptionSaleResponse], include_in_schema=False)
async def list_subscription_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    client_id: Optional[int] = None,
    status: Optional[SubscriptionSaleStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List subscription sales"""
    query = db.query(SubscriptionSale).filter(
        SubscriptionSale.company_id == current_user.company_id
    )
    
    if client_id:
        query = query.filter(SubscriptionSale.client_id == client_id)
    
    if status:
        query = query.filter(SubscriptionSale.status == status)
    
    subscriptions = query.order_by(SubscriptionSale.start_date.desc()).offset(skip).limit(limit).all()
    return [SubscriptionSaleResponse.model_validate(s) for s in subscriptions]


@router.get("/{subscription_id}", response_model=SubscriptionSaleResponse)
async def get_subscription_sale(
    subscription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get subscription sale by ID"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return SubscriptionSaleResponse.model_validate(subscription)


@router.post("/{subscription_id}/renew", response_model=SubscriptionSaleResponse)
async def renew_subscription_sale(
    subscription_id: int,
    renew_data: SubscriptionSaleRenew,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Renew subscription sale and create financial transaction"""
    from app.models.financial import FinancialTransaction
    
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if subscription.status != SubscriptionSaleStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assinatura não está ativa"
        )
    
    # Get model
    model = db.query(SubscriptionSaleModel).filter(
        SubscriptionSaleModel.id == subscription.model_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get client info for description
    client = db.query(Client).filter(
        Client.id == subscription.client_crm_id
    ).first()
    
    # ✅ CRIAR TRANSAÇÃO FINANCEIRA
    financial_transaction = FinancialTransaction(
        company_id=subscription.company_id,
        type="income",
        origin="subscription",
        subscription_sale_id=subscription.id,
        client_id=subscription.client_crm_id,
        value=model.monthly_value,
        net_value=model.monthly_value,
        date=datetime.now(),
        description=f"Assinatura {model.name} - {client.full_name if client else 'Cliente'}",
        status="liquidated",
        is_paid=True
    )
    db.add(financial_transaction)
    db.flush()  # Get transaction ID
    
    # Update payment date
    subscription.last_payment_date = datetime.now()
    subscription.next_payment_date = datetime.now() + timedelta(days=30)
    
    # Reset monthly usage
    subscription.current_month_credits_used = 0
    if model.services_included:
        subscription.current_month_services_used = {
            str(service_id): 0 for service_id in model.services_included
        }
    
    # Create financial transaction if payment received
    if renew_data.payment_received:
        from app.models.financial import FinancialTransaction, TransactionType, TransactionOrigin, TransactionStatus
        transaction = FinancialTransaction(
            company_id=current_user.company_id,
            type=TransactionType.INCOME,
            origin=TransactionOrigin.SUBSCRIPTION,
            value=model.monthly_value,
            date=datetime.now(),
            description=f"Renovação assinatura {model.name}",
            status=TransactionStatus.LIQUIDATED
        )
        db.add(transaction)
    
    db.commit()
    db.refresh(subscription)
    return SubscriptionSaleResponse.model_validate(subscription)


@router.put("/{subscription_id}", response_model=SubscriptionSaleResponse)
async def update_subscription_sale(
    subscription_id: int,
    sale_data: SubscriptionSaleUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update subscription sale"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = sale_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subscription, field, value)
    
    db.commit()
    db.refresh(subscription)
    return SubscriptionSaleResponse.model_validate(subscription)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription_sale(
    subscription_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cancel subscription sale"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    subscription.status = SubscriptionSaleStatus.CANCELLED
    db.commit()
    return None


@router.post("/{subscription_id}/pause", response_model=SubscriptionSaleResponse)
async def pause_subscription_sale(
    subscription_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Pause subscription sale"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if subscription.status != SubscriptionSaleStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas assinaturas ativas podem ser pausadas"
        )
    
    subscription.status = SubscriptionSaleStatus.PAUSED
    subscription.paused_at = datetime.utcnow()
    
    db.commit()
    db.refresh(subscription)
    return SubscriptionSaleResponse.model_validate(subscription)


@router.post("/{subscription_id}/resume", response_model=SubscriptionSaleResponse)
async def resume_subscription_sale(
    subscription_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Resume subscription sale"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if subscription.status != SubscriptionSaleStatus.PAUSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas assinaturas pausadas podem ser retomadas"
        )
    
    subscription.status = SubscriptionSaleStatus.ACTIVE
    subscription.paused_at = None
    
    # Adjust dates if needed
    if subscription.end_date < datetime.now():
        days_paused = (datetime.now() - subscription.paused_at).days if subscription.paused_at else 0
        subscription.end_date = datetime.now() + timedelta(days=30 - days_paused)
    
    db.commit()
    db.refresh(subscription)
    return SubscriptionSaleResponse.model_validate(subscription)


@router.get("/{subscription_id}/payments", response_model=List[dict])
async def get_subscription_payments(
    subscription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get subscription payment history"""
    subscription = db.query(SubscriptionSale).filter(
        SubscriptionSale.id == subscription_id,
        SubscriptionSale.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get financial transactions related to this subscription
    from app.models.financial import FinancialTransaction, TransactionOrigin
    
    transactions = db.query(FinancialTransaction).filter(
        FinancialTransaction.company_id == current_user.company_id,
        FinancialTransaction.origin == TransactionOrigin.SUBSCRIPTION,
        FinancialTransaction.description.like(f"%{subscription.model.name if subscription.model else 'Assinatura'}%")
    ).order_by(FinancialTransaction.date.desc()).all()
    
    return [
        {
            "id": txn.id,
            "date": txn.date.isoformat(),
            "value": float(txn.value),
            "status": txn.status.value,
            "description": txn.description
        }
        for txn in transactions
    ]

