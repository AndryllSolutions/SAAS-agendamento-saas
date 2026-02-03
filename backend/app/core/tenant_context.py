"""
Tenant Context Management for Row Level Security (RLS)

This module provides automatic tenant context injection for all database sessions,
enabling PostgreSQL Row Level Security policies to filter data by company_id.
"""
import logging
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)


def set_tenant_context(db: Session, company_id: Optional[int]) -> None:
    """
    Set the tenant context for the current database session.
    
    This executes `SET LOCAL app.current_company_id = :company_id` which is used
    by PostgreSQL Row Level Security policies to filter data.
    
    Args:
        db: SQLAlchemy session
        company_id: Company ID to set as context (None to clear context)
        
    Raises:
        ValueError: If company_id is invalid
    """
    if company_id is None:
        # Clear tenant context - use with caution!
        logger.warning("⚠️ Clearing tenant context - this should only happen in specific admin operations")
        db.execute(text("SET LOCAL app.current_company_id = ''"))
        return
    
    if not isinstance(company_id, int) or company_id <= 0:
        raise ValueError(f"Invalid company_id: {company_id}. Must be a positive integer.")
    
    try:
        # Set the session-level variable that RLS policies will read
        # Use SET (not SET LOCAL) to persist across transaction boundaries
        db.execute(text("SET app.current_company_id = :company_id"), {"company_id": str(company_id)})
        logger.debug(f"Tenant context set: company_id={company_id}")
    except Exception as e:
        logger.error(f"❌ Failed to set tenant context for company_id={company_id}: {e}")
        raise


def get_tenant_context(db: Session) -> Optional[int]:
    """
    Get the current tenant context from the database session.
    
    Args:
        db: SQLAlchemy session
        
    Returns:
        Current company_id or None if not set
    """
    try:
        result = db.execute(text("SELECT current_setting('app.current_company_id', TRUE)"))
        value = result.scalar()
        
        if value and value.strip():
            return int(value)
        return None
    except Exception as e:
        logger.warning(f"Could not get tenant context: {e}")
        return None


def clear_tenant_context(db: Session) -> None:
    """
    Clear the tenant context from the current database session.
    
    Use this with extreme caution - only in admin operations that need
    cross-tenant visibility.
    
    Args:
        db: SQLAlchemy session
    """
    logger.warning("⚠️ Clearing tenant context")
    db.execute(text("SET LOCAL app.current_company_id = ''"))


def validate_tenant_context(db: Session, expected_company_id: int) -> bool:
    """
    Validate that the current tenant context matches the expected company_id.
    
    This is useful for defensive programming to ensure context wasn't accidentally
    changed or bypassed.
    
    Args:
        db: SQLAlchemy session
        expected_company_id: Expected company ID
        
    Returns:
        True if context matches, False otherwise
    """
    current = get_tenant_context(db)
    if current != expected_company_id:
        logger.error(
            f"❌ Tenant context mismatch! Expected: {expected_company_id}, Got: {current}"
        )
        return False
    return True
