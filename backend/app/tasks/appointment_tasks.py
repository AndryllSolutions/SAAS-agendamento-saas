"""
Appointment-related Celery tasks
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import Dict, List, Any

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.client import Client
from app.models.user import User
from app.models.service import Service
from app.models.waitlist import WaitList, WaitListStatus
from app.models.company import Company
from app.models.company_scheduling_settings import SchedulingSettings
from app.services.notification_service import NotificationService
from app.services.push_service import PushNotificationService
from app.core.config import settings


@celery_app.task(name="app.tasks.appointment_tasks.send_appointment_reminders")
def send_appointment_reminders():
    """
    Send reminders for upcoming appointments using dynamic company settings
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        sent_count = 0
        
        # Get all companies with active scheduling settings
        companies = db.query(Company).join(SchedulingSettings).filter(
            Company.is_active == True
        ).all()
        
        for company in companies:
            scheduling_settings = company.scheduling_settings
            if not scheduling_settings:
                continue
            
            # Use company-specific reminder hours
            reminder_hours = scheduling_settings.reminder_hours_before or [24, 2]
            
            for hours_before in reminder_hours:
                reminder_time = now + timedelta(hours=hours_before)
                
                # Find appointments for this company that need reminders
                appointments = db.query(Appointment).filter(
                    Appointment.company_id == company.id,
                    Appointment.start_time >= reminder_time - timedelta(minutes=15),
                    Appointment.start_time <= reminder_time + timedelta(minutes=15),
                    Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
                ).all()
                
                for appointment in appointments:
                    # Check if reminder already sent (dynamic check based on hours)
                    if _is_reminder_already_sent(appointment, hours_before):
                        continue
                    
                    # Send reminder using company settings
                    if _send_dynamic_appointment_reminder(db, appointment, hours_before, scheduling_settings):
                        # Mark reminder as sent
                        _mark_reminder_as_sent(appointment, hours_before)
                        db.commit()
                        sent_count += 1
        
        return {"status": "success", "message": f"Sent {sent_count} reminders"}
    
    except Exception as e:
        print(f"Error sending reminders: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


def _is_reminder_already_sent(appointment: Appointment, hours_before: int) -> bool:
    """Check if reminder was already sent for this time period"""
    if hours_before == 24:
        return appointment.reminder_sent_24h
    elif hours_before == 2:
        return appointment.reminder_sent_2h
    # For other hours, we don't have specific fields, so assume not sent
    return False


def _mark_reminder_as_sent(appointment: Appointment, hours_before: int):
    """Mark reminder as sent for this time period"""
    if hours_before == 24:
        appointment.reminder_sent_24h = True
    elif hours_before == 2:
        appointment.reminder_sent_2h = True
    # For other hours, we could extend the model or use a JSON field


def _send_dynamic_appointment_reminder(db: Session, appointment: Appointment, hours_before: int, scheduling_settings: SchedulingSettings) -> bool:
    """
    Send appointment reminder using dynamic company settings and templates
    """
    try:
        # Get appointment details
        client_crm = db.query(Client).filter(Client.id == appointment.client_crm_id).first() if appointment.client_crm_id else None
        professional = db.query(User).filter(User.id == appointment.professional_id).first()
        service = db.query(Service).filter(Service.id == appointment.service_id).first()
        
        if not client_crm or not service:
            return False
        
        # Prepare template variables
        template_vars = {
            "client_name": client_crm.full_name or client_crm.email or "Cliente",
            "client_email": client_crm.email or "",
            "client_phone": (client_crm.phone or client_crm.cellphone) or "",
            "professional_name": professional.full_name if professional else "Equipe",
            "service_name": service.name,
            "service_duration": f"{service.duration_minutes} min" if service.duration_minutes else "N/A",
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
        
        # Get enabled reminder types for this company
        enabled_types = scheduling_settings.enabled_reminder_types or ["email", "push"]
        
        # Send notifications for each enabled type
        success = False
        for notification_type in enabled_types:
            try:
                message = scheduling_settings.format_notification_message(
                    template_name, notification_type, template_vars
                )
                
                if message:
                    if notification_type == "email" and client_crm.email:
                        # Send email using NotificationService
                        NotificationService.send_email(
                            client_crm.email,
                            message["subject"],
                            message["body"]
                        )
                        success = True
                    elif notification_type == "push":
                        client_user_id = client_crm.user_id
                        if client_user_id:
                            push_service = PushNotificationService(db)
                            push_service.send_to_user(
                                user_id=client_user_id,
                                title=message.get("title") if isinstance(message, dict) else "Lembrete de Agendamento",
                                body=message.get("body") if isinstance(message, dict) else str(message),
                                url="/appointments",
                                notification_type="appointment_reminder"
                            )
                            success = True
                    elif notification_type == "sms" and (client_crm.phone or client_crm.cellphone):
                        # Send SMS
                        NotificationService.send_sms(
                            client_crm.phone or client_crm.cellphone,
                            message if isinstance(message, str) else message.get("body", "")
                        )
                        success = True
            except Exception as e:
                print(f"Error sending {notification_type} reminder: {e}")
                continue
        
        return success
        
    except Exception as e:
        print(f"Error in _send_dynamic_appointment_reminder: {e}")
        return False


@celery_app.task(name="app.tasks.appointment_tasks.process_waitlist")
def process_waitlist():
    """
    Process waitlist and notify users of available slots
    """
    db = SessionLocal()
    
    try:
        # Find waiting users
        waitlist_entries = db.query(WaitList).filter(
            WaitList.status == WaitListStatus.WAITING
        ).all()
        
        for entry in waitlist_entries:
            # Check for available appointments in the preferred time range
            available_slots = db.query(Appointment).filter(
                Appointment.company_id == entry.company_id,
                Appointment.service_id == entry.service_id,
                Appointment.professional_id == entry.professional_id,
                Appointment.start_time >= entry.preferred_date_start,
                Appointment.start_time <= entry.preferred_date_end,
                Appointment.status == AppointmentStatus.CANCELLED
            ).first()
            
            if available_slots:
                # Notify user
                client_crm = db.query(Client).filter(Client.id == entry.client_crm_id).first() if entry.client_crm_id else None
                client_user = db.query(User).filter(User.id == entry.client_id).first() if not client_crm else None
                service = db.query(Service).filter(Service.id == entry.service_id).first()
                
                if (client_crm or client_user) and service:
                    recipient_email = (client_crm.email if client_crm else client_user.email)
                    recipient_phone = ((client_crm.phone or client_crm.cellphone) if client_crm else client_user.phone)
                    message = f"""
                    Boa notícia! Um horário ficou disponível para o serviço {service.name}.
                    
                    Data/Hora: {available_slots.start_time.strftime("%d/%m/%Y %H:%M")}
                    
                    Acesse o sistema para confirmar seu agendamento.
                    Esta oferta expira em 2 horas.
                    """
                    
                    if recipient_email:
                        NotificationService.send_email(
                            recipient_email,
                            "Horário Disponível!",
                            message
                        )
                    
                    if recipient_phone:
                        NotificationService.send_whatsapp(recipient_phone, message)
                    
                    # Update waitlist status
                    entry.status = WaitListStatus.NOTIFIED
                    entry.notified_at = datetime.utcnow()
                    entry.expires_at = datetime.utcnow() + timedelta(hours=2)
                    
                    db.commit()
        
        return {"status": "success", "message": "Waitlist processed"}
    
    except Exception as e:
        print(f"Error processing waitlist: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.appointment_tasks.mark_no_show")
def mark_no_show():
    """
    Mark appointments as no-show if client didn't check-in
    """
    db = SessionLocal()
    
    try:
        # Find appointments that should have started but no check-in
        cutoff_time = datetime.utcnow() - timedelta(minutes=15)
        
        appointments = db.query(Appointment).filter(
            Appointment.start_time < cutoff_time,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            Appointment.checked_in_at == None
        ).all()
        
        for appointment in appointments:
            appointment.status = AppointmentStatus.NO_SHOW
            db.commit()
        
        return {"status": "success", "count": len(appointments)}
    
    except Exception as e:
        print(f"Error marking no-shows: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()
