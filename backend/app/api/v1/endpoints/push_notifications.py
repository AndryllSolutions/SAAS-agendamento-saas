"""
Push Notifications Endpoints

Endpoints para gerenciar Web Push Notifications.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.push_notification import UserPushSubscription, PushNotificationLog
from app.schemas.push_notification import (
    UserPushSubscriptionCreate,
    UserPushSubscriptionUpdate,
    UserPushSubscriptionResponse,
    SendPushToUserRequest,
    SendPushToCompanyRequest,
    SendPushResponse,
    TestPushNotificationRequest,
    PushNotificationLogResponse
)
from app.services.push_service import PushNotificationService, VAPIDKeyManager

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


@router.get("/vapid-public-key", response_model=dict)
def get_vapid_public_key():
    """
    Retorna a chave pública VAPID.
    
    O frontend precisa dessa chave para criar subscriptions.
    Esta é a ÚNICA chave que deve ser exposta publicamente.
    """
    keys = VAPIDKeyManager.get_vapid_keys()
    return {
        "public_key": keys['public_key']
    }


@router.post("/subscribe", response_model=UserPushSubscriptionResponse, status_code=status.HTTP_201_CREATED)
def subscribe_push(
    data: UserPushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registra uma nova subscription de push para o usuário atual.
    
    Chamado pelo frontend após o usuário aceitar notificações.
    """
    service = PushNotificationService(db)
    
    subscription = service.create_subscription(
        user_id=current_user.id,
        company_id=current_user.company_id,
        endpoint=data.subscription.endpoint,
        p256dh=data.subscription.keys.p256dh,
        auth=data.subscription.keys.auth,
        browser=data.browser,
        device_name=data.device_name,
        user_agent=data.user_agent
    )
    
    return subscription


