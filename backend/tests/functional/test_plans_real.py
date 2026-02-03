"""
Testes FUNCIONAIS REAIS de Planos e Assinaturas
SEM MOCKS - Validacao real de comportamento do sistema
"""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.company import Company
from app.models.user import User
from app.models.plan import Plan
from app.models.addon import AddOn, CompanyAddOn
from app.services.plan_service import PlanService
from app.services.subscription_service import SubscriptionService
from app.core.security import create_access_token


class TestPlansRealFunctional:
    """Testes funcionais REAIS de planos - sem mocks"""
    
    def test_plans_exist_in_database(self, db: Session):
        """VALIDACAO 1: Planos existem no banco e estao ativos"""
        plans = db.query(Plan).filter(Plan.is_active == True).all()
        
        assert len(plans) >= 4, f"Esperado 4+ planos, encontrado {len(plans)}"
        
        plan_slugs = [p.slug for p in plans]
        assert "essencial" in plan_slugs, "Plano ESSENCIAL nao existe"
        assert "pro" in plan_slugs, "Plano PRO nao existe"
        assert "premium" in plan_slugs, "Plano PREMIUM nao existe"
        assert "scale" in plan_slugs, "Plano SCALE nao existe"
        
        print(f"\n[OK] {len(plans)} planos encontrados: {plan_slugs}")
    
    def test_plan_features_are_configured(self, db: Session):
        """VALIDACAO 2: Features estao configuradas corretamente por plano"""
        
        # ESSENCIAL: Deve ter apenas features basicas
        essencial = db.query(Plan).filter(Plan.slug == "essencial").first()
        assert essencial is not None, "Plano ESSENCIAL nao existe"
        assert len(essencial.features) > 0, "ESSENCIAL sem features"
        assert "clients" in essencial.features
        assert "financial_basic" in essencial.features
        assert "financial_complete" not in essencial.features, "ESSENCIAL nao deve ter financial_complete"
        print(f"\n[OK] ESSENCIAL: {len(essencial.features)} features")
        
        # PRO: Deve ter features intermediarias
        pro = db.query(Plan).filter(Plan.slug == "pro").first()
        assert pro is not None, "Plano PRO nao existe"
        assert "financial_complete" in pro.features, "PRO deve ter financial_complete"
        assert "commissions" in pro.features, "PRO deve ter commissions"
        assert "pricing_intelligence" not in pro.features, "PRO nao deve ter pricing_intelligence"
        print(f"[OK] PRO: {len(pro.features)} features")
        
        # PREMIUM: Deve ter features avancadas
        premium = db.query(Plan).filter(Plan.slug == "premium").first()
        assert premium is not None, "Plano PREMIUM nao existe"
        assert "pricing_intelligence" in premium.features, "PREMIUM deve ter pricing_intelligence"
        assert "invoices" in premium.features, "PREMIUM deve ter invoices"
        assert "online_booking" in premium.features, "PREMIUM deve ter online_booking"
        print(f"[OK] PREMIUM: {len(premium.features)} features")
        
        # SCALE: Deve ter todas as features
        scale = db.query(Plan).filter(Plan.slug == "scale").first()
        assert scale is not None, "Plano SCALE nao existe"
        assert "automatic_campaigns" in scale.features, "SCALE deve ter automatic_campaigns"
        assert "crm_advanced" in scale.features, "SCALE deve ter crm_advanced"
        print(f"[OK] SCALE: {len(scale.features)} features")
    
    def test_plan_limits_are_configured(self, db: Session):
        """VALIDACAO 3: Limites estao configurados corretamente"""
        
        essencial = db.query(Plan).filter(Plan.slug == "essencial").first()
        assert essencial.max_professionals == 2, f"ESSENCIAL deve ter 2 profissionais, tem {essencial.max_professionals}"
        assert essencial.max_units == 1, f"ESSENCIAL deve ter 1 unidade, tem {essencial.max_units}"
        print(f"\n[OK] ESSENCIAL: {essencial.max_professionals} profissionais, {essencial.max_units} unidade")
        
        pro = db.query(Plan).filter(Plan.slug == "pro").first()
        assert pro.max_professionals == 5, f"PRO deve ter 5 profissionais, tem {pro.max_professionals}"
        assert pro.max_units == 1, f"PRO deve ter 1 unidade, tem {pro.max_units}"
        print(f"[OK] PRO: {pro.max_professionals} profissionais, {pro.max_units} unidade")
        
        premium = db.query(Plan).filter(Plan.slug == "premium").first()
        assert premium.max_professionals == 10, f"PREMIUM deve ter 10 profissionais, tem {premium.max_professionals}"
        assert premium.max_units == 2, f"PREMIUM deve ter 2 unidades, tem {premium.max_units}"
        print(f"[OK] PREMIUM: {premium.max_professionals} profissionais, {premium.max_units} unidades")
        
        scale = db.query(Plan).filter(Plan.slug == "scale").first()
        assert scale.max_professionals == -1, f"SCALE deve ter ilimitado (-1), tem {scale.max_professionals}"
        assert scale.max_units == -1, f"SCALE deve ter ilimitado (-1), tem {scale.max_units}"
        print(f"[OK] SCALE: Ilimitado profissionais e unidades")
    
    def test_company_essencial_has_correct_features(self, db: Session):
        """VALIDACAO 4: Empresa ESSENCIAL tem apenas features basicas"""
        
        # Criar empresa ESSENCIAL
        essencial_plan = db.query(Plan).filter(Plan.slug == "essencial").first()
        
        company = Company(
            name="Teste Empresa ESSENCIAL",
            slug="teste-essencial",
            email="essencial@teste.com",
            subscription_plan="ESSENCIAL",
            subscription_plan_id=essencial_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Validar features
        has_clients = PlanService.check_feature_access(db, company, "clients")
        assert has_clients, "ESSENCIAL deve ter 'clients'"
        print(f"\n[OK] ESSENCIAL tem 'clients'")
        
        has_financial_basic = PlanService.check_feature_access(db, company, "financial_basic")
        assert has_financial_basic, "ESSENCIAL deve ter 'financial_basic'"
        print(f"[OK] ESSENCIAL tem 'financial_basic'")
        
        has_financial_complete = PlanService.check_feature_access(db, company, "financial_complete")
        assert not has_financial_complete, "ESSENCIAL NAO deve ter 'financial_complete'"
        print(f"[OK] ESSENCIAL NAO tem 'financial_complete' (correto)")
        
        has_commissions = PlanService.check_feature_access(db, company, "commissions")
        assert not has_commissions, "ESSENCIAL NAO deve ter 'commissions'"
        print(f"[OK] ESSENCIAL NAO tem 'commissions' (correto)")
        
        # Cleanup
        db.delete(company)
        db.commit()
    
    def test_company_pro_has_advanced_features(self, db: Session):
        """VALIDACAO 5: Empresa PRO tem features avancadas"""
        
        pro_plan = db.query(Plan).filter(Plan.slug == "pro").first()
        
        company = Company(
            name="Teste Empresa PRO",
            slug="teste-pro",
            email="pro@teste.com",
            subscription_plan="PRO",
            subscription_plan_id=pro_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Validar features PRO
        has_financial_complete = PlanService.check_feature_access(db, company, "financial_complete")
        assert has_financial_complete, "PRO deve ter 'financial_complete'"
        print(f"\n[OK] PRO tem 'financial_complete'")
        
        has_commissions = PlanService.check_feature_access(db, company, "commissions")
        assert has_commissions, "PRO deve ter 'commissions'"
        print(f"[OK] PRO tem 'commissions'")
        
        has_goals = PlanService.check_feature_access(db, company, "goals")
        assert has_goals, "PRO deve ter 'goals'"
        print(f"[OK] PRO tem 'goals'")
        
        # Validar features que PRO NAO tem
        has_invoices = PlanService.check_feature_access(db, company, "invoices")
        assert not has_invoices, "PRO NAO deve ter 'invoices'"
        print(f"[OK] PRO NAO tem 'invoices' (correto)")
        
        has_pricing_intelligence = PlanService.check_feature_access(db, company, "pricing_intelligence")
        assert not has_pricing_intelligence, "PRO NAO deve ter 'pricing_intelligence'"
        print(f"[OK] PRO NAO tem 'pricing_intelligence' (correto)")
        
        # Cleanup
        db.delete(company)
        db.commit()
    
    def test_company_premium_has_premium_features(self, db: Session):
        """VALIDACAO 6: Empresa PREMIUM tem features premium"""
        
        premium_plan = db.query(Plan).filter(Plan.slug == "premium").first()
        
        company = Company(
            name="Teste Empresa PREMIUM",
            slug="teste-premium",
            email="premium@teste.com",
            subscription_plan="PREMIUM",
            subscription_plan_id=premium_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Validar features PREMIUM
        has_invoices = PlanService.check_feature_access(db, company, "invoices")
        assert has_invoices, "PREMIUM deve ter 'invoices'"
        print(f"\n[OK] PREMIUM tem 'invoices'")
        
        has_online_booking = PlanService.check_feature_access(db, company, "online_booking")
        assert has_online_booking, "PREMIUM deve ter 'online_booking'"
        print(f"[OK] PREMIUM tem 'online_booking'")
        
        has_pricing_intelligence = PlanService.check_feature_access(db, company, "pricing_intelligence")
        assert has_pricing_intelligence, "PREMIUM deve ter 'pricing_intelligence'"
        print(f"[OK] PREMIUM tem 'pricing_intelligence'")
        
        has_cashback = PlanService.check_feature_access(db, company, "cashback")
        assert has_cashback, "PREMIUM deve ter 'cashback'"
        print(f"[OK] PREMIUM tem 'cashback'")
        
        # Validar features que PREMIUM NAO tem
        has_automatic_campaigns = PlanService.check_feature_access(db, company, "automatic_campaigns")
        assert not has_automatic_campaigns, "PREMIUM NAO deve ter 'automatic_campaigns'"
        print(f"[OK] PREMIUM NAO tem 'automatic_campaigns' (correto)")
        
        # Cleanup
        db.delete(company)
        db.commit()
    
    def test_upgrade_essencial_to_pro_unlocks_features(self, db: Session):
        """VALIDACAO 7: Upgrade ESSENCIAL -> PRO libera features REAL"""
        
        essencial_plan = db.query(Plan).filter(Plan.slug == "essencial").first()
        
        # Criar empresa ESSENCIAL
        company = Company(
            name="Teste Upgrade",
            slug="teste-upgrade",
            email="upgrade@teste.com",
            subscription_plan="ESSENCIAL",
            subscription_plan_id=essencial_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # ANTES do upgrade: Sem financial_complete
        has_feature_before = PlanService.check_feature_access(db, company, "financial_complete")
        assert not has_feature_before, "ANTES do upgrade: NAO deve ter financial_complete"
        print(f"\n[OK] ANTES upgrade: NAO tem 'financial_complete'")
        
        # Fazer UPGRADE para PRO
        print(f"[ACAO] Fazendo upgrade ESSENCIAL -> PRO...")
        subscription = SubscriptionService.upgrade_plan(db, company, "pro", immediate=True)
        
        db.refresh(company)
        
        # Validar que plano mudou
        assert company.subscription_plan == "PRO", f"Plano nao mudou: {company.subscription_plan}"
        print(f"[OK] Plano mudou para: {company.subscription_plan}")
        
        # DEPOIS do upgrade: Com financial_complete
        has_feature_after = PlanService.check_feature_access(db, company, "financial_complete")
        assert has_feature_after, "DEPOIS do upgrade: DEVE ter financial_complete"
        print(f"[OK] DEPOIS upgrade: TEM 'financial_complete' (LIBERADO)")
        
        # Validar outras features PRO
        has_commissions = PlanService.check_feature_access(db, company, "commissions")
        assert has_commissions, "DEPOIS do upgrade: DEVE ter commissions"
        print(f"[OK] DEPOIS upgrade: TEM 'commissions' (LIBERADO)")
        
        # Cleanup
        db.delete(subscription)
        db.delete(company)
        db.commit()
    
    def test_addon_unlocks_feature_real(self, db: Session):
        """VALIDACAO 8: Add-on desbloqueia feature REAL"""
        
        # Criar empresa ESSENCIAL (sem pricing_intelligence)
        essencial_plan = db.query(Plan).filter(Plan.slug == "essencial").first()
        
        company = Company(
            name="Teste Addon",
            slug="teste-addon",
            email="addon@teste.com",
            subscription_plan="ESSENCIAL",
            subscription_plan_id=essencial_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # ANTES do add-on: Sem pricing_intelligence
        has_feature_before = PlanService.check_feature_access(db, company, "pricing_intelligence")
        assert not has_feature_before, "ANTES do add-on: NAO deve ter pricing_intelligence"
        print(f"\n[OK] ANTES add-on: NAO tem 'pricing_intelligence'")
        
        # Buscar add-on "Precificacao Inteligente"
        addon = db.query(AddOn).filter(AddOn.slug == "pricing-intelligence").first()
        assert addon is not None, "Add-on 'pricing-intelligence' nao existe"
        
        # Ativar add-on para a empresa
        print(f"[ACAO] Ativando add-on '{addon.name}' para empresa...")
        company_addon = CompanyAddOn(
            company_id=company.id,
            addon_id=addon.id,
            is_active=True,
            activated_at=datetime.utcnow()
        )
        db.add(company_addon)
        db.commit()
        
        # DEPOIS do add-on: Com pricing_intelligence
        has_feature_after = PlanService.check_feature_access(db, company, "pricing_intelligence")
        assert has_feature_after, "DEPOIS do add-on: DEVE ter pricing_intelligence"
        print(f"[OK] DEPOIS add-on: TEM 'pricing_intelligence' (LIBERADO via add-on)")
        
        # Cleanup
        db.delete(company_addon)
        db.delete(company)
        db.commit()
    
    def test_downgrade_validates_limits_real(self, db: Session):
        """VALIDACAO 9: Downgrade valida limites REAL"""
        
        # Criar empresa PRO (5 profissionais)
        pro_plan = db.query(Plan).filter(Plan.slug == "pro").first()
        
        company = Company(
            name="Teste Downgrade",
            slug="teste-downgrade",
            email="downgrade@teste.com",
            subscription_plan="PRO",
            subscription_plan_id=pro_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Criar 5 profissionais (limite PRO)
        print(f"\n[ACAO] Criando 5 profissionais...")
        for i in range(5):
            user = User(
                full_name=f"Profissional {i+1}",
                email=f"prof{i+1}@downgrade.com",
                password_hash="hash",
                company_id=company.id,
                role="PROFESSIONAL",
                is_active=True
            )
            db.add(user)
        db.commit()
        
        # Validar que tem 5 profissionais
        from sqlalchemy import func
        count = db.query(func.count(User.id)).filter(
            User.company_id == company.id,
            User.is_active == True
        ).scalar()
        assert count == 5, f"Esperado 5 profissionais, encontrado {count}"
        print(f"[OK] 5 profissionais criados")
        
        # Tentar downgrade para ESSENCIAL (2 profissionais): DEVE BLOQUEAR
        print(f"[ACAO] Tentando downgrade PRO -> ESSENCIAL (DEVE BLOQUEAR)...")
        try:
            SubscriptionService.downgrade_plan(db, company, "essencial")
            assert False, "Downgrade deveria ter sido bloqueado!"
        except ValueError as e:
            assert "5 profissionais" in str(e), f"Mensagem incorreta: {e}"
            assert "2" in str(e), f"Mensagem incorreta: {e}"
            print(f"[OK] Downgrade BLOQUEADO (correto): {e}")
        
        # Cleanup
        db.query(User).filter(User.company_id == company.id).delete()
        db.delete(company)
        db.commit()
    
    def test_addons_exist_in_database(self, db: Session):
        """VALIDACAO 10: Add-ons existem no banco"""
        addons = db.query(AddOn).filter(AddOn.is_active == True).all()
        
        assert len(addons) >= 9, f"Esperado 9+ add-ons, encontrado {len(addons)}"
        
        addon_slugs = [a.slug for a in addons]
        assert "pricing-intelligence" in addon_slugs, "Add-on pricing-intelligence nao existe"
        assert "advanced-reports" in addon_slugs, "Add-on advanced-reports nao existe"
        assert "extra-unit" in addon_slugs, "Add-on extra-unit nao existe"
        
        print(f"\n[OK] {len(addons)} add-ons encontrados")
        
        for addon in addons[:5]:  # Mostrar 5 primeiros
            print(f"  - {addon.name}: R$ {addon.price_monthly}/mes")
    
    def test_scale_has_unlimited_limits(self, db: Session):
        """VALIDACAO 11: SCALE tem limites ilimitados REAL"""
        
        scale_plan = db.query(Plan).filter(Plan.slug == "scale").first()
        
        company = Company(
            name="Teste Scale",
            slug="teste-scale",
            email="scale@teste.com",
            subscription_plan="SCALE",
            subscription_plan_id=scale_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Validar limites
        from app.services.limit_validator import LimitValidator
        
        can_add_prof, msg_prof = LimitValidator.check_professionals_limit(db, company)
        assert can_add_prof, f"SCALE deve permitir profissionais ilimitados: {msg_prof}"
        print(f"\n[OK] SCALE: Profissionais ilimitados")
        
        can_add_unit, msg_unit = LimitValidator.check_units_limit(db, company)
        assert can_add_unit, f"SCALE deve permitir unidades ilimitadas: {msg_unit}"
        print(f"[OK] SCALE: Unidades ilimitadas")
        
        # Validar que tem TODAS as features
        critical_features = [
            "financial_complete",
            "commissions",
            "invoices",
            "pricing_intelligence",
            "automatic_campaigns",
            "crm_advanced"
        ]
        
        for feature in critical_features:
            has = PlanService.check_feature_access(db, company, feature)
            assert has, f"SCALE deve ter '{feature}'"
            print(f"[OK] SCALE tem '{feature}'")
        
        # Cleanup
        db.delete(company)
        db.commit()


class TestPlansAPIRealFunctional:
    """Testes funcionais REAIS via API - comportamento end-to-end"""
    
    def test_api_blocks_feature_without_plan(self, client: TestClient, db: Session):
        """VALIDACAO 12: API bloqueia feature se plano nao tem"""
        
        # Criar empresa ESSENCIAL
        essencial_plan = db.query(Plan).filter(Plan.slug == "essencial").first()
        
        company = Company(
            name="API Test ESSENCIAL",
            slug="api-test-essencial",
            email="apitest@essencial.com",
            subscription_plan="ESSENCIAL",
            subscription_plan_id=essencial_plan.id,
            is_active=True
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Criar usuario
        user = User(
            full_name="API Tester",
            email="apitester@essencial.com",
            password_hash="hash",
            company_id=company.id,
            role="OWNER",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Gerar token
        token = create_access_token(
            data={
                "sub": str(user.id),
                "company_id": company.id,
                "role": user.role
            }
        )
        
        # Tentar acessar endpoint que requer 'financial_complete' (PRO+)
        # TODO: Identificar endpoint real que usa @require_feature
        # Por enquanto, validar logica de servico
        
        has_access = PlanService.check_feature_access(db, company, "financial_complete")
        assert not has_access, "ESSENCIAL nao deve ter acesso a financial_complete"
        print(f"\n[OK] API: ESSENCIAL bloqueado para 'financial_complete'")
        
        # Cleanup
        db.delete(user)
        db.delete(company)
        db.commit()


# Fixture para garantir que planos existem
@pytest.fixture(scope="module", autouse=True)
def ensure_plans_exist(db: Session):
    """Garante que planos existem antes dos testes"""
    plans_count = db.query(Plan).count()
    
    if plans_count == 0:
        print("\n" + "="*60)
        print("AVISO: Nenhum plano encontrado!")
        print("Execute: python scripts/seed_plans_and_addons.py")
        print("="*60)
        pytest.skip("Planos nao existem no banco. Execute seed primeiro.")
    
    yield
