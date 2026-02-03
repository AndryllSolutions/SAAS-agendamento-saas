"""
Push Notification Helpers

Helpers para enviar notificações push automáticas nos eventos do sistema.

Integra push notifications com:
- Appointments (novo, cancelado, lembrete)
- Commands (finalizado, pagamento)
- Reviews (nova avaliação)
- Financial (caixa, relatórios)
- Campaigns (marketing)
"""
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.command import Command
from app.models.user import User
from app.models.client import Client
from app.models.service import Service
from app.models.company_scheduling_settings import SchedulingSettings
from app.services.push_service import PushNotificationService
import logging

logger = logging.getLogger(__name__)


class AppointmentPushNotifications:
    """
    Notificações push para eventos de agendamentos.
    """
    
    @staticmethod
    def notify_new_appointment(db: Session, appointment: Appointment):
        """
        Notifica cliente e profissional sobre novo agendamento.
        """
        service = PushNotificationService(db)
        
        try:
            client_user_id = appointment.client_crm.user_id if appointment.client_crm else None
            # Notificar cliente
            if client_user_id:
                service.send_to_user(
                    user_id=client_user_id,
                    title="✅ Agendamento Confirmado",
                    body=f"Seu agendamento foi confirmado para {appointment.start_time.strftime('%d/%m/%Y às %H:%M')}",
                    url=f"/appointments/{appointment.id}",
                    notification_type="appointment",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"appointment-{appointment.id}"
                )
            
            # Notificar profissional
            if appointment.professional_id:
                service.send_to_user(
                    user_id=appointment.professional_id,
                    title="📅 Novo Agendamento",
                    body=f"Você tem um novo agendamento para {appointment.start_time.strftime('%d/%m/%Y às %H:%M')}",
                    url=f"/appointments/{appointment.id}",
                    notification_type="appointment",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"appointment-{appointment.id}"
                )
            
            logger.info(f"Sent push notifications for new appointment {appointment.id}")
        except Exception as e:
            logger.error(f"Error sending push for new appointment {appointment.id}: {str(e)}")
    
    @staticmethod
    def notify_appointment_cancelled(db: Session, appointment: Appointment, cancelled_by_user: User):
        """
        Notifica sobre cancelamento de agendamento.
        """
        service = PushNotificationService(db)
        
        try:
            # Notificar cliente (se não foi ele quem cancelou)
            client_user_id = appointment.client_crm.user_id if appointment.client_crm else None
            if client_user_id and client_user_id != cancelled_by_user.id:
                service.send_to_user(
                    user_id=client_user_id,
                    title="❌ Agendamento Cancelado",
                    body=f"Seu agendamento de {appointment.start_time.strftime('%d/%m/%Y às %H:%M')} foi cancelado",
                    url="/appointments",
                    notification_type="appointment_cancelled",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"appointment-{appointment.id}"
                )
            
            # Notificar profissional (se não foi ele quem cancelou)
            if appointment.professional_id and appointment.professional_id != cancelled_by_user.id:
                service.send_to_user(
                    user_id=appointment.professional_id,
                    title="❌ Agendamento Cancelado",
                    body=f"O agendamento de {appointment.start_time.strftime('%d/%m/%Y às %H:%M')} foi cancelado",
                    url=f"/appointments/{appointment.id}",
                    notification_type="appointment_cancelled",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"appointment-{appointment.id}"
                )
            
            logger.info(f"Sent cancellation push for appointment {appointment.id}")
        except Exception as e:
            logger.error(f"Error sending cancellation push for appointment {appointment.id}: {str(e)}")
    
    @staticmethod
    def notify_appointment_reminder(db: Session, appointment: Appointment, hours_before: int):
        """
        Envia lembrete de agendamento usando templates dinâmicos da empresa.
        
        Args:
            hours_before: Quantas horas antes (24, 2, etc)
        """
        service = PushNotificationService(db)
        
        try:
            client_user_id = appointment.client_crm.user_id if appointment.client_crm else None
            if client_user_id:
                # Get company scheduling settings for dynamic templates
                scheduling_settings = appointment.company.scheduling_settings
                
                # Prepare template variables
                client_crm = db.query(Client).filter(Client.id == appointment.client_crm_id).first() if appointment.client_crm_id else None
                professional = db.query(User).filter(User.id == appointment.professional_id).first() if appointment.professional_id else None
                service_obj = db.query(Service).filter(Service.id == appointment.service_id).first() if appointment.service_id else None
                
                template_vars = {
                    "client_name": client_crm.full_name if client_crm and client_crm.full_name else (client_crm.email if client_crm else "Cliente"),
                    "client_email": client_crm.email if client_crm else "",
                    "client_phone": (client_crm.phone or client_crm.cellphone) if client_crm else "",
                    "professional_name": professional.full_name if professional and professional.full_name else "Equipe",
                    "service_name": service_obj.name if service_obj else "Serviço",
                    "service_duration": f"{service_obj.duration_minutes} min" if service_obj and service_obj.duration_minutes else "N/A",
                    "appointment_date": appointment.start_time.strftime("%d/%m/%Y"),
                    "appointment_time": appointment.start_time.strftime("%H:%M"),
                    "appointment_datetime": appointment.start_time.strftime("%d/%m/%Y às %H:%M"),
                    "company_name": appointment.company.name,
                    "company_phone": appointment.company.phone or "",
                    "company_address": appointment.company.address or ""
                }
                
                # Determine template name based on hours
                if hours_before == 24:
                    template_name = "appointment_reminder_24h"
                elif hours_before == 2:
                    template_name = "appointment_reminder_2h"
                else:
                    template_name = "appointment_reminder_generic"
                
                # Get message from dynamic template
                title = "📅 Lembrete de Agendamento"  # fallback
                body = f"Seu agendamento é em {hours_before} horas"  # fallback
                
                if scheduling_settings:
                    message = scheduling_settings.format_notification_message(
                        template_name, "push", template_vars
                    )
                    if message and isinstance(message, dict):
                        title = message.get("title", title)
                        body = message.get("body", body)
                else:
                    # Fallback to hardcoded messages if no settings
                    if hours_before == 24:
                        title = "📅 Lembrete: Agendamento Amanhã"
                        body = f"Lembrete: você tem agendamento amanhã às {appointment.start_time.strftime('%H:%M')}"
                    elif hours_before == 2:
                        title = "⏰ Lembrete: Agendamento em 2 Horas"
                        body = f"Seu agendamento é daqui a 2 horas ({appointment.start_time.strftime('%H:%M')})"
                
                service.send_to_user(
                    user_id=client_user_id,
                    title=title,
                    body=body,
                    url=f"/appointments/{appointment.id}",
                    notification_type="appointment_reminder",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"reminder-{appointment.id}"
                )
                
                logger.info(f"Sent {hours_before}h reminder for appointment {appointment.id}")
        except Exception as e:
            logger.error(f"Error sending reminder for appointment {appointment.id}: {str(e)}")
    
    @staticmethod
    def notify_appointment_completed(db: Session, appointment: Appointment):
        """
        Notifica cliente após conclusão do atendimento usando templates dinâmicos.
        """
        service = PushNotificationService(db)
        
        try:
            client_user_id = appointment.client_crm.user_id if appointment.client_crm else None
            if client_user_id:
                # Get company scheduling settings for dynamic templates
                scheduling_settings = appointment.company.scheduling_settings
                
                # Prepare template variables
                client_crm = db.query(Client).filter(Client.id == appointment.client_crm_id).first() if appointment.client_crm_id else None
                professional = db.query(User).filter(User.id == appointment.professional_id).first() if appointment.professional_id else None
                service_obj = db.query(Service).filter(Service.id == appointment.service_id).first() if appointment.service_id else None
                
                template_vars = {
                    "client_name": client_crm.full_name if client_crm and client_crm.full_name else (client_crm.email if client_crm else "Cliente"),
                    "client_email": client_crm.email if client_crm else "",
                    "client_phone": (client_crm.phone or client_crm.cellphone) if client_crm else "",
                    "professional_name": professional.full_name if professional and professional.full_name else "Equipe",
                    "service_name": service_obj.name if service_obj else "Serviço",
                    "service_duration": f"{service_obj.duration_minutes} min" if service_obj and service_obj.duration_minutes else "N/A",
                    "appointment_date": appointment.start_time.strftime("%d/%m/%Y"),
                    "appointment_time": appointment.start_time.strftime("%H:%M"),
                    "appointment_datetime": appointment.start_time.strftime("%d/%m/%Y às %H:%M"),
                    "company_name": appointment.company.name,
                    "company_phone": appointment.company.phone or "",
                    "company_address": appointment.company.address or ""
                }
                
                # Get message from dynamic template
                title = "✨ Atendimento Concluído"  # fallback
                body = "Como foi sua experiência? Deixe sua avaliação!"  # fallback
                
                if scheduling_settings:
                    message = scheduling_settings.format_notification_message(
                        "appointment_completed", "push", template_vars
                    )
                    if message and isinstance(message, dict):
                        title = message.get("title", title)
                        body = message.get("body", body)
                
                service.send_to_user(
                    user_id=client_user_id,
                    title=title,
                    body=body,
                    url=f"/appointments/{appointment.id}/review",
                    notification_type="appointment_completed",
                    reference_id=appointment.id,
                    reference_type="appointment",
                    tag=f"completed-{appointment.id}"
                )
                
                logger.info(f"Sent completion notification for appointment {appointment.id}")
        except Exception as e:
            logger.error(f"Error sending completion notification for appointment {appointment.id}: {str(e)}")


