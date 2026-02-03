"""
Client Schemas
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime, date
from decimal import Decimal


class ClientBase(BaseModel):
    """Base client schema"""
    full_name: str = Field(..., min_length=3, max_length=255)
    nickname: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cellphone: Optional[str] = None
    date_of_birth: Optional[date] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = Field(None, max_length=2)  # Sigla do estado (SP, RJ, etc.)
    zip_code: Optional[str] = None
    marketing_whatsapp: Optional[bool] = False
    marketing_email: Optional[bool] = False
    notes: Optional[str] = None
    
    @field_validator('state')
    @classmethod
    def validate_state(cls, v):
        """Validate state is a 2-letter code"""
        if v and len(v) > 2:
            # Try to extract state code if it's a full name
            state_mapping = {
                'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM',
                'bahia': 'BA', 'ceará': 'CE', 'distrito federal': 'DF', 'espírito santo': 'ES',
                'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
                'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
                'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
                'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
                'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO',
                # English versions
                'single': None, 'married': None, 'divorced': None, 'widowed': None
            }
            v_lower = v.lower().strip()
            mapped = state_mapping.get(v_lower)
            if mapped:
                return mapped
            # If not found, truncate to 2 chars or return None
            return v[:2].upper() if v else None
        return v.upper() if v else None


class ClientCreate(ClientBase):
    """Schema for creating a client"""
    company_id: Optional[int] = None


class ClientUpdate(BaseModel):
    """Schema for updating a client"""
    full_name: Optional[str] = Field(None, min_length=3, max_length=255)
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cellphone: Optional[str] = None
    date_of_birth: Optional[date] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    address_number: Optional[str] = None
    address_complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = Field(None, max_length=2)  # Sigla do estado
    zip_code: Optional[str] = None
    credits: Optional[Decimal] = None
    marketing_whatsapp: Optional[bool] = None
    marketing_email: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    
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
                'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO',
                'single': None, 'married': None, 'divorced': None, 'widowed': None
            }
            v_lower = v.lower().strip()
            mapped = state_mapping.get(v_lower)
            if mapped:
                return mapped
            return v[:2].upper() if v else None
        return v.upper() if v else None


class ClientResponse(ClientBase):
    """Schema for client response"""
    id: int
    company_id: int
    credits: Optional[Decimal] = Decimal('0.00')
    is_active: Optional[bool] = True
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ClientHistory(BaseModel):
    """Schema for client history"""
    appointments: List[dict] = []
    commands: List[dict] = []
    packages: List[dict] = []
    evaluations: List[dict] = []
    anamneses: List[dict] = []
    whatsapp_messages: List[dict] = []

