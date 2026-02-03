"""
Online Booking Configuration Schemas
Schemas Pydantic para validação e serialização
"""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re


# ========== ENUMS ==========

class BookingFlowType(str):
    SERVICE_FIRST = "service_first"
    PROFESSIONAL_FIRST = "professional_first"


class ThemeType(str):
    LIGHT = "light"
    DARK = "dark"
    OPTIONAL = "optional"


# ========== BASE SCHEMAS ==========

class OnlineBookingConfigBase(BaseModel):
    """Base schema para configuração de agendamento online"""
    
    # Detalhes da empresa
    public_name: Optional[str] = None
    public_description: Optional[str] = None
    logo_url: Optional[str] = None
    
    # Endereço
    use_company_address: bool = True
    public_address: Optional[str] = None
    public_address_number: Optional[str] = None
    public_address_complement: Optional[str] = None
    public_neighborhood: Optional[str] = None
    public_city: Optional[str] = None
    public_state: Optional[str] = None
    public_postal_code: Optional[str] = None
    
    # Contatos
    public_whatsapp: Optional[str] = None
    public_phone: Optional[str] = None
    public_instagram: Optional[str] = None
    public_facebook: Optional[str] = None
    public_website: Optional[str] = None
    
    # Aparência
    primary_color: str = "#6366f1"
    theme: str = ThemeType.LIGHT
    
    # Fluxo
    booking_flow: str = BookingFlowType.SERVICE_FIRST
    
    # Login
    require_login: bool = False
    
    # Antecedência
    min_advance_time_minutes: int = 0
    
    # Cancelamento
    allow_cancellation: bool = True
    cancellation_min_hours: int = 24
    
    # Pagamento
    enable_payment_local: bool = True
    enable_payment_card: bool = False
    enable_payment_pix: bool = False
    enable_deposit_payment: bool = False
    deposit_percentage: float = 50.0
    
    # Status
    is_active: bool = True
    
    @field_validator('primary_color')
    @classmethod
    def validate_color(cls, v):
        """Valida formato de cor hexadecimal"""
        if v and not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError('Cor deve estar no formato #RRGGBB')
        return v
    
    @field_validator('deposit_percentage')
    @classmethod
    def validate_percentage(cls, v):
        """Valida percentual entre 0 e 100"""
        if v < 0 or v > 100:
            raise ValueError('Percentual deve estar entre 0 e 100')
        return v
    
    @field_validator('public_instagram', 'public_facebook', 'public_website')
    @classmethod
    def validate_url(cls, v, info):
        """Valida URLs"""
        if v and not v.startswith(('http://', 'https://', 'www.')):
            field_name = info.field_name
            if field_name == 'public_instagram':
                return f"https://instagram.com/{v.replace('@', '')}"
            elif field_name == 'public_facebook':
                return f"https://facebook.com/{v}"
        return v


class OnlineBookingConfigCreate(OnlineBookingConfigBase):
    """Schema para criação de configuração"""
    company_id: int


class OnlineBookingConfigUpdate(BaseModel):
    """Schema para atualização de configuração (todos os campos opcionais)"""
    
    public_name: Optional[str] = None
    public_description: Optional[str] = None
    logo_url: Optional[str] = None
    
    use_company_address: Optional[bool] = None
    public_address: Optional[str] = None
    public_address_number: Optional[str] = None
    public_address_complement: Optional[str] = None
    public_neighborhood: Optional[str] = None
    public_city: Optional[str] = None
    public_state: Optional[str] = None
    public_postal_code: Optional[str] = None
    
    public_whatsapp: Optional[str] = None
    public_phone: Optional[str] = None
    public_instagram: Optional[str] = None
    public_facebook: Optional[str] = None
    public_website: Optional[str] = None
    
    primary_color: Optional[str] = None
    theme: Optional[str] = None
    booking_flow: Optional[str] = None
    require_login: Optional[bool] = None
    min_advance_time_minutes: Optional[int] = None
    allow_cancellation: Optional[bool] = None
    cancellation_min_hours: Optional[int] = None
    
    enable_payment_local: Optional[bool] = None
    enable_payment_card: Optional[bool] = None
    enable_payment_pix: Optional[bool] = None
    enable_deposit_payment: Optional[bool] = None
    deposit_percentage: Optional[float] = None
    
    is_active: Optional[bool] = None


class OnlineBookingConfigResponse(OnlineBookingConfigBase):
    """Schema para resposta de configuração"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== GALLERY SCHEMAS ==========

class OnlineBookingGalleryBase(BaseModel):
    """Base schema para galeria"""
    image_url: str
    display_order: int = 0
    is_active: bool = True


class OnlineBookingGalleryCreate(OnlineBookingGalleryBase):
    """Schema para criação de imagem na galeria"""
    pass


class OnlineBookingGalleryUpdate(BaseModel):
    """Schema para atualização de imagem"""
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class OnlineBookingGalleryResponse(OnlineBookingGalleryBase):
    """Schema para resposta de galeria"""
    id: int
    company_id: int
    config_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== BUSINESS HOURS SCHEMAS ==========

class OnlineBookingBusinessHoursBase(BaseModel):
    """Base schema para horários de atendimento"""
    day_of_week: int = Field(..., ge=0, le=6, description="Dia da semana (0=Domingo, 6=Sábado)")
    is_active: bool = True
    start_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    break_start_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    break_end_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    end_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    
    @field_validator('break_end_time')
    @classmethod
    def validate_break_times(cls, v, info):
        """Valida que o fim do intervalo é depois do início"""
        if v and 'break_start_time' in info.data and info.data['break_start_time']:
            if v <= info.data['break_start_time']:
                raise ValueError('Fim do intervalo deve ser depois do início')
        return v
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        """Valida que o fim do expediente é depois do início"""
        if v and 'start_time' in info.data and info.data['start_time']:
            if v <= info.data['start_time']:
                raise ValueError('Fim do expediente deve ser depois do início')
        return v


class OnlineBookingBusinessHoursCreate(OnlineBookingBusinessHoursBase):
    """Schema para criação de horário"""
    pass


class OnlineBookingBusinessHoursUpdate(BaseModel):
    """Schema para atualização de horário"""
    is_active: Optional[bool] = None
    start_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    break_start_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    break_end_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')
    end_time: Optional[str] = Field(None, pattern=r'^([01]\d|2[0-3]):([0-5]\d)$')


class OnlineBookingBusinessHoursResponse(OnlineBookingBusinessHoursBase):
    """Schema para resposta de horário"""
    id: int
    company_id: int
    config_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ========== BULK OPERATIONS ==========

class OnlineBookingBusinessHoursBulkUpdate(BaseModel):
    """Schema para atualização em lote de horários"""
    hours: List[OnlineBookingBusinessHoursCreate] = Field(..., min_items=1, max_items=7)


# ========== LINKS SCHEMAS ==========

class OnlineBookingLinksResponse(BaseModel):
    """Schema para resposta de links de agendamento"""
    base_url: str
    general_link: str
    instagram_link: str
    whatsapp_link: str
    google_link: str
    facebook_link: str
    slug: str
