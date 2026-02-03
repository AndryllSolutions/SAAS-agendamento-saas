"""
Document Generator Model - Gerador de Documentos
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class DocumentTemplate(BaseModel):
    """Document Template model - Modelos de documentos"""
    
    __tablename__ = "document_templates"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    document_type = Column(String(50), nullable=False)  # contract, term, quote, etc.
    
    # Template Content
    template_content = Column(Text, nullable=False)  # HTML ou texto com variáveis
    variables = Column(JSON, nullable=True)  # Lista de variáveis disponíveis
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship("Company", back_populates="document_templates")
    documents = relationship("GeneratedDocument", back_populates="template", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DocumentTemplate {self.name}>"


class GeneratedDocument(BaseModel):
    """Generated Document model - Documentos gerados"""
    
    __tablename__ = "generated_documents"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("document_templates.id", ondelete="CASCADE"), nullable=False)
    
    # Relations
    client_crm_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)  # ATUALIZADO: client_id -> client_crm_id
    command_id = Column(Integer, ForeignKey("commands.id", ondelete="SET NULL"), nullable=True)
    
    # Document Info
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # Conteúdo gerado
    file_url = Column(String(500), nullable=True)  # URL do PDF gerado
    
    # Variables used
    variables_used = Column(JSON, nullable=True)  # Valores das variáveis usadas
    
    # Relationships
    company = relationship("Company", back_populates="generated_documents")
    template = relationship("DocumentTemplate", back_populates="documents")
    client = relationship("Client")
    command = relationship("Command")
    
    def __repr__(self):
        return f"<GeneratedDocument {self.title}>"

