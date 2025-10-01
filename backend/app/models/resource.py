"""
Resource Model - Physical resources like rooms, chairs, equipment
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class ResourceType(str, enum.Enum):
    """Resource types"""
    ROOM = "room"
    CHAIR = "chair"
    EQUIPMENT = "equipment"
    VEHICLE = "vehicle"
    OTHER = "other"


class Resource(BaseModel):
    """Resource model for physical assets"""
    
    __tablename__ = "resources"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    
    # Location
    location = Column(String(255), nullable=True)
    
    # Capacity
    capacity = Column(Integer, default=1)
    
    # Image
    image_url = Column(String(500), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="resources")
    appointments = relationship("Appointment", back_populates="resource")
    
    def __repr__(self):
        return f"<Resource {self.name} ({self.resource_type})>"
