"""
Anamnesis Model - Anamneses
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class AnamnesisStatus(str, enum.Enum):
    """Anamnesis status"""
    OPEN = "open"
    CLOSED = "closed"


class AnamnesisModel(BaseModel):
    """Anamnesis Model - Modelos de anamnese"""
    
    __tablename__ = "anamnesis_models"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False, index=True)
    fields = Column(JSON, nullable=False)  # Estrutura dos campos do formulário
    related_services = Column(JSON, nullable=True)  # Lista de IDs de serviços relacionados
    
    # Relationships
    company = relationship("Company", back_populates="anamnesis_models")
    anamneses = relationship("Anamnesis", back_populates="model", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<AnamnesisModel {self.name}>"


class Anamnesis(BaseModel):
    """Anamnesis model - Anamneses respondidas"""
    
    __tablename__ = "anamneses"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)  # ATUALIZADO: client_id -> client_crm_id
    professional_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    model_id = Column(Integer, ForeignKey("anamnesis_models.id", ondelete="CASCADE"), nullable=False)
    
    # Responses
    responses = Column(JSON, nullable=False)  # Respostas do formulário
    
    # Status
    status = Column(String(20), default="open", nullable=False, index=True)
    
    # Signature
    is_signed = Column(Boolean, default=False)
    signature_date = Column(DateTime, nullable=True)
    signature_image_url = Column(String(500), nullable=True)  # URL da imagem da assinatura
    signature_name = Column(String(255), nullable=True)  # Nome do assinante
    signature_ip = Column(String(50), nullable=True)  # IP do assinante
    
    # Relationships
    company = relationship("Company", back_populates="anamneses")
    client = relationship("Client", back_populates="anamneses")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="anamneses")
    model = relationship("AnamnesisModel", back_populates="anamneses")
    
    def __repr__(self):
        return f"<Anamnesis {self.id} - {self.status}>"

