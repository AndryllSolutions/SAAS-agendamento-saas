"""
Company Subscription Model - Controls plan and trial per tenant
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel


class CompanySubscription(BaseModel):
    """
    Simple subscription record per company/tenant.
    
    This complements the high-level subscription fields on `Company`
    and is focused on plan type and trial window.
    """

    __tablename__ = "company_subscriptions"

    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_type = Column(String(50), nullable=False, default="FREE")  # FREE, TRIAL, PRO, PREMIUM, etc.
    is_active = Column(Boolean, default=True, nullable=False)  # Subscription status
    trial_end_date = Column(DateTime, nullable=True)
    coupon_code = Column(String(100), nullable=True)
    referral_code = Column(String(100), nullable=True)

    company = relationship("Company", back_populates="subscriptions")

    def __repr__(self) -> str:
        return f"<CompanySubscription company_id={self.company_id} plan_type={self.plan_type}>"


