"""
Service Professional Association Model
Many-to-many relationship between services and professionals
"""
from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import BaseModel


class ServiceProfessional(BaseModel):
    """
    Many-to-many association between services and professionals
    
    This allows:
    - A service to be offered by multiple professionals
    - A professional to offer multiple services
    - Track when assignments were made/removed
    """
    
    __tablename__ = "service_professionals"
    
    # Foreign Keys
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    assigned_at = Column(DateTime, server_default=func.now())
    removed_at = Column(DateTime, nullable=True)
    
    # Relationships
    service = relationship("Service", back_populates="service_professionals")
    professional = relationship("User", back_populates="service_assignments")
    
    def __repr__(self):
        return f"<ServiceProfessional service_id={self.service_id} professional_id={self.professional_id}>"
