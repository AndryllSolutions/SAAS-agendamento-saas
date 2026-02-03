"""
API Key Authentication Middleware
"""
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional, Annotated

from app.core.database import get_db
from app.models.api_key import APIKey
from app.models.company import Company
from app.models.user import User


class APIKeyAuth:
    """API Key authentication handler"""
    
    def __init__(self, required_scope: Optional[str] = None):
        self.required_scope = required_scope
    
    async def __call__(
        self,
        x_api_key: Annotated[Optional[str], Header()] = None,
        db: Session = Depends(get_db)
    ) -> tuple[APIKey, Company]:
        """
        Authenticate request using API Key
        
        Returns: (api_key, company)
        
        Usage:
            @router.get("/")
            async def endpoint(auth: tuple[APIKey, Company] = Depends(APIKeyAuth())):
                api_key, company = auth
                # Your code here
        """
        
        if not x_api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API Key missing. Include X-API-Key header.",
                headers={"WWW-Authenticate": "ApiKey"}
            )
        
        # Extract prefix for quick lookup
        if not x_api_key.startswith("ak_live_"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API Key format"
            )
        
        # Hash the provided key
        import hashlib
        key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
        
        # Find API key in database
        api_key = db.query(APIKey).filter(
            APIKey.key_hash == key_hash
        ).first()
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API Key"
            )
        
        # Check if key is valid (active and not expired)
        if not api_key.is_valid():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API Key expired or inactive"
            )
        
        # Check scope if required
        if self.required_scope and not api_key.has_scope(self.required_scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"API Key does not have required scope: {self.required_scope}"
            )
        
        # Get company
        company = db.query(Company).filter(
            Company.id == api_key.company_id
        ).first()
        
        if not company or not company.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company not found or inactive"
            )
        
        # Update usage statistics
        api_key.update_usage()
        db.commit()
        
        return api_key, company


# Convenience functions for common scopes
def require_api_key(scope: Optional[str] = None):
    """
    Require API Key authentication with optional scope
    
    Usage:
        @router.get("/")
        async def endpoint(
            auth: tuple[APIKey, Company] = Depends(require_api_key("appointments:read"))
        ):
            api_key, company = auth
            # Your code here
    """
    return APIKeyAuth(required_scope=scope)


def get_api_key_optional(
    x_api_key: Annotated[Optional[str], Header()] = None,
    db: Session = Depends(get_db)
) -> Optional[tuple[APIKey, Company]]:
    """
    Optional API Key authentication
    Returns None if no API key provided
    
    Usage:
        @router.get("/")
        async def endpoint(
            auth: Optional[tuple[APIKey, Company]] = Depends(get_api_key_optional)
        ):
            if auth:
                api_key, company = auth
                # Authenticated with API key
            else:
                # Not authenticated
    """
    if not x_api_key:
        return None
    
    try:
        return APIKeyAuth()(x_api_key=x_api_key, db=db)
    except HTTPException:
        return None

