"""
Professional Schedule Override Model
"""
from datetime import date, time
from sqlalchemy import Column, Integer, String, Date, Time, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.user import User


class ProfessionalScheduleOverride(Base):
    """Professional schedule override model for special hours, holidays, etc."""
    __tablename__ = "professional_schedule_overrides"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
    # Override period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Override details
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Schedule for override (can be different from regular schedule)
    start_time = Column(Time, nullable=True)  # null = day off
    end_time = Column(Time, nullable=True)    # null = day off
    break_start_time = Column(Time, nullable=True)
    break_end_time = Column(Time, nullable=True)
    
    # Days of week this override applies to (JSON array)
    # e.g., ["monday", "tuesday", "wednesday"]
    week_days = Column(String, nullable=False)  # JSON string
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    professional = relationship("User", foreign_keys=[professional_id])
    company = relationship("Company", foreign_keys=[company_id])
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<ProfessionalScheduleOverride(id={self.id}, professional_id={self.professional_id}, description='{self.description}')>"


class ProfessionalServiceOverride(Base):
    """Professional service override model for temporary service changes."""
    __tablename__ = "professional_service_overrides"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True, index=True)
    
    # Override period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Override details
    original_price = Column(Integer, nullable=True)  # in cents
    override_price = Column(Integer, nullable=True)   # in cents
    original_duration = Column(Integer, nullable=True)  # in minutes
    override_duration = Column(Integer, nullable=True)   # in minutes
    is_available = Column(Boolean, default=True, nullable=False)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    professional = relationship("User", foreign_keys=[professional_id])
    company = relationship("Company", foreign_keys=[company_id])
    service = relationship("Service", foreign_keys=[service_id])
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<ProfessionalServiceOverride(id={self.id}, professional_id={self.professional_id}, service_id={self.service_id})>"
