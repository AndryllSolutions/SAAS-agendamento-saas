"""
Company Scheduling Settings Model - Configurações dinâmicas de agendamento
Substitui configurações hardcoded por configurações personalizáveis por empresa
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON, Float
from sqlalchemy.orm import relationship
from typing import Dict, List, Any, Optional
import enum

from app.models.base import BaseModel


class ReminderType(str, enum.Enum):
    """Tipos de lembrete"""
    EMAIL = "email"
    SMS = "sms" 
    WHATSAPP = "whatsapp"
    PUSH = "push"


class SchedulingSettings(BaseModel):
    """
    Configurações de agendamento personalizáveis por empresa
    Torna dinâmicas as configurações que antes eram hardcoded
    """
    
    __tablename__ = "company_scheduling_settings"
    
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # === CONFIGURAÇÕES DE HORÁRIO ===
    # Horários de funcionamento (JSON com dias da semana)
    business_hours = Column(JSON, nullable=False, default=lambda: {
        "monday": {"start": "08:00", "end": "18:00", "enabled": True},
        "tuesday": {"start": "08:00", "end": "18:00", "enabled": True}, 
        "wednesday": {"start": "08:00", "end": "18:00", "enabled": True},
        "thursday": {"start": "08:00", "end": "18:00", "enabled": True},
        "friday": {"start": "08:00", "end": "18:00", "enabled": True},
        "saturday": {"start": "08:00", "end": "14:00", "enabled": False},
        "sunday": {"start": "08:00", "end": "14:00", "enabled": False}
    })
    
    # Duração padrão dos agendamentos (em minutos)
    default_appointment_duration = Column(Integer, default=60, nullable=False)
    
    # Intervalo mínimo entre agendamentos (em minutos)
    appointment_interval = Column(Integer, default=0, nullable=False)
    
    # Antecedência mínima para agendamento (em horas)
    min_advance_booking_hours = Column(Integer, default=2, nullable=False)
    
    # Antecedência máxima para agendamento (em dias)
    max_advance_booking_days = Column(Integer, default=30, nullable=False)
    
    # === CONFIGURAÇÕES DE CANCELAMENTO ===
    # Prazo para cancelamento sem multa (em horas)
    cancellation_deadline_hours = Column(Integer, default=24, nullable=False)
    
    # Permitir cancelamento pelo cliente
    allow_client_cancellation = Column(Boolean, default=True, nullable=False)
    
    # === CONFIGURAÇÕES DE LEMBRETES ===
    # Horários de lembrete (em horas antes do agendamento)
    reminder_hours_before = Column(JSON, nullable=False, default=lambda: [24, 2])
    
    # Tipos de lembrete habilitados
    enabled_reminder_types = Column(JSON, nullable=False, default=lambda: ["email", "push"])
    
    # === CONFIGURAÇÕES DE APROVAÇÃO ===
    # Agendamentos precisam de aprovação manual
    require_approval = Column(Boolean, default=False, nullable=False)
    
    # Auto-confirmar agendamentos após X minutos
    auto_confirm_minutes = Column(Integer, nullable=True)
    
    # === CONFIGURAÇÕES DE LISTA DE ESPERA ===
    # Habilitar lista de espera
    enable_waitlist = Column(Boolean, default=True, nullable=False)
    
    # Máximo de pessoas na lista de espera
    max_waitlist_size = Column(Integer, default=50, nullable=False)
    
    # === CONFIGURAÇÕES DE TIMEZONE ===
    # Timezone da empresa
    timezone = Column(String(50), default="America/Sao_Paulo", nullable=False)
    
    # === CONFIGURAÇÕES AVANÇADAS ===
    # Permitir agendamentos simultâneos (mesmo profissional)
    allow_simultaneous_appointments = Column(Boolean, default=False, nullable=False)
    
    # Buffers de tempo (JSON)
    time_buffers = Column(JSON, nullable=True, default=lambda: {
        "before_appointment": 0,  # minutos antes
        "after_appointment": 0,   # minutos depois
        "lunch_break": {"start": "12:00", "end": "13:00", "enabled": False}
    })
    
    # Configurações de feriados (JSON com datas)
    holidays = Column(JSON, nullable=True, default=lambda: [])
    
    # === CONFIGURAÇÕES DE NOTIFICAÇÕES PERSONALIZADAS ===
    # Templates de mensagens personalizadas (JSON)
    notification_templates = Column(JSON, nullable=True, default=lambda: {
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
        }
    })
    
    # Variáveis disponíveis para templates
    available_template_variables = Column(JSON, nullable=True, default=lambda: [
        "client_name", "client_email", "client_phone",
        "professional_name", "service_name", "service_duration",
        "appointment_date", "appointment_time", "appointment_datetime",
        "company_name", "company_phone", "company_address"
    ])
    
    # Relationship
    company = relationship("Company", back_populates="scheduling_settings")
    
    def get_business_hours_for_day(self, day_name: str) -> Optional[Dict[str, Any]]:
        """Retorna os horários de funcionamento para um dia específico"""
        return self.business_hours.get(day_name.lower())
    
    def is_business_day(self, day_name: str) -> bool:
        """Verifica se é um dia de funcionamento"""
        day_config = self.get_business_hours_for_day(day_name)
        return day_config and day_config.get("enabled", False)
    
    def get_reminder_settings(self) -> Dict[str, Any]:
        """Retorna configurações completas de lembretes"""
        return {
            "hours_before": self.reminder_hours_before,
            "enabled_types": self.enabled_reminder_types,
            "templates": self.notification_templates
        }
    
    def get_notification_template(self, template_name: str, notification_type: str) -> Optional[Dict[str, str]]:
        """
        Retorna template de notificação específico
        
        Args:
            template_name: Nome do template (ex: "appointment_reminder_24h")
            notification_type: Tipo da notificação ("email", "sms", "push")
        """
        templates = self.notification_templates or {}
        template_group = templates.get(template_name, {})
        return template_group.get(notification_type)
    
    def format_notification_message(self, template_name: str, notification_type: str, variables: Dict[str, Any]) -> Optional[str]:
        """
        Formata mensagem de notificação com variáveis
        
        Args:
            template_name: Nome do template
            notification_type: Tipo da notificação
            variables: Dicionário com variáveis para substituição
        """
        template = self.get_notification_template(template_name, notification_type)
        if not template:
            return None
        
        try:
            if notification_type == "email":
                subject = template.get("subject", "").format(**variables)
                body = template.get("body", "").format(**variables)
                return {"subject": subject, "body": body}
            elif notification_type in ["sms", "push"]:
                if isinstance(template, dict):
                    # Para push notifications
                    title = template.get("title", "").format(**variables)
                    body = template.get("body", "").format(**variables)
                    return {"title": title, "body": body}
                else:
                    # Para SMS
                    return template.format(**variables)
        except KeyError as e:
            print(f"Erro ao formatar template {template_name}: variável {e} não encontrada")
            return None
    
    def get_cancellation_policy(self) -> Dict[str, Any]:
        """Retorna política de cancelamento"""
        return {
            "deadline_hours": self.cancellation_deadline_hours,
            "allow_client_cancellation": self.allow_client_cancellation
        }
    
    def is_within_business_hours(self, day_name: str, time_str: str) -> bool:
        """
        Verifica se um horário está dentro do funcionamento
        
        Args:
            day_name: Nome do dia da semana
            time_str: Horário no formato "HH:MM"
        """
        if not self.is_business_day(day_name):
            return False
        
        day_config = self.get_business_hours_for_day(day_name)
        start_time = day_config.get("start", "08:00")
        end_time = day_config.get("end", "18:00")
        
        return start_time <= time_str <= end_time
    
    def __repr__(self):
        return f"<SchedulingSettings company_id={self.company_id}>"
