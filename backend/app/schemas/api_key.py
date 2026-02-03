"""
API Key Schemas
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class APIKeyBase(BaseModel):
    """Base API Key schema"""
    name: str = Field(..., min_length=3, max_length=100, description="Nome descritivo da API Key")
    description: Optional[str] = Field(None, description="Descrição detalhada do uso")
    scopes: Optional[List[str]] = Field(default=["appointments:read"], description="Permissões da API Key")
    expires_at: Optional[datetime] = Field(None, description="Data de expiração (null = nunca expira)")
    ip_whitelist: Optional[List[str]] = Field(None, description="Lista de IPs permitidos")


class APIKeyCreate(APIKeyBase):
    """Schema for creating an API Key"""
    pass


class APIKeyUpdate(BaseModel):
    """Schema for updating an API Key"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    scopes: Optional[List[str]] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    ip_whitelist: Optional[List[str]] = None


class APIKeyResponse(BaseModel):
    """Schema for API Key response (without the actual key)"""
    id: int
    company_id: int
    user_id: Optional[int]
    name: str
    key_prefix: str
    description: Optional[str]
    scopes: List[str]
    is_active: bool
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: int
    created_at: datetime
    updated_at: datetime
    
    @field_validator('scopes', mode='before')
    @classmethod
    def parse_scopes(cls, v):
        """Parse scopes from JSON string to list"""
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except:
                return []
        return v or []
    
    model_config = {
        "from_attributes": True
    }


class APIKeyCreatedResponse(APIKeyResponse):
    """Schema for API Key creation response (includes the full key once)"""
    api_key: str = Field(..., description="Full API key - SAVE THIS! It will only be shown once.")
    
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "company_id": 2,
                "name": "Integração WhatsApp",
                "key_prefix": "ak_live_",
                "api_key": "ak_live_1234567890abcdef1234567890abcdef",
                "description": "API Key para integração com WhatsApp Business",
                "scopes": ["appointments:read", "appointments:write"],
                "is_active": True,
                "expires_at": None,
                "last_used_at": None,
                "usage_count": 0,
                "created_at": "2025-12-13T18:00:00Z",
                "updated_at": "2025-12-13T18:00:00Z"
            }
        }
    }


# Available scopes
AVAILABLE_SCOPES = [
    # Appointments
    "appointments:read",
    "appointments:write",
    "appointments:delete",
    
    # Clients
    "clients:read",
    "clients:write",
    "clients:delete",
    
    # Services
    "services:read",
    "services:write",
    
    # Products
    "products:read",
    "products:write",
    
    # Professionals
    "professionals:read",
    
    # Commands
    "commands:read",
    "commands:write",
    
    # Packages
    "packages:read",
    "packages:write",
    
    # Financial
    "financial:read",
    
    # Leads
    "leads:read",
    "leads:write",
    "leads:delete",
    
    # Webhooks
    "webhooks:receive",
    
    # Wildcard (all permissions)
    "*"
]


class AvailableScopesResponse(BaseModel):
    """Schema for available scopes"""
    scopes: List[str] = AVAILABLE_SCOPES
    descriptions: dict = {
        "appointments:read": "Ler agendamentos",
        "appointments:write": "Criar e atualizar agendamentos",
        "appointments:delete": "Cancelar agendamentos",
        "clients:read": "Ler dados de clientes",
        "clients:write": "Criar e atualizar clientes",
        "clients:delete": "Excluir clientes",
        "services:read": "Ler serviços",
        "services:write": "Criar e atualizar serviços",
        "products:read": "Ler produtos",
        "products:write": "Criar e atualizar produtos",
        "professionals:read": "Ler profissionais",
        "commands:read": "Ler comandas",
        "commands:write": "Criar e atualizar comandas",
        "packages:read": "Ler pacotes",
        "packages:write": "Criar e atualizar pacotes",
        "financial:read": "Ler dados financeiros",
        "leads:read": "Ler leads",
        "leads:write": "Criar e atualizar leads",
        "leads:delete": "Excluir leads",
        "webhooks:receive": "Receber webhooks",
        "*": "Todas as permissões"
    }
