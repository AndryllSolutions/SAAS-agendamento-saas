"""
SubscriptionService - Gerenciamento de Assinaturas
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.company_subscription import CompanySubscription
from app.models.plan import Plan
from app.services.plan_service import PlanService


class SubscriptionService:
    """Serviço para gerenciar assinaturas de empresas"""
    
    @staticmethod
    def upgrade_plan(
        db: Session,
        company: Company,
        new_plan_slug: str,
        immediate: bool = True
    ) -> CompanySubscription:
        """
        Faz upgrade do plano da empresa.
        
        Args:
            company: Empresa
            new_plan_slug: Slug do novo plano
            immediate: Se True, aplica imediatamente. Se False, aplica no próximo ciclo.
        """
        new_plan = PlanService.get_plan_by_slug(db, new_plan_slug)
        
        if not new_plan:
            raise ValueError(f"Plano '{new_plan_slug}' não encontrado")
        
        current_plan = PlanService.get_company_current_plan(db, company)
        
        # Verificar se é upgrade ou downgrade
        is_upgrade = new_plan.price_monthly > (current_plan.price_monthly if current_plan else 0)
        
        # Atualizar company
        company.subscription_plan = new_plan.slug.upper()
        company.subscription_plan_id = new_plan.id
        
        if immediate:
            company.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
        
        # Buscar ou criar CompanySubscription
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company.id
        ).first()
        
        if not subscription:
            subscription = CompanySubscription(
                company_id=company.id,
                plan_type=new_plan.slug.upper(),
                plan_id=new_plan.id,
                is_active=True
            )
            db.add(subscription)
        else:
            subscription.plan_type = new_plan.slug.upper()
            subscription.plan_id = new_plan.id
            subscription.is_active = True
        
        if immediate:
            subscription.trial_end_date = None
            subscription.next_billing_date = datetime.utcnow() + timedelta(days=30)
        
        db.commit()
        db.refresh(subscription)
        
        return subscription
    
    @staticmethod
    def downgrade_plan(
        db: Session,
        company: Company,
        new_plan_slug: str
    ) -> CompanySubscription:
        """
        Faz downgrade do plano da empresa.
        
        IMPORTANTE: Verifica se empresa está dentro dos limites do novo plano.
        """
        new_plan = PlanService.get_plan_by_slug(db, new_plan_slug)
        
        if not new_plan:
            raise ValueError(f"Plano '{new_plan_slug}' não encontrado")
        
        # Verificar limites
        from sqlalchemy import func
        from app.models.user import User
        
        professionals_count = db.query(func.count(User.id)).filter(
            User.company_id == company.id,
            User.is_active == True
        ).scalar() or 0
        
        if not new_plan.is_unlimited_professionals() and professionals_count > new_plan.max_professionals:
            raise ValueError(
                f"Não é possível fazer downgrade. "
                f"Você tem {professionals_count} profissionais, "
                f"mas o plano {new_plan.name} permite apenas {new_plan.max_professionals}."
            )
        
        # TODO: Verificar unidades
        
        # Aplicar downgrade
        return SubscriptionService.upgrade_plan(db, company, new_plan_slug, immediate=False)
    
    @staticmethod
    def cancel_subscription(db: Session, company: Company) -> None:
        """Cancela assinatura da empresa"""
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company.id
        ).first()
        
        if subscription:
            subscription.is_active = False
            subscription.auto_renew = False
        
        company.is_active = False
        
        db.commit()

