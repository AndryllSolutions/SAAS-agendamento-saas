"""
Review Model - Client reviews for professionals and services
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Review(BaseModel):
    """Review model"""
    
    __tablename__ = "reviews"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, unique=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Rating (1-5)
    rating = Column(Integer, nullable=False)
    
    # Review content
    comment = Column(Text, nullable=True)
    
    # Status
    is_visible = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)
    
    # Response from professional
    response = Column(Text, nullable=True)
    response_at = Column(String(50), nullable=True)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="review")
    client = relationship("User", foreign_keys=[client_id], back_populates="reviews_given")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="reviews_received")
    
    def __repr__(self):
        return f"<Review {self.rating}/5 - Appointment {self.appointment_id}>"
