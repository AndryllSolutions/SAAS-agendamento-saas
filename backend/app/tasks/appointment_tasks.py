"""
Appointment-related Celery tasks
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.service import Service
from app.models.waitlist import WaitList, WaitListStatus
from app.services.notification_service import NotificationService
from app.core.config import settings


@celery_app.task(name="app.tasks.appointment_tasks.send_appointment_reminders")
def send_appointment_reminders():
    """
    Send reminders for upcoming appointments
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Send reminders for each configured time
        for hours_before in settings.REMINDER_HOURS_BEFORE:
            reminder_time = now + timedelta(hours=hours_before)
            
            # Find appointments that need reminders
            appointments = db.query(Appointment).filter(
                Appointment.start_time >= reminder_time - timedelta(minutes=15),
                Appointment.start_time <= reminder_time + timedelta(minutes=15),
                Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
            ).all()
            
            for appointment in appointments:
                # Check if reminder already sent
                if hours_before == 24 and appointment.reminder_sent_24h:
                    continue
                if hours_before == 2 and appointment.reminder_sent_2h:
                    continue
                
                # Get user and service details
                client = db.query(User).filter(User.id == appointment.client_id).first()
                professional = db.query(User).filter(User.id == appointment.professional_id).first()
                service = db.query(Service).filter(Service.id == appointment.service_id).first()
                
                if not client or not service:
                    continue
                
                # Send reminder
                appointment_details = {
                    "service_name": service.name,
                    "start_time": appointment.start_time.strftime("%d/%m/%Y %H:%M"),
                    "professional_name": professional.full_name if professional else "N/A",
                }
                
                NotificationService.send_appointment_reminder(
                    db,
                    client.id,
                    client.email,
                    client.phone,
                    appointment_details,
                    hours_before
                )
                
                # Mark reminder as sent
                if hours_before == 24:
                    appointment.reminder_sent_24h = True
                elif hours_before == 2:
                    appointment.reminder_sent_2h = True
                
                db.commit()
        
        return {"status": "success", "message": "Reminders sent"}
    
    except Exception as e:
        print(f"Error sending reminders: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


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
                client = db.query(User).filter(User.id == entry.client_id).first()
                service = db.query(Service).filter(Service.id == entry.service_id).first()
                
                if client and service:
                    message = f"""
                    Boa notícia! Um horário ficou disponível para o serviço {service.name}.
                    
                    Data/Hora: {available_slots.start_time.strftime("%d/%m/%Y %H:%M")}
                    
                    Acesse o sistema para confirmar seu agendamento.
                    Esta oferta expira em 2 horas.
                    """
                    
                    NotificationService.send_email(
                        client.email,
                        "Horário Disponível!",
                        message
                    )
                    
                    if client.phone:
                        NotificationService.send_whatsapp(client.phone, message)
                    
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
