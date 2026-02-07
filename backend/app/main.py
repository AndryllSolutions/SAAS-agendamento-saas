"""
Main FastAPI Application
"""
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.core.observability import ObservabilityMiddleware, setup_json_logging, configure_sentry
from app.core.metrics import metrics_endpoint

# Configure observability (logging and monitoring)
if settings.ENVIRONMENT == "production":
    setup_json_logging()
else:
    # Use standard logging for development
    import logging
    logging.basicConfig(level=logging.INFO)

# Initialize Sentry for error tracking (enhanced version)
try:
    sentry_dsn = getattr(settings, 'SENTRY_DSN', None)
    if sentry_dsn and isinstance(sentry_dsn, str) and sentry_dsn.strip():
        configure_sentry(environment=settings.ENVIRONMENT)
except Exception:
    # If Sentry initialization fails, continue without it
    pass

# Initialize rate limiter with generous defaults
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000/hour", "200/minute"],  # Generous limits for normal use
    storage_uri="memory://",
)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema completo de agendamento online multi-tenant",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    redirect_slashes=False,
)

# Add rate limiter to app state
app.state.limiter = limiter
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    origin = request.headers.get("origin")

    response = JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "RATE_LIMITED",
            "message": "Limite de requisições excedido",
        },
    )

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"

    return response

# CORS Middleware - DEVELOPMENT: Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Type", "X-Total-Count"],
    max_age=3600,
)
print("⚠️ CORS: Allowing all origins for DEVELOPMENT ONLY")

# GZip Middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Observability Middleware for request tracking and structured logging
app.add_middleware(ObservabilityMiddleware)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Security headers to prevent common attacks
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # HSTS header for HTTPS enforcement (only in production)
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    # Content Security Policy
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp_policy
    
    return response


# Exception Handlers
def _error_code_for_status(status_code: int) -> str:
    mapping = {
        status.HTTP_400_BAD_REQUEST: "BAD_REQUEST",
        status.HTTP_401_UNAUTHORIZED: "UNAUTHORIZED",
        status.HTTP_403_FORBIDDEN: "FORBIDDEN",
        status.HTTP_404_NOT_FOUND: "NOT_FOUND",
        status.HTTP_409_CONFLICT: "CONFLICT",
        status.HTTP_422_UNPROCESSABLE_ENTITY: "VALIDATION_ERROR",
        status.HTTP_429_TOO_MANY_REQUESTS: "RATE_LIMITED",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "INTERNAL_ERROR",
    }
    return mapping.get(status_code, "ERROR")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin")

    message = exc.detail if isinstance(exc.detail, str) else "Erro na requisição"
    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "error": _error_code_for_status(exc.status_code),
            "message": message,
        },
    )

    if exc.headers:
        for k, v in exc.headers.items():
            response.headers[k] = v

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"

    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    # Get origin from request
    origin = request.headers.get("origin")
    
    response = JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Erro de validação nos dados enviados",
        },
    )
    
    # Add CORS headers manually
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    
    return response


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    # Get origin from request
    origin = request.headers.get("origin")

    response = JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_ERROR",
            "message": "Erro interno do servidor",
        },
    )
    
    # Add CORS headers manually
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    
    return response


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and other services on startup"""
    Base.metadata.create_all(bind=engine)
    
    # ✅ Iniciar scheduler para renovação de assinaturas
    if settings.ENABLE_SUBSCRIPTION_RENEWAL_JOB:
        try:
            from apscheduler.schedulers.background import BackgroundScheduler
            from app.jobs.subscription_renewal import process_subscription_renewals
            import logging
            
            logger = logging.getLogger(__name__)
            
            scheduler = BackgroundScheduler()
            
            # Rodar todos os dias às 8h da manhã
            scheduler.add_job(
                process_subscription_renewals,
                'cron',
                hour=8,
                minute=0,
                id='subscription_renewal',
                replace_existing=True
            )
            
            scheduler.start()
            logger.info("✅ Scheduler de renovação de assinaturas iniciado (8h diárias)")
            
            # Armazenar scheduler para cleanup
            app.state.scheduler = scheduler
            
        except ImportError:
            pass  # APScheduler não instalado, pular
        except Exception as e:
            pass  # Erro ao iniciar scheduler, continuar sem ele


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    # Parar scheduler se estiver rodando
    if hasattr(app.state, 'scheduler'):
        try:
            app.state.scheduler.shutdown()
        except:
            pass


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Metrics endpoint for Prometheus (protected - internal use only)
@app.get("/metrics", include_in_schema=False)
async def metrics():
    """
    Prometheus metrics endpoint.
    
    ⚠️ WARNING: This endpoint should be protected in production!
    Only expose to internal monitoring systems, NOT to the internet.
    """
    return metrics_endpoint()


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": f"Bem-vindo ao {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


# Include API router
app.include_router(api_router, prefix="/api/v1")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
