"""
WhatsApp Appointment Notifications Service
Serviço para enviar notificações e gerenciar agendamentos via WhatsApp
"""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.services.evolution_api import evolution_api_service
from app.models.appointment import Appointment
from app.models.client import Client
from app.models.service import Service
from app.models.professional import Professional
from app.core.config import settings

logger = logging.getLogger(__name__)


class WhatsAppAppointmentNotificationService:
    """Serviço para notificações de agendamento via WhatsApp"""
    
    def _get_instance_name(self, company_id: int) -> str:
        """
        Retorna o nome da instância WhatsApp para a empresa
        Cada empresa tem sua própria instância isolada
        """
        return f"company_{company_id}_whatsapp"

    def _get_default_instance_name(self) -> str:
        return getattr(settings, 'EVOLUTION_INSTANCE_NAME', 'agendamento-saas')
    
    def _format_phone(self, phone: str) -> str:
        """Formata número de telefone para padrão WhatsApp (DDI + DDD + número)"""
        # Remove caracteres não numéricos
        phone = ''.join(filter(str.isdigit, phone))
        
        # Se não tem DDI (55 para Brasil), adiciona
        if not phone.startswith('55'):
            phone = '55' + phone
        
        return phone
    
    def _format_datetime(self, dt: datetime) -> str:
        """Formata data e hora para exibição"""
        return dt.strftime("%d/%m/%Y às %H:%M")
    
    def _format_date(self, dt: datetime) -> str:
        """Formata apenas a data"""
        return dt.strftime("%d/%m/%Y")
    
    def _format_time(self, dt: datetime) -> str:
        """Formata apenas a hora"""
        return dt.strftime("%H:%M")
    
    # ==================== CONFIRMAÇÃO DE AGENDAMENTO ====================
    
    async def send_appointment_confirmation_request(
        self,
        db: Session,
        appointment: Appointment
    ) -> Dict[str, Any]:
        """
        Envia mensagem solicitando confirmação do agendamento
        com botões interativos
        IMPORTANTE: Usa instância isolada por empresa (multi-tenant)
        """
        try:
            # ISOLAMENTO MULTI-TENANT: Usar instância da empresa
            instance_name = self._get_instance_name(appointment.company_id)
            
            # Buscar dados relacionados (já filtrados por company_id no modelo)
            client = db.query(Client).filter(
                Client.id == appointment.client_crm_id,
                Client.company_id == appointment.company_id  # Validação extra de segurança
            ).first()
            service = db.query(Service).filter(
                Service.id == appointment.service_id,
                Service.company_id == appointment.company_id  # Validação extra de segurança
            ).first()
            professional = db.query(Professional).filter(
                Professional.id == appointment.professional_id,
                Professional.company_id == appointment.company_id  # Validação extra de segurança
            ).first()
            
            if not client or not client.phone:
                logger.warning(f"Cliente sem telefone para agendamento {appointment.id} (empresa {appointment.company_id})")
                return {"success": False, "error": "Cliente sem telefone"}
            
            phone = self._format_phone(client.phone)
            
            # Montar mensagem
            title = "🗓️ Confirmação de Agendamento"
            
            description = f"""
Olá *{client.full_name}*! 👋

Você tem um agendamento marcado:

📅 *Data:* {self._format_date(appointment.start_time)}
🕐 *Horário:* {self._format_time(appointment.start_time)}
💇 *Serviço:* {service.name if service else 'N/A'}
👤 *Profissional:* {professional.name if professional else 'N/A'}

Por favor, confirme sua presença:
            """.strip()
            
            footer = "Atendo - Sistema de Agendamentos"
            
            buttons = [
                {
                    "buttonId": f"confirm_{appointment.id}",
                    "buttonText": {"displayText": "✅ Confirmar"}
                },
                {
                    "buttonId": f"reschedule_{appointment.id}",
                    "buttonText": {"displayText": "📅 Reagendar"}
                },
                {
                    "buttonId": f"cancel_{appointment.id}",
                    "buttonText": {"displayText": "❌ Cancelar"}
                }
            ]
            
            result = await evolution_api_service.send_buttons(
                instance_name=instance_name,
                number=phone,
                title=title,
                description=description,
                footer=footer,
                buttons=buttons
            )
            
            logger.info(f"Confirmação enviada para agendamento {appointment.id}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar confirmação: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== LEMBRETE DE AGENDAMENTO ====================
    
    async def send_appointment_reminder(
        self,
        db: Session,
        appointment: Appointment,
        hours_before: int = 24
    ) -> Dict[str, Any]:
        """
        Envia lembrete de agendamento X horas antes
        """
        try:
            client = db.query(Client).filter(Client.id == appointment.client_crm_id).first()
            service = db.query(Service).filter(Service.id == appointment.service_id).first()
            professional = db.query(Professional).filter(
                Professional.id == appointment.professional_id
            ).first()
            
            if not client or not client.phone:
                return {"success": False, "error": "Cliente sem telefone"}
            
            phone = self._format_phone(client.phone)
            
            # Calcular tempo restante
            time_until = appointment.start_time - datetime.now()
            hours_until = int(time_until.total_seconds() / 3600)
            
            if hours_until <= 1:
                time_text = "em menos de 1 hora"
            elif hours_until < 24:
                time_text = f"em {hours_until} horas"
            else:
                days = hours_until // 24
                time_text = f"em {days} dia(s)"
            
            message = f"""
🔔 *Lembrete de Agendamento*

Olá *{client.full_name}*!

Você tem um agendamento {time_text}:

📅 *Data:* {self._format_date(appointment.start_time)}
🕐 *Horário:* {self._format_time(appointment.start_time)}
💇 *Serviço:* {service.name if service else 'N/A'}
👤 *Profissional:* {professional.name if professional else 'N/A'}

Nos vemos em breve! 😊

_Para reagendar ou cancelar, responda esta mensagem._
            """.strip()
            
            result = await evolution_api_service.send_text(
                instance_name=self._get_instance_name(appointment.company_id),
                number=phone,
                text=message
            )
            
            logger.info(f"Lembrete enviado para agendamento {appointment.id}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar lembrete: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== SELEÇÃO DE SERVIÇOS ====================
    
    async def send_service_selection(
        self,
        db: Session,
        client_phone: str,
        available_services: List[Service]
    ) -> Dict[str, Any]:
        """
        Envia lista de serviços disponíveis para seleção
        """
        try:
            phone = self._format_phone(client_phone)
            
            # Agrupar serviços por categoria (se houver)
            sections = []
            
            # Criar seção de serviços
            rows = []
            for service in available_services[:20]:  # Limite de 20 itens
                rows.append({
                    "title": service.name,
                    "description": f"R$ {service.price:.2f} - {service.duration} min",
                    "rowId": f"service_{service.id}"
                })
            
            sections.append({
                "title": "Serviços Disponíveis",
                "rows": rows
            })
            
            result = await evolution_api_service.send_list(
                instance_name=self._get_default_instance_name(),
                number=phone,
                title="💇 Escolha seu Serviço",
                description="Selecione o serviço desejado na lista abaixo:",
                button_text="Ver Serviços",
                sections=sections
            )
            
            logger.info(f"Lista de serviços enviada para {phone}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar lista de serviços: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== SELEÇÃO DE HORÁRIOS ====================
    
    async def send_time_slot_selection(
        self,
        client_phone: str,
        available_slots: List[Dict[str, Any]],
        date: datetime
    ) -> Dict[str, Any]:
        """
        Envia lista de horários disponíveis para agendamento
        """
        try:
            phone = self._format_phone(client_phone)
            
            # Criar lista de horários
            rows = []
            for slot in available_slots[:20]:  # Limite de 20 horários
                time_str = slot['time'].strftime("%H:%M")
                rows.append({
                    "title": time_str,
                    "description": f"Disponível em {self._format_date(date)}",
                    "rowId": f"time_{slot['time'].isoformat()}"
                })
            
            sections = [{
                "title": f"Horários - {self._format_date(date)}",
                "rows": rows
            }]
            
            result = await evolution_api_service.send_list(
                instance_name=self._get_default_instance_name(),
                number=phone,
                title="🕐 Escolha o Horário",
                description="Selecione o melhor horário para você:",
                button_text="Ver Horários",
                sections=sections
            )
            
            logger.info(f"Lista de horários enviada para {phone}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar lista de horários: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== CONFIRMAÇÃO DE AÇÃO ====================
    
    async def send_appointment_confirmed(
        self,
        db: Session,
        appointment: Appointment
    ) -> Dict[str, Any]:
        """Envia mensagem de confirmação após cliente confirmar"""
        try:
            client = db.query(Client).filter(Client.id == appointment.client_crm_id).first()
            service = db.query(Service).filter(Service.id == appointment.service_id).first()
            
            if not client or not client.phone:
                return {"success": False, "error": "Cliente sem telefone"}
            
            phone = self._format_phone(client.phone)
            
            message = f"""
✅ *Agendamento Confirmado!*

Obrigado por confirmar, *{client.full_name}*!

Seu agendamento está confirmado:

📅 *Data:* {self._format_date(appointment.start_time)}
🕐 *Horário:* {self._format_time(appointment.start_time)}
💇 *Serviço:* {service.name if service else 'N/A'}

Aguardamos você! 😊

_Em caso de imprevistos, avise com antecedência._
            """.strip()
            
            result = await evolution_api_service.send_text(
                instance_name=self._get_instance_name(appointment.company_id),
                number=phone,
                text=message
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar confirmação: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_appointment_cancelled(
        self,
        db: Session,
        appointment: Appointment
    ) -> Dict[str, Any]:
        """Envia mensagem após cancelamento"""
        try:
            client = db.query(Client).filter(Client.id == appointment.client_crm_id).first()
            
            if not client or not client.phone:
                return {"success": False, "error": "Cliente sem telefone"}
            
            phone = self._format_phone(client.phone)
            
            message = f"""
❌ *Agendamento Cancelado*

Olá *{client.full_name}*,

Seu agendamento foi cancelado conforme solicitado.

📅 *Data:* {self._format_date(appointment.start_time)}
🕐 *Horário:* {self._format_time(appointment.start_time)}

Esperamos vê-lo em breve! 

_Para fazer um novo agendamento, entre em contato conosco._
            """.strip()
            
            result = await evolution_api_service.send_text(
                instance_name=self._get_instance_name(appointment.company_id),
                number=phone,
                text=message
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar cancelamento: {e}")
            return {"success": False, "error": str(e)}
    
    # ==================== NOVO AGENDAMENTO ====================
    
    async def send_appointment_created(
        self,
        db: Session,
        appointment: Appointment
    ) -> Dict[str, Any]:
        """Envia mensagem quando um novo agendamento é criado"""
        try:
            client = db.query(Client).filter(Client.id == appointment.client_crm_id).first()
            service = db.query(Service).filter(Service.id == appointment.service_id).first()
            professional = db.query(Professional).filter(
                Professional.id == appointment.professional_id
            ).first()
            
            if not client or not client.phone:
                return {"success": False, "error": "Cliente sem telefone"}
            
            phone = self._format_phone(client.phone)
            
            message = f"""
🎉 *Novo Agendamento Criado!*

Olá *{client.full_name}*!

Seu agendamento foi criado com sucesso:

📅 *Data:* {self._format_date(appointment.start_time)}
🕐 *Horário:* {self._format_time(appointment.start_time)}
💇 *Serviço:* {service.name if service else 'N/A'}
👤 *Profissional:* {professional.name if professional else 'N/A'}
💰 *Valor:* R$ {service.price if service else 0:.2f}

Aguardamos você! 😊

_Você receberá um lembrete próximo ao horário._
            """.strip()
            
            result = await evolution_api_service.send_text(
                instance_name=self._get_instance_name(appointment.company_id),
                number=phone,
                text=message
            )
            
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de criação: {e}")
            return {"success": False, "error": str(e)}


# Singleton instance
whatsapp_appointment_service = WhatsAppAppointmentNotificationService()
