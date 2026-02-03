"""
Notification System Endpoints - Templates, Triggers and Queue CRUD
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_manager
from app.models.user import User
from app.models.notification import (
    NotificationTemplate, NotificationTrigger, NotificationQueue,
    NotificationEventType, TriggerCondition
)
from app.schemas.notification_system import (
    NotificationTemplateCreate, NotificationTemplateUpdate, NotificationTemplateResponse,
    NotificationTriggerCreate, NotificationTriggerUpdate, NotificationTriggerResponse,
    NotificationQueueCreate, NotificationQueueResponse,
    SendNotificationRequest, SendNotificationResponse,
    TestNotificationRequest, TemplatePreviewResponse
)

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


# ============================================================================
# TEMPLATES CRUD
# ============================================================================

@router.get("/templates", response_model=List[NotificationTemplateResponse])
async def list_templates(
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    is_active: Optional[bool] = Query(None, description="Filtrar por status"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os templates de notificação da empresa"""
    query = db.query(NotificationTemplate).filter(
        NotificationTemplate.company_id == current_user.company_id
    )
    
    if event_type:
        query = query.filter(NotificationTemplate.event_type == event_type)
    if is_active is not None:
        query = query.filter(NotificationTemplate.is_active == is_active)
    
    return query.order_by(NotificationTemplate.name).all()


