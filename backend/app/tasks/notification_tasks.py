"""
Notification-related Celery tasks
"""
from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.notification import Notification, NotificationStatus
from app.services.notification_service import NotificationService


@celery_app.task(name="app.tasks.notification_tasks.send_pending_notifications")
def send_pending_notifications():
    """
    Send all pending notifications
    """
    db = SessionLocal()
    
    try:
        # Get pending notifications
        notifications = db.query(Notification).filter(
            Notification.status == NotificationStatus.PENDING,
            Notification.retry_count < 3
        ).limit(100).all()
        
        for notification in notifications:
            success = False
            
            # Send based on type
            if notification.notification_type == "email":
                success = NotificationService.send_email(
                    notification.recipient,
                    notification.title,
                    notification.message
                )
            elif notification.notification_type == "sms":
                success = NotificationService.send_sms(
                    notification.recipient,
                    notification.message
                )
            elif notification.notification_type == "whatsapp":
                success = NotificationService.send_whatsapp(
                    notification.recipient,
                    notification.message
                )
            
            # Update notification status
            if success:
                notification.status = NotificationStatus.SENT
                from datetime import datetime
                notification.sent_at = datetime.utcnow()
            else:
                notification.retry_count += 1
                if notification.retry_count >= 3:
                    notification.status = NotificationStatus.FAILED
            
            db.commit()
        
        return {"status": "success", "processed": len(notifications)}
    
    except Exception as e:
        print(f"Error sending notifications: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.notification_tasks.send_promotional_campaign")
def send_promotional_campaign(campaign_data: dict):
    """
    Send promotional campaign to users
    """
    db = SessionLocal()
    
    try:
        from app.models.user import User
        
        # Get target users
        query = db.query(User).filter(User.company_id == campaign_data["company_id"])
        
        if campaign_data.get("role"):
            query = query.filter(User.role == campaign_data["role"])
        
        users = query.all()
        
        sent_count = 0
        for user in users:
            # Check user notification preferences
            if user.notification_preferences:
                if not user.notification_preferences.get("promotional", True):
                    continue
            
            # Send email
            success = NotificationService.send_email(
                user.email,
                campaign_data["subject"],
                campaign_data["message"]
            )
            
            if success:
                sent_count += 1
        
        return {"status": "success", "sent": sent_count, "total": len(users)}
    
    except Exception as e:
        print(f"Error sending campaign: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()
