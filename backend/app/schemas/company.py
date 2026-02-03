"""
Company Schemas
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime


class CompanyBase(BaseModel):
    """Base company schema"""
    name: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    description: Optional[str] = None


class CompanyCreate(CompanyBase):
    """Schema for creating a company"""
    slug: str = Field(..., min_length=3, max_length=100)
    timezone: str = "America/Sao_Paulo"
    currency: str = "BRL"


class CompanyUpdate(BaseModel):
    """Schema for updating a company"""
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = Field(None, max_length=2)  # Sigla do estado (SP, RJ, etc.)
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    features: Optional[Dict[str, bool]] = None
    settings: Optional[Dict[str, Any]] = None
    
    @field_validator('state')
    @classmethod
    def validate_state(cls, v):
        """Validate state is a 2-letter code"""
        if v and len(v) > 2:
            state_mapping = {
                'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM',
                'bahia': 'BA', 'ceará': 'CE', 'distrito federal': 'DF', 'espírito santo': 'ES',
                'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
                'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
                'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
                'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
                'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
            }
            v_lower = v.lower().strip()
            mapped = state_mapping.get(v_lower)
            if mapped:
                return mapped
            return v[:2].upper() if v else None
        return v.upper() if v else None


class CompanyResponse(CompanyBase):
    """Schema for company response"""
    id: int
    slug: str
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_hours: Optional[Dict[str, Any]] = None
    timezone: Optional[str] = "America/Sao_Paulo"
    currency: Optional[str] = "BRL"
    logo_url: Optional[str] = None
    primary_color: Optional[str] = "#3B82F6"  # Default blue color
    secondary_color: Optional[str] = "#10B981"  # Default green color
    is_active: bool
    subscription_plan: Optional[str] = "FREE"
    features: Optional[Dict[str, bool]] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CompanyManagementResponse(BaseModel):
    """Schema for company management response with metrics"""
    id: int
    name: str
    slug: str
    email: EmailStr
    subscription_plan: str
    subscription_expires_at: Optional[datetime]
    is_active: bool
    created_at: datetime
    user_count: int = 0
    appointment_count: int = 0
    revenue_total: float = 0.0
    status: str  # active, expired, trialing, suspended
    
    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    """Schema for SaaS analytics response"""
    # Company metrics
    total_companies: int
    active_companies: int
    trial_companies: int
    expired_companies: int
    
    # User metrics
    total_users: int = 0
    active_users: int = 0
    
    # Revenue metrics
    total_revenue: float = 0.0
    monthly_revenue: float = 0.0
    average_revenue_per_company: float = 0.0
    
    # Usage metrics
    total_appointments: int = 0
    monthly_appointments: int = 0
    
    # Growth metrics
    new_companies_this_month: int = 0
    churn_rate: float = 0.0
    
    model_config = ConfigDict(from_attributes=True)
