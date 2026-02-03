"""
Review Model - Client reviews and evaluations (merged table)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Review(BaseModel):
    """Review model - Includes both reviews and evaluations functionality"""
    
    __tablename__ = "reviews"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, unique=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=False, index=True)  # Cliente do CRM
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Rating (1-5)
    rating = Column(Integer, nullable=False)
    
    # Review content
    comment = Column(Text, nullable=True)
    
    # Origin (from merged evaluations)
    origin = Column(String(50), nullable=False, default='post_service')  # link, app, post_service, other
    
    # Status (original review fields)
    is_visible = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)
    
    # Response from professional (original review fields)
    response = Column(Text, nullable=True)
    response_at = Column(String(50), nullable=True)
    
    # Response fields (from merged evaluations)
    is_answered = Column(Boolean, default=False)
    answer_date = Column(DateTime, nullable=True)
    answer_text = Column(Text, nullable=True)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="review")
    client_crm = relationship("Client", foreign_keys=[client_crm_id], back_populates="reviews")  # Cliente do CRM
    professional = relationship("User", foreign_keys=[professional_id], back_populates="reviews_received")
    
    def __repr__(self):
        return f"<Review {self.rating}/5 - {self.origin} - Appointment {self.appointment_id}>"
