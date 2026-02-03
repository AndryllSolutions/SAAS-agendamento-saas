"""
Invoices Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.core.feature_flags import get_feature_checker
from app.models.user import User
from app.models.invoice import Invoice, FiscalConfiguration, InvoiceType, InvoiceStatus
from app.models.command import Command
from app.models.company_configurations import CompanyDetails
from app.schemas.invoice import (
    FiscalConfigurationCreate, FiscalConfigurationUpdate, FiscalConfigurationResponse,
    InvoiceCreate, InvoiceResponse, InvoiceGenerate
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== FISCAL CONFIGURATION ==========

@router.get("/fiscal/config", response_model=FiscalConfigurationResponse)
async def get_fiscal_configuration(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get fiscal configuration"""
    config = db.query(FiscalConfiguration).filter(
        FiscalConfiguration.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração fiscal não encontrada"
        )
    
    return config


@router.post("/fiscal/config", response_model=FiscalConfigurationResponse, status_code=status.HTTP_201_CREATED)
async def create_fiscal_configuration(
    config_data: FiscalConfigurationCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create fiscal configuration"""
    if config_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Check if already exists
    existing = db.query(FiscalConfiguration).filter(
        FiscalConfiguration.company_id == current_user.company_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Configuração fiscal já existe. Use PUT para atualizar."
        )
    
    # Preencher dados fiscais automaticamente do CompanyDetails
    company_details = db.query(CompanyDetails).filter(
        CompanyDetails.company_id == current_user.company_id
    ).first()
    
    config_dict = config_data.dict()
    if company_details:
        if not config_dict.get('company_name'):
            config_dict['company_name'] = company_details.company_name
        if not config_dict.get('document_number'):
            config_dict['document_number'] = company_details.document_number
        if not config_dict.get('municipal_registration'):
            config_dict['municipal_registration'] = company_details.municipal_registration
        if not config_dict.get('state_registration'):
            config_dict['state_registration'] = company_details.state_registration
    
    config = FiscalConfiguration(**config_dict)
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.put("/fiscal/config", response_model=FiscalConfigurationResponse)
async def update_fiscal_configuration(
    config_data: FiscalConfigurationUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update fiscal configuration"""
    config = db.query(FiscalConfiguration).filter(
        FiscalConfiguration.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração fiscal não encontrada"
        )
    
    update_data = config_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return config


# ========== INVOICES ==========

@router.get("/", response_model=List[InvoiceResponse])
async def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    invoice_type: Optional[InvoiceType] = None,
    status: Optional[InvoiceStatus] = None,
    command_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List invoices"""
    query = db.query(Invoice).filter(Invoice.company_id == current_user.company_id)
    
    if invoice_type:
        query = query.filter(Invoice.invoice_type == invoice_type)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    if command_id:
        query = query.filter(Invoice.command_id == command_id)
    
    invoices = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
    return invoices


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get invoice by ID"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return invoice


@router.post("/generate", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def generate_invoice(
    generate_data: InvoiceGenerate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("invoices"))
):
    """Generate invoice (stub - needs actual fiscal provider integration)"""
    # Verify command exists
    command = db.query(Command).filter(
        Command.id == generate_data.command_id,
        Command.company_id == current_user.company_id
    ).first()
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comanda não encontrada"
        )
    
    if command.status.value != "finished":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comanda deve estar finalizada para gerar nota fiscal"
        )
    
    # Check if invoice already exists
    existing = db.query(Invoice).filter(
        Invoice.command_id == generate_data.command_id,
        Invoice.invoice_type == generate_data.invoice_type,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nota fiscal já existe para esta comanda"
        )
    
    # Create invoice (stub - would integrate with fiscal provider)
    invoice = Invoice(
        company_id=current_user.company_id,
        command_id=generate_data.command_id,
        client_id=command.client_id,
        invoice_type=generate_data.invoice_type,
        total_value=command.net_value,
        status=InvoiceStatus.PENDING
    )
    db.add(invoice)
    
    # Update command flags
    if generate_data.invoice_type == InvoiceType.NFSE:
        command.has_nfse = True
    elif generate_data.invoice_type == InvoiceType.NFE:
        command.has_nfe = True
    elif generate_data.invoice_type == InvoiceType.NFCE:
        command.has_nfce = True
    
    db.commit()
    db.refresh(invoice)
    
    # TODO: Integrate with actual fiscal provider API
    # This would call the provider API to generate the invoice
    
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_data: InvoiceCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update invoice (only if status is PENDING)"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota fiscal não encontrada"
        )
    
    # Only allow update if status is PENDING
    if invoice.status != InvoiceStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível atualizar nota fiscal que não está pendente"
        )
    
    update_data = invoice_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete invoice (only if status is PENDING or CANCELLED)"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota fiscal não encontrada"
        )
    
    # Only allow delete if status is PENDING or CANCELLED
    if invoice.status not in [InvoiceStatus.PENDING, InvoiceStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar nota fiscal que não está pendente ou cancelada"
        )
    
    # Update command flags
    command = db.query(Command).filter(Command.id == invoice.command_id).first()
    if command:
        if invoice.invoice_type == InvoiceType.NFSE:
            command.has_nfse = False
        elif invoice.invoice_type == InvoiceType.NFE:
            command.has_nfe = False
        elif invoice.invoice_type == InvoiceType.NFCE:
            command.has_nfce = False
    
    db.delete(invoice)
    db.commit()
    
    return None


@router.post("/{invoice_id}/cancel", response_model=InvoiceResponse)
async def cancel_invoice(
    invoice_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cancel invoice"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota fiscal não encontrada"
        )
    
    if invoice.status == InvoiceStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nota fiscal já está cancelada"
        )
    
    invoice.status = InvoiceStatus.CANCELLED
    invoice.cancelled_at = datetime.utcnow()
    
    # Update command flags
    command = db.query(Command).filter(Command.id == invoice.command_id).first()
    if command:
        if invoice.invoice_type == InvoiceType.NFSE:
            command.has_nfse = False
        elif invoice.invoice_type == InvoiceType.NFE:
            command.has_nfe = False
        elif invoice.invoice_type == InvoiceType.NFCE:
            command.has_nfce = False
    
    db.commit()
    db.refresh(invoice)
    
    return invoice


@router.get("/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download invoice PDF (stub - needs actual PDF generation)"""
    from fastapi.responses import Response
    
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota fiscal não encontrada"
        )
    
    # TODO: Generate actual PDF using a library like reportlab or weasyprint
    # For now, return a placeholder response
    pdf_content = f"PDF placeholder for invoice {invoice_id}".encode()
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"
        }
    )


@router.post("/{invoice_id}/send-email")
async def send_invoice_email(
    invoice_id: int,
    email: Optional[str] = None,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Send invoice by email (stub - needs actual email integration)"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota fiscal não encontrada"
        )
    
    # Get client email
    from app.models.client import Client
    client = db.query(Client).filter(Client.id == invoice.client_id).first()
    
    recipient_email = email or (client.email if client else None)
    
    if not recipient_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email do destinatário não encontrado"
        )
    
    # TODO: Implement actual email sending
    # This would use an email service like SendGrid, AWS SES, etc.
    
    return {
        "message": "Email enviado com sucesso (stub - implementar integração real)",
        "recipient": recipient_email,
        "invoice_id": invoice_id
    }

