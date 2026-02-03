"""
Tenant-aware Celery task decorator and utilities for background jobs
"""
from functools import wraps
from typing import Callable
import logging
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.tenant_context import set_tenant_context

logger = logging.getLogger(__name__)


def tenant_task(func: Callable) -> Callable:
    """
    Decorator for Celery tasks that need tenant context.
    
    This decorator ensures that:
    1. The task receives company_id as first argument
    2. Tenant context is set before task execution
    3. Database session is properly managed
    4. Errors are logged with tenant context
    
    Usage:
        from app.tasks.tenant_aware_task import tenant_task
        from app.tasks.celery_app import celery
        
        @celery.task
        @tenant_task
        def send_appointment_reminders(company_id: int):
            # This task runs with tenant context automatically set
            db = SessionLocal()
            try:
                appointments = db.query(Appointment).filter(
                    Appointment.status == 'pending'
                ).all()
                # Process appointments...
            finally:
                db.close()
    
    Args:
        func: Celery task function (must accept company_id as first parameter)
        
    Returns:
        Wrapped function with tenant context management
    """
    @wraps(func)
    def wrapper(company_id: int, *args, **kwargs):
        if not company_id:
            logger.error(f"❌ Task {func.__name__} called without company_id")
            raise ValueError(f"Task {func.__name__} requires company_id as first argument")
        
        logger.info(f"🔧 Starting task {func.__name__} for company_id={company_id}")
        
        # Create database session and set tenant context
        db = SessionLocal()
        try:
            set_tenant_context(db, company_id)
            logger.debug(f"🔒 Tenant context set for task {func.__name__}: company_id={company_id}")
            
            # Execute the task
            result = func(company_id, *args, db=db, **kwargs)
            
            logger.info(f"✅ Task {func.__name__} completed for company_id={company_id}")
            return result
            
        except Exception as e:
            logger.error(
                f"❌ Task {func.__name__} failed for company_id={company_id}: {e}",
                exc_info=True
            )
            raise
        finally:
            db.close()
    
    return wrapper


def bulk_tenant_task(func: Callable) -> Callable:
    """
    Decorator for Celery tasks that process multiple tenants.
    
    This is for tasks that iterate over all companies, like:
    - Subscription renewal checks
    - Daily reports
    - System maintenance
    
    The task function should NOT receive company_id, instead it should
    query all companies and spawn subtasks for each one.
    
    Usage:
        @celery.task
        @bulk_tenant_task
        def check_expiring_subscriptions():
            db = SessionLocal()
            try:
                companies = db.query(Company).filter(Company.is_active == True).all()
                for company in companies:
                    # Spawn individual task with tenant context
                    process_company_subscription.delay(company.id)
            finally:
                db.close()
    
    Args:
        func: Celery task function
        
    Returns:
        Wrapped function with proper logging
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"🔧 Starting bulk task {func.__name__}")
        
        try:
            result = func(*args, **kwargs)
            logger.info(f"✅ Bulk task {func.__name__} completed")
            return result
        except Exception as e:
            logger.error(f"❌ Bulk task {func.__name__} failed: {e}", exc_info=True)
            raise
    
    return wrapper


class TenantTaskSession:
    """
    Context manager for tenant-aware database sessions in Celery tasks.
    
    Usage:
        @celery.task
        def my_task(company_id: int):
            with TenantTaskSession(company_id) as db:
                # db has tenant context automatically set
                clients = db.query(Client).all()
                # Process clients...
    """
    
    def __init__(self, company_id: int):
        self.company_id = company_id
        self.db = None
    
    def __enter__(self) -> Session:
        self.db = SessionLocal()
        set_tenant_context(self.db, self.company_id)
        logger.debug(f"🔒 Tenant session opened: company_id={self.company_id}")
        return self.db
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.db:
            self.db.close()
        
        if exc_type:
            logger.error(
                f"❌ Error in tenant session (company_id={self.company_id}): {exc_val}",
                exc_info=(exc_type, exc_val, exc_tb)
            )
        else:
            logger.debug(f"✅ Tenant session closed: company_id={self.company_id}")
