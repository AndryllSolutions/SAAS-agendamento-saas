"""
Evaluation Model - Avaliações (separado de Review para seguir especificação)
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class EvaluationOrigin(str, enum.Enum):
    """Evaluation origin"""
    LINK = "link"
    APP = "app"
    POST_SERVICE = "post_service"
    OTHER = "other"


class Evaluation(BaseModel):
    """Evaluation model - Avaliações de clientes"""
    
    __tablename__ = "evaluations"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    
    # Rating
    rating = Column(Integer, nullable=False)  # 1 a 5
    comment = Column(Text, nullable=True)
    
    # Origin
    origin = Column(String(50), nullable=False)  # link, app, post_service
    
    # Response
    is_answered = Column(Boolean, default=False)
    answer_date = Column(DateTime, nullable=True)
    answer_text = Column(Text, nullable=True)
    
    # Relationships
    company = relationship("Company")
    client = relationship("Client")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="evaluations_received")
    appointment = relationship("Appointment")
    
    def __repr__(self):
        return f"<Evaluation {self.rating}/5 - {self.client_id}>"

