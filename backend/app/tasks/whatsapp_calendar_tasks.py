"""
WhatsApp Calendar Tasks - Tasks automáticas para confirmação de agendamentos via WhatsApp
Integração Evolution API com sistema de calendário
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.client import Client
from app.models.company import Company
from app.models.company_scheduling_settings import SchedulingSettings
from app.services.evolution_api_service import get_evolution_api_service


@celery_app.task(name="app.tasks.whatsapp_calendar_tasks.send_whatsapp_confirmation_requests")
def send_whatsapp_confirmation_requests():
    """
    Envia solicitações de confirmação de agendamento via WhatsApp
    Executa periodicamente para agendamentos que precisam de confirmação
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Buscar empresas com WhatsApp configurado
        companies = db.query(Company).filter(
            Company.is_active == True
        ).all()
        
        total_sent = 0
        total_errors = 0
        
        for company in companies:
            try:
                # Verificar se empresa tem configurações de agendamento
                scheduling_settings = db.query(SchedulingSettings).filter(
                    SchedulingSettings.company_id == company.id
                ).first()
                
                if not scheduling_settings:
                    continue
                
                # Obter horários de lembrete configurados
                reminder_hours = scheduling_settings.reminder_hours_before or [24, 2]
                
                for hours_before in reminder_hours:
                    # Calcular janela de tempo
                    target_time = now + timedelta(hours=hours_before)
                    window_start = target_time - timedelta(minutes=15)
                    window_end = target_time + timedelta(minutes=15)
                    
                    # Buscar agendamentos que precisam de confirmação
                    appointments = db.query(Appointment).join(Client).filter(
                        Appointment.company_id == company.id,
                        Appointment.start_time >= window_start,
                        Appointment.start_time <= window_end,
                        Appointment.status == AppointmentStatus.PENDING,
                        Client.cellphone.isnot(None)
                    ).all()
                    
                    service = get_evolution_api_service(db)
                    
                    for appointment in appointments:
                        try:
                            # Verificar se já enviou confirmação para este horário
                            if _confirmation_already_sent(appointment, hours_before):
                                continue
                            
                            # Enviar solicitação de confirmação
                            if hours_before >= 24:
                                result = service.send_appointment_confirmation_request(appointment)
                            else:
                                result = service.send_appointment_reminder(appointment, hours_before)
                            
                            if result.get("success"):
                                _mark_confirmation_sent(db, appointment, hours_before)
                                total_sent += 1
                            else:
                                total_errors += 1
                                
                        except Exception as e:
                            print(f"Error sending confirmation for appointment {appointment.id}: {e}")
                            total_errors += 1
                
            except Exception as e:
                print(f"Error processing company {company.id}: {e}")
        
        return {
            "status": "success",
            "message": f"Enviadas {total_sent} solicitações de confirmação",
            "total_sent": total_sent,
            "total_errors": total_errors
        }
    
    except Exception as e:
        print(f"Error in send_whatsapp_confirmation_requests: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.whatsapp_calendar_tasks.send_whatsapp_reminders")
def send_whatsapp_reminders():
    """
    Envia lembretes de agendamento via WhatsApp
    Para agendamentos já confirmados
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Buscar agendamentos confirmados para as próximas 2 horas
        target_time = now + timedelta(hours=2)
        window_start = target_time - timedelta(minutes=15)
        window_end = target_time + timedelta(minutes=15)
        
        appointments = db.query(Appointment).join(Client).filter(
            Appointment.start_time >= window_start,
            Appointment.start_time <= window_end,
            Appointment.status == AppointmentStatus.CONFIRMED,
            Client.cellphone.isnot(None)
        ).all()
        
        service = get_evolution_api_service(db)
        sent_count = 0
        
        for appointment in appointments:
            try:
                # Verificar se já enviou lembrete de 2h
                if _reminder_already_sent(appointment, 2):
                    continue
                
                result = service.send_appointment_reminder(appointment, 2)
                
                if result.get("success"):
                    _mark_reminder_sent(db, appointment, 2)
                    sent_count += 1
                    
            except Exception as e:
                print(f"Error sending reminder for appointment {appointment.id}: {e}")
        
        return {
            "status": "success",
            "message": f"Enviados {sent_count} lembretes",
            "sent_count": sent_count
        }
    
    except Exception as e:
        print(f"Error in send_whatsapp_reminders: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.whatsapp_calendar_tasks.send_appointment_notification")
def send_appointment_notification(appointment_id: int, notification_type: str):
    """
    Envia notificação específica de agendamento via WhatsApp
    
    Args:
        appointment_id: ID do agendamento
        notification_type: Tipo de notificação (confirmation, reminder, cancelled, rescheduled)
    """
    db = SessionLocal()
    
    try:
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        
        if not appointment:
            return {"status": "error", "message": f"Appointment {appointment_id} not found"}
        
        service = get_evolution_api_service(db)
        
        if notification_type == "confirmation_request":
            result = service.send_appointment_confirmation_request(appointment)
        elif notification_type == "confirmed":
            result = service.send_appointment_confirmed(appointment)
        elif notification_type == "cancelled":
            result = service.send_cancellation_confirmation(appointment)
        elif notification_type == "reminder_24h":
            result = service.send_appointment_reminder(appointment, 24)
        elif notification_type == "reminder_2h":
            result = service.send_appointment_reminder(appointment, 2)
        else:
            result = {"success": False, "error": f"Unknown notification type: {notification_type}"}
        
        return {
            "status": "success" if result.get("success") else "error",
            "appointment_id": appointment_id,
            "notification_type": notification_type,
            "result": result
        }
    
    except Exception as e:
        print(f"Error sending notification for appointment {appointment_id}: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


# Funções auxiliares
def _confirmation_already_sent(appointment: Appointment, hours_before: int) -> bool:
    """Verifica se confirmação já foi enviada para este horário"""
    # Usar campo JSON para rastrear confirmações enviadas
    sent_confirmations = appointment.internal_notes or ""
    marker = f"[WHATSAPP_CONF_{hours_before}H]"
    return marker in sent_confirmations


def _mark_confirmation_sent(db: Session, appointment: Appointment, hours_before: int):
    """Marca confirmação como enviada"""
    marker = f"[WHATSAPP_CONF_{hours_before}H]"
    appointment.internal_notes = (appointment.internal_notes or "") + f" {marker}"
    db.commit()


def _reminder_already_sent(appointment: Appointment, hours_before: int) -> bool:
    """Verifica se lembrete já foi enviado"""
    sent_reminders = appointment.internal_notes or ""
    marker = f"[WHATSAPP_REM_{hours_before}H]"
    return marker in sent_reminders


def _mark_reminder_sent(db: Session, appointment: Appointment, hours_before: int):
    """Marca lembrete como enviado"""
    marker = f"[WHATSAPP_REM_{hours_before}H]"
    appointment.internal_notes = (appointment.internal_notes or "") + f" {marker}"
    db.commit()


# Funções para disparo manual
def trigger_confirmation_request(appointment_id: int):
    """Dispara solicitação de confirmação de forma assíncrona"""
    send_appointment_notification.delay(appointment_id, "confirmation_request")


def trigger_appointment_confirmed(appointment_id: int):
    """Dispara notificação de confirmação"""
    send_appointment_notification.delay(appointment_id, "confirmed")


def trigger_appointment_cancelled(appointment_id: int):
    """Dispara notificação de cancelamento"""
    send_appointment_notification.delay(appointment_id, "cancelled")
