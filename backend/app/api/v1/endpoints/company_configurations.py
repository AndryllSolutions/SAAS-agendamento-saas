"""
Company Configurations Endpoints
APIs para gerenciar todas as configurações da empresa
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_manager
from app.models.user import User
from app.models.company_configurations import (
    CompanyDetails,
    CompanyFinancialSettings,
    CompanyNotificationSettings,
    CompanyThemeSettings,
    CompanyAdminSettings
)
from app.schemas.company_configurations import (
    CompanyDetailsCreate,
    CompanyDetailsUpdate,
    CompanyDetailsResponse,
    CompanyFinancialSettingsUpdate,
    CompanyFinancialSettingsResponse,
    CompanyNotificationSettingsUpdate,
    CompanyNotificationSettingsResponse,
    CompanyThemeSettingsUpdate,
    CompanyThemeSettingsResponse,
    CompanyAdminSettingsUpdate,
    CompanyAdminSettingsResponse,
    AllCompanySettings
)

router = APIRouter()


# ========== COMPANY DETAILS ==========

@router.get("/details", response_model=CompanyDetailsResponse)
def get_company_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém detalhes cadastrais da empresa"""
    company_id = current_user.company_id
    
    details = db.query(CompanyDetails).filter(
        CompanyDetails.company_id == company_id
    ).first()
    
    if not details:
        # Criar registro padrão se não existir
        details = CompanyDetails(company_id=company_id)
        db.add(details)
        db.commit()
        db.refresh(details)
    
    return details


@router.put("/details", response_model=CompanyDetailsResponse)
def update_company_details(
    data: CompanyDetailsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Atualiza detalhes cadastrais da empresa"""
    company_id = current_user.company_id
    
    details = db.query(CompanyDetails).filter(
        CompanyDetails.company_id == company_id
    ).first()
    
    if not details:
        details = CompanyDetails(company_id=company_id)
        db.add(details)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(details, field, value)
    
    db.commit()
    db.refresh(details)
    
    return details


# ========== FINANCIAL SETTINGS ==========

@router.get("/financial", response_model=CompanyFinancialSettingsResponse)
def get_financial_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém configurações financeiras da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyFinancialSettings).filter(
        CompanyFinancialSettings.company_id == company_id
    ).first()
    
    if not settings:
        # Criar registro padrão se não existir
        settings = CompanyFinancialSettings(company_id=company_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/financial", response_model=CompanyFinancialSettingsResponse)
def update_financial_settings(
    data: CompanyFinancialSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Atualiza configurações financeiras da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyFinancialSettings).filter(
        CompanyFinancialSettings.company_id == company_id
    ).first()
    
    if not settings:
        settings = CompanyFinancialSettings(company_id=company_id)
        db.add(settings)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings


# ========== NOTIFICATION SETTINGS ==========

@router.get("/notifications", response_model=CompanyNotificationSettingsResponse)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém configurações de notificações da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyNotificationSettings).filter(
        CompanyNotificationSettings.company_id == company_id
    ).first()
    
    if not settings:
        # Criar registro padrão se não existir
        settings = CompanyNotificationSettings(company_id=company_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/notifications", response_model=CompanyNotificationSettingsResponse)
def update_notification_settings(
    data: CompanyNotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Atualiza configurações de notificações da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyNotificationSettings).filter(
        CompanyNotificationSettings.company_id == company_id
    ).first()
    
    if not settings:
        settings = CompanyNotificationSettings(company_id=company_id)
        db.add(settings)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings


# ========== THEME SETTINGS ==========

@router.get("/theme", response_model=CompanyThemeSettingsResponse)
def get_theme_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém configurações de tema da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyThemeSettings).filter(
        CompanyThemeSettings.company_id == company_id
    ).first()
    
    if not settings:
        # Criar registro padrão se não existir
        settings = CompanyThemeSettings(company_id=company_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/theme", response_model=CompanyThemeSettingsResponse)
def update_theme_settings(
    data: CompanyThemeSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualiza configurações de tema da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyThemeSettings).filter(
        CompanyThemeSettings.company_id == company_id
    ).first()
    
    if not settings:
        settings = CompanyThemeSettings(company_id=company_id)
        db.add(settings)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings


# ========== ADMIN SETTINGS ==========

@router.get("/admin", response_model=CompanyAdminSettingsResponse)
def get_admin_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém configurações administrativas da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyAdminSettings).filter(
        CompanyAdminSettings.company_id == company_id
    ).first()
    
    if not settings:
        # Criar registro padrão se não existir
        settings = CompanyAdminSettings(company_id=company_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/admin", response_model=CompanyAdminSettingsResponse)
def update_admin_settings(
    data: CompanyAdminSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Atualiza configurações administrativas da empresa"""
    company_id = current_user.company_id
    
    settings = db.query(CompanyAdminSettings).filter(
        CompanyAdminSettings.company_id == company_id
    ).first()
    
    if not settings:
        settings = CompanyAdminSettings(company_id=company_id)
        db.add(settings)
    
    # Atualizar campos
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings


# ========== ALL SETTINGS ==========

@router.get("/all", response_model=AllCompanySettings)
def get_all_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtém todas as configurações da empresa de uma vez"""
    company_id = current_user.company_id
    
    # Buscar ou criar cada configuração
    details = db.query(CompanyDetails).filter(
        CompanyDetails.company_id == company_id
    ).first()
    if not details:
        details = CompanyDetails(company_id=company_id)
        db.add(details)
    
    financial = db.query(CompanyFinancialSettings).filter(
        CompanyFinancialSettings.company_id == company_id
    ).first()
    if not financial:
        financial = CompanyFinancialSettings(company_id=company_id)
        db.add(financial)
    
    notifications = db.query(CompanyNotificationSettings).filter(
        CompanyNotificationSettings.company_id == company_id
    ).first()
    if not notifications:
        notifications = CompanyNotificationSettings(company_id=company_id)
        db.add(notifications)
    
    theme = db.query(CompanyThemeSettings).filter(
        CompanyThemeSettings.company_id == company_id
    ).first()
    if not theme:
        theme = CompanyThemeSettings(company_id=company_id)
        db.add(theme)
    
    admin = db.query(CompanyAdminSettings).filter(
        CompanyAdminSettings.company_id == company_id
    ).first()
    if not admin:
        admin = CompanyAdminSettings(company_id=company_id)
        db.add(admin)
    
    db.commit()
    
    return AllCompanySettings(
        details=details,
        financial=financial,
        notifications=notifications,
        theme=theme,
        admin=admin
    )
