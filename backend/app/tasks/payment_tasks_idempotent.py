"""
Tarefas financeiras com idempotência garantida
Crítico para SaaS: nunca cobrar duas vezes
"""
from celery import current_task
from celery.exceptions import Retry
from datetime import datetime
from typing import Optional
import hashlib

from app.tasks.celery_app import celery_app
from app.core.database import get_db
from app.models.subscription import Subscription
from app.models.payment import Payment, PaymentStatus
from app.core.config import settings


def generate_task_id(subscription_id: int, competency: str) -> str:
    """Gera ID idempotente baseado em assinatura + competência"""
    payload = f"{subscription_id}:{competency}"
    return hashlib.md5(payload.encode()).hexdigest()


@celery_app.task(
    bind=True,
    name="payment_tasks.process_subscription_renewal",
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
)
def process_subscription_renewal(
    self, 
    subscription_id: int, 
    competency: str,
    amount: float,
    payment_method_id: str
):
    """
    Processa renovação de assinatura de forma idempotente
    
    Se rodar duas vezes com mesma subscription_id + competency:
    - Segunda execução detecta pagamento existente
    - Retorna sucesso sem cobrar novamente
    """
    task_id = generate_task_id(subscription_id, competency)
    
    # Verificar se já processado (idempotência)
    if _is_already_processed(subscription_id, competency):
        return {
            "status": "already_processed",
            "task_id": task_id,
            "message": "Renewal already processed for this competency"
        }
    
    db = next(get_db())
    
    try:
        # 1. Validar assinatura (regra de negócio na API, não no Celery)
        subscription = db.query(Subscription).filter(
            Subscription.id == subscription_id,
            Subscription.is_active == True
        ).first()
        
        if not subscription:
            raise ValueError(f"Subscription {subscription_id} not found or inactive")
        
        # 2. Verificar lock para evitar processamento duplicado
        lock_key = f"renewal_lock:{subscription_id}:{competency}"
        if not _acquire_lock(lock_key, ttl=300):  # 5 minutos
            raise Retry(f"Renewal already in progress for subscription {subscription_id}")
        
        try:
            # 3. Criar registro de pagamento (status PENDING)
            payment = Payment(
                subscription_id=subscription_id,
                amount=amount,
                competency=competency,
                status=PaymentStatus.PENDING,
                payment_method_id=payment_method_id,
                task_id=task_id,
                created_at=datetime.utcnow()
            )
            db.add(payment)
            db.commit()
            
            # 4. Processar pagamento (integrar com gateway)
            payment_result = _process_payment_gateway(
                amount=amount,
                payment_method_id=payment_method_id,
                customer_id=subscription.customer_id,
                description=f"Subscription renewal {competency}"
            )
            
            # 5. Atualizar status baseado no resultado
            if payment_result["success"]:
                payment.status = PaymentStatus.COMPLETED
                payment.gateway_transaction_id = payment_result["transaction_id"]
                payment.paid_at = datetime.utcnow()
                
                # Estender assinatura
                subscription.extend_period(competency)
                
            else:
                payment.status = PaymentStatus.FAILED
                payment.failure_reason = payment_result["error"]
                
                # Não retry erros permanentes
                if _is_permanent_error(payment_result["error"]):
                    raise ValueError(f"Permanent payment error: {payment_result['error']}")
                
                # Retry erros temporários
                raise self.retry(
                    exc=Exception(f"Temporary payment error: {payment_result['error']}"),
                    countdown=60 * (2 ** self.request.retries)  # Exponential backoff
                )
            
            db.commit()
            
            # 6. Liberar lock
            _release_lock(lock_key)
            
            return {
                "status": "success",
                "task_id": task_id,
                "payment_id": payment.id,
                "subscription_id": subscription_id,
                "competency": competency,
                "amount": amount
            }
            
        except Exception as e:
            # Garantir que lock seja liberado em caso de erro
            _release_lock(lock_key)
            raise e
            
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def _is_already_processed(subscription_id: int, competency: str) -> bool:
    """Verifica se renovação já foi processada (idempotência)"""
    db = next(get_db())
    try:
        existing_payment = db.query(Payment).filter(
            Payment.subscription_id == subscription_id,
            Payment.competency == competency,
            Payment.status.in_([PaymentStatus.COMPLETED, PaymentStatus.PENDING])
        ).first()
        return existing_payment is not None
    finally:
        db.close()


def _acquire_lock(lock_key: str, ttl: int = 300) -> bool:
    """Adquire lock distribuído no Redis"""
    import redis
    
    r = redis.from_url(settings.get_celery_result_backend)
    return r.set(lock_key, "locked", ex=ttl, nx=True)


def _release_lock(lock_key: str) -> None:
    """Libera lock distribuído"""
    import redis
    
    r = redis.from_url(settings.get_celery_result_backend)
    r.delete(lock_key)


def _process_payment_gateway(
    amount: float, 
    payment_method_id: str, 
    customer_id: str, 
    description: str
) -> dict:
    """
    Integração com gateway de pagamento
    Em produção, usar Stripe, Mercado Pago, etc.
    """
    # Mock para exemplo
    import random
    
    if random.random() > 0.1:  # 90% sucesso
        return {
            "success": True,
            "transaction_id": f"txn_{datetime.utcnow().timestamp()}",
            "amount": amount
        }
    else:
        errors = [
            "insufficient_funds",
            "card_declined", 
            "temporary_gateway_error"
        ]
        return {
            "success": False,
            "error": random.choice(errors)
        }


def _is_permanent_error(error: str) -> bool:
    """Verifica se erro é permanente (não deve retry)"""
    permanent_errors = [
        "insufficient_funds",
        "card_declined",
        "invalid_payment_method",
        "subscription_cancelled"
    ]
    return error in permanent_errors
