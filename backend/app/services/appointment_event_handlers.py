"""
Appointment Event Handlers - Integra eventos de agendamento com Google Calendar
Conecta criação/atualização/cancelamento de agendamentos com sincronização automática
"""
from sqlalchemy.orm import Session
from typing import Optional

from app.models.appointment import Appointment, AppointmentStatus
from app.models.google_calendar_integration import GoogleCalendarIntegration
from app.tasks.google_calendar_tasks import (
    trigger_appointment_creation_sync,
    trigger_appointment_update_sync,
    trigger_appointment_deletion_sync
)


class AppointmentEventHandler:
    """
    Handler para eventos de agendamento que dispara sincronização com Google Calendar
    """
    
    @staticmethod
    def on_appointment_created(db: Session, appointment: Appointment):
        """
        Evento disparado quando agendamento é criado
        """
        try:
            # Verificar se profissional tem integração ativa
            if appointment.professional_id:
                integration = db.query(GoogleCalendarIntegration).filter(
                    GoogleCalendarIntegration.user_id == appointment.professional_id,
                    GoogleCalendarIntegration.is_active == True,
                    GoogleCalendarIntegration.sync_enabled == True,
                    GoogleCalendarIntegration.auto_sync == True
                ).first()
                
                if integration and integration.can_sync():
                    # Apenas sincronizar agendamentos confirmados ou pendentes
                    if appointment.status in [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]:
                        trigger_appointment_creation_sync(appointment)
        
        except Exception as e:
            print(f"Error in on_appointment_created handler: {e}")
    
    @staticmethod
    def on_appointment_updated(db: Session, appointment: Appointment, previous_status: Optional[str] = None):
        """
        Evento disparado quando agendamento é atualizado
        """
        try:
            if appointment.professional_id:
                integration = db.query(GoogleCalendarIntegration).filter(
                    GoogleCalendarIntegration.user_id == appointment.professional_id,
                    GoogleCalendarIntegration.is_active == True,
                    GoogleCalendarIntegration.sync_enabled == True,
                    GoogleCalendarIntegration.auto_sync == True
                ).first()
                
                if integration and integration.can_sync():
                    current_status = appointment.status
                    
                    # Se foi cancelado ou marcado como no-show
                    if current_status in [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]:
                        trigger_appointment_deletion_sync(appointment)
                    
                    # Se foi reativado (de cancelado para ativo)
                    elif (previous_status in ['cancelled', 'no_show'] and 
                          current_status in [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]):
                        trigger_appointment_creation_sync(appointment)
                    
                    # Atualização normal (horário, serviço, etc)
                    elif current_status in [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, 
                                          AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS]:
                        trigger_appointment_update_sync(appointment)
        
        except Exception as e:
            print(f"Error in on_appointment_updated handler: {e}")
    
    @staticmethod
    def on_appointment_cancelled(db: Session, appointment: Appointment):
        """
        Evento disparado quando agendamento é cancelado
        """
        try:
            if appointment.professional_id:
                integration = db.query(GoogleCalendarIntegration).filter(
                    GoogleCalendarIntegration.user_id == appointment.professional_id,
                    GoogleCalendarIntegration.is_active == True,
                    GoogleCalendarIntegration.sync_enabled == True
                ).first()
                
                if integration and integration.can_sync():
                    trigger_appointment_deletion_sync(appointment)
        
        except Exception as e:
            print(f"Error in on_appointment_cancelled handler: {e}")
    
    @staticmethod
    def on_appointment_deleted(db: Session, appointment: Appointment):
        """
        Evento disparado quando agendamento é deletado do sistema
        """
        try:
            if appointment.professional_id:
                integration = db.query(GoogleCalendarIntegration).filter(
                    GoogleCalendarIntegration.user_id == appointment.professional_id,
                    GoogleCalendarIntegration.is_active == True,
                    GoogleCalendarIntegration.sync_enabled == True
                ).first()
                
                if integration and integration.can_sync():
                    trigger_appointment_deletion_sync(appointment)
        
        except Exception as e:
            print(f"Error in on_appointment_deleted handler: {e}")


# Factory function
def get_appointment_event_handler() -> AppointmentEventHandler:
    """Factory para criar handler de eventos"""
    return AppointmentEventHandler()


# Funções auxiliares para integração com sistema existente
def notify_appointment_created(db: Session, appointment: Appointment):
    """
    Função auxiliar para notificar criação de agendamento
    Pode ser chamada de endpoints ou outros serviços
    """
    handler = get_appointment_event_handler()
    handler.on_appointment_created(db, appointment)


def notify_appointment_updated(db: Session, appointment: Appointment, previous_status: Optional[str] = None):
    """
    Função auxiliar para notificar atualização de agendamento
    """
    handler = get_appointment_event_handler()
    handler.on_appointment_updated(db, appointment, previous_status)


def notify_appointment_cancelled(db: Session, appointment: Appointment):
    """
    Função auxiliar para notificar cancelamento de agendamento
    """
    handler = get_appointment_event_handler()
    handler.on_appointment_cancelled(db, appointment)


def notify_appointment_deleted(db: Session, appointment: Appointment):
    """
    Função auxiliar para notificar exclusão de agendamento
    """
    handler = get_appointment_event_handler()
    handler.on_appointment_deleted(db, appointment)
