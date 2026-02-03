"""
Payments Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.payment import Payment, PaymentStatus, PackagePlan, PackageSubscription
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
from app.services.payment_service import PaymentService

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# Payments
@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a payment and process with gateway
    """
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    target_user_id = payment_data.user_id or current_user.id

    # Clients can only create payments for themselves
    if role_value == "CLIENT":
        target_user_id = current_user.id

    # Get user info for payment
    user = db.query(User).filter(
        User.id == target_user_id,
        User.company_id == current_user.company_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    payment_dict = payment_data.model_dump(exclude={'user_id'}, exclude_none=True)

    # Create payment record
    payment = Payment(
        **payment_dict,
        company_id=current_user.company_id,
        user_id=target_user_id,
        status=PaymentStatus.PENDING
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Process payment with gateway if gateway is specified
    if payment_data.gateway and payment_data.gateway.lower() in ["mercadopago", "stripe"]:
        try:
            gateway_result = PaymentService.create_payment(
                gateway=payment_data.gateway,
                amount=float(payment_data.amount),
                description=f"Pagamento #{payment.id}",
                payer_email=user.email if user else current_user.email,
                payer_name=user.full_name if user else current_user.full_name,
                payer_phone=getattr(user, 'phone', None) if user else None,
                external_reference=str(payment.id),
                metadata={
                    "payment_id": payment.id,
                    "company_id": current_user.company_id,
                    "user_id": target_user_id
                }
            )
            
            # Update payment with gateway response
            payment.gateway_transaction_id = gateway_result.get("transaction_id") or gateway_result.get("id")
            payment.gateway_response = gateway_result
            payment.payment_url = gateway_result.get("payment_url")
            
            # For Pix payments, store QR code
            if gateway_result.get("qr_code"):
                payment.gateway_response["qr_code"] = gateway_result.get("qr_code")
                payment.gateway_response["qr_code_base64"] = gateway_result.get("qr_code_base64")
            
            db.commit()
            db.refresh(payment)
        except Exception as e:
            # Log error but don't fail payment creation
            payment.gateway_response = {"error": str(e)}
            payment.status = PaymentStatus.FAILED
            db.commit()
    
    return PaymentResponse.model_validate(payment)


@router.get("", response_model=List[PaymentResponse])
@router.get("/", response_model=List[PaymentResponse], include_in_schema=False)
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

    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_value == "CLIENT":
        query = query.filter(Payment.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    
    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    return [PaymentResponse.model_validate(p) for p in payments]


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
    
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role_value == "CLIENT" and payment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este pagamento"
        )
    
    return PaymentResponse.model_validate(payment)


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
    plan = PackagePlan(
        **plan_data.dict(),
        company_id=current_user.company_id
    )
    
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return PlanResponse.model_validate(plan)


@router.get("/plans", response_model=List[PlanResponse])
async def list_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List plans
    """
    plans = db.query(PackagePlan).filter(
        PackagePlan.company_id == current_user.company_id,
        PackagePlan.is_active == True
    ).all()
    
    return [PlanResponse.model_validate(p) for p in plans]


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
    plan = db.query(PackagePlan).filter(
        PackagePlan.id == plan_id,
        PackagePlan.company_id == current_user.company_id
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
    
    return PlanResponse.model_validate(plan)


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
    plan = db.query(PackagePlan).filter(
        PackagePlan.id == subscription_data.plan_id,
        PackagePlan.company_id == current_user.company_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plano não encontrado"
        )
    
    from datetime import timedelta
    
    subscription = PackageSubscription(
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
    
    return SubscriptionResponse.model_validate(subscription)


@router.get("/subscriptions", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List subscriptions
    """
    query = db.query(PackageSubscription).filter(PackageSubscription.company_id == current_user.company_id)
    
    if current_user.role == "client":
        query = query.filter(PackageSubscription.user_id == current_user.id)
    
    subscriptions = query.all()
    return [SubscriptionResponse.model_validate(s) for s in subscriptions]


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update payment (Manager/Admin only)"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == current_user.company_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    # Only allow update if payment is pending
    if payment.status != PaymentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível atualizar pagamento que não está pendente"
        )
    
    update_data = payment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    db.commit()
    db.refresh(payment)
    
    return PaymentResponse.model_validate(payment)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cancel/Delete payment (Manager/Admin only)"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == current_user.company_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    # Only allow delete if payment is pending or failed
    if payment.status not in [PaymentStatus.PENDING, PaymentStatus.FAILED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar pagamento que não está pendente ou falhou"
        )
    
    payment.status = PaymentStatus.CANCELLED
    db.commit()
    
    return None


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: int,
    amount: Optional[float] = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Refund payment (Manager/Admin only)"""
    payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.company_id == current_user.company_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )
    
    if payment.status != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Apenas pagamentos completados podem ser reembolsados"
        )
    
    if not payment.gateway or not payment.gateway_transaction_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pagamento não possui gateway configurado"
        )
    
    # Process refund with payment gateway
    try:
        refund_result = PaymentService.refund_payment(
            gateway=payment.gateway,
            payment_id=payment.gateway_transaction_id,
            amount=amount
        )
        
        payment.status = PaymentStatus.REFUNDED
        payment.refunded_at = datetime.utcnow()
        payment.gateway_response = payment.gateway_response or {}
        payment.gateway_response["refund"] = refund_result
        
        db.commit()
        db.refresh(payment)
        
        return PaymentResponse.model_validate(payment)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar reembolso: {str(e)}"
        )


@router.post("/webhook/{gateway}", status_code=status.HTTP_200_OK)
async def payment_webhook_by_gateway(
    gateway: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Webhook endpoint for specific payment gateway"""
    import hmac
    import hashlib
    import json
    
    body = await request.body()
    body_json = await request.json()
    
    # Verify webhook signature based on gateway
    if gateway.lower() == "stripe" and settings.STRIPE_WEBHOOK_SECRET:
        sig_header = request.headers.get("stripe-signature")
        if sig_header:
            try:
                import stripe
                stripe.api_key = settings.STRIPE_SECRET_KEY
                event = stripe.Webhook.construct_event(
                    body, sig_header, settings.STRIPE_WEBHOOK_SECRET
                )
                body_json = event
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid webhook signature: {str(e)}"
                )
    
    # Get transaction ID from webhook data
    transaction_id = None
    if gateway.lower() == "mercadopago":
        transaction_id = body_json.get("data", {}).get("id") or body_json.get("id")
    elif gateway.lower() == "stripe":
        if body_json.get("type") == "payment_intent.succeeded":
            transaction_id = body_json.get("data", {}).get("object", {}).get("id")
        else:
            transaction_id = body_json.get("data", {}).get("object", {}).get("payment_intent")
    
    if not transaction_id:
        transaction_id = body_json.get("transaction_id") or body_json.get("id")
    
    if not transaction_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction ID não encontrado no webhook"
        )
    
    payment = db.query(Payment).filter(
        Payment.gateway_transaction_id == str(transaction_id),
        Payment.gateway == gateway.lower()
    ).first()
    
    if not payment:
        # Try to get payment status from gateway
        try:
            gateway_status = PaymentService.get_payment_status(gateway.lower(), str(transaction_id))
            # If payment not found in DB, just acknowledge webhook
            return {"status": "ok", "message": "Payment not found in database"}
        except:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )
    
    # Update payment status based on gateway response
    webhook_status = None
    if gateway.lower() == "mercadopago":
        webhook_status = body_json.get("action") or body_json.get("data", {}).get("status")
    elif gateway.lower() == "stripe":
        if body_json.get("type") == "payment_intent.succeeded":
            webhook_status = "succeeded"
        elif body_json.get("type") == "payment_intent.payment_failed":
            webhook_status = "failed"
    
    if not webhook_status:
        webhook_status = body_json.get("status") or body_json.get("state")
    
    if webhook_status in ["approved", "paid", "completed", "success", "succeeded"]:
        payment.status = PaymentStatus.COMPLETED
        payment.paid_at = datetime.utcnow()
    elif webhook_status in ["rejected", "failed", "error", "payment_failed"]:
        payment.status = PaymentStatus.FAILED
    elif webhook_status in ["refunded", "reversed"]:
        payment.status = PaymentStatus.REFUNDED
        payment.refunded_at = datetime.utcnow()
    
    # Update gateway response
    payment.gateway_response = payment.gateway_response or {}
    payment.gateway_response["webhook"] = body_json
    
    db.commit()
    
    return {"status": "ok", "payment_id": payment.id}
