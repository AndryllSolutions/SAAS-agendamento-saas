"""
Payments Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.payment import Payment, PaymentStatus, Plan, Subscription
from app.models.user import User
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    PaymentWebhook,
    PlanCreate,
    PlanUpdate,
    PlanResponse,
    SubscriptionCreate,
    SubscriptionResponse,
)

router = APIRouter()


# Payments
@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a payment
    """
    payment = Payment(
        **payment_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # TODO: Process payment with gateway
    
    return payment


@router.get("/", response_model=List[PaymentResponse])
async def list_payments(
    status_filter: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List payments
    """
    query = db.query(Payment).filter(Payment.company_id == current_user.company_id)
    
    if current_user.role == "client":
        query = query.filter(Payment.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    
    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    return payments


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get payment by ID
    """
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == current_user.company_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    if current_user.role == "client" and payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este pagamento"
        )
    
    return payment


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def payment_webhook(
    request: Request,
    webhook_data: PaymentWebhook,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for payment gateways
    """
    # TODO: Verify webhook signature
    
    # Find payment by gateway transaction ID
    payment = db.query(Payment).filter(
        Payment.gateway_transaction_id == webhook_data.transaction_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    # Update payment status based on webhook data
    if webhook_data.status == "approved":
        payment.status = PaymentStatus.COMPLETED
        payment.paid_at = datetime.utcnow()
    elif webhook_data.status == "rejected":
        payment.status = PaymentStatus.FAILED
    
    payment.gateway_response = webhook_data.data
    
    db.commit()
    
    return {"status": "ok"}


# Plans
@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_data: PlanCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Create a plan (Manager/Admin only)
    """
    plan = Plan(
        **plan_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return plan


@router.get("/plans", response_model=List[PlanResponse])
async def list_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List plans
    """
    plans = db.query(Plan).filter(
        Plan.company_id == current_user.company_id,
        Plan.is_active == True
    ).all()
    
    return plans


@router.put("/plans/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: int,
    plan_data: PlanUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Update plan (Manager/Admin only)
    """
    plan = db.query(Plan).filter(
        Plan.id == plan_id,
        Plan.company_id == current_user.company_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    update_data = plan_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan


# Subscriptions
@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a subscription
    """
    plan = db.query(Plan).filter(
        Plan.id == subscription_data.plan_id,
        Plan.company_id == current_user.company_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    from datetime import timedelta
    
    subscription = Subscription(
        company_id=current_user.company_id,
        user_id=subscription_data.user_id,
        plan_id=subscription_data.plan_id,
        payment_id=subscription_data.payment_id,
        sessions_remaining=plan.sessions_included,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=plan.validity_days)
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return subscription


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List subscriptions
    """
    query = db.query(Subscription).filter(Subscription.company_id == current_user.company_id)
    
    if current_user.role == "client":
        query = query.filter(Subscription.user_id == current_user.id)
    
    subscriptions = query.all()
    return subscriptions
