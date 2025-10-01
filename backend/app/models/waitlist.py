"""
WaitList Model - Smart waiting list for cancelled appointments
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class WaitListStatus(str, enum.Enum):
    """WaitList status"""
    WAITING = "waiting"
    NOTIFIED = "notified"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class WaitList(BaseModel):
    """WaitList model for intelligent queue management"""
    
    __tablename__ = "waitlist"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Preferred time range
    preferred_date_start = Column(DateTime, nullable=False)
    preferred_date_end = Column(DateTime, nullable=False)
    
    # Status
    status = Column(SQLEnum(WaitListStatus), default=WaitListStatus.WAITING, nullable=False, index=True)
    
    # Priority (higher = more priority)
    priority = Column(Integer, default=0)
    
    # Notification
    notified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Notes
    notes = Column(String(500), nullable=True)
    
    def __repr__(self):
        return f"<WaitList {self.id} - {self.status}>"