@router.get("/subscriptions", response_model=List[UserPushSubscriptionResponse])
def list_my_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todas as subscriptions do usuário atual.
    """
    subscriptions = db.query(UserPushSubscription).filter(
        UserPushSubscription.user_id == current_user.id
    ).all()
    
    return subscriptions


@router.get("/subscriptions/{subscription_id}", response_model=UserPushSubscriptionResponse)
def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtém uma subscription específica do usuário atual.
    """
    subscription = db.query(UserPushSubscription).filter(
        UserPushSubscription.id == subscription_id,
        UserPushSubscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return subscription


@router.put("/subscriptions/{subscription_id}", response_model=UserPushSubscriptionResponse)
def update_subscription(
    subscription_id: int,
    data: UserPushSubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza uma subscription existente.
    """
    subscription = db.query(UserPushSubscription).filter(
        UserPushSubscription.id == subscription_id,
        UserPushSubscription.user_id == current_user.id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subscription, field, value)
    
    db.commit()
    db.refresh(subscription)
    
    return subscription


@router.delete("/subscriptions/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deleta uma subscription (quando usuário desativa notificações).
    """
    service = PushNotificationService(db)
    
    deleted = service.delete_subscription(subscription_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return None


@router.post("/test", response_model=SendPushResponse)
def test_push_notification(
    data: TestPushNotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envia uma notificação de teste para o usuário atual.
    
    Útil para testar se as notificações estão funcionando.
    """
    service = PushNotificationService(db)
    
    logs = service.send_to_user(
        user_id=current_user.id,
        title=data.title,
        body=data.body,
        url=data.url,
        notification_type="test"
    )
    
    sent_count = sum(1 for log in logs if log.status == "sent")
    failed_count = sum(1 for log in logs if log.status == "failed")
    
    return SendPushResponse(
        success=sent_count > 0,
        sent_count=sent_count,
        failed_count=failed_count,
        log_ids=[log.id for log in logs],
        errors=[log.error_message for log in logs if log.error_message]
    )


@router.post("/send-to-user", response_model=SendPushResponse)
def send_push_to_user(
    data: SendPushToUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envia notificação para um usuário específico.
    
    Requer que o remetente e destinatário sejam da mesma empresa.
    """
    # Verificar se user pertence à mesma empresa
    target_user = db.query(User).filter(
        User.id == data.user_id,
        User.company_id == current_user.company_id
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or not in your company"
        )
    
    service = PushNotificationService(db)
    
    logs = service.send_to_user(
        user_id=data.user_id,
        title=data.notification.title,
        body=data.notification.body,
        url=data.notification.url,
        icon=data.notification.icon,
        badge=data.notification.badge,
        image=data.notification.image,
        tag=data.notification.tag,
        notification_type=data.notification.notification_type,
        reference_id=data.notification.reference_id,
        reference_type=data.notification.reference_type,
        data=data.notification.data
    )
    
    sent_count = sum(1 for log in logs if log.status == "sent")
    failed_count = sum(1 for log in logs if log.status == "failed")
    
    return SendPushResponse(
        success=sent_count > 0,
        sent_count=sent_count,
        failed_count=failed_count,
        log_ids=[log.id for log in logs],
        errors=[log.error_message for log in logs if log.error_message]
    )


@router.post("/send-to-company", response_model=SendPushResponse)
def send_push_to_company(
    data: SendPushToCompanyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envia notificação para múltiplos usuários da empresa.
    
    Pode filtrar por user_ids ou roles específicos.
    Requer permissão de OWNER ou MANAGER.
    """
    # Verificar permissão
    if current_user.role not in ["OWNER", "MANAGER", "SAAS_ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only OWNER or MANAGER can send company-wide notifications"
        )
    
    service = PushNotificationService(db)
    
    logs = service.send_to_company(
        company_id=current_user.company_id,
        title=data.notification.title,
        body=data.notification.body,
        url=data.notification.url,
        icon=data.notification.icon,
        badge=data.notification.badge,
        image=data.notification.image,
        tag=data.notification.tag,
        user_ids=data.user_ids,
        roles=data.roles,
        notification_type=data.notification.notification_type,
        reference_id=data.notification.reference_id,
        reference_type=data.notification.reference_type,
        data=data.notification.data
    )
    
    sent_count = sum(1 for log in logs if log.status == "sent")
    failed_count = sum(1 for log in logs if log.status == "failed")
    
    return SendPushResponse(
        success=sent_count > 0,
        sent_count=sent_count,
        failed_count=failed_count,
        log_ids=[log.id for log in logs],
        errors=[log.error_message for log in logs if log.error_message]
    )


@router.get("/logs", response_model=List[PushNotificationLogResponse])
def list_notification_logs(
    limit: int = 50,
    offset: int = 0,
    notification_type: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista logs de notificações enviadas.
    
    Útil para debug e analytics.
    """
    query = db.query(PushNotificationLog).filter(
        PushNotificationLog.company_id == current_user.company_id
    )
    
    # Filtros opcionais
    if notification_type:
        query = query.filter(PushNotificationLog.notification_type == notification_type)
    
    if status:
        query = query.filter(PushNotificationLog.status == status)
    
    # Ordernar por mais recente
    query = query.order_by(PushNotificationLog.created_at.desc())
    
    # Paginação
    logs = query.offset(offset).limit(limit).all()
    
    return logs


@router.get("/stats", response_model=dict)
def get_push_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Estatísticas de notificações push da empresa.
    """
    # Total de subscriptions ativas
    total_subscriptions = db.query(UserPushSubscription).filter(
        UserPushSubscription.company_id == current_user.company_id,
        UserPushSubscription.is_active == True
    ).count()
    
    # Total de notificações enviadas
    total_sent = db.query(PushNotificationLog).filter(
        PushNotificationLog.company_id == current_user.company_id,
        PushNotificationLog.status == "sent"
    ).count()
    
    # Total de falhas
    total_failed = db.query(PushNotificationLog).filter(
        PushNotificationLog.company_id == current_user.company_id,
        PushNotificationLog.status == "failed"
    ).count()
    
    # Total de expiradas
    total_expired = db.query(PushNotificationLog).filter(
        PushNotificationLog.company_id == current_user.company_id,
        PushNotificationLog.status == "expired"
    ).count()
    
    return {
        "active_subscriptions": total_subscriptions,
        "total_sent": total_sent,
        "total_failed": total_failed,
        "total_expired": total_expired,
        "success_rate": round(total_sent / (total_sent + total_failed) * 100, 2) if (total_sent + total_failed) > 0 else 0
    }
