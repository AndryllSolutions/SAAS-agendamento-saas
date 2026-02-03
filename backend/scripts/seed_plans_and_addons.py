"""
Script para popular planos e add-ons no banco de dados
Executar: python scripts/seed_plans_and_addons.py
"""
import sys
from pathlib import Path

# Adicionar backend ao path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.models.plan import Plan
from app.models.addon import AddOn
from app.models.base import Base

def seed_plans(db: Session):
    """Popula tabela de planos"""
    
    print("Verificando planos existentes...")
    existing_plans = db.query(Plan).count()
    
    if existing_plans > 0:
        print(f"  {existing_plans} planos ja existem. Pulando seed de planos.")
        return
    
    print("Criando planos oficiais...")
    
    plans_data = [
        {
            "name": "Essencial",
            "slug": "essencial",
            "description": "Plano basico para iniciar seu negocio",
            "price_monthly": 89.00,
            "price_yearly": 890.00,  # 10% desconto anual
            "max_professionals": 2,
            "max_units": 1,
            "max_clients": -1,
            "max_appointments_per_month": -1,
            "features": [
                "clients",
                "services",
                "products",
                "appointments",
                "commands",
                "financial_basic",
                "reports_basic",
            ],
            "highlight_label": None,
            "display_order": 1,
            "color": "#10B981",
            "is_active": True,
            "is_visible": True,
            "trial_days": 14,
        },
        {
            "name": "Pro",
            "slug": "pro",
            "description": "Para negocios em crescimento",
            "price_monthly": 149.00,
            "price_yearly": 1490.00,
            "max_professionals": 5,
            "max_units": 1,
            "max_clients": -1,
            "max_appointments_per_month": -1,
            "features": [
                "clients",
                "services",
                "products",
                "appointments",
                "commands",
                "financial_complete",
                "reports_complete",
                "packages",
                "commissions",
                "goals",
                "anamneses",
                "purchases",
                "evaluations",
                "whatsapp_marketing",
            ],
            "highlight_label": "Mais Popular",
            "display_order": 2,
            "color": "#3B82F6",
            "is_active": True,
            "is_visible": True,
            "trial_days": 14,
        },
        {
            "name": "Premium",
            "slug": "premium",
            "description": "Funcionalidades avancadas para empresas consolidadas",
            "price_monthly": 249.00,
            "price_yearly": 2490.00,
            "max_professionals": 10,
            "max_units": 2,
            "max_clients": -1,
            "max_appointments_per_month": -1,
            "features": [
                "clients",
                "services",
                "products",
                "appointments",
                "commands",
                "financial_complete",
                "reports_complete",
                "packages",
                "commissions",
                "goals",
                "anamneses",
                "purchases",
                "evaluations",
                "whatsapp_marketing",
                "cashback",
                "promotions",
                "subscription_sales",
                "document_generator",
                "invoices",
                "online_booking",
                "pricing_intelligence",
                "advanced_reports",
                "professional_ranking",
                "client_funnel",
            ],
            "highlight_label": "Recomendado",
            "display_order": 3,
            "color": "#8B5CF6",
            "is_active": True,
            "is_visible": True,
            "trial_days": 14,
        },
        {
            "name": "Scale",
            "slug": "scale",
            "description": "Solucao enterprise sem limites",
            "price_monthly": 449.00,
            "price_yearly": 4490.00,
            "price_min": 399.00,
            "price_max": 499.00,
            "max_professionals": -1,  # Ilimitado
            "max_units": -1,  # Ilimitado
            "max_clients": -1,
            "max_appointments_per_month": -1,
            "features": [
                "clients",
                "services",
                "products",
                "appointments",
                "commands",
                "financial_complete",
                "reports_complete",
                "packages",
                "commissions",
                "goals",
                "anamneses",
                "purchases",
                "evaluations",
                "whatsapp_marketing",
                "cashback",
                "promotions",
                "subscription_sales",
                "document_generator",
                "invoices",
                "online_booking",
                "pricing_intelligence",
                "advanced_reports",
                "professional_ranking",
                "client_funnel",
                "crm_advanced",
                "automatic_campaigns",
                "multi_unit_reports",
                "priority_support",
                "programa_crescer",
            ],
            "highlight_label": "Enterprise",
            "display_order": 4,
            "color": "#F59E0B",
            "is_active": True,
            "is_visible": True,
            "trial_days": 14,
        },
    ]
    
    for plan_data in plans_data:
        plan = Plan(**plan_data)
        db.add(plan)
        print(f"  + {plan.name} (R$ {plan.price_monthly}/mes)")
    
    db.commit()
    print(f"4 planos criados com sucesso!")


