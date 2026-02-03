"""
Google Calendar Sync Tasks - Tasks automáticas para sincronização
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import List

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.google_calendar_integration import GoogleCalendarIntegration
from app.models.appointment import Appointment, AppointmentStatus
from app.services.google_calendar_service import get_google_calendar_service


@celery_app.task(name="app.tasks.google_calendar_tasks.sync_all_calendar_integrations")
def sync_all_calendar_integrations():
    """
    Sincroniza todos os agendamentos de usuários com integração ativa
    Executa periodicamente para manter calendários atualizados
    """
    db = SessionLocal()
    
    try:
        # Buscar todas as integrações ativas
        integrations = db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.is_active == True,
            GoogleCalendarIntegration.sync_enabled == True,
            GoogleCalendarIntegration.auto_sync == True
        ).all()
        
        total_synced = 0
        total_errors = 0
        processed_users = 0
        
        service = get_google_calendar_service(db)
        
        for integration in integrations:
            try:
                # Configurações de sincronização
                config = integration.sync_config or {}
                days_back = config.get('sync_past_days', 7)
                days_forward = config.get('sync_future_days', 30)
                
                # Sincronizar agendamentos do usuário
                results = service.sync_all_appointments_for_user(
                    integration.user_id, days_back, days_forward
                )
                
                if "error" not in results:
                    total_synced += results.get("synced", 0)
                    total_errors += results.get("errors", 0)
                    processed_users += 1
                    
                    integration.update_sync_status("success")
                else:
                    total_errors += 1
                    integration.update_sync_status("error", results["error"])
                
                db.commit()
                
            except Exception as e:
                print(f"Error syncing user {integration.user_id}: {e}")
                integration.update_sync_status("error", str(e))
                db.commit()
                total_errors += 1
        
        return {
            "status": "success",
            "message": f"Sincronizados {total_synced} agendamentos de {processed_users} usuários",
            "total_synced": total_synced,
            "total_errors": total_errors,
            "processed_users": processed_users
        }
    
    except Exception as e:
        print(f"Error in sync_all_calendar_integrations: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.google_calendar_tasks.sync_appointment_to_calendar")
def sync_appointment_to_calendar(appointment_id: int, action: str = "create"):
    """
    Sincroniza um agendamento específico para o Google Calendar
    
    Args:
        appointment_id: ID do agendamento
        action: Ação a ser executada ("create", "update", "delete")
    """
    db = SessionLocal()
    
    try:
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()
        
        if not appointment:
            return {"status": "error", "message": f"Appointment {appointment_id} not found"}
        
        service = get_google_calendar_service(db)
        
        if action == "delete":
            success = service.delete_appointment_from_google(appointment)
        else:
            success = service.sync_appointment_to_google(appointment)
        
        if success:
            return {
                "status": "success",
                "message": f"Appointment {appointment_id} {action}d successfully",
                "appointment_id": appointment_id,
                "action": action
            }
        else:
            return {
                "status": "error",
                "message": f"Failed to {action} appointment {appointment_id}",
                "appointment_id": appointment_id,
                "action": action
            }
    
    except Exception as e:
        print(f"Error syncing appointment {appointment_id}: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.google_calendar_tasks.cleanup_expired_tokens")
def cleanup_expired_tokens():
    """
    Limpa tokens expirados e desativa integrações com problemas
    """
    db = SessionLocal()
    
    try:
        # Buscar integrações com tokens expirados há mais de 30 dias
        expired_cutoff = datetime.utcnow() - timedelta(days=30)
        
        expired_integrations = db.query(GoogleCalendarIntegration).filter(
            GoogleCalendarIntegration.token_expires_at < expired_cutoff,
            GoogleCalendarIntegration.is_active == True
        ).all()
        
        deactivated_count = 0
        
        for integration in expired_integrations:
            if integration.is_token_expired():
                # Tentar renovar token primeiro
                service = get_google_calendar_service(db)
                credentials = service._get_credentials(integration)
                
                if not credentials:
                    # Desativar integração se não conseguir renovar
                    integration.is_active = False
                    integration.sync_enabled = False
                    integration.last_sync_error = "Token expired and cannot be refreshed"
                    deactivated_count += 1
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Deactivated {deactivated_count} expired integrations",
            "deactivated_count": deactivated_count
        }
    
    except Exception as e:
        print(f"Error in cleanup_expired_tokens: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="app.tasks.google_calendar_tasks.sync_recent_appointments")
def sync_recent_appointments():
    """
    Sincroniza agendamentos criados/modificados recentemente
    """
    db = SessionLocal()
    
    try:
        # Buscar agendamentos criados/atualizados nas últimas 2 horas
        recent_cutoff = datetime.utcnow() - timedelta(hours=2)
        
        recent_appointments = db.query(Appointment).filter(
            Appointment.updated_at >= recent_cutoff,
            Appointment.status.in_([
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.PENDING,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_PROGRESS
            ])
        ).all()
        
        service = get_google_calendar_service(db)
        synced_count = 0
        error_count = 0
        
        for appointment in recent_appointments:
            try:
                # Verificar se profissional tem integração ativa
                integration = db.query(GoogleCalendarIntegration).filter(
                    GoogleCalendarIntegration.user_id == appointment.professional_id,
                    GoogleCalendarIntegration.is_active == True,
                    GoogleCalendarIntegration.sync_enabled == True
                ).first()
                
                if integration and integration.can_sync():
                    if service.sync_appointment_to_google(appointment):
                        synced_count += 1
                    else:
                        error_count += 1
            
            except Exception as e:
                print(f"Error syncing recent appointment {appointment.id}: {e}")
                error_count += 1
        
        return {
            "status": "success",
            "message": f"Synced {synced_count} recent appointments",
            "synced_count": synced_count,
            "error_count": error_count
        }
    
    except Exception as e:
        print(f"Error in sync_recent_appointments: {e}")
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()


# Funções auxiliares para triggers de agendamento
def trigger_appointment_sync(appointment_id: int, action: str):
    """
    Dispara sincronização de agendamento de forma assíncrona
    """
    sync_appointment_to_calendar.delay(appointment_id, action)


def trigger_appointment_creation_sync(appointment: Appointment):
    """
    Dispara sincronização quando agendamento é criado
    """
    if appointment.professional_id:
        trigger_appointment_sync(appointment.id, "create")


def trigger_appointment_update_sync(appointment: Appointment):
    """
    Dispara sincronização quando agendamento é atualizado
    """
    if appointment.professional_id:
        trigger_appointment_sync(appointment.id, "update")


def trigger_appointment_deletion_sync(appointment: Appointment):
    """
    Dispara sincronização quando agendamento é cancelado/deletado
    """
    if appointment.professional_id:
        trigger_appointment_sync(appointment.id, "delete")
