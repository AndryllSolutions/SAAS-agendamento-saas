"""
PlanService - Gerenciamento de Planos
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.plan import Plan
from app.models.company import Company


class PlanService:
    """Serviço centralizado para gerenciar planos"""
    
    @staticmethod
    def get_all_active_plans(db: Session) -> List[Plan]:
        """Retorna todos os planos ativos, ordenados por display_order"""
        return db.query(Plan).filter(
            Plan.is_active == True,
            Plan.is_visible == True
        ).order_by(Plan.display_order).all()
    
    @staticmethod
    def get_plan_by_slug(db: Session, slug: str) -> Optional[Plan]:
        """Busca plano por slug"""
        return db.query(Plan).filter(
            Plan.slug == slug,
            Plan.is_active == True
        ).first()
    
    @staticmethod
    def get_plan_by_id(db: Session, plan_id: int) -> Optional[Plan]:
        """Busca plano por ID"""
        return db.query(Plan).filter(
            Plan.id == plan_id,
            Plan.is_active == True
        ).first()
    
    @staticmethod
    def get_company_current_plan(db: Session, company: Company) -> Optional[Plan]:
        """Retorna o plano atual da empresa"""
        if company.subscription_plan_id:
            return PlanService.get_plan_by_id(db, company.subscription_plan_id)
        
        # Fallback: buscar por subscription_plan (string)
        if company.subscription_plan:
            slug = company.subscription_plan.lower()
            return PlanService.get_plan_by_slug(db, slug)
        
        # Padrão: ESSENCIAL
        return PlanService.get_plan_by_slug(db, 'essencial')
    
    @staticmethod
    def check_feature_access(db: Session, company: Company, feature: str) -> bool:
        """
        Verifica se a empresa tem acesso a uma feature.
        
        Lógica:
        1. Verifica plano atual
        2. Verifica add-ons ativos
        """
        plan = PlanService.get_company_current_plan(db, company)
        
        if not plan:
            return False
        
        # Verifica se a feature está no plano
        if plan.has_feature(feature):
            return True
        
        # Verificar add-ons ativos da empresa
        from app.models.addon import CompanyAddOn, AddOn
        
        active_addons = db.query(CompanyAddOn).filter(
            CompanyAddOn.company_id == company.id,
            CompanyAddOn.is_active == True
        ).all()
        
        for company_addon in active_addons:
            addon = db.query(AddOn).filter(AddOn.id == company_addon.addon_id).first()
            if addon and addon.unlocks_features:
                if feature in addon.unlocks_features:
                    return True
        
        return False
    
    @staticmethod
    def get_required_plan_for_feature(feature: str) -> str:
        """Retorna o plano mínimo necessário para uma feature"""
        feature_to_plan = {
            # ESSENCIAL
            "clients": "essencial",
            "services": "essencial",
            "products": "essencial",
            "appointments": "essencial",
            "commands": "essencial",
            "financial_basic": "essencial",
            "reports_basic": "essencial",
            
            # PRO
            "financial_complete": "pro",
            "reports_complete": "pro",
            "packages": "pro",
            "commissions": "pro",
            "goals": "pro",
            "anamneses": "pro",
            "purchases": "pro",
            "evaluations": "pro",
            "whatsapp_marketing": "pro",
            
            # PREMIUM
            "cashback": "premium",
            "promotions": "premium",
            "subscription_sales": "premium",
            "document_generator": "premium",
            "invoices": "premium",
            "online_booking": "premium",
            "pricing_intelligence": "premium",
            "advanced_reports": "premium",
            "professional_ranking": "premium",
            "client_funnel": "premium",
            
            # SCALE
            "crm_advanced": "scale",
            "automatic_campaigns": "scale",
            "multi_unit_reports": "scale",
            "priority_support": "scale",
            "programa_crescer": "scale",
        }
        
        # IMPORTANTE: Manter sincronizado com core/plans.py
        
        return feature_to_plan.get(feature, "essencial")

