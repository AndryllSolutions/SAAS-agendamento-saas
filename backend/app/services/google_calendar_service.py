"""
Google Calendar Service - Integração completa com Google Calendar API
Implementa sincronização bidirecional de agendamentos
"""
import json
import logging
from typing import Optional, Dict, List, Any, Tuple
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

# Google API
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.errors import HttpError

from app.models.google_calendar_integration import GoogleCalendarIntegration, CalendarSyncLog
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.service import Service
from app.models.client import Client
from app.core.config import settings
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


class GoogleCalendarService:
    """Serviço para integração com Google Calendar"""
    
    # OAuth 2.0 scopes necessários
    SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_oauth_flow(self, redirect_uri: str) -> Flow:
        """
        Cria flow OAuth para autenticação com Google
        """
        if not settings.GOOGLE_CALENDAR_CLIENT_ID or not settings.GOOGLE_CALENDAR_CLIENT_SECRET:
            raise ValueError("Google Calendar credentials not configured")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CALENDAR_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CALENDAR_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.SCOPES,
            redirect_uri=redirect_uri
        )
        
        return flow
    
    def get_auth_url(self, user_id: int, redirect_uri: str) -> str:
        """
        Gera URL de autorização OAuth
        """
        flow = self.get_oauth_flow(redirect_uri)
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=str(user_id),  # Passar user_id como state
            prompt='consent'  # Force consent para obter refresh_token
        )
        
        return auth_url
    
    def handle_oauth_callback(self, code: str, user_id: int, redirect_uri: str) -> GoogleCalendarIntegration:
        """
        Processa callback OAuth e salva tokens
        """
        flow = self.get_oauth_flow(redirect_uri)
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        
        # Obter informações do usuário
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Criar ou atualizar integração
        integration = self.db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.user_id == user_id
        ).first()
        
        if not integration:
            integration = GoogleCalendarIntegration(
                user_id=user_id,
                company_id=user.company_id
            )
            self.db.add(integration)
        
        # Salvar tokens
        integration.access_token = credentials.token
        integration.refresh_token = credentials.refresh_token
        integration.token_expires_at = credentials.expiry
        integration.is_active = True
        integration.sync_enabled = True
        
        # Buscar calendário primário
        try:
            service = self._build_service(credentials)
            calendar_list = service.calendarList().list().execute()
            
            # Encontrar calendário primário
            primary_calendar = None
            for calendar_item in calendar_list.get('items', []):
                if calendar_item.get('primary', False):
                    primary_calendar = calendar_item
                    break
            
            if primary_calendar:
                integration.calendar_id = primary_calendar['id']
                integration.calendar_name = primary_calendar.get('summary', 'Primary Calendar')
        
        except Exception as e:
            logger.error(f"Error fetching calendar info: {e}")
        
        self.db.commit()
        self.db.refresh(integration)
        
        return integration
    
    def _build_service(self, credentials: Credentials):
        """Constrói serviço Google Calendar API"""
        return build('calendar', 'v3', credentials=credentials)
    
    def _get_credentials(self, integration: GoogleCalendarIntegration) -> Optional[Credentials]:
        """
        Obtém credentials válidas, renovando se necessário
        """
        if not integration.access_token:
            return None
        
        credentials = Credentials(
            token=integration.access_token,
            refresh_token=integration.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CALENDAR_CLIENT_ID,
            client_secret=settings.GOOGLE_CALENDAR_CLIENT_SECRET,
            scopes=self.SCOPES
        )
        
        if integration.token_expires_at:
            credentials.expiry = integration.token_expires_at
        
        # Renovar token se necessário
        if credentials.expired and credentials.refresh_token:
            try:
                credentials.refresh(Request())
                
                # Atualizar tokens no banco
                integration.access_token = credentials.token
                integration.token_expires_at = credentials.expiry
                self.db.commit()
                
            except Exception as e:
                logger.error(f"Error refreshing token: {e}")
                return None
        
        return credentials
    
    def sync_appointment_to_google(self, appointment: Appointment) -> bool:
        """
        Sincroniza agendamento para Google Calendar
        """
        # Buscar integração do profissional
        integration = self.db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.user_id == appointment.professional_id,
            GoogleCalendarIntegration.is_active == True
        ).first()
        
        if not integration or not integration.can_sync():
            logger.warning(f"No active integration for professional {appointment.professional_id}")
            return False
        
        credentials = self._get_credentials(integration)
        if not credentials:
            logger.error(f"Invalid credentials for integration {integration.id}")
            return False
        
        try:
            service = self._build_service(credentials)
            
            # Verificar se evento já existe
            existing_log = self.db.query(CalendarSyncLog).filter(
                CalendarSyncLog.appointment_id == appointment.id,
                CalendarSyncLog.integration_id == integration.id,
                CalendarSyncLog.sync_direction == "to_google",
                CalendarSyncLog.status == "success"
            ).first()
            
            # Preparar dados do evento
            event_data = self._prepare_event_data(appointment, integration)
            
            if existing_log and existing_log.google_event_id:
                # Atualizar evento existente
                try:
                    event = service.events().update(
                        calendarId=integration.calendar_id,
                        eventId=existing_log.google_event_id,
                        body=event_data
                    ).execute()
                    
                    action = "update"
                    
                except HttpError as e:
                    if e.resp.status == 404:
                        # Evento não existe mais, criar novo
                        event = service.events().insert(
                            calendarId=integration.calendar_id,
                            body=event_data
                        ).execute()
                        action = "create"
                    else:
                        raise
            else:
                # Criar novo evento
                event = service.events().insert(
                    calendarId=integration.calendar_id,
                    body=event_data
                ).execute()
                action = "create"
            
            # Log da sincronização
            sync_log = CalendarSyncLog(
                integration_id=integration.id,
                appointment_id=appointment.id,
                sync_direction="to_google",
                action=action,
                status="success",
                google_event_id=event.get('id'),
                google_calendar_id=integration.calendar_id,
                sync_data=event_data
            )
            self.db.add(sync_log)
            
            integration.update_sync_status("success")
            self.db.commit()
            
            logger.info(f"Successfully synced appointment {appointment.id} to Google Calendar")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing appointment {appointment.id} to Google: {e}")
            
            # Log do erro
            sync_log = CalendarSyncLog(
                integration_id=integration.id,
                appointment_id=appointment.id,
                sync_direction="to_google",
                action="create" if not existing_log else "update",
                status="error",
                error_message=str(e)
            )
            self.db.add(sync_log)
            
            integration.update_sync_status("error", str(e))
            self.db.commit()
            
            return False
    
    def _prepare_event_data(self, appointment: Appointment, integration: GoogleCalendarIntegration) -> Dict[str, Any]:
        """
        Prepara dados do evento para Google Calendar
        """
        # Obter informações relacionadas
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        professional = self.db.query(User).filter(User.id == appointment.professional_id).first()
        
        # Configurações
        config = integration.sync_config or {}
        event_prefix = config.get("event_prefix", "[Agendamento]")
        include_client_info = config.get("include_client_info", True)
        include_notes = config.get("include_notes", True)
        reminder_minutes = config.get("reminder_minutes", [15, 60])
        
        # Título do evento
        title_parts = [event_prefix]
        if service:
            title_parts.append(service.name)
        if client and include_client_info:
            title_parts.append(f"- {client.full_name}")
        
        title = " ".join(title_parts)
        
        # Descrição
        description_parts = []
        if service:
            description_parts.append(f"Serviço: {service.name}")
            if service.duration_minutes:
                description_parts.append(f"Duração: {service.duration_minutes} min")
        
        if client and include_client_info:
            description_parts.append(f"Cliente: {client.full_name}")
            if client.phone:
                description_parts.append(f"Telefone: {client.phone}")
            if client.email:
                description_parts.append(f"Email: {client.email}")
        
        if professional:
            description_parts.append(f"Profissional: {professional.full_name}")
        
        if include_notes:
            if appointment.client_notes:
                description_parts.append(f"Observações do Cliente: {appointment.client_notes}")
            if appointment.professional_notes:
                description_parts.append(f"Observações do Profissional: {appointment.professional_notes}")
        
        description_parts.append(f"Status: {appointment.status.value}")
        
        # Converter para timezone
        start_time = appointment.start_time.replace(tzinfo=timezone.utc)
        end_time = appointment.end_time.replace(tzinfo=timezone.utc)
        
        # Preparar lembretes
        reminders = {
            'useDefault': False,
            'overrides': [
                {'method': 'popup', 'minutes': minutes}
                for minutes in reminder_minutes
            ]
        }
        
        return {
            'summary': title,
            'description': '\n'.join(description_parts),
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': integration.get_sync_config_value('timezone', 'America/Sao_Paulo')
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': integration.get_sync_config_value('timezone', 'America/Sao_Paulo')
            },
            'reminders': reminders,
            'colorId': '2',  # Verde para agendamentos
        }
    
    def delete_appointment_from_google(self, appointment: Appointment) -> bool:
        """
        Remove agendamento do Google Calendar
        """
        # Buscar integração
        integration = self.db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.user_id == appointment.professional_id,
            GoogleCalendarIntegration.is_active == True
        ).first()
        
        if not integration:
            return False
        
        # Buscar evento no Google
        sync_log = self.db.query(CalendarSyncLog).filter(
            CalendarSyncLog.appointment_id == appointment.id,
            CalendarSyncLog.integration_id == integration.id,
            CalendarSyncLog.sync_direction == "to_google",
            CalendarSyncLog.status == "success"
        ).first()
        
        if not sync_log or not sync_log.google_event_id:
            return False
        
        credentials = self._get_credentials(integration)
        if not credentials:
            return False
        
        try:
            service = self._build_service(credentials)
            
            service.events().delete(
                calendarId=integration.calendar_id,
                eventId=sync_log.google_event_id
            ).execute()
            
            # Log da exclusão
            delete_log = CalendarSyncLog(
                integration_id=integration.id,
                appointment_id=appointment.id,
                sync_direction="to_google",
                action="delete",
                status="success",
                google_event_id=sync_log.google_event_id,
                google_calendar_id=integration.calendar_id
            )
            self.db.add(delete_log)
            self.db.commit()
            
            logger.info(f"Successfully deleted appointment {appointment.id} from Google Calendar")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting appointment {appointment.id} from Google: {e}")
            return False
    
    def sync_all_appointments_for_user(self, user_id: int, days_back: int = 7, days_forward: int = 30) -> Dict[str, int]:
        """
        Sincroniza todos os agendamentos de um usuário
        """
        integration = self.db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.user_id == user_id,
            GoogleCalendarIntegration.is_active == True
        ).first()
        
        if not integration or not integration.can_sync():
            return {"error": "No active integration"}
        
        # Data range para sincronização
        start_date = datetime.utcnow() - timedelta(days=days_back)
        end_date = datetime.utcnow() + timedelta(days=days_forward)
        
        # Buscar agendamentos
        appointments = self.db.query(Appointment).filter(
            Appointment.professional_id == user_id,
            Appointment.start_time >= start_date,
            Appointment.start_time <= end_date,
            Appointment.status.in_([
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.PENDING,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_PROGRESS
            ])
        ).all()
        
        results = {"synced": 0, "errors": 0, "skipped": 0}
        
        for appointment in appointments:
            try:
                if self.sync_appointment_to_google(appointment):
                    results["synced"] += 1
                else:
                    results["errors"] += 1
            except Exception as e:
                logger.error(f"Error syncing appointment {appointment.id}: {e}")
                results["errors"] += 1
        
        return results
    
    def get_integration_status(self, user_id: int) -> Dict[str, Any]:
        """
        Retorna status da integração para um usuário
        """
        integration = self.db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.user_id == user_id
        ).first()
        
        if not integration:
            return {"connected": False}
        
        return {
            "connected": True,
            "active": integration.is_active,
            "sync_enabled": integration.sync_enabled,
            "calendar_name": integration.calendar_name,
            "last_sync": integration.last_sync_at,
            "last_sync_status": integration.last_sync_status,
            "can_sync": integration.can_sync(),
            "token_expired": integration.is_token_expired()
        }


# Factory function
def get_google_calendar_service(db: Optional[Session] = None) -> GoogleCalendarService:
    """Factory function para criar instância do serviço"""
    if db is None:
        db = SessionLocal()
    
    return GoogleCalendarService(db)
