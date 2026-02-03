"""
Document Generator Schemas
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class DocumentTemplateBase(BaseModel):
    """Base document template schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    document_type: str  # contract, term, quote, etc.
    template_content: str = Field(..., min_length=1)
    variables: Optional[List[str]] = None


class DocumentTemplateCreate(DocumentTemplateBase):
    """Schema for creating a document template"""
    company_id: int


class DocumentTemplateUpdate(BaseModel):
    """Schema for updating a document template"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    document_type: Optional[str] = None
    template_content: Optional[str] = Field(None, min_length=1)
    variables: Optional[List[str]] = None
    is_active: Optional[bool] = None


class DocumentTemplateResponse(DocumentTemplateBase):
    """Schema for document template response"""
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GeneratedDocumentBase(BaseModel):
    """Base generated document schema"""
    template_id: int
    client_id: Optional[int] = None
    command_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=255)
    variables_used: Optional[Dict] = None


class GeneratedDocumentCreate(GeneratedDocumentBase):
    """Schema for creating a generated document"""
    company_id: int


class GeneratedDocumentResponse(GeneratedDocumentBase):
    """Schema for generated document response"""
    id: int
    company_id: int
    content: str
    file_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentGenerate(BaseModel):
    """Schema for generating a document"""
    template_id: int
    client_id: Optional[int] = None
    command_id: Optional[int] = None
    variables: Dict = Field(..., min_items=1)  # Valores das variáveis

