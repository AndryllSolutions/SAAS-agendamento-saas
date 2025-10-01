"""
Service and ServiceCategory Models
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Numeric
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ServiceCategory(BaseModel):
    """Service category for organization"""
    
    __tablename__ = "service_categories"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), default="#3B82F6")
    is_active = Column(Boolean, default=True)
    
    # Relationships
    services = relationship("Service", back_populates="category")
    
    def __repr__(self):
        return f"<ServiceCategory {self.name}>"


class Service(BaseModel):
    """Service model"""
    
    __tablename__ = "services"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("service_categories.id", ondelete="SET NULL"), nullable=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL")
    
    # Duration
    duration_minutes = Column(Integer, nullable=False, default=60)
    
    # Availability
    is_active = Column(Boolean, default=True)
    requires_professional = Column(Boolean, default=True)
    
    # Visual
    image_url = Column(String(500), nullable=True)
    color = Column(String(7), default="#3B82F6")
    
    # Commission
    commission_rate = Column(Integer, default=0)  # Percentage (0-100)
    
    # Relationships
    company = relationship("Company", back_populates="services")
    category = relationship("ServiceCategory", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")
    
    def __repr__(self):
        return f"<Service {self.name}>"
