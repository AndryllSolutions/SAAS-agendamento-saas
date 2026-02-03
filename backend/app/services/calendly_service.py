"""
Calendly Service - Integração completa com Calendly API v2
Implementa sincronização bidirecional de agendamentos
"""
import json
import logging
import hmac
import hashlib
from typing import Optional, Dict, List, Any, Tuple
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import httpx

from app.models.calendly_integration import (
    CalendlyIntegration, 
    CalendlyEventType, 
    CalendlySyncLog,
    CalendlyWebhookEvent
)
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.service import Service
from app.models.client import Client
from app.core.config import settings
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


# Calendly API Configuration
CALENDLY_API_BASE = "https://api.calendly.com"
CALENDLY_AUTH_BASE = "https://auth.calendly.com"


class CalendlyService:
    """Serviço para integração com Calendly API v2"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =========================================================================
    # OAuth Flow
    # =========================================================================
    
    def get_auth_url(self, user_id: int, redirect_uri: str) -> str:
        """
        Gera URL de autorização OAuth do Calendly
        """
        if not settings.CALENDLY_CLIENT_ID:
            raise ValueError("Calendly client ID not configured")
        
        params = {
            "client_id": settings.CALENDLY_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": redirect_uri,
            "state": str(user_id),
        }
        
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{CALENDLY_AUTH_BASE}/oauth/authorize?{query_string}"
    
    async def handle_oauth_callback(self, code: str, user_id: int, redirect_uri: str) -> CalendlyIntegration:
        """
        Processa callback OAuth e salva tokens
        """
        # Trocar código por tokens
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CALENDLY_AUTH_BASE}/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": settings.CALENDLY_CLIENT_ID,
                    "client_secret": settings.CALENDLY_CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise ValueError(f"OAuth token exchange failed: {response.text}")
            
            token_data = response.json()
        
        # Obter informações do usuário
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Calcular expiração do token
        expires_in = token_data.get("expires_in", 7200)
        token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        # Criar ou atualizar integração
        integration = self.db.query(CalendlyIntegration).filter(
            CalendlyIntegration.user_id == user_id
        ).first()
        
        if not integration:
            integration = CalendlyIntegration(
                user_id=user_id,
                company_id=user.company_id
            )
            self.db.add(integration)
        
        # Salvar tokens
        integration.access_token = token_data.get("access_token")
        integration.refresh_token = token_data.get("refresh_token")
        integration.token_expires_at = token_expires_at
        integration.token_type = token_data.get("token_type", "Bearer")
        integration.is_active = True
        integration.sync_enabled = True
        
        self.db.commit()
        
        # Buscar informações do usuário Calendly
        await self._fetch_calendly_user_info(integration)
        
        # Buscar tipos de evento
        await self._fetch_event_types(integration)
        
        # Configurar webhook
        await self._setup_webhook(integration)
        
        self.db.refresh(integration)
        return integration
    
    async def _refresh_token(self, integration: CalendlyIntegration) -> bool:
        """
        Renova token OAuth expirado
        """
        if not integration.refresh_token:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{CALENDLY_AUTH_BASE}/oauth/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": integration.refresh_token,
                        "client_id": settings.CALENDLY_CLIENT_ID,
                        "client_secret": settings.CALENDLY_CLIENT_SECRET,
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if response.status_code != 200:
                    logger.error(f"Token refresh failed: {response.text}")
                    return False
                
                token_data = response.json()
            
            # Atualizar tokens
            expires_in = token_data.get("expires_in", 7200)
            integration.access_token = token_data.get("access_token")
            integration.refresh_token = token_data.get("refresh_token", integration.refresh_token)
            integration.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            return False
    
    async def _get_valid_token(self, integration: CalendlyIntegration) -> Optional[str]:
        """
        Obtém token válido, renovando se necessário
        """
        if integration.is_token_expired():
            if not await self._refresh_token(integration):
                return None
        
        return integration.access_token
    
    # =========================================================================
    # Calendly API Calls
    # =========================================================================
    
    async def _api_request(
        self, 
        integration: CalendlyIntegration, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Optional[Dict]:
        """
        Faz requisição autenticada para API do Calendly
        """
        token = await self._get_valid_token(integration)
        if not token:
            return None
        
        url = f"{CALENDLY_API_BASE}{endpoint}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                if method.upper() == "GET":
                    response = await client.get(url, headers=headers, params=params)
                elif method.upper() == "POST":
                    response = await client.post(url, headers=headers, json=data)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, headers=headers)
                else:
                    return None
                
                if response.status_code in [200, 201]:
                    return response.json()
                elif response.status_code == 204:
                    return {"success": True}
                else:
                    logger.error(f"Calendly API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Calendly API request error: {e}")
            return None
    
    async def _fetch_calendly_user_info(self, integration: CalendlyIntegration):
        """
        Busca informações do usuário no Calendly
        """
        result = await self._api_request(integration, "GET", "/users/me")
        
        if result and "resource" in result:
            user_data = result["resource"]
            integration.calendly_user_uri = user_data.get("uri")
            integration.calendly_user_name = user_data.get("name")
            integration.calendly_user_email = user_data.get("email")
            integration.calendly_organization_uri = user_data.get("current_organization")
            integration.scheduling_url = user_data.get("scheduling_url")
            
            self.db.commit()
    
    async def _fetch_event_types(self, integration: CalendlyIntegration):
        """
        Busca tipos de evento do usuário no Calendly
        """
        if not integration.calendly_user_uri:
            return
        
        result = await self._api_request(
            integration, 
            "GET", 
            "/event_types",
            params={"user": integration.calendly_user_uri, "active": "true"}
        )
        
        if result and "collection" in result:
            for event_type_data in result["collection"]:
                # Verificar se já existe
                existing = self.db.query(CalendlyEventType).filter(
                    CalendlyEventType.calendly_event_type_uri == event_type_data.get("uri")
                ).first()
                
                if not existing:
                    event_type = CalendlyEventType(
                        integration_id=integration.id,
                        calendly_event_type_uri=event_type_data.get("uri"),
                        name=event_type_data.get("name"),
                        description=event_type_data.get("description_plain"),
                        duration_minutes=event_type_data.get("duration"),
                        scheduling_url=event_type_data.get("scheduling_url"),
                        color=event_type_data.get("color")
                    )
                    self.db.add(event_type)
                else:
                    # Atualizar dados existentes
                    existing.name = event_type_data.get("name")
                    existing.description = event_type_data.get("description_plain")
                    existing.duration_minutes = event_type_data.get("duration")
                    existing.scheduling_url = event_type_data.get("scheduling_url")
                    existing.color = event_type_data.get("color")
            
            self.db.commit()
    
    async def _setup_webhook(self, integration: CalendlyIntegration):
        """
        Configura webhook para receber eventos do Calendly
        """
        if not integration.calendly_organization_uri:
            return
        
        # URL do webhook no nosso sistema
        webhook_url = f"{settings.BACKEND_URL}/api/v1/calendly/webhook"
        
        # Criar webhook subscription
        result = await self._api_request(
            integration,
            "POST",
            "/webhook_subscriptions",
            data={
                "url": webhook_url,
                "events": [
                    "invitee.created",
                    "invitee.canceled",
                    "routing_form_submission.created"
                ],
                "organization": integration.calendly_organization_uri,
                "scope": "user",
                "user": integration.calendly_user_uri
            }
        )
        
        if result and "resource" in result:
            webhook_data = result["resource"]
            integration.webhook_uri = webhook_data.get("uri")
            integration.webhook_signing_key = webhook_data.get("signing_key")
            self.db.commit()
    
    # =========================================================================
    # Sync Operations
    # =========================================================================
    
    async def sync_calendly_events_to_appointments(self, integration: CalendlyIntegration) -> Dict[str, int]:
        """
        Sincroniza eventos do Calendly para agendamentos locais
        """
        if not integration.can_sync():
            return {"error": "Integration cannot sync"}
        
        results = {"created": 0, "updated": 0, "errors": 0}
        
        # Buscar eventos agendados
        config = integration.sync_config or {}
        min_start = datetime.utcnow() - timedelta(days=config.get("sync_past_days", 7))
        max_start = datetime.utcnow() + timedelta(days=config.get("sync_future_days", 60))
        
        events_result = await self._api_request(
            integration,
            "GET",
            "/scheduled_events",
            params={
                "user": integration.calendly_user_uri,
                "min_start_time": min_start.isoformat() + "Z",
                "max_start_time": max_start.isoformat() + "Z",
                "status": "active"
            }
        )
        
        if not events_result or "collection" not in events_result:
            return results
        
        for event_data in events_result["collection"]:
            try:
                result = await self._process_calendly_event(integration, event_data)
                if result == "created":
                    results["created"] += 1
                elif result == "updated":
                    results["updated"] += 1
            except Exception as e:
                logger.error(f"Error processing Calendly event: {e}")
                results["errors"] += 1
        
        integration.update_sync_status("success")
        self.db.commit()
        
        return results
    
    async def _process_calendly_event(self, integration: CalendlyIntegration, event_data: Dict) -> str:
        """
        Processa um evento do Calendly e cria/atualiza agendamento
        """
        event_uri = event_data.get("uri")
        
        # Verificar se já existe sincronização
        existing_log = self.db.query(CalendlySyncLog).filter(
            CalendlySyncLog.calendly_event_uri == event_uri,
            CalendlySyncLog.status == "success"
        ).first()
        
        # Buscar invitees do evento
        invitees_result = await self._api_request(
            integration,
            "GET",
            f"/scheduled_events/{event_uri.split('/')[-1]}/invitees"
        )
        
        if not invitees_result or "collection" not in invitees_result:
            return "skipped"
        
        invitee = invitees_result["collection"][0] if invitees_result["collection"] else None
        if not invitee:
            return "skipped"
        
        # Mapear tipo de evento para serviço
        event_type_uri = event_data.get("event_type")
        event_type_mapping = self.db.query(CalendlyEventType).filter(
            CalendlyEventType.calendly_event_type_uri == event_type_uri,
            CalendlyEventType.is_active == True
        ).first()
        
        service_id = event_type_mapping.service_id if event_type_mapping else None
        
        # Buscar ou criar cliente
        client = await self._get_or_create_client(
            integration, 
            invitee.get("email"),
            invitee.get("name")
        )
        
        # Dados do agendamento
        start_time = datetime.fromisoformat(event_data.get("start_time").replace("Z", "+00:00"))
        end_time = datetime.fromisoformat(event_data.get("end_time").replace("Z", "+00:00"))
        
        config = integration.sync_config or {}
        auto_confirm = config.get("auto_confirm_bookings", True)
        
        if existing_log and existing_log.appointment_id:
            # Atualizar agendamento existente
            appointment = self.db.query(Appointment).filter(
                Appointment.id == existing_log.appointment_id
            ).first()
            
            if appointment:
                appointment.start_time = start_time
                appointment.end_time = end_time
                if service_id:
                    appointment.service_id = service_id
                
                self.db.commit()
                return "updated"
        
        # Criar novo agendamento
        appointment = Appointment(
            company_id=integration.company_id,
            professional_id=integration.user_id,
            client_crm_id=client.id if client else None,
            service_id=service_id,
            start_time=start_time,
            end_time=end_time,
            status=AppointmentStatus.CONFIRMED if auto_confirm else AppointmentStatus.PENDING,
            client_notes=f"Agendado via Calendly\nEvento: {event_data.get('name')}\nInvitee: {invitee.get('name')} ({invitee.get('email')})"
        )
        self.db.add(appointment)
        self.db.commit()
        
        # Log da sincronização
        sync_log = CalendlySyncLog(
            integration_id=integration.id,
            appointment_id=appointment.id,
            sync_direction="from_calendly",
            action="create",
            status="success",
            calendly_event_uri=event_uri,
            calendly_invitee_uri=invitee.get("uri"),
            sync_data=event_data
        )
        self.db.add(sync_log)
        self.db.commit()
        
        return "created"
    
    async def _get_or_create_client(
        self, 
        integration: CalendlyIntegration, 
        email: str, 
        name: str
    ) -> Optional[Client]:
        """
        Busca ou cria cliente baseado no email
        """
        if not email:
            return None
        
        # Buscar cliente existente
        client = self.db.query(Client).filter(
            Client.company_id == integration.company_id,
            Client.email == email
        ).first()
        
        if client:
            return client
        
        # Criar novo cliente se configurado
        config = integration.sync_config or {}
        if not config.get("create_client_if_not_exists", True):
            return None
        
        client = Client(
            company_id=integration.company_id,
            full_name=name or email.split("@")[0],
            email=email,
            source="calendly"
        )
        self.db.add(client)
        self.db.commit()
        
        return client
    
    # =========================================================================
    # Webhook Handling
    # =========================================================================
    
    def verify_webhook_signature(self, payload: bytes, signature: str, signing_key: str) -> bool:
        """
        Verifica assinatura do webhook do Calendly
        """
        if not signing_key:
            return False
        
        expected_signature = hmac.new(
            signing_key.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    
    async def process_webhook_event(self, event_type: str, payload: Dict) -> Dict[str, Any]:
        """
        Processa evento de webhook do Calendly
        """
        # Salvar evento recebido
        webhook_event = CalendlyWebhookEvent(
            event_type=event_type,
            event_uri=payload.get("uri"),
            payload=payload
        )
        
        # Encontrar integração relacionada
        event_data = payload.get("payload", {})
        scheduled_event = event_data.get("scheduled_event", {})
        event_memberships = scheduled_event.get("event_memberships", [])
        
        user_uri = None
        for membership in event_memberships:
            user_uri = membership.get("user")
            break
        
        if user_uri:
            integration = self.db.query(CalendlyIntegration).filter(
                CalendlyIntegration.calendly_user_uri == user_uri,
                CalendlyIntegration.is_active == True
            ).first()
            
            if integration:
                webhook_event.integration_id = integration.id
        
        self.db.add(webhook_event)
        self.db.commit()
        
        # Processar evento
        try:
            if event_type == "invitee.created":
                result = await self._handle_invitee_created(webhook_event)
            elif event_type == "invitee.canceled":
                result = await self._handle_invitee_canceled(webhook_event)
            else:
                result = {"status": "ignored", "message": f"Event type {event_type} not handled"}
            
            webhook_event.mark_processed()
            self.db.commit()
            
            return result
            
        except Exception as e:
            webhook_event.mark_processed(str(e))
            self.db.commit()
            raise
    
    async def _handle_invitee_created(self, webhook_event: CalendlyWebhookEvent) -> Dict:
        """
        Processa criação de novo invitee (agendamento)
        """
        if not webhook_event.integration_id:
            return {"status": "skipped", "message": "No integration found"}
        
        integration = self.db.query(CalendlyIntegration).filter(
            CalendlyIntegration.id == webhook_event.integration_id
        ).first()
        
        if not integration or not integration.sync_enabled:
            return {"status": "skipped", "message": "Integration not active"}
        
        payload = webhook_event.payload.get("payload", {})
        scheduled_event = payload.get("scheduled_event", {})
        
        # Processar evento
        result = await self._process_calendly_event(integration, scheduled_event)
        
        return {"status": "success", "action": result}
    
    async def _handle_invitee_canceled(self, webhook_event: CalendlyWebhookEvent) -> Dict:
        """
        Processa cancelamento de invitee
        """
        if not webhook_event.integration_id:
            return {"status": "skipped", "message": "No integration found"}
        
        payload = webhook_event.payload.get("payload", {})
        scheduled_event = payload.get("scheduled_event", {})
        event_uri = scheduled_event.get("uri")
        
        # Buscar agendamento relacionado
        sync_log = self.db.query(CalendlySyncLog).filter(
            CalendlySyncLog.calendly_event_uri == event_uri,
            CalendlySyncLog.status == "success"
        ).first()
        
        if sync_log and sync_log.appointment_id:
            appointment = self.db.query(Appointment).filter(
                Appointment.id == sync_log.appointment_id
            ).first()
            
            if appointment:
                appointment.status = AppointmentStatus.CANCELLED
                appointment.internal_notes = (appointment.internal_notes or "") + f"\nCancelado via Calendly em {datetime.utcnow()}"
                
                # Log do cancelamento
                cancel_log = CalendlySyncLog(
                    integration_id=webhook_event.integration_id,
                    appointment_id=appointment.id,
                    sync_direction="from_calendly",
                    action="cancel",
                    status="success",
                    calendly_event_uri=event_uri
                )
                self.db.add(cancel_log)
                self.db.commit()
                
                return {"status": "success", "action": "cancelled", "appointment_id": appointment.id}
        
        return {"status": "skipped", "message": "Appointment not found"}
    
    # =========================================================================
    # Status & Management
    # =========================================================================
    
    def get_integration_status(self, user_id: int) -> Dict[str, Any]:
        """
        Retorna status da integração para um usuário
        """
        integration = self.db.query(CalendlyIntegration).filter(
            CalendlyIntegration.user_id == user_id
        ).first()
        
        if not integration:
            return {"connected": False}
        
        # Contar tipos de evento
        event_types_count = self.db.query(CalendlyEventType).filter(
            CalendlyEventType.integration_id == integration.id
        ).count()
        
        return {
            "connected": True,
            "active": integration.is_active,
            "sync_enabled": integration.sync_enabled,
            "calendly_user_name": integration.calendly_user_name,
            "calendly_user_email": integration.calendly_user_email,
            "scheduling_url": integration.scheduling_url,
            "last_sync": integration.last_sync_at,
            "last_sync_status": integration.last_sync_status,
            "can_sync": integration.can_sync(),
            "token_expired": integration.is_token_expired(),
            "event_types_count": event_types_count,
            "webhook_configured": bool(integration.webhook_uri)
        }
    
    async def disconnect(self, user_id: int) -> bool:
        """
        Desconecta integração Calendly
        """
        integration = self.db.query(CalendlyIntegration).filter(
            CalendlyIntegration.user_id == user_id
        ).first()
        
        if not integration:
            return False
        
        # Remover webhook se existir
        if integration.webhook_uri:
            await self._api_request(
                integration,
                "DELETE",
                f"/webhook_subscriptions/{integration.webhook_uri.split('/')[-1]}"
            )
        
        # Desativar integração
        integration.is_active = False
        integration.sync_enabled = False
        integration.access_token = None
        integration.refresh_token = None
        integration.webhook_uri = None
        
        self.db.commit()
        return True


# Factory function
def get_calendly_service(db: Optional[Session] = None) -> CalendlyService:
    """Factory function para criar instância do serviço"""
    if db is None:
        db = SessionLocal()
    
    return CalendlyService(db)
