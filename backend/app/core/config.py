"""
Application Configuration
"""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )
    
    # Application
    APP_NAME: str = "Agendamento SaaS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    
    # Passwords for services (used in Docker)
    REDIS_PASSWORD: Optional[str] = None
    RABBITMQ_USER: Optional[str] = None
    RABBITMQ_PASSWORD: Optional[str] = None
    
    # Jobs & Background Tasks
    ENABLE_SUBSCRIPTION_RENEWAL_JOB: bool = True  # Renovação automática de assinaturas
    SUBSCRIPTION_RENEWAL_HOUR: int = 8  # Hora para rodar o job (8h da manhã)
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas (era 30 min)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 dias (era 7)
    
    # Public URLs
    PUBLIC_URL: str = "http://localhost:80"
    API_URL: str = "http://localhost:8000"
    
    # CORS
    CORS_ORIGIN: Optional[str] = None
    CORS_ALLOW_ALL: bool = False  # Set to True for development only
    
    def get_cors_origins(self) -> List[str]:
        """
        Parse CORS origins from environment variable
        
        IMPORTANT: Wildcards (*) are NOT supported with allow_credentials=True.
        This function returns explicit origins only to support credentials.
        
        Returns:
            List of allowed origins. Returns ["*"] if CORS_ALLOW_ALL is True.
            Returns parsed CORS_ORIGIN if set, otherwise returns default development origins.
        """
        import os
        
        # If explicitly set to allow all (development only)
        # NOTE: This will disable credentials in main.py
        if self.CORS_ALLOW_ALL:
            return ["*"]
        
        # Start with default localhost origins
        origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
        ]
        
        # If CORS_ORIGIN is set, parse and add it
        if self.CORS_ORIGIN:
            parsed_origins = [origin.strip() for origin in self.CORS_ORIGIN.split(",")]
            # Filter out empty strings and wildcards
            parsed_origins = [origin for origin in parsed_origins if origin and origin != "*"]
            origins.extend(parsed_origins)
        
        # Add FRONTEND_URL if set
        if self.FRONTEND_URL:
            frontend_url = self.FRONTEND_URL.rstrip("/")
            if frontend_url not in origins:
                origins.append(frontend_url)
        
        # Add PUBLIC_URL if set and different from FRONTEND_URL
        if self.PUBLIC_URL:
            public_url = self.PUBLIC_URL.rstrip("/")
            if public_url not in origins:
                origins.append(public_url)
        
        # Add cloudflare tunnel URL if set
        cloudflare_url = os.getenv("CLOUDFLARE_TUNNEL_URL")
        if cloudflare_url:
            cloudflare_url = cloudflare_url.rstrip("/")
            if cloudflare_url not in origins:
                origins.append(cloudflare_url)
        
        # Add localtunnel URL if set
        localtunnel_url = os.getenv("LOCALTUNNEL_URL")
        if localtunnel_url:
            localtunnel_url = localtunnel_url.rstrip("/")
            if localtunnel_url not in origins:
                origins.append(localtunnel_url)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_origins = []
        for origin in origins:
            if origin not in seen:
                seen.add(origin)
                unique_origins.append(origin)
        
        # If no origins found, return default localhost
        return unique_origins if unique_origins else ["http://localhost:3000"]
    
    # OAuth2 - Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None
    
    # OAuth2 - Facebook
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None
    FACEBOOK_REDIRECT_URI: Optional[str] = None
    
    # Payment Gateways
    MERCADOPAGO_ACCESS_TOKEN: Optional[str] = None
    MERCADOPAGO_PUBLIC_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_MODE: str = "sandbox"
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@agendamento.com"
    SMTP_FROM_NAME: str = "Agendamento SaaS"
    
    # SMS - Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    # WhatsApp / Evolution API
    WHATSAPP_API_URL: Optional[str] = None
    WHATSAPP_API_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER: Optional[str] = None
    WHATSAPP_INSTANCE_NAME: Optional[str] = None  # Nome da instância Evolution API
    
    # Web Push Notifications (VAPID)
    VAPID_PUBLIC_KEY: Optional[str] = None
    VAPID_PRIVATE_KEY: Optional[str] = None
    VAPID_MAILTO: str = "mailto:admin@agendamento.com"
    
    # Storage - AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None
    
    # Google Calendar
    GOOGLE_CALENDAR_CLIENT_ID: Optional[str] = None
    GOOGLE_CALENDAR_CLIENT_SECRET: Optional[str] = None
    
    # Calendly
    CALENDLY_CLIENT_ID: Optional[str] = None
    CALENDLY_CLIENT_SECRET: Optional[str] = None
    
    # Backend URL (for webhooks)
    BACKEND_URL: str = "http://localhost:8000"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Cookie settings for local development
    COOKIE_DOMAIN: Optional[str] = None
    COOKIE_SECURE: bool = False
    COOKIE_SAME_SITE: str = "lax"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Celery
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None
    
    @property
    def get_celery_broker_url(self) -> str:
        """Get Celery broker URL with authentication"""
        if self.CELERY_BROKER_URL:
            return self.CELERY_BROKER_URL
        
        # Build URL from RabbitMQ settings
        if self.RABBITMQ_USER and self.RABBITMQ_PASSWORD:
            return f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}@rabbitmq:5672/"
        return self.RABBITMQ_URL
    
    @property
    def get_celery_result_backend(self) -> str:
        """Get Celery result backend URL with authentication"""
        if self.CELERY_RESULT_BACKEND:
            return self.CELERY_RESULT_BACKEND
        
        # Build URL from Redis settings
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@redis:6379/1"
        return "redis://redis:6379/1"
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    
    # Analytics
    GOOGLE_ANALYTICS_ID: Optional[str] = None
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
    
    # Appointment Settings
    DEFAULT_APPOINTMENT_DURATION: int = 60  # minutes
    CANCELLATION_DEADLINE_HOURS: int = 24
    REMINDER_HOURS_BEFORE: List[int] = [24, 2]
    
    # Business Hours
    BUSINESS_START_HOUR: int = 8
    BUSINESS_END_HOUR: int = 20
    
    # Evolution API Integration
    EVOLUTION_API_URL: str = "http://localhost:8080"
    EVOLUTION_API_KEY: str = "evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7"
    EVOLUTION_INSTANCE_NAME: Optional[str] = None


# Initialize settings
settings = Settings()
