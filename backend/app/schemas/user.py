"""
User Schemas
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=255)
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=6, max_length=100)
    company_id: int


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = Field(None, min_length=3, max_length=255)
    phone: Optional[str] = None
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


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    company_id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    specialties: Optional[List[str]] = None
    working_hours: Optional[Dict[str, Any]] = None
    commission_rate: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


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
