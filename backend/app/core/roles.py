"""
Role Enums - Two-Layer Architecture

This module defines the enums for the two-layer role architecture:
1. SaaSRole: Global SaaS roles (no company_id required)
2. CompanyRole: Company/tenant roles (requires company_id)
"""
from enum import Enum


class SaaSRole(str, Enum):
    """
    Global SaaS roles - Access to global admin panel.
    These roles do NOT require company_id.
    """
    SAAS_OWNER = "SAAS_OWNER"  # Root owner of the SaaS platform
    SAAS_STAFF = "SAAS_STAFF"  # Staff member with global access


class CompanyRole(str, Enum):
    """
    Company/Tenant roles - Access to company-specific features.
    These roles REQUIRE company_id.
    """
    COMPANY_OWNER = "COMPANY_OWNER"  # Owner of the company/tenant
    COMPANY_MANAGER = "COMPANY_MANAGER"  # Manager with full access
    COMPANY_OPERATOR = "COMPANY_OPERATOR"  # Operator with operational access
    COMPANY_PROFESSIONAL = "COMPANY_PROFESSIONAL"  # Professional/service provider
    COMPANY_RECEPTIONIST = "COMPANY_RECEPTIONIST"  # Receptionist
    COMPANY_FINANCE = "COMPANY_FINANCE"  # Financial manager
    COMPANY_CLIENT = "COMPANY_CLIENT"  # Client/customer
    COMPANY_READ_ONLY = "COMPANY_READ_ONLY"  # Read-only access

