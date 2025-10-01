"""
Payment-related Celery tasks
"""
from datetime import datetime
from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.payment import Subscription
from app.models.user import User
from app.services.notification_service import NotificationService


@celery_app.task(name="app.tasks.payment_tasks.check_expired_subscriptions")
def check_expired_subscriptions():
    """
    Check for expired subscriptions and notify users
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Find expired subscriptions
        expired_subscriptions = db.query(Subscription).filter(
            Subscription.end_date < now,
            Subscription.is_active == True
        ).all()
        
        for subscription in expired_subscriptions:
            # Deactivate subscription
            subscription.is_active = False
            
            # Notify user
            user = db.query(User).filter(User.id == subscription.user_id).first()
            
            if user:
                message = """
                Sua assinatura expirou.
                
                Para continuar aproveitando nossos serviços, renove sua assinatura.
                """
                
                NotificationService.send_email(
                    user.email,
                    "Assinatura Expirada",
                    message
                )
            
            db.commit()
        
        return {"status": "success", "expired": len(expired_subscriptions)}
    
    except Exception as e:
        print(f"Error checking subscriptions: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.payment_tasks.process_pending_payments")
def process_pending_payments():
    """
    Process pending payments and update status
    """
    db = SessionLocal()
    
    try:
        from app.models.payment import Payment, PaymentStatus
        
        # Find pending payments older than 1 hour
        from datetime import timedelta
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        
        pending_payments = db.query(Payment).filter(
            Payment.status == PaymentStatus.PENDING,
            Payment.created_at < cutoff_time
        ).all()
        
        for payment in pending_payments:
            # TODO: Check payment status with gateway
            # For now, just mark as failed after timeout
            payment.status = PaymentStatus.FAILED
            db.commit()
        
        return {"status": "success", "processed": len(pending_payments)}
    
    except Exception as e:
        print(f"Error processing payments: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()
