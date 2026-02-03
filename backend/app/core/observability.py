"""
Observability middleware and utilities for request tracking, logging, and monitoring
"""
import time
import uuid
import logging
import json
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import sentry_sdk

logger = logging.getLogger(__name__)


class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Middleware for observability: request tracking, structured logging, and metrics.
    
    This middleware:
    1. Generates/extracts request_id for correlation
    2. Logs all requests with structured data
    3. Tracks request duration
    4. Attaches tenant context to Sentry
    5. Handles exceptions with proper logging
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        # Start timer
        start_time = time.time()
        
        # Extract tenant context (will be set later by get_db_with_tenant)
        company_id = getattr(request.state, "company_id", None)
        user_id = getattr(request.state, "user_id", None)
        
        # Log incoming request
        logger.info(
            "incoming_request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "company_id": company_id,
                "user_id": user_id,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
        )
        
        # Set Sentry context
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("request_id", request_id)
            if company_id:
                scope.set_tag("company_id", company_id)
            if user_id:
                scope.set_user({"id": user_id})
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Re-extract context (might have been set during request)
            company_id = getattr(request.state, "company_id", None)
            user_id = getattr(request.state, "user_id", None)
            
            # Add headers to response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
            
            # Log response
            logger.info(
                "request_completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                    "company_id": company_id,
                    "user_id": user_id,
                }
            )
            
            return response
            
        except Exception as e:
            # Calculate duration even for errors
            duration_ms = (time.time() - start_time) * 1000
            
            # Log error with full context
            logger.error(
                "request_failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": round(duration_ms, 2),
                    "company_id": company_id,
                    "user_id": user_id,
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
                exc_info=True
            )
            
            # Re-raise to let FastAPI handle it
            raise


class StructuredLogger:
    """
    JSON structured logger for production environments.
    
    Usage:
        from app.core.observability import structured_logger
        
        structured_logger.info(
            "appointment_created",
            appointment_id=123,
            company_id=1,
            user_id=5
        )
    """
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def _log(self, level: str, event: str, **kwargs):
        """Internal method to log structured data"""
        log_data = {
            "event": event,
            "timestamp": time.time(),
            **kwargs
        }
        
        log_method = getattr(self.logger, level)
        log_method(json.dumps(log_data))
    
    def debug(self, event: str, **kwargs):
        self._log("debug", event, **kwargs)
    
    def info(self, event: str, **kwargs):
        self._log("info", event, **kwargs)
    
    def warning(self, event: str, **kwargs):
        self._log("warning", event, **kwargs)
    
    def error(self, event: str, **kwargs):
        self._log("error", event, **kwargs)
    
    def critical(self, event: str, **kwargs):
        self._log("critical", event, **kwargs)


# Global structured logger instance
structured_logger = StructuredLogger("app")


def configure_sentry(environment: str = "production"):
    """
    Configure Sentry for error tracking and performance monitoring.
    
    Args:
        environment: Environment name (production, staging, development)
    """
    from app.core.config import settings
    
    sentry_sdk.init(
        dsn=getattr(settings, "SENTRY_DSN", None),
        environment=environment,
        traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
        profiles_sample_rate=0.1,  # 10% for profiling
        send_default_pii=False,  # Don't send PII by default
        before_send=_before_send_sentry,
    )


def _before_send_sentry(event, hint):
    """
    Filter and enrich Sentry events before sending.
    
    This ensures sensitive data is not sent and adds useful context.
    """
    # Filter out health check errors
    if event.get("request", {}).get("url", "").endswith("/health"):
        return None
    
    # Add custom tags if available in hint
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        event.setdefault("tags", {})["exception_type"] = exc_type.__name__
    
    return event


def setup_json_logging():
    """
    Configure JSON structured logging for production environments.
    
    This should be called at application startup.
    """
    import logging.config
    
    LOGGING_CONFIG = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s %(request_id)s %(company_id)s %(user_id)s",
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json",  # Use "standard" for development
                "stream": "ext://sys.stdout",
            },
        },
        "root": {
            "level": "INFO",
            "handlers": ["console"],
        },
        "loggers": {
            "app": {
                "level": "DEBUG",
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "level": "WARNING",  # Don't log every SQL query in production
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }
    
    logging.config.dictConfig(LOGGING_CONFIG)
