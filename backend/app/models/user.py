"""
User Model with Role-based Access Control
"""
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """User roles for RBAC"""
    ADMIN = "admin"
    MANAGER = "manager"
    PROFESSIONAL = "professional"
    CLIENT = "client"


class User(BaseModel):
    """User model with multi-tenant support"""
    
    __tablename__ = "users"
    
    # Company (Tenant) relationship
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # Role & Status
    role = Column(SQLEnum(UserRole), default=UserRole.CLIENT, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Profile
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    
    # Address
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Professional specific fields
    specialties = Column(JSON, nullable=True)  # For professionals: ["Corte", "Barba", ...]
    working_hours = Column(JSON, nullable=True)  # {"monday": {"start": "09:00", "end": "18:00"}, ...}
    commission_rate = Column(Integer, default=0)  # Percentage (0-100)
    
    # OAuth
    oauth_provider = Column(String(50), nullable=True)  # google, facebook, apple
    oauth_id = Column(String(255), nullable=True)
    
    # Notifications preferences
    notification_preferences = Column(JSON, nullable=True)  # {"email": true, "sms": false, "whatsapp": true}
    
    # Client specific fields
    notes = Column(Text, nullable=True)  # Internal notes about the client
    tags = Column(JSON, nullable=True)  # ["VIP", "Regular", ...]
    
    # Relationships
    company = relationship("Company", back_populates="users")
    appointments_as_client = relationship(
        "Appointment",
        foreign_keys="Appointment.client_id",
        back_populates="client"
    )
    appointments_as_professional = relationship(
        "Appointment",
        foreign_keys="Appointment.professional_id",
        back_populates="professional"
    )
    reviews_given = relationship(
        "Review",
        foreign_keys="Review.client_id",
        back_populates="client"
    )
    reviews_received = relationship(
        "Review",
        foreign_keys="Review.professional_id",
        back_populates="professional"
    )
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
