"""
Company Configurations Schemas
Schemas para validação das configurações da empresa
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re

from app.models.company_configurations import (
    CompanyType,
    Language,
    Currency,
    Country
)


# ========== COMPANY DETAILS SCHEMAS ==========

class CompanyDetailsBase(BaseModel):
    """Base schema para detalhes da empresa"""
    company_type: CompanyType = CompanyType.pessoa_fisica
    document_number: Optional[str] = None
    company_name: Optional[str] = None
    municipal_registration: Optional[str] = None
    state_registration: Optional[str] = None
    
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    
    postal_code: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    
    @field_validator('document_number')
    @classmethod
    def validate_document(cls, v, info):
        """Valida CPF ou CNPJ"""
        if v:
            # Remove caracteres não numéricos
            clean_doc = re.sub(r'\D', '', v)
            
            # Validação básica de tamanho
            if len(clean_doc) not in [11, 14]:
                raise ValueError('Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)')
        
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Valida formato de email"""
        if v and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Email inválido')
        return v
    
    @field_validator('postal_code')
    @classmethod
    def validate_postal_code(cls, v):
        """Valida CEP"""
        if v:
            clean_cep = re.sub(r'\D', '', v)
            if len(clean_cep) != 8:
                raise ValueError('CEP deve ter 8 dígitos')
        return v


class CompanyDetailsCreate(CompanyDetailsBase):
    """Schema para criação de detalhes"""
    pass


class CompanyDetailsUpdate(BaseModel):
    """Schema para atualização de detalhes"""
    company_type: Optional[CompanyType] = None
    document_number: Optional[str] = None
    company_name: Optional[str] = None
    municipal_registration: Optional[str] = None
    state_registration: Optional[str] = None
    
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    
    postal_code: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None


class CompanyDetailsResponse(CompanyDetailsBase):
    """Schema para resposta de detalhes"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== FINANCIAL SETTINGS SCHEMAS ==========

class CompanyFinancialSettingsBase(BaseModel):
    """Base schema para configurações financeiras"""
    allow_retroactive_entries: bool = False
    allow_invoice_edit_after_conference: bool = False
    edit_only_value_after_conference: bool = True
    allow_operations_with_closed_cash: bool = False
    require_category_on_transaction: bool = True
    require_payment_form_on_transaction: bool = True


class CompanyFinancialSettingsUpdate(BaseModel):
    """Schema para atualização de configurações financeiras"""
    allow_retroactive_entries: Optional[bool] = None
    allow_invoice_edit_after_conference: Optional[bool] = None
    edit_only_value_after_conference: Optional[bool] = None
    allow_operations_with_closed_cash: Optional[bool] = None
    require_category_on_transaction: Optional[bool] = None
    require_payment_form_on_transaction: Optional[bool] = None


class CompanyFinancialSettingsResponse(CompanyFinancialSettingsBase):
    """Schema para resposta de configurações financeiras"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== NOTIFICATION SETTINGS SCHEMAS ==========

class CompanyNotificationSettingsBase(BaseModel):
    """Base schema para configurações de notificações"""
    notify_new_appointment: bool = True
    notify_appointment_cancellation: bool = True
    notify_appointment_deletion: bool = True
    notify_new_review: bool = True
    notify_sms_response: bool = False
    notify_client_return: bool = True
    notify_goal_achievement: bool = True
    notify_client_waiting: bool = True
    notification_sound_enabled: bool = True
    notification_duration_seconds: int = Field(default=5, ge=1, le=30)


class CompanyNotificationSettingsUpdate(BaseModel):
    """Schema para atualização de configurações de notificações"""
    notify_new_appointment: Optional[bool] = None
    notify_appointment_cancellation: Optional[bool] = None
    notify_appointment_deletion: Optional[bool] = None
    notify_new_review: Optional[bool] = None
    notify_sms_response: Optional[bool] = None
    notify_client_return: Optional[bool] = None
    notify_goal_achievement: Optional[bool] = None
    notify_client_waiting: Optional[bool] = None
    notification_sound_enabled: Optional[bool] = None
    notification_duration_seconds: Optional[int] = Field(None, ge=1, le=30)


class CompanyNotificationSettingsResponse(CompanyNotificationSettingsBase):
    """Schema para resposta de configurações de notificações"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== THEME SETTINGS SCHEMAS ==========

class CompanyThemeSettingsBase(BaseModel):
    """Base schema para configurações de tema"""
    interface_language: Language = Language.pt_BR
    sidebar_color: str = Field(default="#6366f1", pattern=r'^#[0-9A-Fa-f]{6}$')
    theme_mode: str = Field(default="light", pattern=r'^(light|dark|auto)$')
    custom_logo_url: Optional[str] = None
    
    @field_validator('sidebar_color')
    @classmethod
    def validate_color(cls, v):
        """Valida formato de cor hexadecimal"""
        if v and not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError('Cor deve estar no formato #RRGGBB')
        return v


class CompanyThemeSettingsUpdate(BaseModel):
    """Schema para atualização de configurações de tema"""
    interface_language: Optional[Language] = None
    sidebar_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    theme_mode: Optional[str] = Field(None, pattern=r'^(light|dark|auto)$')
    custom_logo_url: Optional[str] = None


class CompanyThemeSettingsResponse(CompanyThemeSettingsBase):
    """Schema para resposta de configurações de tema"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== ADMIN SETTINGS SCHEMAS ==========

class CompanyAdminSettingsBase(BaseModel):
    """Base schema para configurações administrativas"""
    default_message_language: Language = Language.pt_BR
    currency: Currency = Currency.BRL
    country: Country = Country.BR
    timezone: str = "America/Sao_Paulo"
    date_format: str = "DD/MM/YYYY"
    time_format: str = "HH:mm"
    additional_settings: Optional[Dict[str, Any]] = None


class CompanyAdminSettingsUpdate(BaseModel):
    """Schema para atualização de configurações administrativas"""
    default_message_language: Optional[Language] = None
    currency: Optional[Currency] = None
    country: Optional[Country] = None
    timezone: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    additional_settings: Optional[Dict[str, Any]] = None


class CompanyAdminSettingsResponse(CompanyAdminSettingsBase):
    """Schema para resposta de configurações administrativas"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== COMBINED SCHEMAS ==========

class AllCompanySettings(BaseModel):
    """Schema combinado com todas as configurações"""
    details: Optional[CompanyDetailsResponse] = None
    financial: Optional[CompanyFinancialSettingsResponse] = None
    notifications: Optional[CompanyNotificationSettingsResponse] = None
    theme: Optional[CompanyThemeSettingsResponse] = None
    admin: Optional[CompanyAdminSettingsResponse] = None
