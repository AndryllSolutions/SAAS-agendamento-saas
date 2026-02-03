"""
RBAC (Role-Based Access Control) Module - Two-Layer Architecture

This module provides:
1. SaaS Global Layer: SAAS_OWNER, SAAS_STAFF (access to global admin panel)
2. Company/Tenant Layer: COMPANY_OWNER, COMPANY_MANAGER, etc. (access to company-specific features)

The architecture separates:
- Global SaaS operations (no company_id filtering)
- Company-scoped operations (always filtered by company_id)
"""
from dataclasses import dataclass
from typing import Optional, List
from enum import Enum
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, decode_token, oauth2_scheme
from app.models.user import User
from app.models.company_user import CompanyUser
from app.core.roles import SaaSRole, CompanyRole


class Scope(str, Enum):
    """Token scope - defines the context of the current session"""
    SAAS = "saas"  # Global SaaS admin context
    COMPANY = "company"  # Company/tenant context


# ========== USER CONTEXT ==========

@dataclass
class CurrentUserContext:
    """
    Complete user context extracted from JWT token.
    
    This context contains all information needed for RBAC decisions:
    - User identification
    - SaaS-level role (if any)
    - Company-level role and company_id (if in company scope)
    - Current scope (saas or company)
    """
    user_id: int
    email: str
    saas_role: Optional[SaaSRole] = None
    company_role: Optional[CompanyRole] = None
    company_id: Optional[int] = None
    scope: Scope = Scope.COMPANY
    
    def is_saas_admin(self) -> bool:
        """Check if user has SaaS admin privileges"""
        return self.saas_role in [SaaSRole.SAAS_OWNER, SaaSRole.SAAS_STAFF]
    
    def is_company_owner(self) -> bool:
        """Check if user is company owner"""
        return self.company_role == CompanyRole.COMPANY_OWNER
    
    def has_company_access(self) -> bool:
        """Check if user has access to a company context"""
        return self.company_id is not None and self.company_role is not None


# ========== CONTEXT EXTRACTION ==========

async def get_current_user_context(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> CurrentUserContext:
    """
    Extract complete user context from JWT token.
    
    The token should contain:
    - sub: user_id
    - saas_role: Optional[SaaSRole]
    - company_role: Optional[CompanyRole]
    - company_id: Optional[int]
    - scope: "saas" or "company"
    
    Returns CurrentUserContext with all extracted information.
    """
    try:
        payload = decode_token(token)
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: sub não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        # Extract context from token payload
        saas_role_str = payload.get("saas_role")
        company_role_str = payload.get("company_role")
        company_id = payload.get("company_id")
        scope_str = payload.get("scope", "company")
        
        # Parse enums
        saas_role = None
        if saas_role_str:
            try:
                saas_role = SaaSRole(saas_role_str)
            except ValueError:
                pass
        
        company_role = None
        if company_role_str:
            try:
                company_role = CompanyRole(company_role_str)
            except ValueError:
                pass
        
        scope = Scope(scope_str) if scope_str in ["saas", "company"] else Scope.COMPANY
        
        # If company_id is in token but not company_role, try to get from CompanyUser
        if company_id and not company_role:
            company_user = db.query(CompanyUser).filter(
                CompanyUser.user_id == user.id,
                CompanyUser.company_id == company_id
            ).first()
            if company_user:
                try:
                    company_role = CompanyRole(company_user.role)
                except ValueError:
                    # Fallback to COMPANY_OWNER if role doesn't match enum
                    company_role = CompanyRole.COMPANY_OWNER
        
        # If no company_id in token but user has company_id, use it
        if not company_id and user.company_id:
            company_id = user.company_id
        
        return CurrentUserContext(
            user_id=user.id,
            email=user.email,
            saas_role=saas_role,
            company_role=company_role,
            company_id=company_id,
            scope=scope
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Erro ao extrair contexto do usuário: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ========== DEPENDENCIES FOR SAAS ROLES ==========

def require_saas_roles(allowed_roles: List[SaaSRole]):
    """
    Dependency to require specific SaaS roles.
    
    Usage:
        @router.get("/saas-admin/companies")
        async def list_companies(
            context: CurrentUserContext = Depends(require_saas_roles([SaaSRole.SAAS_OWNER, SaaSRole.SAAS_STAFF]))
        ):
            ...
    """
    async def check_saas_role(context: CurrentUserContext = Depends(get_current_user_context)):
        if not context.saas_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: requer role de SaaS Admin"
            )
        
        if context.saas_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado: requer uma das roles: {[r.value for r in allowed_roles]}"
            )
        
        return context
    
    return check_saas_role


# Shortcuts for common SaaS role checks
require_saas_owner = require_saas_roles([SaaSRole.SAAS_OWNER])
require_saas_admin = require_saas_roles([SaaSRole.SAAS_OWNER, SaaSRole.SAAS_STAFF])


# ========== DEPENDENCIES FOR COMPANY ROLES ==========

def require_company_roles(allowed_roles: List[CompanyRole]):
    """
    Dependency to require specific company roles.
    
    Usage:
        @router.get("/companies/{company_id}/settings")
        async def get_settings(
            company_id: int,
            context: CurrentUserContext = Depends(require_company_roles([CompanyRole.COMPANY_OWNER]))
        ):
            ...
    """
    async def check_company_role(context: CurrentUserContext = Depends(get_current_user_context)):
        if not context.has_company_access():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado: requer contexto de empresa"
            )
        
        if context.company_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado: requer uma das roles: {[r.value for r in allowed_roles]}"
            )
        
        return context
    
    return check_company_role


# Shortcuts for common company role checks
require_company_owner = require_company_roles([CompanyRole.COMPANY_OWNER])
require_company_manager = require_company_roles([
    CompanyRole.COMPANY_OWNER,
    CompanyRole.COMPANY_MANAGER
])


# ========== DEPENDENCY FOR COMPANY SCOPE ==========

def require_company_scope():
    """
    Dependency to ensure the request is in company scope.
    
    This ensures:
    1. The token has company_id set
    2. The scope is "company"
    3. All queries should filter by company_id
    
    Usage:
        @router.get("/appointments")
        async def list_appointments(
            context: CurrentUserContext = Depends(require_company_scope()),
            db: Session = Depends(get_db)
        ):
            # All queries MUST filter by context.company_id
            appointments = db.query(Appointment).filter(
                Appointment.company_id == context.company_id
            ).all()
            ...
    """
    async def check_company_scope(context: CurrentUserContext = Depends(get_current_user_context)):
        if context.scope != Scope.COMPANY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Esta rota requer contexto de empresa"
            )
        
        if not context.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="company_id não encontrado no token"
            )
        
        return context
    
    return check_company_scope


# ========== LEGACY COMPATIBILITY ==========

async def get_current_user_legacy(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Legacy compatibility: returns User object instead of CurrentUserContext.
    
    Use this only for routes that haven't been migrated yet.
    """
    return current_user
