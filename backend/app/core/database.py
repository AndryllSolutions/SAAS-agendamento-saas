"""
Database configuration and session management
"""
from sqlalchemy import create_engine, event, pool
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import Generator
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine with optimized pool settings
engine = create_engine(
    settings.DATABASE_URL,
    # Connection pooling (otimizado para produção)
    poolclass=pool.QueuePool,
    pool_pre_ping=True,  # Verify connections before using (previne erros de conexão perdida)
    pool_size=20,  # Pool mínimo de conexões (aumentado de 10)
    max_overflow=40,  # Pool máximo de conexões extras (aumentado de 20)
    pool_recycle=3600,  # Reciclar conexões após 1 hora (previne conexões obsoletas)
    pool_timeout=30,  # Timeout para obter conexão do pool
    echo=settings.DEBUG,  # Log SQL queries apenas em debug
    echo_pool=settings.DEBUG,  # Log pool events apenas em debug
    # PostgreSQL specific optimizations
    connect_args={
        "connect_timeout": 10,
        "application_name": "agendamento_saas",
        "options": "-c statement_timeout=30000"  # 30 segundos timeout para queries
    } if "postgresql" in settings.DATABASE_URL else {}
)

# Event listeners para monitoramento de conexões (apenas em debug)
if settings.DEBUG:
    @event.listens_for(engine, "connect")
    def receive_connect(dbapi_conn, connection_record):
        logger.debug("📊 Nova conexão ao banco de dados")

    @event.listens_for(engine, "checkout")
    def receive_checkout(dbapi_conn, connection_record, connection_proxy):
        logger.debug("🔓 Conexão retirada do pool")

    @event.listens_for(engine, "checkin")
    def receive_checkin(dbapi_conn, connection_record):
        logger.debug("🔒 Conexão devolvida ao pool")

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Otimização: não expira objetos após commit
)

# Create Base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db() -> Generator:
    """
    Dependency function to get database session.
    
    For public endpoints without authentication.
    For authenticated endpoints, tenant context should be set via middleware or dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Enhanced get_db with automatic tenant context
def get_db_with_context(current_user=None) -> Generator:
    """
    Dependency function to get database session with automatic tenant context.
    
    Sets app.current_company_id for PostgreSQL Row Level Security policies.
    This should be used in authenticated endpoints.
    """
    from app.core.tenant_context import set_tenant_context
    
    db = SessionLocal()
    try:
        # Set tenant context if user has company_id
        if current_user and hasattr(current_user, 'company_id') and current_user.company_id:
            set_tenant_context(db, current_user.company_id)
            logger.debug(f"🔒 Tenant context set for user {current_user.id}: company_id={current_user.company_id}")
        
        yield db
    finally:
        db.close()
