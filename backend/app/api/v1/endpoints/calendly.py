"""
Calendly Integration Endpoints
API endpoints para gerenciar integração com Calendly
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.calendly_integration import (
    CalendlyIntegration, 
    CalendlyEventType,
    CalendlySyncLog
)
from app.services.calendly_service import get_calendly_service
from app.schemas.calendly import (
    CalendlyIntegrationResponse,
    CalendlyAuthResponse,
    CalendlySyncResponse,
    CalendlyStatusResponse,
    CalendlyEventTypeResponse,
    CalendlyEventTypeMappingUpdate
)

router = APIRouter()


@router.get("/auth-url", response_model=CalendlyAuthResponse)
async def get_calendly_auth_url(
    redirect_uri: str = Query(..., description="URI para redirect após autorização"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém URL de autorização do Calendly OAuth
    """
    try:
        service = get_calendly_service(db)
        auth_url = service.get_auth_url(current_user.id, redirect_uri)
        
        return CalendlyAuthResponse(
            auth_url=auth_url,
            user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao gerar URL de autorização: {str(e)}"
        )


@router.post("/oauth-callback", response_model=CalendlyIntegrationResponse)
async def handle_oauth_callback(
    code: str = Query(..., description="Código de autorização do Calendly"),
    redirect_uri: str = Query(..., description="URI usado na autorização"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Processa callback OAuth e salva integração
    """
    try:
        service = get_calendly_service(db)
        integration = await service.handle_oauth_callback(code, current_user.id, redirect_uri)
        
        return CalendlyIntegrationResponse.model_validate(integration)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao processar autorização: {str(e)}"
        )


@router.get("/status", response_model=CalendlyStatusResponse)
async def get_integration_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retorna status da integração Calendly do usuário
    """
    service = get_calendly_service(db)
    status = service.get_integration_status(current_user.id)
    
    return CalendlyStatusResponse(**status)


@router.get("/integration", response_model=CalendlyIntegrationResponse)
async def get_integration(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes da integração do usuário
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    return CalendlyIntegrationResponse.model_validate(integration)


@router.put("/integration/toggle")
async def toggle_integration(
    enabled: bool = Query(..., description="Ativar/desativar integração"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Ativa/desativa integração Calendly
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
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
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    # Validar configurações
    valid_keys = [
        'sync_past_days', 'sync_future_days', 'event_types_to_sync',
        'auto_confirm_bookings', 'create_client_if_not_exists',
        'default_service_id', 'notification_on_booking'
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


@router.post("/sync/manual", response_model=CalendlySyncResponse)
async def manual_sync(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Executa sincronização manual de eventos do Calendly
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    service = get_calendly_service(db)
    results = await service.sync_calendly_events_to_appointments(integration)
    
    if "error" in results:
        raise HTTPException(
            status_code=400,
            detail=results["error"]
        )
    
    return CalendlySyncResponse(
        success=True,
        created_count=results.get("created", 0),
        updated_count=results.get("updated", 0),
        error_count=results.get("errors", 0),
        message=f"Sincronização concluída: {results.get('created', 0)} criados, {results.get('updated', 0)} atualizados"
    )


@router.delete("/integration")
async def disconnect_integration(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Desconecta integração Calendly
    """
    service = get_calendly_service(db)
    success = await service.disconnect(current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    return {
        "success": True,
        "message": "Integração desconectada com sucesso"
    }


# =========================================================================
# Event Types Management
# =========================================================================

@router.get("/event-types", response_model=List[CalendlyEventTypeResponse])
async def get_event_types(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Lista tipos de evento do Calendly do usuário
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    event_types = db.query(CalendlyEventType).filter(
        CalendlyEventType.integration_id == integration.id
    ).all()
    
    return [CalendlyEventTypeResponse.model_validate(et) for et in event_types]


@router.put("/event-types/{event_type_id}/mapping")
async def update_event_type_mapping(
    event_type_id: int,
    mapping: CalendlyEventTypeMappingUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza mapeamento de tipo de evento para serviço local
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    event_type = db.query(CalendlyEventType).filter(
        CalendlyEventType.id == event_type_id,
        CalendlyEventType.integration_id == integration.id
    ).first()
    
    if not event_type:
        raise HTTPException(
            status_code=404,
            detail="Tipo de evento não encontrado"
        )
    
    if mapping.service_id is not None:
        event_type.service_id = mapping.service_id
    if mapping.is_active is not None:
        event_type.is_active = mapping.is_active
    if mapping.auto_create_appointment is not None:
        event_type.auto_create_appointment = mapping.auto_create_appointment
    
    db.commit()
    
    return {
        "success": True,
        "message": "Mapeamento atualizado com sucesso",
        "event_type_id": event_type_id,
        "service_id": event_type.service_id
    }


@router.post("/event-types/refresh")
async def refresh_event_types(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza lista de tipos de evento do Calendly
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=404,
            detail="Integração não encontrada"
        )
    
    service = get_calendly_service(db)
    await service._fetch_event_types(integration)
    
    return {
        "success": True,
        "message": "Tipos de evento atualizados"
    }


# =========================================================================
# Webhook Endpoint
# =========================================================================

@router.post("/webhook")
async def calendly_webhook(
    request: Request,
    db: Session = Depends(get_db),
    calendly_webhook_signature: str = Header(None, alias="Calendly-Webhook-Signature")
):
    """
    Endpoint para receber webhooks do Calendly
    """
    try:
        payload = await request.json()
        event_type = payload.get("event")
        
        if not event_type:
            raise HTTPException(status_code=400, detail="Invalid webhook payload")
        
        service = get_calendly_service(db)
        result = await service.process_webhook_event(event_type, payload)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar webhook: {str(e)}"
        )


# =========================================================================
# Sync Logs
# =========================================================================

@router.get("/sync-logs")
async def get_sync_logs(
    limit: int = Query(50, le=100, description="Número máximo de logs"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtém logs de sincronização do usuário
    """
    integration = db.query(CalendlyIntegration).filter(
        CalendlyIntegration.user_id == current_user.id
    ).first()
    
    if not integration:
        return {"logs": []}
    
    logs = db.query(CalendlySyncLog).filter(
        CalendlySyncLog.integration_id == integration.id
    ).order_by(CalendlySyncLog.synced_at.desc()).limit(limit).all()
    
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
                "calendly_event_uri": log.calendly_event_uri
            }
            for log in logs
        ]
    }
