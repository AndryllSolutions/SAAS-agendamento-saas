"""
Online Booking Configuration Endpoints
APIs completas para configuração de agendamento online
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.company import Company
from app.models.service import Service
from app.models.online_booking_config import (
    OnlineBookingConfig,
    OnlineBookingGallery,
    OnlineBookingBusinessHours
)
from app.schemas.online_booking_config import (
    OnlineBookingConfigCreate,
    OnlineBookingConfigUpdate,
    OnlineBookingConfigResponse,
    OnlineBookingGalleryCreate,
    OnlineBookingGalleryUpdate,
    OnlineBookingGalleryResponse,
    OnlineBookingBusinessHoursCreate,
    OnlineBookingBusinessHoursUpdate,
    OnlineBookingBusinessHoursResponse,
    OnlineBookingBusinessHoursBulkUpdate,
    OnlineBookingLinksResponse
)

router = APIRouter(
    redirect_slashes=False
)


# ========== CONFIGURATION ENDPOINTS ==========

@router.get("/config", response_model=OnlineBookingConfigResponse)
async def get_online_booking_config(
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Obter configuração de agendamento online da empresa
    """
    config = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        # Criar configuração padrão se não existir
        config = OnlineBookingConfig(
            company_id=current_user.company_id
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return config


@router.post("/config", response_model=OnlineBookingConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_online_booking_config(
    config_data: OnlineBookingConfigCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Criar configuração de agendamento online
    """
    if config_data.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para criar configuração para outra empresa"
        )
    
    # Verificar se já existe
    existing = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Configuração já existe. Use PUT para atualizar."
        )
    
    config = OnlineBookingConfig(**config_data.dict())
    db.add(config)
    db.commit()
    db.refresh(config)
    
    return config


@router.put("/config", response_model=OnlineBookingConfigResponse)
async def update_online_booking_config(
    config_data: OnlineBookingConfigUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Atualizar configuração de agendamento online
    """
    config = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração não encontrada"
        )
    
    # Atualizar campos
    update_data = config_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    return config


# ========== GALLERY ENDPOINTS ==========

@router.get("/gallery", response_model=List[OnlineBookingGalleryResponse])
async def list_gallery_images(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar imagens da galeria
    """
    images = db.query(OnlineBookingGallery).filter(
        OnlineBookingGallery.company_id == current_user.company_id,
        OnlineBookingGallery.is_active == True
    ).order_by(OnlineBookingGallery.display_order).all()
    
    return images


@router.post("/gallery", response_model=OnlineBookingGalleryResponse, status_code=status.HTTP_201_CREATED)
async def add_gallery_image(
    image_data: OnlineBookingGalleryCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Adicionar imagem à galeria
    """
    # Buscar configuração
    config = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configure o agendamento online primeiro"
        )
    
    # Criar imagem
    image = OnlineBookingGallery(
        company_id=current_user.company_id,
        config_id=config.id,
        **image_data.dict()
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return image


@router.put("/gallery/{image_id}", response_model=OnlineBookingGalleryResponse)
async def update_gallery_image(
    image_id: int,
    image_data: OnlineBookingGalleryUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Atualizar imagem da galeria
    """
    image = db.query(OnlineBookingGallery).filter(
        OnlineBookingGallery.id == image_id,
        OnlineBookingGallery.company_id == current_user.company_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada"
        )
    
    # Atualizar campos
    update_data = image_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(image, field, value)
    
    db.commit()
    db.refresh(image)
    
    return image


@router.delete("/gallery/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    image_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Excluir imagem da galeria
    """
    image = db.query(OnlineBookingGallery).filter(
        OnlineBookingGallery.id == image_id,
        OnlineBookingGallery.company_id == current_user.company_id
    ).first()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagem não encontrada"
        )
    
    db.delete(image)
    db.commit()
    
    return None


# ========== BUSINESS HOURS ENDPOINTS ==========

@router.get("/business-hours", response_model=List[OnlineBookingBusinessHoursResponse])
async def list_business_hours(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar horários de atendimento
    """
    hours = db.query(OnlineBookingBusinessHours).filter(
        OnlineBookingBusinessHours.company_id == current_user.company_id
    ).order_by(OnlineBookingBusinessHours.day_of_week).all()
    
    return hours


@router.post("/business-hours", response_model=OnlineBookingBusinessHoursResponse, status_code=status.HTTP_201_CREATED)
async def create_business_hours(
    hours_data: OnlineBookingBusinessHoursCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Criar horário de atendimento para um dia
    """
    # Buscar configuração
    config = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configure o agendamento online primeiro"
        )
    
    # Verificar se já existe para este dia
    existing = db.query(OnlineBookingBusinessHours).filter(
        OnlineBookingBusinessHours.company_id == current_user.company_id,
        OnlineBookingBusinessHours.day_of_week == hours_data.day_of_week
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Horário para este dia já existe. Use PUT para atualizar."
        )
    
    # Criar horário
    hours = OnlineBookingBusinessHours(
        company_id=current_user.company_id,
        config_id=config.id,
        **hours_data.dict()
    )
    
    db.add(hours)
    db.commit()
    db.refresh(hours)
    
    return hours


@router.put("/business-hours/{day_of_week}", response_model=OnlineBookingBusinessHoursResponse)
async def update_business_hours(
    day_of_week: int,
    hours_data: OnlineBookingBusinessHoursUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Atualizar horário de atendimento
    """
    hours = db.query(OnlineBookingBusinessHours).filter(
        OnlineBookingBusinessHours.company_id == current_user.company_id,
        OnlineBookingBusinessHours.day_of_week == day_of_week
    ).first()
    
    if not hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horário não encontrado"
        )
    
    # Atualizar campos
    update_data = hours_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hours, field, value)
    
    db.commit()
    db.refresh(hours)
    
    return hours


@router.post("/business-hours/bulk", response_model=List[OnlineBookingBusinessHoursResponse])
async def bulk_update_business_hours(
    bulk_data: OnlineBookingBusinessHoursBulkUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Atualizar horários em lote (todos os dias da semana)
    """
    # Buscar configuração
    config = db.query(OnlineBookingConfig).filter(
        OnlineBookingConfig.company_id == current_user.company_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configure o agendamento online primeiro"
        )
    
    # Deletar horários existentes
    db.query(OnlineBookingBusinessHours).filter(
        OnlineBookingBusinessHours.company_id == current_user.company_id
    ).delete()
    
    # Criar novos horários
    created_hours = []
    for hours_data in bulk_data.hours:
        hours = OnlineBookingBusinessHours(
            company_id=current_user.company_id,
            config_id=config.id,
            **hours_data.dict()
        )
        db.add(hours)
        created_hours.append(hours)
    
    db.commit()
    
    # Refresh all
    for hours in created_hours:
        db.refresh(hours)
    
    return created_hours


# ========== LINKS ENDPOINTS ==========

@router.get("/links", response_model=OnlineBookingLinksResponse)
async def get_booking_links(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter links de agendamento online
    """
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    if not company or not company.slug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada ou sem slug configurado"
        )
    
    # Gerar links
    base_url = f"https://atendo.website/?company={company.slug}"
    
    return OnlineBookingLinksResponse(
        base_url=base_url,
        general_link=f"{base_url}",
        instagram_link=f"{base_url}?utm_source=instagram",
        whatsapp_link=f"{base_url}?utm_source=whatsapp",
        google_link=f"{base_url}?utm_source=google",
        facebook_link=f"{base_url}?utm_source=facebook",
        slug=company.slug
    )


# ========== SERVICES AVAILABILITY ENDPOINTS ==========

@router.get("/services/available")
async def list_available_services(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar serviços disponíveis para agendamento online
    """
    services = db.query(Service).filter(
        Service.company_id == current_user.company_id,
        Service.is_active == True,
        Service.online_booking_enabled == True
    ).all()
    
    return services


@router.get("/services/unavailable")
async def list_unavailable_services(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar serviços indisponíveis para agendamento online
    """
    services = db.query(Service).filter(
        Service.company_id == current_user.company_id,
        Service.is_active == True,
        Service.online_booking_enabled == False
    ).all()
    
    return services


@router.put("/services/{service_id}/availability")
async def toggle_service_availability(
    service_id: int,
    available: bool = Query(...),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """
    Alternar disponibilidade de serviço para agendamento online
    """
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.company_id == current_user.company_id
    ).first()
    
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serviço não encontrado"
        )
    
    service.online_booking_enabled = available
    db.commit()
    db.refresh(service)
    
    return {
        "message": f"Serviço {'ativado' if available else 'desativado'} para agendamento online",
        "service_id": service_id,
        "available": available
    }


