"""
Celery Application Configuration
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "agendamento_saas",
    broker=settings.get_celery_broker_url,
    backend=settings.get_celery_result_backend,
    include=[
        "app.tasks.appointment_tasks",
        "app.tasks.notification_tasks",
        "app.tasks.payment_tasks",
    ]
)

# Configure Celery with performance optimizations
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Timezone
    timezone="America/Sao_Paulo",
    enable_utc=True,
    
    # Task tracking
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    
    # Worker configuration (otimizado para desempenho)
    worker_prefetch_multiplier=4,  # Prefetch 4 tasks per worker (reduz latência)
    worker_max_tasks_per_child=1000,  # Reciclar worker após 1000 tarefas (previne memory leaks)
    worker_disable_rate_limits=False,  # Manter rate limits para controle
    
    # Task acknowledgment (otimizado)
    task_acks_late=True,  # Acknowledge após conclusão (melhor para tarefas longas)
    task_reject_on_worker_lost=True,  # Rejeitar tarefas se worker morrer
    
    # Result backend (Redis)
    result_backend_transport_options={
        'visibility_timeout': 3600,  # 1 hora
        'retry_policy': {
            'timeout': 5.0
        },
        'max_connections': 50,
    },
    result_expires=3600,  # Resultados expiram em 1 hora
    
    # Broker connection (RabbitMQ) com retry robusto
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    broker_connection_timeout=30,  # Timeout de conexão
    broker_pool_limit=10,  # Pool de conexões com broker
    
    # Retry policies (crítico para SaaS)
    task_default_retry_delay=60,  # 1 minuto entre tentativas
    task_max_retries=3,  # Máximo 3 tentativas
    task_reject_on_worker_lost=True,  # Rejeitar se worker morrer
    
    # Dead-letter handling
    task_reject_on_worker_lost=True,
    task_ignore_result=False,  # Guardar resultados para auditoria
    
    # Task routing (separado por domínio para evitar bloqueio em cascata)
    task_routes={
        'app.tasks.appointment_tasks.*': {'queue': 'appointments'},
        'app.tasks.notification_tasks.*': {'queue': 'notifications'},
        'app.tasks.payment_tasks.*': {'queue': 'payments'},
        'app.tasks.report_tasks.*': {'queue': 'reports'},
        'app.tasks.backup_tasks.*': {'queue': 'backups'},
    },
    
    # Queue definitions com DLQ (Dead-Letter Queue)
    task_queues={
        'appointments': {
            'exchange': 'appointments',
            'routing_key': 'appointments',
            'queue_arguments': {
                'x-dead-letter-exchange': 'appointments.dlq',
                'x-message-ttl': 3600000,  # 1 hora
            }
        },
        'notifications': {
            'exchange': 'notifications', 
            'routing_key': 'notifications',
            'queue_arguments': {
                'x-dead-letter-exchange': 'notifications.dlq',
                'x-message-ttl': 3600000,  # 1 hora
            }
        },
        'payments': {
            'exchange': 'payments',
            'routing_key': 'payments', 
            'queue_arguments': {
                'x-dead-letter-exchange': 'payments.dlq',
                'x-message-ttl': 3600000,  # 1 hora
            }
        },
        'reports': {
            'exchange': 'reports',
            'routing_key': 'reports',
            'queue_arguments': {
                'x-dead-letter-exchange': 'reports.dlq',
                'x-message-ttl': 7200000,  # 2 horas
            }
        },
        'backups': {
            'exchange': 'backups',
            'routing_key': 'backups',
            'queue_arguments': {
                'x-dead-letter-exchange': 'backups.dlq',
                'x-message-ttl': 14400000,  # 4 horas
            }
        },
    },
    
    # Task compression (para tarefas grandes)
    task_compression='gzip',
    result_compression='gzip',
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
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
    # Google Calendar sync tasks
    "sync-all-calendar-integrations": {
        "task": "app.tasks.google_calendar_tasks.sync_all_calendar_integrations",
        "schedule": crontab(minute=0, hour="*/4"),  # Every 4 hours
    },
    "sync-recent-appointments": {
        "task": "app.tasks.google_calendar_tasks.sync_recent_appointments", 
        "schedule": crontab(minute="*/15"),  # Every 15 minutes
    },
    "cleanup-expired-tokens": {
        "task": "app.tasks.google_calendar_tasks.cleanup_expired_tokens",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    # WhatsApp Calendar Tasks (Evolution API)
    "send-whatsapp-confirmation-requests": {
        "task": "app.tasks.whatsapp_calendar_tasks.send_whatsapp_confirmation_requests",
        "schedule": crontab(minute="*/30"),  # Every 30 minutes
    },
    "send-whatsapp-reminders": {
        "task": "app.tasks.whatsapp_calendar_tasks.send_whatsapp_reminders",
        "schedule": crontab(minute="*/15"),  # Every 15 minutes
    },
}

if __name__ == "__main__":
    celery_app.start()
