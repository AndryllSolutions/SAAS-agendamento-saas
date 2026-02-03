"""
User Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from datetime import datetime

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=255)
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value):
        """Allow case-insensitive role strings"""
        if isinstance(value, str):
            return value.upper()
        return value


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=6, max_length=100)
    company_id: int


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = Field(None, min_length=3, max_length=255)
    phone: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    specialties: Optional[List[str]] = None
    working_hours: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, bool]] = None
    commission_rate: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None
    # Role management (updates CompanyUser.role, not User.role)
    role: Optional[str] = None  # Company role (COMPANY_OWNER, COMPANY_MANAGER, etc.)
    company_role: Optional[str] = None  # Alias for 'role'


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    company_id: Optional[int] = None  # Nullable for SaaS admins without company
    is_active: bool
    is_verified: bool
    cpf_cnpj: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    specialties: Optional[List[str]] = None
    working_hours: Optional[Dict[str, Any]] = None
    commission_rate: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    # SaaS Role - Global role for SaaS admin panel access
    saas_role: Optional[str] = None  # SAAS_OWNER, SAAS_STAFF, or None
    company_role: Optional[str] = None  # COMPANY_OWNER, COMPANY_MANAGER, etc.
    
    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None  # User data included in login response


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: Optional[str] = None
    refreshToken: Optional[str] = None  # Alternative camelCase for mobile


class TokenData(BaseModel):
    """Schema for token data"""
    user_id: Optional[int] = None


class PasswordChange(BaseModel):
    """Schema for password change"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class PasswordReset(BaseModel):
    """Schema for password reset"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
