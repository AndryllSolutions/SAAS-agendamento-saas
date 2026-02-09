"""
LimitValidator - Validação de Limites por Plano
"""
from typing import Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.company import Company
from app.models.user import User
from app.services.plan_service import PlanService


class LimitValidator:
    """Validador de limites por plano"""
    
    @staticmethod
    def check_professionals_limit(db: Session, company: Company) -> Tuple[bool, str]:
        """
        Verifica se a empresa pode adicionar mais profissionais.
        
        Returns:
            (pode_adicionar: bool, mensagem: str)
        """
        plan = PlanService.get_company_current_plan(db, company)
        
        if not plan:
            return False, "Plano não encontrado"
        
        # Se ilimitado, libera
        if plan.is_unlimited_professionals():
            return True, ""
        
        # Contar profissionais existentes
        current_count = db.query(func.count(User.id)).filter(
            User.company_id == company.id,
            User.is_active == True,
            User.role == 'PROFESSIONAL'
        ).scalar() or 0
        
        # Verificar limite
        if current_count >= plan.max_professionals:
            return False, (
                f"Limite de profissionais atingido. "
                f"Seu plano {plan.name} permite até {plan.max_professionals} profissionais. "
                f"Faça upgrade para adicionar mais."
            )
        
        return True, ""
    
    @staticmethod
    def check_units_limit(db: Session, company: Company) -> Tuple[bool, str]:
        """
        Verifica se a empresa pode adicionar mais unidades.
        
        Returns:
            (pode_adicionar: bool, mensagem: str)
        """
        plan = PlanService.get_company_current_plan(db, company)
        
        if not plan:
            return False, "Plano não encontrado"
        
        # Se ilimitado, libera
        if plan.is_unlimited_units():
            return True, ""
        
        # TODO: Implementar modelo CompanyUnit para multi-unidade (Fase 6)
        # Quando implementado:
        # from app.models.company_unit import CompanyUnit
        # current_count = db.query(func.count(CompanyUnit.id)).filter(
        #     CompanyUnit.company_id == company.id,
        #     CompanyUnit.is_active == True
        # ).scalar() or 0
        
        # Por enquanto, cada empresa tem 1 unidade por padrão
        # Empresas com add-on "Unidade Extra" terão contagem baseada em company_addons
        current_count = 1
        
        # Verificar limite
        if current_count >= plan.max_units:
            return False, (
                f"Limite de unidades atingido. "
                f"Seu plano {plan.name} permite até {plan.max_units} unidade(s). "
                f"Faça upgrade ou contrate o add-on 'Unidade Extra'."
            )
        
        return True, ""
    
    @staticmethod
    def get_current_usage(db: Session, company: Company) -> dict:
        """
        Retorna o uso atual de recursos da empresa.
        
        Returns:
            {
                "professionals": {"current": 3, "limit": 5, "percentage": 60},
                "units": {"current": 1, "limit": 1, "percentage": 100}
            }
        """
        plan = PlanService.get_company_current_plan(db, company)
        
        if not plan:
            return {}
        
        # Profissionais
        professionals_count = db.query(func.count(User.id)).filter(
            User.company_id == company.id,
            User.is_active == True
        ).scalar() or 0
        
        professionals_limit = plan.max_professionals
        professionals_percentage = (
            (professionals_count / professionals_limit * 100)
            if professionals_limit > 0
            else 0
        )
        
        # Unidades
        units_count = 1  # TODO: implementar contagem real
        units_limit = plan.max_units
        units_percentage = (
            (units_count / units_limit * 100)
            if units_limit > 0
            else 0
        )
        
        return {
            "professionals": {
                "current": professionals_count,
                "limit": professionals_limit if professionals_limit > 0 else "Ilimitado",
                "percentage": professionals_percentage if professionals_limit > 0 else 0,
                "can_add": plan.is_unlimited_professionals() or professionals_count < professionals_limit
            },
            "units": {
                "current": units_count,
                "limit": units_limit if units_limit > 0 else "Ilimitado",
                "percentage": units_percentage if units_limit > 0 else 0,
                "can_add": plan.is_unlimited_units() or units_count < units_limit
            }
        }

