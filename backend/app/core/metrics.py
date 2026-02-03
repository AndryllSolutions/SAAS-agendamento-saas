"""
Prometheus metrics for monitoring and observability
"""
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time

# HTTP Metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Database Metrics
db_connections_active = Gauge(
    'db_connections_active',
    'Number of active database connections'
)

db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
)

# Tenant/Business Metrics
tenant_appointments_created_total = Counter(
    'tenant_appointments_created_total',
    'Total appointments created per tenant',
    ['company_id']
)

tenant_active_users = Gauge(
    'tenant_active_users',
    'Number of active users per tenant',
    ['company_id']
)

# Celery Metrics
celery_tasks_executed_total = Counter(
    'celery_tasks_executed_total',
    'Total Celery tasks executed',
    ['task_name', 'status']
)

celery_task_duration_seconds = Histogram(
    'celery_task_duration_seconds',
    'Celery task duration in seconds',
    ['task_name'],
    buckets=[0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0]
)

# RabbitMQ/Queue Metrics
queue_size = Gauge(
    'queue_size',
    'Number of messages in queue',
    ['queue_name']
)


def metrics_endpoint():
    """
    Endpoint to expose Prometheus metrics.
    
    Usage:
        from app.core.metrics import metrics_endpoint
        
        @app.get("/metrics")
        async def metrics():
            return metrics_endpoint()
    """
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


class MetricsCollector:
    """
    Helper class to collect and record metrics throughout the application.
    """
    
    @staticmethod
    def record_http_request(method: str, endpoint: str, status_code: int, duration: float):
        """Record HTTP request metrics"""
        http_requests_total.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
        http_request_duration_seconds.labels(method=method, endpoint=endpoint).observe(duration)
    
    @staticmethod
    def record_db_query(query_type: str, duration: float):
        """Record database query metrics"""
        db_query_duration_seconds.labels(query_type=query_type).observe(duration)
    
    @staticmethod
    def record_appointment_created(company_id: int):
        """Record appointment creation for a tenant"""
        tenant_appointments_created_total.labels(company_id=str(company_id)).inc()
    
    @staticmethod
    def record_celery_task(task_name: str, status: str, duration: float):
        """Record Celery task execution"""
        celery_tasks_executed_total.labels(task_name=task_name, status=status).inc()
        celery_task_duration_seconds.labels(task_name=task_name).observe(duration)
    
    @staticmethod
    def set_active_users(company_id: int, count: int):
        """Set the number of active users for a tenant"""
        tenant_active_users.labels(company_id=str(company_id)).set(count)
    
    @staticmethod
    def set_queue_size(queue_name: str, size: int):
        """Set the current queue size"""
        queue_size.labels(queue_name=queue_name).set(size)


# Global metrics collector instance
metrics = MetricsCollector()
