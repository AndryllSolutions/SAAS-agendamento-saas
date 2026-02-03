"""
Notification Service - Email, SMS, WhatsApp
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import requests

from app.core.config import settings
from app.models.notification import Notification, NotificationType, NotificationStatus
from sqlalchemy.orm import Session


class NotificationService:
    """Service for sending notifications"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """Send email notification"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add plain text part
            msg.attach(MIMEText(body, 'plain'))
            
            # Add HTML part if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    @staticmethod
    def send_email_with_config(
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str],
        smtp_config: dict
    ) -> bool:
        """Send email notification with custom SMTP config"""
        try:
            msg = MIMEMultipart('alternative')
            from_email = smtp_config.get('from') or smtp_config.get('from_email', settings.SMTP_FROM)
            from_name = smtp_config.get('from_name', settings.SMTP_FROM_NAME)
            msg['From'] = f"{from_name} <{from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add plain text part
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Add HTML part if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html', 'utf-8'))
            
            # Send email with custom SMTP
            smtp_host = smtp_config.get('host', settings.SMTP_HOST)
            smtp_port = smtp_config.get('port', settings.SMTP_PORT)
            smtp_user = smtp_config.get('user')
            smtp_password = smtp_config.get('password')
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email with custom config: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    @staticmethod
    def send_sms(to_phone: str, message: str) -> bool:
        """Send SMS notification via Twilio"""
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            print("Twilio credentials not configured")
            return False
        
        try:
            from twilio.rest import Client
            
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            message = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_phone
            )
            
            return message.sid is not None
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    @staticmethod
    def send_whatsapp(to_phone: str, message: str) -> bool:
        """Send WhatsApp notification via Evolution API"""
        # Configurações da Evolution API
        EVOLUTION_API_URL = getattr(settings, 'EVOLUTION_API_URL', None)
        EVOLUTION_API_KEY = getattr(settings, 'EVOLUTION_API_KEY', None)
        EVOLUTION_INSTANCE = getattr(settings, 'EVOLUTION_INSTANCE_NAME', 'agendamento-saas')
        
        # Se não configurado, apenas loga a mensagem (não falha)
        if not EVOLUTION_API_URL or not EVOLUTION_API_KEY:
            print("⚠️ WhatsApp não configurado - mensagem seria:")
            print(f"📱 Para: {to_phone}")
            print(f"💬 Mensagem:\n{message}")
            print("="*50)
            return True  # Retorna True para não quebrar o fluxo
        
        try:
            # Limpar número (remover caracteres especiais)
            clean_phone = ''.join(filter(str.isdigit, to_phone))
            
            # Adicionar código do país se não tiver (Brasil = 55)
            if not clean_phone.startswith('55'):
                clean_phone = '55' + clean_phone
            
            url = f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}"
            headers = {
                "apikey": EVOLUTION_API_KEY,
                "Content-Type": "application/json"
            }
            
            data = {
                "number": clean_phone,
                "text": message
            }
            
            response = requests.post(
                url,
                json=data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"✅ WhatsApp enviado para {clean_phone}")
                return True
            else:
                print(f"⚠️ WhatsApp não enviado: {response.text}")
                return True  # Não quebra o fluxo
        except Exception as e:
            print(f"⚠️ WhatsApp não enviado: {e}")
            return True  # Não quebra o fluxo
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        recipient: str,
        data: Optional[str] = None
    ) -> Notification:
        """Create a notification record in database"""
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            recipient=recipient,
            data=data
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def send_appointment_confirmation(
        db: Session,
        user_id: int,
        user_email: str,
        user_phone: Optional[str],
        appointment_details: dict
    ):
        """Send appointment confirmation via multiple channels"""
        title = "Agendamento Confirmado"
        message = f"""
        Seu agendamento foi confirmado!
        
        Serviço: {appointment_details['service_name']}
        Data/Hora: {appointment_details['start_time']}
        Profissional: {appointment_details['professional_name']}
        
        Até breve!
        """
        
        # Send email
        NotificationService.send_email(user_email, title, message)
        NotificationService.create_notification(
            db, user_id, NotificationType.EMAIL, title, message, user_email
        )
        
        # Send SMS if phone provided
        if user_phone:
            NotificationService.send_sms(user_phone, message)
            NotificationService.create_notification(
                db, user_id, NotificationType.SMS, title, message, user_phone
            )
    
    @staticmethod
    def send_appointment_reminder(
        db: Session,
        user_id: int,
        user_email: str,
        user_phone: Optional[str],
        appointment_details: dict,
        hours_before: int
    ):
        """Send appointment reminder"""
        title = f"Lembrete: Agendamento em {hours_before}h"
        message = f"""
        Lembrete do seu agendamento:
        
        Serviço: {appointment_details['service_name']}
        Data/Hora: {appointment_details['start_time']}
        Profissional: {appointment_details['professional_name']}
        Local: {appointment_details.get('location', 'N/A')}
        
        Nos vemos em breve!
        """
        
        # Send via preferred channels
        NotificationService.send_email(user_email, title, message)
        
        if user_phone:
            NotificationService.send_whatsapp(user_phone, message) or \
            NotificationService.send_sms(user_phone, message)
    
    @staticmethod
    def send_appointment_cancelled(
        db: Session,
        user_id: int,
        user_email: str,
        appointment_details: dict
    ):
        """Send appointment cancellation notification"""
        title = "Agendamento Cancelado"
        message = f"""
        Seu agendamento foi cancelado.
        
        Serviço: {appointment_details['service_name']}
        Data/Hora: {appointment_details['start_time']}
        
        Para reagendar, acesse nosso sistema.
        """
        
        NotificationService.send_email(user_email, title, message)
        NotificationService.create_notification(
            db, user_id, NotificationType.EMAIL, title, message, user_email
        )
