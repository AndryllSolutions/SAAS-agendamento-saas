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
    extra_cost = Column(Numeric(10, 2), nullable=True)
    
    # Duration
    duration_minutes = Column(Integer, nullable=False, default=60)
    lead_time_minutes = Column(Integer, nullable=True, default=0)
    
    # Availability
    is_active = Column(Boolean, default=True)
    is_favorite = Column(Boolean, default=False)
    requires_professional = Column(Boolean, default=True)
    available_online = Column(Boolean, default=True)  # Disponível para agendamento online
    online_booking_enabled = Column(Boolean, default=True)  # Habilitado para agendamento online
    
    # Visual
    image_url = Column(String(500), nullable=True)
    color = Column(String(7), default="#3B82F6")
    
    # Commission
    commission_rate = Column(Integer, default=0)  # Percentage (0-100)
    
    # Relationships
    company = relationship("Company", back_populates="services")
    category = relationship("ServiceCategory", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")
    service_professionals = relationship("ServiceProfessional", back_populates="service", cascade="all, delete-orphan")
    
    # Helper properties
    @property
    def assigned_professionals(self):
        """Get active professionals assigned to this service"""
        return [sp.professional for sp in self.service_professionals if sp.is_active]
    
    def __repr__(self):
        return f"<Service {self.name}>"
