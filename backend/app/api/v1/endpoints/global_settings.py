"""
Global Settings Endpoints - Configurações globais do sistema SaaS
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.rbac import require_saas_admin
from app.models.user import User
from app.models.global_settings import GlobalSettings
from app.schemas.global_settings import (
    GlobalSettingsResponse, GlobalSettingsCreate, GlobalSettingsUpdate,
    GlobalSettingsPublic, GlobalSettingsBatch, GlobalSettingsCategoryResponse,
    SystemStatusResponse
)

router = APIRouter()


@router.get("/public", response_model=List[GlobalSettingsPublic])
async def get_public_settings(
    db: Session = Depends(get_db)
):
    """Get public settings (no authentication required)"""
    settings = db.query(GlobalSettings).filter(
        GlobalSettings.is_active == True,
        GlobalSettings.is_public == True
    ).order_by(GlobalSettings.category, GlobalSettings.key).all()
    
    public_settings = []
    for setting in settings:
        public_settings.append(GlobalSettingsPublic(
            key=setting.key,
            category=setting.category,
            value=setting.parsed_value,
            description=setting.description
        ))
    
    return public_settings


@router.get("/", response_model=List[GlobalSettingsResponse])
async def list_settings(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """List all global settings (SaaS admin only)"""
    query = db.query(GlobalSettings)
    
    if category:
        query = query.filter(GlobalSettings.category == category)
    
    if is_active is not None:
        query = query.filter(GlobalSettings.is_active == is_active)
    
    settings = query.order_by(GlobalSettings.category, GlobalSettings.key).offset(skip).limit(limit).all()
    
    # Adicionar valor parseado
    result = []
    for setting in settings:
        setting_data = GlobalSettingsResponse.model_validate(setting)
        setting_data.parsed_value = setting.parsed_value
        result.append(setting_data)
    
    return result


@router.get("/categories", response_model=List[GlobalSettingsCategoryResponse])
async def list_settings_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """List settings grouped by category (SaaS admin only)"""
    settings = db.query(GlobalSettings).filter(
        GlobalSettings.is_active == True
    ).order_by(GlobalSettings.category, GlobalSettings.key).all()
    
    # Agrupar por categoria
    categories = {}
    for setting in settings:
        if setting.category not in categories:
            categories[setting.category] = []
        
        setting_data = GlobalSettingsResponse.model_validate(setting)
        setting_data.parsed_value = setting.parsed_value
        categories[setting.category].append(setting_data)
    
    # Criar resposta
    result = []
    for category, settings_list in categories.items():
        result.append(GlobalSettingsCategoryResponse(
            category=category,
            settings=settings_list,
            total=len(settings_list)
        ))
    
    return result


@router.get("/{key}", response_model=GlobalSettingsResponse)
async def get_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """Get a specific setting by key (SaaS admin only)"""
    setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    setting_data = GlobalSettingsResponse.model_validate(setting)
    setting_data.parsed_value = setting.parsed_value
    
    return setting_data


@router.post("/", response_model=GlobalSettingsResponse, status_code=status.HTTP_201_CREATED)
async def create_setting(
    setting_data: GlobalSettingsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """Create a new global setting (SaaS admin only)"""
    # Check if key already exists
    existing = db.query(GlobalSettings).filter(GlobalSettings.key == setting_data.key).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Setting with this key already exists"
        )
    
    setting = GlobalSettings(**setting_data.model_dump())
    setting.updated_by = current_user.id
    setting.updated_at = datetime.utcnow()
    
    db.add(setting)
    db.commit()
    db.refresh(setting)
    
    setting_data = GlobalSettingsResponse.model_validate(setting)
    setting_data.parsed_value = setting.parsed_value
    
    return setting_data


@router.put("/{key}", response_model=GlobalSettingsResponse)
async def update_setting(
    key: str,
    setting_data: GlobalSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """Update a global setting (SaaS admin only)"""
    setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    # Update fields
    update_data = setting_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    
    setting.updated_by = current_user.id
    setting.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(setting)
    
    setting_data = GlobalSettingsResponse.model_validate(setting)
    setting_data.parsed_value = setting.parsed_value
    
    return setting_data


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """Delete a global setting (SaaS admin only)"""
    setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    # Soft delete
    setting.is_active = False
    setting.updated_by = current_user.id
    setting.updated_at = datetime.utcnow()
    
    db.commit()
    
    return None


@router.post("/batch", response_model=List[GlobalSettingsResponse])
async def update_batch_settings(
    batch_data: GlobalSettingsBatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_saas_admin)
):
    """Update multiple settings at once (SaaS admin only)"""
    updated_settings = []
    
    for key, value in batch_data.settings.items():
        setting = db.query(GlobalSettings).filter(GlobalSettings.key == key).first()
        
        if setting:
            setting.parsed_value = value
            setting.updated_by = current_user.id
            setting.updated_at = datetime.utcnow()
            
            setting_data = GlobalSettingsResponse.model_validate(setting)
            setting_data.parsed_value = setting.parsed_value
            updated_settings.append(setting_data)
    
    db.commit()
    
    return updated_settings


@router.get("/system/status", response_model=SystemStatusResponse)
async def get_system_status(
    db: Session = Depends(get_db)
):
    """Get system status (public endpoint)"""
    # Get maintenance mode setting
    maintenance_setting = db.query(GlobalSettings).filter(
        GlobalSettings.key == "maintenance_mode",
        GlobalSettings.is_active == True
    ).first()
    
    maintenance_mode = False
    maintenance_message = None
    
    if maintenance_setting:
        maintenance_mode = maintenance_setting.parsed_value
        
        # Get maintenance message
        message_setting = db.query(GlobalSettings).filter(
            GlobalSettings.key == "maintenance_message",
            GlobalSettings.is_active == True
        ).first()
        
        if message_setting:
            maintenance_message = message_setting.parsed_value
    
    # Get system version
    version_setting = db.query(GlobalSettings).filter(
        GlobalSettings.key == "system_version",
        GlobalSettings.is_active == True
    ).first()
    
    system_version = version_setting.parsed_value if version_setting else "1.0.0"
    
    return SystemStatusResponse(
        maintenance_mode=maintenance_mode,
        maintenance_message=maintenance_message,
        system_version=system_version
    )