@router.post("/templates", response_model=NotificationTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: NotificationTemplateCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cria um novo template de notificação"""
    template = NotificationTemplate(
        company_id=current_user.company_id,
        created_by=current_user.id,
        name=template_data.name,
        description=template_data.description,
        event_type=template_data.event_type.value,
        channel=template_data.channel.value,
        title_template=template_data.title_template,
        body_template=template_data.body_template,
        url_template=template_data.url_template,
        icon_url=template_data.icon_url,
        is_active=template_data.is_active,
        is_default=template_data.is_default
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template


@router.get("/templates/{template_id}", response_model=NotificationTemplateResponse)
async def get_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um template específico"""
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id,
        NotificationTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return template


@router.put("/templates/{template_id}", response_model=NotificationTemplateResponse)
async def update_template(
    template_id: int,
    template_data: NotificationTemplateUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Atualiza um template"""
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id,
        NotificationTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    update_data = template_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(value, 'value'):  # Enum
            value = value.value
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Remove um template"""
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id,
        NotificationTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    db.delete(template)
    db.commit()


@router.post("/templates/{template_id}/preview", response_model=TemplatePreviewResponse)
async def preview_template(
    template_id: int,
    request: TestNotificationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Preview de um template com dados de teste"""
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == template_id,
        NotificationTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    rendered = template.render(request.test_context or {})
    return TemplatePreviewResponse(**rendered)


# ============================================================================
# TRIGGERS CRUD
# ============================================================================

@router.get("/triggers", response_model=List[NotificationTriggerResponse])
async def list_triggers(
    event_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista todos os triggers da empresa"""
    query = db.query(NotificationTrigger).filter(
        NotificationTrigger.company_id == current_user.company_id
    )
    
    if event_type:
        query = query.filter(NotificationTrigger.event_type == event_type)
    if is_active is not None:
        query = query.filter(NotificationTrigger.is_active == is_active)
    
    return query.order_by(NotificationTrigger.name).all()


@router.post("/triggers", response_model=NotificationTriggerResponse, status_code=status.HTTP_201_CREATED)
async def create_trigger(
    trigger_data: NotificationTriggerCreate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cria um novo trigger"""
    # Verificar se template existe
    template = db.query(NotificationTemplate).filter(
        NotificationTemplate.id == trigger_data.template_id,
        NotificationTemplate.company_id == current_user.company_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    trigger = NotificationTrigger(
        company_id=current_user.company_id,
        created_by=current_user.id,
        template_id=trigger_data.template_id,
        name=trigger_data.name,
        event_type=trigger_data.event_type.value,
        trigger_condition=trigger_data.trigger_condition.value,
        trigger_offset_minutes=trigger_data.trigger_offset_minutes,
        trigger_time=trigger_data.trigger_time,
        trigger_day_of_week=trigger_data.trigger_day_of_week,
        trigger_day_of_month=trigger_data.trigger_day_of_month,
        filters=trigger_data.filters,
        target_roles=trigger_data.target_roles,
        send_to_client=trigger_data.send_to_client,
        send_to_professional=trigger_data.send_to_professional,
        send_to_manager=trigger_data.send_to_manager,
        is_active=trigger_data.is_active
    )
    
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    
    return trigger


@router.get("/triggers/{trigger_id}", response_model=NotificationTriggerResponse)
async def get_trigger(
    trigger_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém um trigger específico"""
    trigger = db.query(NotificationTrigger).filter(
        NotificationTrigger.id == trigger_id,
        NotificationTrigger.company_id == current_user.company_id
    ).first()
    
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger não encontrado")
    
    return trigger


@router.put("/triggers/{trigger_id}", response_model=NotificationTriggerResponse)
async def update_trigger(
    trigger_id: int,
    trigger_data: NotificationTriggerUpdate,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Atualiza um trigger"""
    trigger = db.query(NotificationTrigger).filter(
        NotificationTrigger.id == trigger_id,
        NotificationTrigger.company_id == current_user.company_id
    ).first()
    
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger não encontrado")
    
    update_data = trigger_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(value, 'value'):
            value = value.value
        setattr(trigger, field, value)
    
    trigger.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(trigger)
    
    return trigger


@router.delete("/triggers/{trigger_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trigger(
    trigger_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Remove um trigger"""
    trigger = db.query(NotificationTrigger).filter(
        NotificationTrigger.id == trigger_id,
        NotificationTrigger.company_id == current_user.company_id
    ).first()
    
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger não encontrado")
    
    db.delete(trigger)
    db.commit()


@router.post("/triggers/{trigger_id}/toggle", response_model=NotificationTriggerResponse)
async def toggle_trigger(
    trigger_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Ativa/desativa um trigger"""
    trigger = db.query(NotificationTrigger).filter(
        NotificationTrigger.id == trigger_id,
        NotificationTrigger.company_id == current_user.company_id
    ).first()
    
    if not trigger:
        raise HTTPException(status_code=404, detail="Trigger não encontrado")
    
    trigger.is_active = not trigger.is_active
    trigger.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(trigger)
    
    return trigger


# ============================================================================
# QUEUE
# ============================================================================

@router.get("/queue", response_model=List[NotificationQueueResponse])
async def list_queue(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Lista notificações na fila"""
    query = db.query(NotificationQueue).filter(
        NotificationQueue.company_id == current_user.company_id
    )
    
    if status:
        query = query.filter(NotificationQueue.status == status)
    
    return query.order_by(NotificationQueue.scheduled_at.desc()).limit(limit).all()


@router.delete("/queue/{queue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_queued_notification(
    queue_id: int,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Cancela uma notificação agendada"""
    item = db.query(NotificationQueue).filter(
        NotificationQueue.id == queue_id,
        NotificationQueue.company_id == current_user.company_id,
        NotificationQueue.status == "pending"
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Notificação não encontrada ou já processada")
    
    item.status = "cancelled"
    item.updated_at = datetime.utcnow()
    db.commit()


# ============================================================================
# SEND NOTIFICATION
# ============================================================================

@router.post("/send", response_model=SendNotificationResponse)
async def send_notification(
    request: SendNotificationRequest,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Envia notificação manual para usuários"""
    from app.services.push_service import PushNotificationService
    
    sent_count = 0
    failed_count = 0
    queued_count = 0
    
    # Se agendado para depois, adiciona na fila
    if request.schedule_at and request.schedule_at > datetime.utcnow():
        for user_id in request.user_ids:
            queue_item = NotificationQueue(
                company_id=current_user.company_id,
                user_id=user_id,
                channel=request.channel.value,
                title=request.title,
                body=request.body,
                url=request.url,
                scheduled_at=request.schedule_at,
                event_type="manual"
            )
            db.add(queue_item)
            queued_count += 1
        
        db.commit()
        return SendNotificationResponse(
            success=True,
            message=f"Notificações agendadas para {request.schedule_at}",
            queued_count=queued_count
        )
    
    # Envio imediato via push
    if request.channel.value == "push":
        push_service = PushNotificationService(db)
        
        for user_id in request.user_ids:
            try:
                result = push_service.send_to_user(
                    user_id=user_id,
                    title=request.title,
                    body=request.body,
                    url=request.url,
                    company_id=current_user.company_id
                )
                if result.get("success"):
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                failed_count += 1
    
    return SendNotificationResponse(
        success=sent_count > 0,
        message=f"Enviadas: {sent_count}, Falhas: {failed_count}",
        sent_count=sent_count,
        failed_count=failed_count
    )


# ============================================================================
# EVENT TYPES
# ============================================================================

@router.get("/event-types")
async def list_event_types():
    """Lista todos os tipos de eventos disponíveis"""
    return [
        {"value": e.value, "label": e.value.replace("_", " ").title()}
        for e in NotificationEventType
    ]


@router.get("/trigger-conditions")
async def list_trigger_conditions():
    """Lista todas as condições de trigger disponíveis"""
    return [
        {"value": c.value, "label": c.value.replace("_", " ").title()}
        for c in TriggerCondition
    ]