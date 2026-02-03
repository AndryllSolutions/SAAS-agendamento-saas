"""
Web Push Notification Service

Service completo para gerenciar Web Push Notifications usando VAPID.

Funcionalidades:
- Gerar e gerenciar chaves VAPID
- Enviar notificações push para usuários
- Gerenciar subscriptions
- Logging completo
"""
import json
import base64
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
import logging

from app.models.push_notification import UserPushSubscription, PushNotificationLog
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger(__name__)


class VAPIDKeyManager:
    """
    Gerenciador de chaves VAPID (Voluntary Application Server Identification).
    
    VAPID é necessário para identificar o servidor de aplicação aos push services.
    """
    
    @staticmethod
    def generate_vapid_keys() -> Dict[str, str]:
        """
        Gera um par de chaves VAPID (pública e privada).
        
        Returns:
            dict: {
                'public_key': str (base64 url-safe),
                'private_key': str (base64 url-safe)
            }
        
        Exemplo:
            >>> keys = VAPIDKeyManager.generate_vapid_keys()
            >>> print(keys['public_key'])
            'BEl62iUYgUivxIkv69yViEu...'
        """
        # Gerar chave privada usando curva elíptica P-256
        private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        
        # Extrair chave pública
        public_key = private_key.public_key()
        
        # Serializar chave privada para PEM
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Serializar chave pública para formato X9.62 uncompressed
        public_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint
        )
        
        # Converter para base64 url-safe (formato esperado pelo navegador)
        public_b64 = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')
        
        return {
            'public_key': public_b64,
            'private_key': private_pem.decode('utf-8')
        }
    
    @staticmethod
    def get_vapid_keys() -> Dict[str, str]:
        """
        Retorna as chaves VAPID configuradas.
        
        Busca primeiro nas variáveis de ambiente. Se não existir, gera novas.
        
        IMPORTANTE: Em produção, as chaves devem estar no .env!
        
        Returns:
            dict: {
                'public_key': str,
                'private_key': str,
                'mailto': str
            }
        """
        public_key = getattr(settings, 'VAPID_PUBLIC_KEY', None)
        private_key = getattr(settings, 'VAPID_PRIVATE_KEY', None)
        mailto = getattr(settings, 'VAPID_MAILTO', 'mailto:admin@example.com')
        
        if not public_key or not private_key:
            logger.warning("VAPID keys not found in settings. Generating new keys...")
            logger.warning("IMPORTANT: Add these keys to your .env file!")
            
            keys = VAPIDKeyManager.generate_vapid_keys()
            public_key = keys['public_key']
            private_key = keys['private_key']
            
            # Mostrar no log para o admin copiar
            logger.info(f"\n\n{'='*60}\n")
            logger.info("Add these to your .env file:\n")
            logger.info(f"VAPID_PUBLIC_KEY={public_key}")
            logger.info(f"VAPID_PRIVATE_KEY={private_key.replace(chr(10), '\\n')}")
            logger.info(f"VAPID_MAILTO={mailto}")
            logger.info(f"\n{'='*60}\n\n")
        
        return {
            'public_key': public_key,
            'private_key': private_key,
            'mailto': mailto
        }


