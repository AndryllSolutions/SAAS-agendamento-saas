"""
Google Calendar Integration Endpoints
API endpoints para gerenciar integração com Google Calendar
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.google_calendar_integration import GoogleCalendarIntegration
from app.services.google_calendar_service import get_google_calendar_service
from app.schemas.google_calendar import (
    GoogleCalendarIntegrationResponse,
    GoogleCalendarAuthResponse,
    GoogleCalendarSyncResponse,
    GoogleCalendarStatusResponse
)

router = APIRouter()


@router.get("/auth-url", response_model=GoogleCalendarAuthResponse)
async def get_google_calendar_auth_url(
    redirect_uri: str = Query(..., description="URI para redirect após autorização"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém URL de autorização do Google Calendar OAuth
    """
    try:
        service = get_google_calendar_service(db)
        auth_url = service.get_auth_url(current_user.id, redirect_uri)
        
        return GoogleCalendarAuthResponse(
            auth_url=auth_url,
            user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao gerar URL de autorização: {str(e)}"
        )


@router.post("/oauth-callback", response_model=GoogleCalendarIntegrationResponse)
async def handle_oauth_callback(
    code: str = Query(..., description="Código de autorização do Google"),
    redirect_uri: str = Query(..., description="URI usado na autorização"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Processa callback OAuth e salva integração
    """
    try:
        service = get_google_calendar_service(db)
        integration = service.handle_oauth_callback(code, current_user.id, redirect_uri)
        
        return GoogleCalendarIntegrationResponse.model_validate(integration)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao processar autorização: {str(e)}"
        )


@router.get("/status", response_model=GoogleCalendarStatusResponse)
async def get_integration_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retorna status da integração Google Calendar do usuário
    """
    service = get_google_calendar_service(db)
    status = service.get_integration_status(current_user.id)
    
    return GoogleCalendarStatusResponse(**status)


@router.get("/integration", response_model=GoogleCalendarIntegrationResponse)
async def get_integration(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes da integração do usuário
    """
    integration = db.query(GoogleCalendarIntegration).filter(
        GoogleCalendarIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    return GoogleCalendarIntegrationResponse.model_validate(integration)


@router.put("/integration/toggle")
async def toggle_integration(
    enabled: bool = Query(..., description="Ativar/desativar integração"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Ativa/desativa integração Google Calendar
    """
    integration = db.query(GoogleCalendarIntegration).filter(
        GoogleCalendarIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    integration.sync_enabled = enabled
    db.commit()
    
    return {
        "success": True,
        "message": f"Integração {'ativada' if enabled else 'desativada'} com sucesso",
        "sync_enabled": enabled
    }


@router.put("/integration/sync-settings")
async def update_sync_settings(
    sync_config: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza configurações de sincronização
    """
    integration = db.query(GoogleCalendarIntegration).filter(
        GoogleCalendarIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    # Validar configurações
    valid_keys = [
        'sync_past_days', 'sync_future_days', 'conflict_resolution',
        'event_prefix', 'include_client_info', 'include_notes', 'reminder_minutes'
    ]
    
    filtered_config = {k: v for k, v in sync_config.items() if k in valid_keys}
    
    # Merge com configurações existentes
    current_config = integration.sync_config or {}
    current_config.update(filtered_config)
    integration.sync_config = current_config
    
    db.commit()
    
    return {
        "success": True,
        "message": "Configurações de sincronização atualizadas",
        "sync_config": current_config
    }


@router.post("/sync/manual", response_model=GoogleCalendarSyncResponse)
async def manual_sync(
    days_back: int = Query(7, description="Dias atrás para sincronizar"),
    days_forward: int = Query(30, description="Dias à frente para sincronizar"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Executa sincronização manual de agendamentos
    """
    service = get_google_calendar_service(db)
    results = service.sync_all_appointments_for_user(
        current_user.id, days_back, days_forward
    )
    
    if "error" in results:
        raise HTTPException(
            status_code=400,
            detail=results["error"]
        )
    
    return GoogleCalendarSyncResponse(
        success=True,
        synced_count=results.get("synced", 0),
        error_count=results.get("errors", 0),
        skipped_count=results.get("skipped", 0),
        message=f"Sincronização concluída: {results.get('synced', 0)} agendamentos sincronizados"
    )


@router.post("/sync/appointment/{appointment_id}")
async def sync_single_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Sincroniza um agendamento específico
    """
    from app.models.appointment import Appointment
    
    # Verificar se o agendamento existe e pertence ao usuário
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.professional_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Agendamento não encontrado ou sem permissão"
        )
    
    service = get_google_calendar_service(db)
    success = service.sync_appointment_to_google(appointment)
    
    if success:
        return {
            "success": True,
            "message": f"Agendamento {appointment_id} sincronizado com sucesso"
        }
    else:
        raise HTTPException(
            status_code=400,
            detail="Erro na sincronização do agendamento"
        )


@router.delete("/integration")
async def disconnect_integration(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Desconecta integração Google Calendar
    """
    integration = db.query(GoogleCalendarIntegration).filter(
        GoogleCalendarIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    # Desativar integração em vez de deletar (preservar histórico)
    integration.is_active = False
    integration.sync_enabled = False
    integration.access_token = None
    integration.refresh_token = None
    
    db.commit()
    
    return {
        "success": True,
        "message": "Integração desconectada com sucesso"
    }


@router.get("/sync-logs")
async def get_sync_logs(
    limit: int = Query(50, le=100, description="Número máximo de logs"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém logs de sincronização do usuário
    """
    from app.models.google_calendar_integration import CalendarSyncLog
    
    integration = db.query(GoogleCalendarIntegration).filter(
        GoogleCalendarIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        return {"logs": []}
    
    logs = db.query(CalendarSyncLog).filter(
        CalendarSyncLog.integration_id == integration.id
    ).order_by(CalendarSyncLog.synced_at.desc()).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "appointment_id": log.appointment_id,
                "action": log.action,
                "status": log.status,
                "sync_direction": log.sync_direction,
                "synced_at": log.synced_at,
                "error_message": log.error_message,
                "google_event_id": log.google_event_id
            }
            for log in logs
        ]
    }
