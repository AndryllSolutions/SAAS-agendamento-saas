"""
Company (Tenant) Model - Multi-tenant support
"""
from sqlalchemy import Column, String, Boolean, Text, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Company(BaseModel):
    """Company/Tenant model for multi-tenant architecture"""
    
    __tablename__ = "companies"
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Contact Information
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Address
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Business Settings
    business_hours = Column(JSON, nullable=True)  # {"monday": {"start": "09:00", "end": "18:00"}, ...}
    timezone = Column(String(50), default="America/Sao_Paulo")
    currency = Column(String(3), default="BRL")
    
    # Branding
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), default="#3B82F6")
    secondary_color = Column(String(7), default="#10B981")
    
    # Subscription & Status
    is_active = Column(Boolean, default=True)
    subscription_plan = Column(String(50), default="free")  # free, basic, pro, enterprise
    subscription_expires_at = Column(String(50), nullable=True)
    
    # Features enabled
    features = Column(JSON, nullable=True)  # {"whatsapp": true, "sms": false, ...}
    
    # Settings
    settings = Column(JSON, nullable=True)  # Custom settings per company
    
    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="company", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="company", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company {self.name}>"
