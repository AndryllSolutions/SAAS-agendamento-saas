from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Lead(BaseModel):
    __tablename__ = "leads"

    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)

    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    converted_client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)

    full_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(20), nullable=True, index=True)
    whatsapp = Column(String(20), nullable=True, index=True)

    source = Column(String(50), nullable=True, index=True)
    stage = Column(String(50), nullable=True, index=True)
    status = Column(String(20), nullable=True, index=True)

    notes = Column(Text, nullable=True)

    wa_chat_title = Column(String(255), nullable=True)
    wa_last_message = Column(Text, nullable=True)
    wa_url = Column(String(500), nullable=True)

    raw_payload = Column(JSON, nullable=True)

    is_converted = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_user_id], back_populates="leads_created")
    converted_client = relationship("Client", foreign_keys=[converted_client_id])

    def __repr__(self):
        return f"<Lead {self.full_name}>"
