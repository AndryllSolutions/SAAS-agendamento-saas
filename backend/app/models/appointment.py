"""
Appointment Model
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class AppointmentStatus(str, enum.Enum):
    """Appointment status"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Appointment(BaseModel):
    """Appointment model"""
    
    __tablename__ = "appointments"
    
    # Tenant
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Relations
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)  # Cliente do CRM
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="SET NULL"), nullable=True)
    
    # Scheduling
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    
    # Status
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False, index=True)
    
    # Notes
    client_notes = Column(Text, nullable=True)  # Notes from client
    professional_notes = Column(Text, nullable=True)  # Notes from professional
    internal_notes = Column(Text, nullable=True)  # Internal notes
    
    # Cancellation
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    # Check-in
    checked_in_at = Column(DateTime, nullable=True)
    check_in_code = Column(String(50), nullable=True, unique=True)  # QR Code
    
    # Reminders
    reminder_sent_24h = Column(Boolean, default=False)
    reminder_sent_2h = Column(Boolean, default=False)
    
    # Payment
    payment_status = Column(String(20), default="pending")  # pending, paid, refunded
    
    # Relationships
    company = relationship("Company", back_populates="appointments")
    client_crm = relationship("Client", foreign_keys=[client_crm_id], back_populates="appointments")  # Cliente do CRM
    professional = relationship("User", foreign_keys=[professional_id], back_populates="appointments_as_professional")
    service = relationship("Service", back_populates="appointments")
    resource = relationship("Resource", back_populates="appointments")
    payment = relationship("Payment", back_populates="appointment", uselist=False)
    review = relationship("Review", back_populates="appointment", uselist=False)
    command = relationship("Command", back_populates="appointment")
    
    def __repr__(self):
        return f"<Appointment {self.id} - {self.status}>"
