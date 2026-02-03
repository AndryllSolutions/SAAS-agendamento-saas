"""
Feature Flags Decorator and Dependency
"""
from functools import wraps
from fastapi import HTTPException, status, Depends
from app.models.user import User
from app.models.company import Company
from app.core.security import get_current_active_user
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.plans import check_feature_access, get_required_plan


def require_feature(feature: str):
    """
    Decorator to require a specific feature based on company plan
    
    Usage:
        @router.get("/cashback")
        @require_feature("cashback")
        async def get_cashback(...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs
            current_user = None
            db = None
            
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                elif isinstance(value, Session):
                    db = value
            
            if not current_user or not db:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro ao verificar permissões"
                )
            
            # Get company
            company = db.query(Company).filter(
                Company.id == current_user.company_id
            ).first()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Empresa não encontrada"
                )
            
            # Check feature access
            if not check_feature_access(company, feature):
                required_plan = get_required_plan(feature)
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "message": "Funcionalidade não disponível no seu plano",
                        "feature": feature,
                        "current_plan": company.subscription_plan,
                        "required_plan": required_plan,
                        "upgrade_required": True
                    }
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def get_feature_checker(feature: str):
    """
    Dependency to check feature access
    
    Usage:
        @router.get("/cashback")
        async def get_cashback(
            current_user: User = Depends(get_current_active_user),
            db: Session = Depends(get_db),
            _: None = Depends(get_feature_checker("cashback"))
        ):
            ...
    """
    def check_feature(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ):
        company = db.query(Company).filter(
            Company.id == current_user.company_id
        ).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa não encontrada"
            )
        
        if not check_feature_access(company, feature):
            required_plan = get_required_plan(feature)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "Funcionalidade não disponível no seu plano",
                    "feature": feature,
                    "current_plan": company.subscription_plan,
                    "required_plan": required_plan,
                    "upgrade_required": True
                }
            )
        
        return None
    
    return check_feature

