"""
File Upload Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User, UserRole
from app.services.file_upload import FileUploadService

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


class FileInfo(BaseModel):
    """Schema for file information"""
    filename: str
    url: str
    size: int
    content_type: str
    folder: str
    created_at: str


class FileUpdate(BaseModel):
    """Schema for updating file metadata"""
    filename: Optional[str] = None
    folder: Optional[str] = None


@router.post("/images", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "images",
    prefix: str = "",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image file
    Supports: services, products, professionals, clients
    """
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder=folder,
            prefix=prefix or "img",
            optimize_image=True
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    folder: str = "documents",
    prefix: str = "",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document file
    Supports: anamneses, invoices, templates
    """
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder=folder,
            prefix=prefix or "doc",
            optimize_image=False
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/services/{service_id}/image", status_code=status.HTTP_201_CREATED)
async def upload_service_image(
    service_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload image for a service"""
    from app.models.service import Service
    
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder="services",
            prefix=f"service_{service_id}",
            optimize_image=True
        )
        
        # Update service with image URL
        service.image_url = result["url"]
        db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/products/{product_id}/image", status_code=status.HTTP_201_CREATED)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload image for a product"""
    from app.models.product import Product
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.company_id == current_user.company_id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder="products",
            prefix=f"product_{product_id}",
            optimize_image=True
        )
        
        # Add image URL to product images (if it's a list) or set as main image
        if not product.images:
            product.images = []
        if isinstance(product.images, list):
            if result["url"] not in product.images:
                product.images.append(result["url"])
        else:
            product.images = [result["url"]]
        
        # Also set as main image_url for compatibility
        if not product.image_url:
            product.image_url = result["url"]
        
        db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/professionals/{professional_id}/avatar", status_code=status.HTTP_201_CREATED)
async def upload_professional_avatar(
    professional_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload avatar for a professional"""
    professional = db.query(User).filter(
        User.id == professional_id,
        User.company_id == current_user.company_id,
        User.role == UserRole.PROFESSIONAL
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional não encontrado"
        )
    
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder="professionals",
            prefix=f"prof_{professional_id}",
            optimize_image=True
        )
        
        # Update professional with avatar URL
        professional.avatar_url = result["url"]
        db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/clients/{client_id}/avatar", status_code=status.HTTP_201_CREATED)
async def upload_client_avatar(
    client_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload avatar for a client"""
    from app.models.client import Client
    
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder="clients",
            prefix=f"client_{client_id}",
            optimize_image=True
        )
        
        # Update client with avatar URL (if client model has avatar_url field)
        # Note: Adjust based on your Client model structure
        if hasattr(client, 'avatar_url'):
            client.avatar_url = result["url"]
            db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.post("/documents/templates/{template_id}/file", status_code=status.HTTP_201_CREATED)
async def upload_document_template_file(
    template_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload file for a document template"""
    from app.models.document_generator import DocumentTemplate
    
    template = db.query(DocumentTemplate).filter(
        DocumentTemplate.id == template_id,
        DocumentTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template não encontrado"
        )
    
    try:
        result = await FileUploadService.upload_file(
            file=file,
            folder="document_templates",
            prefix=f"template_{template_id}",
            optimize_image=False
        )
        
        # Update template with file URL (if template model has file_url field)
        if hasattr(template, 'file_url'):
            template.file_url = result["url"]
            db.commit()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.delete("/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    filename: str,
    folder: str = "uploads",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a file"""
    success = FileUploadService.delete_file(filename, folder)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo não encontrado"
        )
    
    return None


@router.get("/files", response_model=List[FileInfo])
async def list_files(
    folder: Optional[str] = Query(None, description="Filter by folder"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List uploaded files
    """
    try:
        files = FileUploadService.list_files(
            folder=folder,
            limit=limit,
            offset=offset,
            company_id=current_user.company_id
        )
        return files
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar arquivos: {str(e)}"
        )


@router.get("/files/{filename}", response_model=FileInfo)
async def get_file_info(
    filename: str,
    folder: Optional[str] = Query(None, description="File folder"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get file information
    """
    try:
        file_info = FileUploadService.get_file_info(
            filename=filename,
            folder=folder or "uploads",
            company_id=current_user.company_id
        )
        
        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo não encontrado"
            )
        
        return file_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter informações do arquivo: {str(e)}"
        )


@router.put("/files/{filename}", response_model=FileInfo)
async def update_file(
    filename: str,
    file_data: FileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update file metadata (rename or move to different folder)
    """
    try:
        updated_file = FileUploadService.update_file(
            filename=filename,
            new_filename=file_data.filename,
            new_folder=file_data.folder,
            company_id=current_user.company_id
        )
        
        if not updated_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo não encontrado"
            )
        
        return updated_file
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar arquivo: {str(e)}"
        )

