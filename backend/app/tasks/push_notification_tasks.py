"""
Push Notification Tasks - Celery

Tasks assíncronas para envio de notificações push.

Tasks:
- Enviar lembretes de agendamentos
- Enviar notificações agendadas
- Limpar subscriptions expiradas
"""
from datetime import datetime, timedelta
from celery import shared_task
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.services.push_notification_helpers import AppointmentPushNotifications
import logging

logger = logging.getLogger(__name__)


@shared_task(name="send_appointment_reminders_24h")
def send_appointment_reminders_24h():
    """
    Envia lembretes de agendamentos 24 horas antes.
    
    Executar diariamente via Celery Beat.
    """
    db = SessionLocal()
    
    try:
        # Buscar agendamentos para amanhã
        tomorrow_start = datetime.utcnow() + timedelta(hours=24)
        tomorrow_end = tomorrow_start + timedelta(hours=1)
        
        appointments = db.query(Appointment).filter(
            Appointment.start_time.between(tomorrow_start, tomorrow_end),
            Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
            Appointment.reminder_sent_24h == False
        ).all()
        
        logger.info(f"Found {len(appointments)} appointments for 24h reminders")
        
        for appointment in appointments:
            try:
                AppointmentPushNotifications.notify_appointment_reminder(db, appointment, 24)
                
                # Marcar como enviado
                appointment.reminder_sent_24h = True
                db.commit()
                
            except Exception as e:
                logger.error(f"Error sending 24h reminder for appointment {appointment.id}: {str(e)}")
                continue
        
        logger.info(f"Sent {len(appointments)} 24h reminders")
        
    except Exception as e:
        logger.error(f"Error in send_appointment_reminders_24h task: {str(e)}")
    finally:
        db.close()


@shared_task(name="send_appointment_reminders_2h")
def send_appointment_reminders_2h():
    """
    Envia lembretes de agendamentos 2 horas antes.
    
    Executar a cada hora via Celery Beat.
    """
    db = SessionLocal()
    
    try:
        # Buscar agendamentos daqui a 2 horas
        two_hours_later = datetime.utcnow() + timedelta(hours=2)
        window_start = two_hours_later - timedelta(minutes=30)
        window_end = two_hours_later + timedelta(minutes=30)
        
        appointments = db.query(Appointment).filter(
            Appointment.start_time.between(window_start, window_end),
            Appointment.status.in_([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
            Appointment.reminder_sent_2h == False
        ).all()
        
        logger.info(f"Found {len(appointments)} appointments for 2h reminders")
        
        for appointment in appointments:
            try:
                AppointmentPushNotifications.notify_appointment_reminder(db, appointment, 2)
                
                # Marcar como enviado
                appointment.reminder_sent_2h = True
                db.commit()
                
            except Exception as e:
                logger.error(f"Error sending 2h reminder for appointment {appointment.id}: {str(e)}")
                continue
        
        logger.info(f"Sent {len(appointments)} 2h reminders")
        
    except Exception as e:
        logger.error(f"Error in send_appointment_reminders_2h task: {str(e)}")
    finally:
        db.close()


@shared_task(name="clean_expired_push_subscriptions")
def clean_expired_push_subscriptions():
    """
    Limpa subscriptions que não são usadas há muito tempo.
    
    Executar semanalmente via Celery Beat.
    """
    db = SessionLocal()
    
    try:
        from app.models.push_notification import UserPushSubscription
        
        # Subscriptions sem uso há 90 dias
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        
        expired = db.query(UserPushSubscription).filter(
            UserPushSubscription.last_used_at < cutoff_date
        ).all()
        
        count = 0
        for subscription in expired:
            # Desativar (não deletar, para histórico)
            subscription.is_active = False
            count += 1
        
        db.commit()
        
        logger.info(f"Deactivated {count} expired push subscriptions")
        
    except Exception as e:
        logger.error(f"Error in clean_expired_push_subscriptions task: {str(e)}")
    finally:
        db.close()


@shared_task(name="send_push_notification")
def send_push_notification(
    user_id: int,
    title: str,
    body: str,
    url: str = "/",
    notification_type: str = "system",
    reference_id: int = None,
    reference_type: str = None
):
    """
    Task genérica para enviar push notification.
    
    Pode ser chamada de qualquer lugar do sistema.
    
    Exemplo:
        send_push_notification.delay(
            user_id=5,
            title="Novo Pagamento",
            body="Pagamento de R$ 100,00 recebido",
            url="/financial/payments/123"
        )
    """
    db = SessionLocal()
    
    try:
        from app.services.push_service import PushNotificationService
        
        service = PushNotificationService(db)
        
        logs = service.send_to_user(
            user_id=user_id,
            title=title,
            body=body,
            url=url,
            notification_type=notification_type,
            reference_id=reference_id,
            reference_type=reference_type
        )
        
        logger.info(f"Sent push notification to user {user_id}: {title}")
        
        return len(logs)
        
    except Exception as e:
        logger.error(f"Error sending push notification to user {user_id}: {str(e)}")
        raise
    finally:
        db.close()
