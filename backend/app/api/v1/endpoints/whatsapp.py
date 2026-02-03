"""
WhatsApp Marketing Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.client import Client
from app.models.whatsapp_marketing import (
    WhatsAppProvider, WhatsAppTemplate, WhatsAppCampaign, WhatsAppCampaignLog,
    CampaignStatus, LogStatus
)
from app.schemas.whatsapp_marketing import (
    WhatsAppProviderCreate, WhatsAppProviderUpdate, WhatsAppProviderResponse,
    WhatsAppTemplateCreate, WhatsAppTemplateUpdate, WhatsAppTemplateResponse,
    WhatsAppCampaignCreate, WhatsAppCampaignUpdate, WhatsAppCampaignResponse,
    WhatsAppCampaignLogResponse
)
from app.services.whatsapp_service import WhatsAppService
from datetime import datetime

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ========== WHATSAPP PROVIDERS ==========

@router.post("/providers", response_model=WhatsAppProviderResponse, status_code=status.HTTP_201_CREATED)
async def create_whatsapp_provider(
    provider_data: WhatsAppProviderCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create or update WhatsApp provider configuration"""
    if provider_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Check if provider already exists
    existing = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if existing:
        # Update existing
        update_data = provider_data.dict(exclude={'company_id'}, exclude_unset=True)
        for field, value in update_data.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    
    provider = WhatsAppProvider(**provider_data.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/providers", response_model=WhatsAppProviderResponse)
async def get_whatsapp_provider(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get WhatsApp provider configuration"""
    provider = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provedor WhatsApp não configurado"
        )
    
    return provider


@router.get("/providers/connection-status", response_model=dict)
async def check_whatsapp_connection(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check WhatsApp API connection status"""
    provider = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provedor WhatsApp não configurado"
        )
    
    # Check connection using service
    connection_status = WhatsAppService.check_connection(
        instance_id=provider.instance_id,
        api_token=provider.api_key,
        api_url=provider.api_url
    )
    
    # Update provider status
    provider.is_connected = connection_status.get("connected", False)
    provider.connection_status = connection_status.get("status", "unknown")
    db.commit()
    
    return connection_status


@router.put("/providers/{provider_id}", response_model=WhatsAppProviderResponse)
async def update_whatsapp_provider(
    provider_id: int,
    provider_data: WhatsAppProviderUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update WhatsApp provider configuration"""
    provider = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.id == provider_id,
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provedor WhatsApp não encontrado"
        )
    
    update_data = provider_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)
    
    db.commit()
    db.refresh(provider)
    return provider


@router.delete("/providers/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_whatsapp_provider(
    provider_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete WhatsApp provider configuration"""
    provider = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.id == provider_id,
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provedor WhatsApp não encontrado"
        )
    
    db.delete(provider)
    db.commit()
    return None


# ========== WHATSAPP TEMPLATES ==========

@router.post("/templates", response_model=WhatsAppTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_whatsapp_template(
    template_data: WhatsAppTemplateCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new WhatsApp template"""
    if template_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    template = WhatsAppTemplate(**template_data.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/templates", response_model=List[WhatsAppTemplateResponse])
async def list_whatsapp_templates(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List WhatsApp templates"""
    query = db.query(WhatsAppTemplate).filter(
        WhatsAppTemplate.company_id == current_user.company_id
    )
    
    if is_active is not None:
        query = query.filter(WhatsAppTemplate.is_active == is_active)
    
    templates = query.all()
    return templates


@router.get("/templates/{template_id}", response_model=WhatsAppTemplateResponse)
async def get_whatsapp_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get WhatsApp template by ID"""
    template = db.query(WhatsAppTemplate).filter(
        WhatsAppTemplate.id == template_id,
        WhatsAppTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return template


@router.put("/templates/{template_id}", response_model=WhatsAppTemplateResponse)
async def update_whatsapp_template(
    template_id: int,
    template_data: WhatsAppTemplateUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update WhatsApp template"""
    template = db.query(WhatsAppTemplate).filter(
        WhatsAppTemplate.id == template_id,
        WhatsAppTemplate.company_id == current_user.company_id
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
async def delete_whatsapp_template(
    template_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete WhatsApp template"""
    template = db.query(WhatsAppTemplate).filter(
        WhatsAppTemplate.id == template_id,
        WhatsAppTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(template)
    db.commit()
    return None


# ========== WHATSAPP CAMPAIGNS ==========

@router.post("/campaigns", response_model=WhatsAppCampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_whatsapp_campaign(
    campaign_data: WhatsAppCampaignCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new WhatsApp campaign"""
    if campaign_data.company_id != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    campaign = WhatsAppCampaign(**campaign_data.dict())
    campaign.status = CampaignStatus.ACTIVE
    campaign.total_sent = 0
    campaign.total_delivered = 0
    campaign.total_read = 0
    campaign.total_failed = 0
    
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/campaigns", response_model=List[WhatsAppCampaignResponse])
async def list_whatsapp_campaigns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[CampaignStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List WhatsApp campaigns"""
    query = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.company_id == current_user.company_id
    )
    
    if status:
        query = query.filter(WhatsAppCampaign.status == status)
    
    campaigns = query.order_by(WhatsAppCampaign.created_at.desc()).offset(skip).limit(limit).all()
    return campaigns


@router.get("/campaigns/{campaign_id}", response_model=WhatsAppCampaignResponse)
async def get_whatsapp_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get WhatsApp campaign by ID"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return campaign


@router.put("/campaigns/{campaign_id}", response_model=WhatsAppCampaignResponse)
async def update_whatsapp_campaign(
    campaign_id: int,
    campaign_data: WhatsAppCampaignUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Update WhatsApp campaign"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    update_data = campaign_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/campaigns/{campaign_id}/send", response_model=dict)
async def send_whatsapp_campaign(
    campaign_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Send WhatsApp campaign with real integration"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Get provider configuration
    provider = db.query(WhatsAppProvider).filter(
        WhatsAppProvider.company_id == current_user.company_id
    ).first()
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provedor WhatsApp não configurado"
        )
    
    # Get template
    template = db.query(WhatsAppTemplate).filter(
        WhatsAppTemplate.id == campaign.template_id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template não encontrado"
        )
    
    # Get clients to send to
    clients_query = db.query(Client).filter(
        Client.company_id == current_user.company_id,
        Client.opt_in_marketing == True
    )
    
    # Apply campaign filters
    if campaign.client_filters:
        filters = campaign.client_filters
        if filters.get("tags"):
            # Filter by tags if implemented
            pass
        if filters.get("min_purchases"):
            # Filter by minimum purchases
            pass
    
    clients = clients_query.limit(campaign.max_recipients or 1000).all()
    
    sent_count = 0
    failed_count = 0
    
    # Send messages
    for client in clients:
        if not client.cellphone:
            continue
        
        # Replace template variables
        message = template.content
        if template.available_variables:
            for var in template.available_variables:
                value = getattr(client, var, "")
                message = message.replace(f"{{{var}}}", str(value))
        
        # Send message
        try:
            result = WhatsAppService.send_message(
                phone_number=client.cellphone,
                message=message,
                instance_id=provider.instance_id,
                api_token=provider.api_key,
                api_url=provider.api_url
            )
            
            # Create log entry
            log = WhatsAppCampaignLog(
                campaign_id=campaign_id,
                client_id=client.id,
                phone_number=client.cellphone,
                message=message,
                status=LogStatus.SENT if result.get("success") else LogStatus.FAILED,
                sent_at=datetime.utcnow() if result.get("success") else None,
                error_message=result.get("error") if not result.get("success") else None,
                gateway_message_id=result.get("message_id")
            )
            db.add(log)
            
            if result.get("success"):
                sent_count += 1
            else:
                failed_count += 1
        except Exception as e:
            # Create failed log entry
            log = WhatsAppCampaignLog(
                campaign_id=campaign_id,
                client_id=client.id,
                phone_number=client.cellphone,
                message=message,
                status=LogStatus.FAILED,
                error_message=str(e)
            )
            db.add(log)
            failed_count += 1
    
    # Update campaign
    campaign.status = CampaignStatus.SENT
    campaign.sent_at = datetime.utcnow()
    campaign.total_sent = sent_count
    campaign.total_failed = failed_count
    
    db.commit()
    
    return {
        "message": "Campanha enviada",
        "campaign_id": campaign_id,
        "sent": sent_count,
        "failed": failed_count,
        "total": len(clients)
    }


@router.get("/campaigns/{campaign_id}/logs", response_model=List[WhatsAppCampaignLogResponse])
async def get_campaign_logs(
    campaign_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[LogStatus] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get campaign logs"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    query = db.query(WhatsAppCampaignLog).filter(
        WhatsAppCampaignLog.campaign_id == campaign_id
    )
    
    if status:
        query = query.filter(WhatsAppCampaignLog.status == status)
    
    logs = query.order_by(WhatsAppCampaignLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs


@router.post("/campaigns/{campaign_id}/toggle-auto", response_model=WhatsAppCampaignResponse)
async def toggle_campaign_auto_send(
    campaign_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Toggle campaign auto-send"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    campaign.auto_send_enabled = not campaign.auto_send_enabled
    db.commit()
    db.refresh(campaign)
    return campaign


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_whatsapp_campaign(
    campaign_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Delete WhatsApp campaign"""
    campaign = db.query(WhatsAppCampaign).filter(
        WhatsAppCampaign.id == campaign_id,
        WhatsAppCampaign.company_id == current_user.company_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    db.delete(campaign)
    db.commit()
    return None

