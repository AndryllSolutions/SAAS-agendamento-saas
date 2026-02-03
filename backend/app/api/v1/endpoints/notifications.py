"""
Notifications Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.notification import Notification
from app.models.user import User
from pydantic import BaseModel, ConfigDict
from typing import Optional

router = APIRouter(
    redirect_slashes=False  # 🔥 DESATIVA REDIRECT AUTOMÁTICO - CORS FIX
)


class NotificationUpdate(BaseModel):
    """Schema for updating notification"""
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    notification_type: str
    status: str
    title: str
    message: str
    recipient: str
    sent_at: datetime = None
    read_at: datetime = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[NotificationResponse])
@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List user notifications
    """
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    return notifications


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get unread notifications count
    """
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at == None
    ).count()
    
    return {"count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark notification as read
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Notificação marcada como lida"}


@router.post("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at == None
    ).update({"read_at": datetime.utcnow()})
    
    db.commit()
    
    return {"message": "Todas as notificações marcadas como lidas"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    db.delete(notification)
    db.commit()
    
    return None


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete all notifications for current user
    """
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return None


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get notification by ID
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    return notification


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_data: NotificationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificação não encontrada"
        )
    
    # Update fields
    update_data = notification_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notification, field, value)
    
    db.commit()
    db.refresh(notification)
    
    return notification