class CommandPushNotifications:
    """
    Notificações push para eventos de comandas.
    """
    
    @staticmethod
    def notify_command_finished(db: Session, command: Command):
        """
        Notifica sobre comanda finalizada (pedir pagamento ou confirmar).
        """
        service = PushNotificationService(db)
        
        try:
            # Notificar profissional responsável
            if command.professional_id:
                service.send_to_user(
                    user_id=command.professional_id,
                    title="💰 Comanda Finalizada",
                    body=f"Comanda #{command.number} finalizada. Total: R$ {command.net_value:.2f}",
                    url=f"/commands/{command.id}",
                    notification_type="command_finished",
                    reference_id=command.id,
                    reference_type="command",
                    tag=f"command-{command.id}"
                )
            
            logger.info(f"Sent push for finished command {command.id}")
        except Exception as e:
            logger.error(f"Error sending push for command {command.id}: {str(e)}")


class FinancialPushNotifications:
    """
    Notificações push para eventos financeiros.
    """
    
    @staticmethod
    def notify_low_stock(db: Session, company_id: int, product_name: str, current_stock: int):
        """
        Notifica sobre estoque baixo.
        """
        service = PushNotificationService(db)
        
        try:
            # Notificar OWNER e MANAGER
            service.send_to_company(
                company_id=company_id,
                title="⚠️ Estoque Baixo",
                body=f"O produto '{product_name}' está com estoque baixo ({current_stock} unidades)",
                url="/products",
                notification_type="alert",
                roles=["OWNER", "MANAGER"]
            )
            
            logger.info(f"Sent low stock alert for product {product_name}")
        except Exception as e:
            logger.error(f"Error sending low stock alert: {str(e)}")
    
    @staticmethod
    def notify_payment_received(db: Session, company_id: int, amount: float, payment_id: int):
        """
        Notifica sobre pagamento recebido.
        """
        service = PushNotificationService(db)
        
        try:
            service.send_to_company(
                company_id=company_id,
                title="💰 Pagamento Recebido",
                body=f"Novo pagamento de R$ {amount:.2f} foi recebido",
                url=f"/financial/payments/{payment_id}",
                notification_type="payment",
                reference_id=payment_id,
                reference_type="payment",
                roles=["OWNER", "MANAGER", "FINANCE"]
            )
            
            logger.info(f"Sent payment notification for payment {payment_id}")
        except Exception as e:
            logger.error(f"Error sending payment notification: {str(e)}")