class PushNotificationService:
    """
    Service principal para envio de Web Push Notifications.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.vapid_keys = VAPIDKeyManager.get_vapid_keys()
    
    def get_vapid_public_key(self) -> str:
        """
        Retorna a chave pública VAPID (para o frontend).
        
        O frontend precisa dessa chave para criar subscriptions.
        """
        return self.vapid_keys['public_key']
    
    def create_subscription(
        self,
        user_id: int,
        company_id: int,
        endpoint: str,
        p256dh: str,
        auth: str,
        browser: Optional[str] = None,
        device_name: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> UserPushSubscription:
        """
        Cria ou atualiza uma subscription de push.
        
        Se já existir uma subscription com o mesmo endpoint, atualiza.
        """
        # Verificar se já existe
        existing = self.db.query(UserPushSubscription).filter(
            UserPushSubscription.endpoint == endpoint
        ).first()
        
        if existing:
            # Atualizar subscription existente
            existing.user_id = user_id
            existing.company_id = company_id
            existing.p256dh = p256dh
            existing.auth = auth
            existing.browser = browser
            existing.device_name = device_name
            existing.user_agent = user_agent
            existing.is_active = True
            
            self.db.commit()
            self.db.refresh(existing)
            
            logger.info(f"Updated push subscription for user {user_id}")
            return existing
        
        # Criar nova subscription
        subscription = UserPushSubscription(
            user_id=user_id,
            company_id=company_id,
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
            browser=browser,
            device_name=device_name,
            user_agent=user_agent,
            is_active=True
        )
        
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        
        logger.info(f"Created new push subscription for user {user_id}")
        return subscription
    
    def delete_subscription(self, subscription_id: int, user_id: int) -> bool:
        """
        Deleta uma subscription (quando usuário desativa notificações).
        """
        subscription = self.db.query(UserPushSubscription).filter(
            UserPushSubscription.id == subscription_id,
            UserPushSubscription.user_id == user_id
        ).first()
        
        if not subscription:
            return False
        
        self.db.delete(subscription)
        self.db.commit()
        
        logger.info(f"Deleted push subscription {subscription_id} for user {user_id}")
        return True
    
    def send_push(
        self,
        subscription: UserPushSubscription,
        title: str,
        body: Optional[str] = None,
        url: Optional[str] = None,
        icon: Optional[str] = None,
        badge: Optional[str] = None,
        image: Optional[str] = None,
        tag: Optional[str] = None,
        notification_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reference_type: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> PushNotificationLog:
        """
        Envia uma notificação push para uma subscription específica.
        
        Args:
            subscription: Subscription do destinatário
            title: Título da notificação
            body: Corpo da notificação
            url: URL para abrir ao clicar
            icon: URL do ícone
            badge: URL do badge
            image: URL da imagem
            tag: Tag para agrupar notificações
            notification_type: Tipo (appointment, reminder, alert, etc)
            reference_id: ID do objeto relacionado
            reference_type: Tipo do objeto (appointment, command, etc)
            data: Dados extras para o service worker
        
        Returns:
            PushNotificationLog: Log do envio
        """
        # Preparar payload da notificação
        notification_payload = {
            "title": title,
            "body": body,
            "url": url or "/",
            "icon": icon or "/logo.png",
            "badge": badge,
            "image": image,
            "tag": tag,
            "data": data or {}
        }
        
        # Criar log (antes de enviar)
        log = PushNotificationLog(
            company_id=subscription.company_id,
            user_id=subscription.user_id,
            subscription_id=subscription.id,
            title=title,
            body=body,
            url=url,
            icon=icon,
            badge=badge,
            image=image,
            tag=tag,
            notification_type=notification_type,
            reference_id=reference_id,
            reference_type=reference_type,
            status="sending"
        )
        
        try:
            # Enviar push notification
            response = webpush(
                subscription_info=subscription.subscription_info,
                data=json.dumps(notification_payload),
                vapid_private_key=self.vapid_keys['private_key'],
                vapid_claims={
                    "sub": self.vapid_keys['mailto']
                }
            )
            
            # Atualizar log com sucesso
            log.status = "sent"
            log.response_status = response.status_code
            log.response_body = response.text if hasattr(response, 'text') else None
            
            # Atualizar last_used_at da subscription
            subscription.last_used_at = log.sent_at
            
            logger.info(f"Push sent successfully to user {subscription.user_id}")
            
        except WebPushException as e:
            # Erro ao enviar
            log.status = "failed"
            log.error_message = str(e)
            log.response_status = e.response.status_code if hasattr(e, 'response') else None
            
            # Se subscription expirou (410 Gone), desativar
            if hasattr(e, 'response') and e.response.status_code == 410:
                subscription.is_active = False
                log.status = "expired"
                logger.warning(f"Push subscription expired for user {subscription.user_id}")
            
            logger.error(f"Failed to send push to user {subscription.user_id}: {str(e)}")
        
        # Salvar log
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        
        return log
    
    def send_to_user(
        self,
        user_id: int,
        title: str,
        body: Optional[str] = None,
        **kwargs
    ) -> List[PushNotificationLog]:
        """
        Envia notificação para todas as subscriptions ativas de um usuário.
        
        Um usuário pode ter múltiplas subscriptions (desktop, mobile, etc).
        """
        subscriptions = self.db.query(UserPushSubscription).filter(
            UserPushSubscription.user_id == user_id,
            UserPushSubscription.is_active == True
        ).all()
        
        if not subscriptions:
            logger.warning(f"No active subscriptions found for user {user_id}")
            return []
        
        logs = []
        for subscription in subscriptions:
            log = self.send_push(subscription, title, body, **kwargs)
            logs.append(log)
        
        logger.info(f"Sent push to {len(logs)} subscriptions for user {user_id}")
        return logs
    
    def send_to_users(
        self,
        user_ids: List[int],
        title: str,
        body: Optional[str] = None,
        **kwargs
    ) -> List[PushNotificationLog]:
        """
        Envia notificação para múltiplos usuários.
        """
        all_logs = []
        
        for user_id in user_ids:
            logs = self.send_to_user(user_id, title, body, **kwargs)
            all_logs.extend(logs)
        
        logger.info(f"Sent push to {len(user_ids)} users, total {len(all_logs)} notifications")
        return all_logs
    
    def send_to_company(
        self,
        company_id: int,
        title: str,
        body: Optional[str] = None,
        user_ids: Optional[List[int]] = None,
        roles: Optional[List[str]] = None,
        **kwargs
    ) -> List[PushNotificationLog]:
        """
        Envia notificação para usuários de uma empresa.
        
        Args:
            company_id: ID da empresa
            user_ids: IDs específicos (opcional)
            roles: Filtrar por roles (opcional)
        """
        query = self.db.query(UserPushSubscription).filter(
            UserPushSubscription.company_id == company_id,
            UserPushSubscription.is_active == True
        )
        
        # Filtrar por user_ids específicos
        if user_ids:
            query = query.filter(UserPushSubscription.user_id.in_(user_ids))
        
        # Filtrar por roles
        if roles:
            query = query.join(User).filter(User.role.in_(roles))
        
        subscriptions = query.all()
        
        if not subscriptions:
            logger.warning(f"No active subscriptions found for company {company_id}")
            return []
        
        logs = []
        for subscription in subscriptions:
            log = self.send_push(subscription, title, body, **kwargs)
            logs.append(log)
        
        logger.info(f"Sent push to {len(logs)} subscriptions in company {company_id}")
        return logs
