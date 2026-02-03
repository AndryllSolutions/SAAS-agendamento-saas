"""
Plan and Feature Flag System - ATENDO

Planos oficiais:
- ESSENCIAL: R$ 89/mês (2 profissionais, 1 unidade)
- PRO: R$ 149/mês (5 profissionais, 1 unidade)
- PREMIUM: R$ 249/mês (10 profissionais, 2 unidades)
- SCALE: R$ 399-499/mês (ilimitado)
"""
from typing import Dict, List
from app.models.company import Company

# Define which features each plan includes
PLAN_FEATURES: Dict[str, List[str]] = {
    "ESSENCIAL": [
        "clients",
        "services",
        "products",
        "appointments",
        "commands",
        "financial_basic",
        "reports_basic",
    ],
    "PRO": [
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
        "whatsapp_marketing",  # Marketing básico WhatsApp (confirmações, lembretes)
    ],
    "PREMIUM": [
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
    "SCALE": [
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
        "automatic_campaigns",  # Campanhas automáticas WhatsApp
        "multi_unit_reports",
        "priority_support",
        "programa_crescer",
    ],
}

# Feature to plan mapping (for quick lookup)
# IMPORTANTE: Manter sincronizado com services/plan_service.py
FEATURE_PLANS: Dict[str, str] = {
    # ESSENCIAL features
    "clients": "ESSENCIAL",
    "services": "ESSENCIAL",
    "products": "ESSENCIAL",
    "appointments": "ESSENCIAL",
    "commands": "ESSENCIAL",
    "financial_basic": "ESSENCIAL",
    "reports_basic": "ESSENCIAL",
    
    # PRO features
    "financial_complete": "PRO",
    "reports_complete": "PRO",
    "packages": "PRO",
    "commissions": "PRO",
    "goals": "PRO",
    "anamneses": "PRO",
    "purchases": "PRO",
    "evaluations": "PRO",
    "whatsapp_marketing": "PRO",
    
    # PREMIUM features
    "cashback": "PREMIUM",
    "promotions": "PREMIUM",
    "subscription_sales": "PREMIUM",
    "document_generator": "PREMIUM",
    "invoices": "PREMIUM",
    "online_booking": "PREMIUM",
    "pricing_intelligence": "PREMIUM",
    "advanced_reports": "PREMIUM",
    "professional_ranking": "PREMIUM",
    "client_funnel": "PREMIUM",
    
    # SCALE features
    "crm_advanced": "SCALE",
    "automatic_campaigns": "SCALE",
    "multi_unit_reports": "SCALE",
    "priority_support": "SCALE",
    "programa_crescer": "SCALE",
}


def check_feature_access(company: Company, feature: str) -> bool:
    """
    Check if company has access to a feature based on their plan
    
    Args:
        company: Company instance
        feature: Feature name to check
        
    Returns:
        True if company has access, False otherwise
    """
    plan = (company.subscription_plan or "ESSENCIAL").upper()
    
    # Normalize plan names (handle legacy BASIC -> ESSENCIAL)
    if plan == "BASIC":
        plan = "ESSENCIAL"
    
    # Check if feature is in plan features
    if plan in PLAN_FEATURES:
        return feature in PLAN_FEATURES[plan]
    
    # Default to ESSENCIAL if plan not found
    return feature in PLAN_FEATURES.get("ESSENCIAL", [])


def get_required_plan(feature: str) -> str:
    """
    Get the minimum plan required for a feature
    
    Args:
        feature: Feature name
        
    Returns:
        Minimum plan name (ESSENCIAL, PRO, PREMIUM, or SCALE)
    """
    return FEATURE_PLANS.get(feature, "ESSENCIAL")


def get_plan_features(plan: str) -> List[str]:
    """
    Get all features available for a plan
    
    Args:
        plan: Plan name
        
    Returns:
        List of feature names
    """
    plan_upper = plan.upper()
    if plan_upper == "BASIC":
        plan_upper = "ESSENCIAL"
    return PLAN_FEATURES.get(plan_upper, PLAN_FEATURES["ESSENCIAL"])

