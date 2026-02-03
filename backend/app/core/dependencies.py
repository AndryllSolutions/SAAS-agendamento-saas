"""
FastAPI dependencies for tenant context, authentication, and observability
"""
from typing import Generator, Optional
from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.tenant_context import set_tenant_context, validate_tenant_context
from app.core.rbac import get_current_user_context, CurrentUserContext
from app.models.user import User
from app.core.security import get_current_user
from app.core.api_key_auth import require_api_key
from app.models.api_key import APIKey
from app.models.company import Company
import logging

logger = logging.getLogger(__name__)


def get_db_with_tenant(
    request: Request,
    context: CurrentUserContext = Depends(get_current_user_context)
) -> Generator[Session, None, None]:
    """
    Get database session with automatic tenant context injection.
    
    This dependency should be used in all authenticated endpoints that need
    tenant isolation. It automatically:
    1. Creates a database session
    2. Extracts company_id from the authenticated user
    3. Sets the PostgreSQL session variable for RLS
    4. Validates the context after setting
    
    Usage:
        @router.get("/clients")
        async def list_clients(
            db: Session = Depends(get_db_with_tenant),
            context: CurrentUserContext = Depends(get_current_user_context)
        ):
            # All queries here are automatically filtered by company_id via RLS
            clients = db.query(Client).all()
            return clients
    
    Args:
        request: FastAPI Request object (for logging/tracing)
        context: Current user context with company_id
        
    Yields:
        SQLAlchemy session with tenant context set
        
    Raises:
        HTTPException: If user has no company_id or context validation fails
    """
    from fastapi import HTTPException, status
    
    db = SessionLocal()
    
    try:
        # Extract company_id from user context
        company_id = context.company_id
        
        if not company_id:
            logger.error(
                f"❌ User {context.user_id} ({context.email}) has no company_id. "
                "Cannot set tenant context."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not associated with any company"
            )
        
        # Set tenant context for RLS
        set_tenant_context(db, company_id)
        
        # Validate context was set correctly (defensive programming)
        if not validate_tenant_context(db, company_id):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set tenant context"
            )
        
        # Attach metadata to request state for observability
        request.state.company_id = company_id
        request.state.user_id = context.user_id
        
        logger.debug(
            f"🔒 Session initialized with tenant context: "
            f"user_id={context.user_id}, company_id={company_id}"
        )
        
        yield db
        
    except HTTPException:
        db.close()
        raise
    except Exception as e:
        logger.error(f"❌ Error in get_db_with_tenant: {e}", exc_info=True)
        db.close()
        raise
    finally:
        db.close()


def get_db_with_api_key_tenant(scope: Optional[str] = None):
    """Factory dependency: Get DB session with tenant context set from API Key.

    This is required for external integrations (Chrome Extension, webhooks)
    where auth is done through X-API-Key and RLS must still apply.
    """

    async def _dependency(
        request: Request,
        auth: tuple[APIKey, Company] = Depends(require_api_key(scope))
    ) -> Generator[Session, None, None]:
        from fastapi import HTTPException, status

        api_key, company = auth
        db = SessionLocal()

        try:
            company_id = api_key.company_id
            if not company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API Key is not associated with any company"
                )

            set_tenant_context(db, company_id)
            if not validate_tenant_context(db, company_id):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to set tenant context"
                )

            request.state.company_id = company_id
            request.state.api_key_id = api_key.id
            request.state.user_id = api_key.user_id

            yield db
        except HTTPException:
            db.close()
            raise
        except Exception as e:
            logger.error(f"❌ Error in get_db_with_api_key_tenant: {e}", exc_info=True)
            db.close()
            raise
        finally:
            db.close()

    return _dependency


def get_db_with_api_key_tenant_context(scope: Optional[str] = None):
    """Factory dependency: (db, api_key, company) with tenant context set via API Key.

    Use this in endpoints where you need both the DB session and the authenticated
    API Key/company, avoiding duplicate auth + duplicate DB sessions.
    """

    async def _dependency(
        request: Request,
        auth: tuple[APIKey, Company] = Depends(require_api_key(scope))
    ) -> Generator[tuple[Session, APIKey, Company], None, None]:
        from fastapi import HTTPException, status

        api_key, company = auth
        db = SessionLocal()

        try:
            company_id = api_key.company_id
            if not company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="API Key is not associated with any company"
                )

            set_tenant_context(db, company_id)
            if not validate_tenant_context(db, company_id):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to set tenant context"
                )

            request.state.company_id = company_id
            request.state.api_key_id = api_key.id
            request.state.user_id = api_key.user_id

            yield db, api_key, company
        except HTTPException:
            db.close()
            raise
        except Exception as e:
            logger.error(f"❌ Error in get_db_with_api_key_tenant_context: {e}", exc_info=True)
            db.close()
            raise
        finally:
            db.close()

    return _dependency


def get_db_legacy(current_user: User = Depends(get_current_user)) -> Generator[Session, None, None]:
    """
    Legacy database dependency that manually sets tenant context.
    
    This is for backwards compatibility with endpoints that haven't been
    migrated to use CurrentUserContext. New code should use get_db_with_tenant().
    
    Args:
        current_user: Current authenticated user
        
    Yields:
        SQLAlchemy session with tenant context set
    """
    db = SessionLocal()
    
    try:
        if current_user.company_id:
            set_tenant_context(db, current_user.company_id)
            logger.debug(f"🔒 Legacy session: company_id={current_user.company_id}")
        else:
            logger.warning(f"⚠️ Legacy session without company_id for user {current_user.id}")
        
        yield db
    finally:
        db.close()


def get_db_admin() -> Generator[Session, None, None]:
    """
    Get database session WITHOUT tenant context for admin operations.
    
    ⚠️ USE WITH EXTREME CAUTION ⚠️
    
    This dependency should ONLY be used in SaaS admin endpoints that need
    cross-tenant visibility. It bypasses RLS by not setting app.current_company_id.
    
    Usage should be limited to:
    - SaaS admin panel (listing all companies)
    - System-level reports
    - Maintenance operations
    
    Always check that the user has SAAS_OWNER or SAAS_STAFF role before using this.
    
    Yields:
        SQLAlchemy session without tenant context
    """
    logger.warning("⚠️ Creating admin session WITHOUT tenant isolation")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
