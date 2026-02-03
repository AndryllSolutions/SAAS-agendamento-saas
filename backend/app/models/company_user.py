"""
CompanyUser Model - Explicit user<->company link with role management
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.base import BaseModel
from app.core.roles import CompanyRole


class CompanyUser(BaseModel):
    """
    Explicit relation between users and companies with role management.
    
    This table provides:
    - Multi-company support (users can belong to multiple companies)
    - Role-based access control per company
    - Audit trail (who invited, when, etc.)
    - Status tracking (active, inactive, pending)
    
    Constraints:
    - Unique constraint on (user_id, company_id) to prevent duplicates
    - Role must be a valid CompanyRole enum value
    """
    
    __tablename__ = "company_users"
    __table_args__ = (
        UniqueConstraint('user_id', 'company_id', name='uq_company_users_user_company'),
    )
    
    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Role - Uses CompanyRole enum from RBAC system
    # Note: The enum type 'company_role' must be created in PostgreSQL first (via migration)
    role = Column(SQLEnum(CompanyRole, name='company_role', create_type=False), nullable=False, default=CompanyRole.COMPANY_OWNER, index=True)
    
    # Status
    is_active = Column(String(20), nullable=False, default="active", index=True)  # active, inactive, pending, suspended
    
    # Audit fields
    invited_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    invited_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    joined_at = Column(DateTime, nullable=True)  # When user accepted/joined
    last_active_at = Column(DateTime, nullable=True)  # Last time user accessed this company
    
    # Notes
    notes = Column(String(500), nullable=True)  # Internal notes about this membership
    
    # Relationships
    company = relationship("Company", back_populates="company_users", foreign_keys=[company_id])
    user = relationship("User", back_populates="company_users", foreign_keys=[user_id])
    invited_by = relationship("User", foreign_keys=[invited_by_id], remote_side="User.id")
    
    def __repr__(self) -> str:
        return f"<CompanyUser company_id={self.company_id} user_id={self.user_id} role={self.role.value if isinstance(self.role, CompanyRole) else self.role}>"
    
    def activate(self):
        """Activate this membership"""
        self.is_active = "active"
        if not self.joined_at:
            self.joined_at = datetime.utcnow()
        self.last_active_at = datetime.utcnow()
    
    def deactivate(self):
        """Deactivate this membership"""
        self.is_active = "inactive"
    
    def suspend(self):
        """Suspend this membership"""
        self.is_active = "suspended"
    
    def update_last_active(self):
        """Update last active timestamp"""
        self.last_active_at = datetime.utcnow()


