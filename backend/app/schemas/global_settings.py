"""
Global Settings Schemas - Pydantic models for Global Settings API
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class GlobalSettingsBase(BaseModel):
    """Base schema for GlobalSettings"""
    key: str = Field(..., min_length=1, max_length=100, description="Chave única da configuração")
    category: str = Field(..., min_length=1, max_length=50, description="Categoria da configuração")
    value: Optional[str] = Field(None, description="Valor da configuração como texto")
    value_type: str = Field(default="string", description="Tipo do valor: string, number, boolean, json")
    description: Optional[str] = Field(None, description="Descrição da configuração")
    is_active: bool = Field(default=True, description="Se a configuração está ativa")
    is_public: bool = Field(default=False, description="Se pode ser acessada publicamente")
    requires_restart: bool = Field(default=False, description="Se requer restart do servidor")
    
    @field_validator('value_type')
    @classmethod
    def validate_value_type(cls, v):
        allowed_types = ['string', 'number', 'boolean', 'json']
        if v not in allowed_types:
            raise ValueError(f'value_type must be one of: {", ".join(allowed_types)}')
        return v
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = ['maintenance', 'security', 'notifications', 'limits', 'integrations', 'features', 'ui']
        if v not in allowed_categories:
            raise ValueError(f'category must be one of: {", ".join(allowed_categories)}')
        return v


class GlobalSettingsCreate(GlobalSettingsBase):
    """Schema for creating GlobalSettings"""
    pass


class GlobalSettingsUpdate(BaseModel):
    """Schema for updating GlobalSettings"""
    value: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    requires_restart: Optional[bool] = None


class GlobalSettingsResponse(GlobalSettingsBase):
    """Schema for GlobalSettings response"""
    id: int
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None
    created_at: datetime
    
    # Campo computado com valor parseado
    parsed_value: Optional[Any] = None
    
    model_config = {'from_attributes': True}


class GlobalSettingsPublic(BaseModel):
    """Schema para configurações públicas (sem dados sensíveis)"""
    key: str
    category: str
    value: Optional[Any]
    description: Optional[str]
    
    model_config = {'from_attributes': True}


class GlobalSettingsBatch(BaseModel):
    """Schema para atualização em lote"""
    settings: Dict[str, Any] = Field(..., description="Dicionário com configurações")


class GlobalSettingsCategoryResponse(BaseModel):
    """Schema para resposta por categoria"""
    category: str
    settings: List[GlobalSettingsResponse]
    total: int


class SystemStatusResponse(BaseModel):
    """Schema para status do sistema"""
    maintenance_mode: bool = False
    maintenance_message: Optional[str] = None
    system_version: str
    uptime_seconds: Optional[int] = None
    active_users: Optional[int] = None
    total_companies: Optional[int] = None
