"""
Scheduling Settings Service - Gerencia configurações dinâmicas de agendamento
Centralizaa lógica de negócio para configurações de scheduling por empresa
"""
from typing import Optional, Dict, List, Any
from sqlalchemy.orm import Session
from datetime import datetime, time, timedelta

from app.models.company import Company
from app.models.company_scheduling_settings import SchedulingSettings
from app.core.database import SessionLocal


class SchedulingSettingsService:
    """Serviço para gerenciar configurações de agendamento"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_settings(self, company_id: int) -> SchedulingSettings:
        """
        Obtém configurações de agendamento da empresa ou cria configurações padrão
        """
        settings = self.db.query(SchedulingSettings).filter(
            SchedulingSettings.company_id == company_id
        ).first()
        
        if not settings:
            settings = self.create_default_settings(company_id)
        
        return settings
    
    def create_default_settings(self, company_id: int) -> SchedulingSettings:
        """
        Cria configurações padrão para uma empresa
        """
        default_business_hours = {
            "monday": {"start": "08:00", "end": "18:00", "enabled": True},
            "tuesday": {"start": "08:00", "end": "18:00", "enabled": True},
            "wednesday": {"start": "08:00", "end": "18:00", "enabled": True},
            "thursday": {"start": "08:00", "end": "18:00", "enabled": True},
            "friday": {"start": "08:00", "end": "18:00", "enabled": True},
            "saturday": {"start": "08:00", "end": "14:00", "enabled": False},
            "sunday": {"start": "08:00", "end": "14:00", "enabled": False}
        }
        
        default_templates = {
            "appointment_confirmation": {
                "email": {
                    "subject": "Agendamento Confirmado - {service_name}",
                    "body": "Olá {client_name}! Seu agendamento foi confirmado para {appointment_date} às {appointment_time}."
                },
                "sms": "Agendamento confirmado: {service_name} em {appointment_date} às {appointment_time}. Até lá!",
                "push": {
                    "title": "Agendamento Confirmado",
                    "body": "{service_name} confirmado para {appointment_date} às {appointment_time}"
                }
            },
            "appointment_reminder_24h": {
                "email": {
                    "subject": "Lembrete: Agendamento Amanhã - {service_name}",
                    "body": "Olá {client_name}! Lembramos que você tem agendamento amanhã ({appointment_date}) às {appointment_time}."
                },
                "sms": "Lembrete: Você tem agendamento amanhã às {appointment_time}. {service_name}",
                "push": {
                    "title": "📅 Lembrete: Agendamento Amanhã",
                    "body": "{service_name} amanhã às {appointment_time}"
                }
            },
            "appointment_reminder_2h": {
                "email": {
                    "subject": "Lembrete: Agendamento em 2 Horas - {service_name}",
                    "body": "Olá {client_name}! Seu agendamento é daqui a 2 horas ({appointment_time})."
                },
                "sms": "Lembrete: Seu agendamento é daqui a 2 horas ({appointment_time})",
                "push": {
                    "title": "⏰ Lembrete: Agendamento em 2 Horas",
                    "body": "{service_name} daqui a 2 horas ({appointment_time})"
                }
            },
            "appointment_cancellation": {
                "email": {
                    "subject": "Agendamento Cancelado - {service_name}",
                    "body": "Seu agendamento de {service_name} para {appointment_date} às {appointment_time} foi cancelado."
                },
                "sms": "Agendamento cancelado: {service_name} em {appointment_date} às {appointment_time}",
                "push": {
                    "title": "Agendamento Cancelado",
                    "body": "{service_name} de {appointment_date} foi cancelado"
                }
            },
            "appointment_completed": {
                "push": {
                    "title": "✨ Atendimento Concluído",
                    "body": "Como foi sua experiência? Deixe sua avaliação!"
                }
            }
        }
        
        settings = SchedulingSettings(
            company_id=company_id,
            business_hours=default_business_hours,
            default_appointment_duration=60,
            appointment_interval=0,
            min_advance_booking_hours=2,
            max_advance_booking_days=30,
            cancellation_deadline_hours=24,
            allow_client_cancellation=True,
            reminder_hours_before=[24, 2],
            enabled_reminder_types=["email", "push"],
            require_approval=False,
            enable_waitlist=True,
            max_waitlist_size=50,
            timezone="America/Sao_Paulo",
            allow_simultaneous_appointments=False,
            time_buffers={
                "before_appointment": 0,
                "after_appointment": 0,
                "lunch_break": {"start": "12:00", "end": "13:00", "enabled": False}
            },
            holidays=[],
            notification_templates=default_templates,
            available_template_variables=[
                "client_name", "client_email", "client_phone",
                "professional_name", "service_name", "service_duration",
                "appointment_date", "appointment_time", "appointment_datetime",
                "company_name", "company_phone", "company_address"
            ]
        )
        
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        
        return settings
    
    def update_business_hours(self, company_id: int, business_hours: Dict[str, Any]) -> SchedulingSettings:
        """
        Atualiza horários de funcionamento
        """
        settings = self.get_or_create_settings(company_id)
        settings.business_hours = business_hours
        self.db.commit()
        self.db.refresh(settings)
        return settings
    
    def update_reminder_settings(self, company_id: int, hours_before: List[int], enabled_types: List[str]) -> SchedulingSettings:
        """
        Atualiza configurações de lembretes
        """
        settings = self.get_or_create_settings(company_id)
        settings.reminder_hours_before = hours_before
        settings.enabled_reminder_types = enabled_types
        self.db.commit()
        self.db.refresh(settings)
        return settings
    
    def update_notification_template(self, company_id: int, template_name: str, template_data: Dict[str, Any]) -> SchedulingSettings:
        """
        Atualiza template de notificação específico
        """
        settings = self.get_or_create_settings(company_id)
        
        # Assegurar que notification_templates existe
        if not settings.notification_templates:
            settings.notification_templates = {}
        
        settings.notification_templates[template_name] = template_data
        self.db.commit()
        self.db.refresh(settings)
        return settings
    
    def get_business_hours_for_date(self, company_id: int, target_date: datetime) -> Optional[Dict[str, Any]]:
        """
        Retorna horários de funcionamento para uma data específica
        """
        settings = self.get_or_create_settings(company_id)
        
        # Verificar se é feriado
        holidays = settings.holidays or []
        date_str = target_date.strftime("%Y-%m-%d")
        
        if date_str in holidays:
            return None
        
        # Obter horário do dia da semana
        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_name = day_names[target_date.weekday()]
        
        return settings.get_business_hours_for_day(day_name)
    
    def is_time_available(self, company_id: int, target_datetime: datetime) -> bool:
        """
        Verifica se um horário específico está disponível para agendamento
        """
        settings = self.get_or_create_settings(company_id)
        
        # Verificar se é dentro do horário de funcionamento
        day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_name = day_names[target_datetime.weekday()]
        
        if not settings.is_business_day(day_name):
            return False
        
        time_str = target_datetime.strftime("%H:%M")
        if not settings.is_within_business_hours(day_name, time_str):
            return False
        
        # Verificar antecedência mínima
        now = datetime.utcnow()
        min_advance = timedelta(hours=settings.min_advance_booking_hours)
        if target_datetime < now + min_advance:
            return False
        
        # Verificar antecedência máxima
        max_advance = timedelta(days=settings.max_advance_booking_days)
        if target_datetime > now + max_advance:
            return False
        
        return True
    
    def get_available_reminder_hours(self, company_id: int) -> List[int]:
        """
        Retorna horários de lembrete configurados para a empresa
        """
        settings = self.get_or_create_settings(company_id)
        return settings.reminder_hours_before or [24, 2]
    
    def get_notification_message(self, company_id: int, template_name: str, notification_type: str, variables: Dict[str, Any]) -> Optional[str]:
        """
        Retorna mensagem formatada usando templates da empresa
        """
        settings = self.get_or_create_settings(company_id)
        return settings.format_notification_message(template_name, notification_type, variables)
    
    def get_cancellation_policy(self, company_id: int) -> Dict[str, Any]:
        """
        Retorna política de cancelamento da empresa
        """
        settings = self.get_or_create_settings(company_id)
        return settings.get_cancellation_policy()
    
    def can_cancel_appointment(self, company_id: int, appointment_datetime: datetime) -> Dict[str, Any]:
        """
        Verifica se um agendamento pode ser cancelado baseado nas políticas da empresa
        """
        settings = self.get_or_create_settings(company_id)
        
        if not settings.allow_client_cancellation:
            return {
                "can_cancel": False,
                "reason": "Cancelamento pelo cliente não permitido"
            }
        
        now = datetime.utcnow()
        deadline = appointment_datetime - timedelta(hours=settings.cancellation_deadline_hours)
        
        if now > deadline:
            return {
                "can_cancel": False,
                "reason": f"Cancelamento deve ser feito com {settings.cancellation_deadline_hours} horas de antecedência"
            }
        
        return {"can_cancel": True}
    
    def get_appointment_duration(self, company_id: int, service_duration: Optional[int] = None) -> int:
        """
        Retorna duração do agendamento (preferência: serviço -> empresa -> padrão)
        """
        if service_duration:
            return service_duration
        
        settings = self.get_or_create_settings(company_id)
        return settings.default_appointment_duration or 60


# Factory function for easier usage
def get_scheduling_service(db: Optional[Session] = None) -> SchedulingSettingsService:
    """
    Factory function para criar instância do serviço
    """
    if db is None:
        db = SessionLocal()
    
    return SchedulingSettingsService(db)