class CampaignPushNotifications:
    """
    Notificações push para campanhas de marketing.
    """
    
    @staticmethod
    def send_campaign_to_clients(
        db: Session,
        company_id: int,
        title: str,
        body: str,
        url: Optional[str] = None,
        client_user_ids: Optional[list[int]] = None
    ):
        """
        Envia campanha de marketing para clientes.
        
        Args:
            client_user_ids: Lista de user_ids de clientes (role CLIENT)
        """
        service = PushNotificationService(db)
        
        try:
            service.send_to_company(
                company_id=company_id,
                title=title,
                body=body,
                url=url or "/",
                notification_type="campaign",
                user_ids=client_user_ids,
                roles=["CLIENT"] if not client_user_ids else None
            )
            
            logger.info(f"Sent campaign push to company {company_id}")
        except Exception as e:
            logger.error(f"Error sending campaign push: {str(e)}")


class SystemPushNotifications:
    """
    Notificações push para eventos do sistema.
    """
    
    @staticmethod
    def notify_system_update(db: Session, company_id: int, message: str):
        """
        Notifica sobre atualização do sistema.
        """
        service = PushNotificationService(db)
        
        try:
            service.send_to_company(
                company_id=company_id,
                title="🔔 Atualização do Sistema",
                body=message,
                url="/updates",
                notification_type="system",
                roles=["OWNER", "MANAGER"]
            )
            
            logger.info(f"Sent system update notification to company {company_id}")
        except Exception as e:
            logger.error(f"Error sending system notification: {str(e)}")
    
    @staticmethod
    def notify_new_review(db: Session, professional_id: int, rating: int, client_name: str):
        """
        Notifica profissional sobre nova avaliação.
        """
        service = PushNotificationService(db)
        
        try:
            stars = "⭐" * rating
            
            service.send_to_user(
                user_id=professional_id,
                title="🌟 Nova Avaliação",
                body=f"{client_name} avaliou seu atendimento: {stars} ({rating}/5)",
                url="/reviews",
                notification_type="review"
            )
            
            logger.info(f"Sent review notification to professional {professional_id}")
        except Exception as e:
            logger.error(f"Error sending review notification: {str(e)}")


# Funções de conveniência (para usar em endpoints)
def send_appointment_notification(db: Session, appointment: Appointment, event: str):
    """
    Envia notificação baseada no evento do appointment.
    
    Args:
        event: 'created', 'cancelled', 'reminder_24h', 'reminder_2h', 'completed'
    """
    if event == 'created':
        AppointmentPushNotifications.notify_new_appointment(db, appointment)
    elif event == 'cancelled':
        # Precisa passar cancelled_by_user
        pass  # Chamar notify_appointment_cancelled com user
    elif event == 'reminder_24h':
        AppointmentPushNotifications.notify_appointment_reminder(db, appointment, 24)
    elif event == 'reminder_2h':
        AppointmentPushNotifications.notify_appointment_reminder(db, appointment, 2)
    elif event == 'completed':
        AppointmentPushNotifications.notify_appointment_completed(db, appointment)


def send_command_notification(db: Session, command: Command, event: str):
    """
    Envia notificação baseada no evento da comanda.
    
    Args:
        event: 'finished', 'paid'
    """
    if event == 'finished':
        CommandPushNotifications.notify_command_finished(db, command)