def seed_addons(db: Session):
    """Popula tabela de add-ons"""
    
    print("\nVerificando add-ons existentes...")
    existing_addons = db.query(AddOn).count()
    
    if existing_addons > 0:
        print(f"  {existing_addons} add-ons ja existem. Pulando seed de add-ons.")
        return
    
    print("Criando add-ons oficiais...")
    
    addons_data = [
        {
            "name": "Precificacao Inteligente",
            "slug": "pricing-intelligence",
            "description": "IA para sugestao de precos baseada no mercado",
            "price_monthly": 49.00,
            "addon_type": "feature",
            "config": {"feature": "pricing_intelligence"},
            "unlocks_features": ["pricing_intelligence"],
            "icon": "TrendingUp",
            "color": "#10B981",
            "category": "analytics",
            "display_order": 1,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["premium", "scale"],
        },
        {
            "name": "Relatorios Avancados",
            "slug": "advanced-reports",
            "description": "Dashboards e relatorios personalizados",
            "price_monthly": 39.00,
            "addon_type": "feature",
            "config": {"feature": "advanced_reports"},
            "unlocks_features": ["advanced_reports", "professional_ranking", "client_funnel"],
            "icon": "BarChart3",
            "color": "#3B82F6",
            "category": "analytics",
            "display_order": 2,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["premium", "scale"],
        },
        {
            "name": "Metas & Bonificacao",
            "slug": "goals-commissions",
            "description": "Sistema de metas e comissoes para equipe",
            "price_monthly": 39.00,
            "addon_type": "feature",
            "config": {"feature": "goals"},
            "unlocks_features": ["goals", "commissions"],
            "icon": "Target",
            "color": "#F59E0B",
            "category": "operations",
            "display_order": 3,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["pro", "premium", "scale"],
        },
        {
            "name": "Marketing & Reativacao WhatsApp",
            "slug": "whatsapp-marketing",
            "description": "Campanhas automaticas e reativacao via WhatsApp",
            "price_monthly": 59.00,
            "addon_type": "feature",
            "config": {"feature": "automatic_campaigns"},
            "unlocks_features": ["whatsapp_marketing", "automatic_campaigns"],
            "icon": "MessageCircle",
            "color": "#25D366",
            "category": "marketing",
            "display_order": 4,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["scale"],
        },
        {
            "name": "Unidade Extra",
            "slug": "extra-unit",
            "description": "Adicione mais uma unidade ao seu plano",
            "price_monthly": 69.00,
            "addon_type": "limit_override",
            "config": {"limit_override": {"units": 1}},
            "override_limits": {"units": 1},
            "icon": "Building2",
            "color": "#8B5CF6",
            "category": "operations",
            "display_order": 5,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": [],
        },
        {
            "name": "Assinatura Digital",
            "slug": "digital-signature",
            "description": "Assinatura digital de documentos e contratos",
            "price_monthly": 19.00,
            "addon_type": "feature",
            "config": {"feature": "digital_signature"},
            "unlocks_features": ["digital_signature"],
            "icon": "FileSignature",
            "color": "#6366F1",
            "category": "operations",
            "display_order": 6,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": [],
        },
        {
            "name": "Anamnese Inteligente",
            "slug": "smart-anamnesis",
            "description": "Anamnese com IA para sugestoes personalizadas",
            "price_monthly": 29.00,
            "addon_type": "feature",
            "config": {"feature": "anamneses"},
            "unlocks_features": ["anamneses"],
            "icon": "ClipboardList",
            "color": "#EC4899",
            "category": "operations",
            "display_order": 7,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["pro", "premium", "scale"],
        },
        {
            "name": "Cashback & Fidelizacao",
            "slug": "cashback-loyalty",
            "description": "Programa de cashback e fidelidade para clientes",
            "price_monthly": 29.00,
            "addon_type": "feature",
            "config": {"feature": "cashback"},
            "unlocks_features": ["cashback", "promotions"],
            "icon": "Gift",
            "color": "#F43F5E",
            "category": "marketing",
            "display_order": 8,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["premium", "scale"],
        },
        {
            "name": "Fiscal Pro",
            "slug": "fiscal-pro",
            "description": "Emissao de notas fiscais e integracao com prefeitura",
            "price_monthly": 69.00,
            "addon_type": "feature",
            "config": {"feature": "invoices"},
            "unlocks_features": ["invoices", "fiscal_complete"],
            "icon": "Receipt",
            "color": "#0EA5E9",
            "category": "operations",
            "display_order": 9,
            "is_active": True,
            "is_visible": True,
            "included_in_plans": ["premium", "scale"],
        },
    ]
    
    for addon_data in addons_data:
        addon = AddOn(**addon_data)
        db.add(addon)
        print(f"  + {addon.name} (R$ {addon.price_monthly}/mes)")
    
    db.commit()
    print(f"9 add-ons criados com sucesso!")


def main():
    """Executa seed de planos e add-ons"""
    print("=" * 60)
    print("SEED: Planos e Add-ons")
    print("=" * 60)
    
    # Criar tabelas se nao existirem
    print("\nCriando tabelas (se necessario)...")
    Base.metadata.create_all(bind=engine)
    
    # Criar sessao
    db = SessionLocal()
    
    try:
        # Seed planos
        seed_plans(db)
        
        # Seed add-ons
        seed_addons(db)
        
        print("\n" + "=" * 60)
        print("SEED CONCLUIDO COM SUCESSO!")
        print("=" * 60)
        
        # Resumo
        plans_count = db.query(Plan).count()
        addons_count = db.query(AddOn).count()
        
        print(f"\nResumo:")
        print(f"  Planos no banco: {plans_count}")
        print(f"  Add-ons no banco: {addons_count}")
        
    except Exception as e:
        print(f"\nERRO durante seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
