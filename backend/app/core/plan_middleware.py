"""
Plan Middleware - Validação de Limites e Features
"""
from functools import wraps
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.company import Company
from app.services.limit_validator import LimitValidator
from app.services.plan_service import PlanService


def check_plan_limit(resource_type: str):
    """
    Decorator para verificar limites do plano antes de criar recurso.
    
    Uso:
        @check_plan_limit("professionals")
        async def create_professional(...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extrair db e current_user dos kwargs
            db: Session = kwargs.get('db')
            current_user: User = kwargs.get('current_user')
            
            if not db or not current_user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno: db ou current_user não encontrado"
                )
            
            # Buscar company
            company = db.query(Company).filter(Company.id == current_user.company_id).first()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Empresa não encontrada"
                )
            
            # Verificar limite baseado no tipo de recurso
            if resource_type == "professionals":
                can_add, message = LimitValidator.check_professionals_limit(db, company)
            elif resource_type == "units":
                can_add, message = LimitValidator.check_units_limit(db, company)
            else:
                # Recurso não tem limite
                can_add = True
                message = ""
            
            if not can_add:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=message
                )
            
            # Continuar execução
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def require_feature(feature: str):
    """
    Decorator para verificar se empresa tem acesso a uma feature.
    
    Uso:
        @require_feature("pricing_intelligence")
        async def get_pricing_report(...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            db: Session = kwargs.get('db')
            current_user: User = kwargs.get('current_user')
            
            if not db or not current_user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Erro interno: db ou current_user não encontrado"
                )
            
            company = db.query(Company).filter(Company.id == current_user.company_id).first()
            
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Empresa não encontrada"
                )
            
            # Verificar acesso
            has_access = PlanService.check_feature_access(db, company, feature)
            
            if not has_access:
                required_plan = PlanService.get_required_plan_for_feature(feature)
                
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Recurso '{feature}' não disponível no seu plano. Faça upgrade para {required_plan}."
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

