"""
Celery Application Configuration
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "agendamento_saas",
    broker=settings.CELERY_BROKER_URL or settings.RABBITMQ_URL,
    backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
    include=[
        "app.tasks.appointment_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.payment_tasks",
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)

# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    # Send appointment reminders every 30 minutes
    "send-appointment-reminders": {
        "task": "app.tasks.appointment_tasks.send_appointment_reminders",
        "schedule": crontab(minute="*/30"),
    },
    # Check for expired subscriptions daily
    "check-expired-subscriptions": {
        "task": "app.tasks.payment_tasks.check_expired_subscriptions",
        "schedule": crontab(hour=0, minute=0),
    },
    # Process waitlist daily
    "process-waitlist": {
        "task": "app.tasks.appointment_tasks.process_waitlist",
        "schedule": crontab(hour="*/2"),  # Every 2 hours
    },
}

if __name__ == "__main__":
    celery_app.start()
