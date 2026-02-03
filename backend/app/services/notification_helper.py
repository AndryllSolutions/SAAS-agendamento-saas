"""
Notification Helper - Respeita configuracoes de notificacao da empresa
"""
from sqlalchemy.orm import Session
from app.models.company_configurations import CompanyNotificationSettings
from app.models.notification import Notification
from datetime import datetime


class NotificationHelper:
    """Helper para envio de notificacoes respeitando preferencias da empresa"""
    
    @staticmethod
    def should_send_notification(db: Session, company_id: int, notification_type: str) -> bool:
        """
        Verifica se deve enviar notificacao baseado nas configuracoes da empresa
        
        Args:
            db: Sessao do banco
            company_id: ID da empresa
            notification_type: Tipo de notificacao (new_appointment, cancellation, etc)
        
        Returns:
            bool: True se deve enviar, False caso contrario
        """
        settings = db.query(CompanyNotificationSettings).filter(
            CompanyNotificationSettings.company_id == company_id
        ).first()
        
        if not settings:
            return True  # Se nao tem configuracoes, envia por padrao
        
        # Mapear tipos de notificacao para campos de configuracao
        notification_map = {
            'new_appointment': settings.notify_new_appointment,
            'appointment_cancellation': settings.notify_appointment_cancellation,
            'appointment_deletion': settings.notify_appointment_deletion,
            'new_review': settings.notify_new_review,
            'sms_response': settings.notify_sms_response,
            'client_return': settings.notify_client_return,
            'goal_achievement': settings.notify_goal_achievement,
            'client_waiting': settings.notify_client_waiting,
        }
        
        return notification_map.get(notification_type, True)
    
    @staticmethod
    def create_notification(
        db: Session,
        company_id: int,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        force: bool = False
    ) -> Notification:
        """
        Cria notificacao respeitando configuracoes da empresa
        
        Args:
            db: Sessao do banco
            company_id: ID da empresa
            user_id: ID do usuario destinatario
            notification_type: Tipo de notificacao
            title: Titulo da notificacao
            message: Mensagem da notificacao
            force: Se True, ignora configuracoes e envia sempre
        
        Returns:
            Notification: Notificacao criada ou None se nao deve enviar
        """
        # Verificar se deve enviar
        if not force and not NotificationHelper.should_send_notification(db, company_id, notification_type):
            return None
        
        # Criar notificacao
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            status='pending',
            recipient=f'user_{user_id}',
            sent_at=datetime.utcnow()
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def get_notification_settings(db: Session, company_id: int) -> dict:
        """
        Retorna configuracoes de notificacao da empresa
        
        Args:
            db: Sessao do banco
            company_id: ID da empresa
        
        Returns:
            dict: Configuracoes de notificacao
        """
        settings = db.query(CompanyNotificationSettings).filter(
            CompanyNotificationSettings.company_id == company_id
        ).first()
        
        if not settings:
            return {
                'sound_enabled': True,
                'duration_seconds': 5,
                'all_enabled': True
            }
        
        return {
            'sound_enabled': settings.notification_sound_enabled,
            'duration_seconds': settings.notification_duration_seconds,
            'new_appointment': settings.notify_new_appointment,
            'appointment_cancellation': settings.notify_appointment_cancellation,
            'appointment_deletion': settings.notify_appointment_deletion,
            'new_review': settings.notify_new_review,
            'sms_response': settings.notify_sms_response,
            'client_return': settings.notify_client_return,
            'goal_achievement': settings.notify_goal_achievement,
            'client_waiting': settings.notify_client_waiting,
        }
