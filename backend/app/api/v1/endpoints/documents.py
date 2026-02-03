"""
Document Generator Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.feature_flags import get_feature_checker
from app.models.user import User
from app.models.document_generator import DocumentTemplate, GeneratedDocument
from app.models.client import Client
from app.models.command import Command
from app.schemas.document_generator import (
    DocumentTemplateCreate, DocumentTemplateUpdate, DocumentTemplateResponse,
    GeneratedDocumentCreate, GeneratedDocumentResponse, DocumentGenerate
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== DOCUMENT TEMPLATES ==========

@router.post("/templates", response_model=DocumentTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_document_template(
    template_data: DocumentTemplateCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("document_generator"))
):
    """Create a new document template"""
    if template_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    template = DocumentTemplate(**template_data.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    return DocumentTemplateResponse.model_validate(template)


@router.get("/templates", response_model=List[DocumentTemplateResponse])
async def list_document_templates(
    document_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List document templates"""
    query = db.query(DocumentTemplate).filter(
        DocumentTemplate.company_id == current_user.company_id
    )
    
    if document_type:
        query = query.filter(DocumentTemplate.document_type == document_type)
    
    if is_active is not None:
        query = query.filter(DocumentTemplate.is_active == is_active)
    
    templates = query.all()
    return [DocumentTemplateResponse.model_validate(t) for t in templates]


@router.get("/templates/{template_id}", response_model=DocumentTemplateResponse)
async def get_document_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get document template by ID"""
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id,
        DocumentTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return DocumentTemplateResponse.model_validate(template)


@router.put("/templates/{template_id}", response_model=DocumentTemplateResponse)
async def update_document_template(
    template_id: int,
    template_data: DocumentTemplateUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update document template"""
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id,
        DocumentTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = template_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document_template(
    template_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete document template"""
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id,
        DocumentTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(template)
    db.commit()
    return None


# ========== GENERATED DOCUMENTS ==========

@router.post("/generate", response_model=GeneratedDocumentResponse, status_code=status.HTTP_201_CREATED)
async def generate_document(
    generate_data: DocumentGenerate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Generate a document from template"""
    # Get template
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == generate_data.template_id,
        DocumentTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template não encontrado"
        )
    
    # Verify client if provided
    if generate_data.client_id:
        client = db.query(Client).filter(
            Client.id == generate_data.client_id,
            Client.company_id == current_user.company_id
        ).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
    
    # Verify command if provided
    if generate_data.command_id:
        command = db.query(Command).filter(
            Command.id == generate_data.command_id,
            Command.company_id == current_user.company_id
        ).first()
        if not command:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comanda não encontrada"
            )
    
    # Replace variables in template content
    content = template.template_content
    for key, value in generate_data.variables.items():
        content = content.replace(f"{{{key}}}", str(value))
    
    # Generate title
    title = f"{template.name} - {datetime.now().strftime('%d/%m/%Y')}"
    if generate_data.client_id:
        client = db.query(Client).filter(Client.id == generate_data.client_id).first()
        if client:
            title = f"{template.name} - {client.full_name}"
    
    # Create generated document
    document = GeneratedDocument(
        company_id=current_user.company_id,
        template_id=template.id,
        client_id=generate_data.client_id,
        command_id=generate_data.command_id,
        title=title,
        content=content,
        variables_used=generate_data.variables
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # TODO: Generate PDF file and save to storage
    # document.file_url = generate_pdf(content)
    # db.commit()
    
    return GeneratedDocumentResponse.model_validate(document)


@router.get("", response_model=List[GeneratedDocumentResponse])
@router.get("/", response_model=List[GeneratedDocumentResponse], include_in_schema=False)
async def list_generated_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    template_id: Optional[int] = None,
    client_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List generated documents"""
    query = db.query(GeneratedDocument).filter(
        GeneratedDocument.company_id == current_user.company_id
    )
    
    if template_id:
        query = query.filter(GeneratedDocument.template_id == template_id)
    
    if client_id:
        query = query.filter(GeneratedDocument.client_id == client_id)
    
    documents = query.order_by(GeneratedDocument.created_at.desc()).offset(skip).limit(limit).all()
    return [GeneratedDocumentResponse.model_validate(doc) for doc in documents]


@router.get("/{document_id}", response_model=GeneratedDocumentResponse)
async def get_generated_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get generated document by ID"""
    document = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.company_id == current_user.company_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generated_document(
    document_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete generated document"""
    document = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.company_id == current_user.company_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(document)
    db.commit()
    return None


@router.get("/generated/{document_id}/download")
async def download_generated_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download generated document (PDF)"""
    from fastapi.responses import Response
    
    document = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == document_id,
        GeneratedDocument.company_id == current_user.company_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado"
        )
    
    # TODO: Generate actual PDF from document.content
    # For now, return HTML content that can be converted to PDF
    if document.file_url:
        # If file already exists, return it
        # In production, this would serve the actual file from storage
        return {"file_url": document.file_url}
    
    # Return document content as HTML (can be converted to PDF client-side)
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{document.title}</title>
    </head>
    <body>
        <h1>{document.title}</h1>
        <div>{document.content}</div>
    </body>
    </html>
    """
    
    return Response(
        content=html_content,
        media_type="text/html",
        headers={
            "Content-Disposition": f"attachment; filename={document.title.replace(' ', '_')}.html"
        }
    )

