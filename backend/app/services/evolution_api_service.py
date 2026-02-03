"""
Evolution API Service - Integração completa com WhatsApp
Confirmação, reagendamento e cancelamento de agendamentos via WhatsApp
"""
import json
import logging
import hashlib
import hmac
from typing import Optional, Dict, List, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import httpx
import requests

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.service import Service
from app.models.client import Client
from app.models.company import Company
from app.core.config import settings
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


class EvolutionAPIService:
    """
    Serviço para integração com Evolution API (WhatsApp)
    Suporta confirmação, reagendamento e cancelamento de agendamentos
    """
    
    def __init__(self, db: Session, instance_name: str = None, api_url: str = None, api_key: str = None):
        self.db = db
        self.instance_name = instance_name or settings.WHATSAPP_INSTANCE_NAME or "default"
        self.api_url = (api_url or settings.WHATSAPP_API_URL or "").rstrip('/')
        self.api_key = api_key or settings.WHATSAPP_API_TOKEN
    
    def _get_headers(self) -> Dict[str, str]:
        """Headers para requisições à Evolution API"""
        return {
            "Content-Type": "application/json",
            "apikey": self.api_key
        }
    
    def _format_phone(self, phone: str) -> str:
        """Formata número de telefone para padrão WhatsApp"""
        phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '').replace('+', '')
        
        # Adicionar código do país se não tiver
        if len(phone) == 11 and phone.startswith('9'):
            phone = '55' + phone
        elif len(phone) == 10:
            phone = '55' + phone
        elif not phone.startswith('55') and len(phone) < 13:
            phone = '55' + phone
        
        return phone
    
    # =========================================================================
    # Métodos de Envio de Mensagens
    # =========================================================================
    
    def send_text_message(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia mensagem de texto simples
        """
        phone = self._format_phone(phone)
        
        endpoint = f"{self.api_url}/message/sendText/{self.instance_name}"
        
        payload = {
            "number": phone,
            "text": message
        }
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("key", {}).get("id"),
                    "status": "sent",
                    "response": data
                }
            else:
                logger.error(f"Evolution API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "status": "failed",
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return {
                "success": False,
                "status": "error",
                "error": str(e)
            }
    
    def send_button_message(
        self, 
        phone: str, 
        title: str, 
        description: str, 
        buttons: List[Dict[str, str]],
        footer: str = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem com botões interativos
        
        Args:
            phone: Número do telefone
            title: Título da mensagem
            description: Descrição/corpo da mensagem
            buttons: Lista de botões [{"buttonId": "id", "buttonText": {"displayText": "Texto"}}]
            footer: Rodapé opcional
        """
        phone = self._format_phone(phone)
        
        endpoint = f"{self.api_url}/message/sendButtons/{self.instance_name}"
        
        payload = {
            "number": phone,
            "title": title,
            "description": description,
            "buttons": buttons
        }
        
        if footer:
            payload["footer"] = footer
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("key", {}).get("id"),
                    "status": "sent",
                    "response": data
                }
            else:
                # Fallback para mensagem de texto se botões não suportados
                logger.warning(f"Buttons not supported, falling back to text message")
                return self._send_confirmation_text_fallback(phone, title, description, buttons)
                
        except Exception as e:
            logger.error(f"Error sending button message: {e}")
            return self._send_confirmation_text_fallback(phone, title, description, buttons)
    
    def send_list_message(
        self,
        phone: str,
        title: str,
        description: str,
        button_text: str,
        sections: List[Dict[str, Any]],
        footer: str = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem com lista de opções
        
        Args:
            phone: Número do telefone
            title: Título da mensagem
            description: Descrição
            button_text: Texto do botão para abrir lista
            sections: Seções com opções
            footer: Rodapé opcional
        """
        phone = self._format_phone(phone)
        
        endpoint = f"{self.api_url}/message/sendList/{self.instance_name}"
        
        payload = {
            "number": phone,
            "title": title,
            "description": description,
            "buttonText": button_text,
            "sections": sections
        }
        
        if footer:
            payload["footer"] = footer
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("key", {}).get("id"),
                    "status": "sent",
                    "response": data
                }
            else:
                logger.error(f"List message error: {response.status_code}")
                return {
                    "success": False,
                    "status": "failed",
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error sending list message: {e}")
            return {"success": False, "status": "error", "error": str(e)}
    
    def _send_confirmation_text_fallback(
        self, 
        phone: str, 
        title: str, 
        description: str, 
        buttons: List[Dict]
    ) -> Dict[str, Any]:
        """Fallback para texto quando botões não são suportados"""
        options_text = "\n".join([
            f"*{i+1}* - {btn.get('buttonText', {}).get('displayText', btn.get('text', ''))}"
            for i, btn in enumerate(buttons)
        ])
        
        message = f"*{title}*\n\n{description}\n\n{options_text}\n\n_Responda com o número da opção desejada_"
        
        return self.send_text_message(phone, message)
    
    # =========================================================================
    # Confirmação de Agendamento
    # =========================================================================
    
    def send_appointment_confirmation_request(self, appointment: Appointment) -> Dict[str, Any]:
        """
        Envia solicitação de confirmação de agendamento via WhatsApp
        """
        # Buscar dados relacionados
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        professional = self.db.query(User).filter(User.id == appointment.professional_id).first()
        company = self.db.query(Company).filter(Company.id == appointment.company_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        # Formatar data/hora
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        # Preparar mensagem
        title = f"📅 Confirmação de Agendamento"
        
        description = (
            f"Olá *{client.full_name}*!\n\n"
            f"Você tem um agendamento marcado:\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n"
            f"👤 *Profissional:* {professional.full_name if professional else 'Equipe'}\n"
            f"📆 *Data:* {date_str}\n"
            f"⏰ *Horário:* {time_str}\n"
            f"🏢 *Local:* {company.name if company else 'Empresa'}\n\n"
            f"Por favor, confirme sua presença:"
        )
        
        # Botões de ação
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
        
        footer = f"Agendamento #{appointment.id}"
        
        result = self.send_button_message(
            phone=client.cellphone,
            title=title,
            description=description,
            buttons=buttons,
            footer=footer
        )
        
        # Registrar envio
        if result.get("success"):
            self._log_whatsapp_message(
                appointment_id=appointment.id,
                message_type="confirmation_request",
                phone=client.cellphone,
                status="sent",
                message_id=result.get("message_id")
            )
        
        return result
    
    def send_appointment_reminder(self, appointment: Appointment, hours_before: int = 24) -> Dict[str, Any]:
        """
        Envia lembrete de agendamento via WhatsApp
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        professional = self.db.query(User).filter(User.id == appointment.professional_id).first()
        company = self.db.query(Company).filter(Company.id == appointment.company_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        if hours_before == 24:
            time_text = "amanhã"
        elif hours_before < 24:
            time_text = f"em {hours_before} horas"
        else:
            time_text = f"em {hours_before // 24} dias"
        
        message = (
            f"⏰ *Lembrete de Agendamento*\n\n"
            f"Olá *{client.full_name}*!\n\n"
            f"Seu agendamento é *{time_text}*:\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n"
            f"👤 *Profissional:* {professional.full_name if professional else 'Equipe'}\n"
            f"📆 *Data:* {date_str}\n"
            f"⏰ *Horário:* {time_str}\n"
            f"🏢 *Local:* {company.name if company else 'Empresa'}\n\n"
            f"Responda:\n"
            f"*1* - ✅ Confirmar presença\n"
            f"*2* - 📅 Reagendar\n"
            f"*3* - ❌ Cancelar\n\n"
            f"_Agendamento #{appointment.id}_"
        )
        
        result = self.send_text_message(client.cellphone, message)
        
        if result.get("success"):
            self._log_whatsapp_message(
                appointment_id=appointment.id,
                message_type=f"reminder_{hours_before}h",
                phone=client.cellphone,
                status="sent",
                message_id=result.get("message_id")
            )
        
        return result
    
    # =========================================================================
    # Reagendamento
    # =========================================================================
    
    def send_reschedule_options(self, appointment: Appointment, available_slots: List[Dict]) -> Dict[str, Any]:
        """
        Envia opções de horários disponíveis para reagendamento
        
        Args:
            appointment: Agendamento atual
            available_slots: Lista de horários disponíveis [{"datetime": datetime, "formatted": "str"}]
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        title = "📅 Reagendamento"
        description = f"Olá *{client.full_name}*!\n\nEscolha um novo horário para seu agendamento:"
        
        # Criar seções com horários disponíveis
        sections = []
        
        # Agrupar por data
        slots_by_date = {}
        for slot in available_slots[:20]:  # Limitar a 20 opções
            date_key = slot["datetime"].strftime("%d/%m/%Y")
            if date_key not in slots_by_date:
                slots_by_date[date_key] = []
            slots_by_date[date_key].append(slot)
        
        for date_str, slots in slots_by_date.items():
            rows = []
            for slot in slots:
                time_str = slot["datetime"].strftime("%H:%M")
                rows.append({
                    "title": f"⏰ {time_str}",
                    "description": f"Horário disponível",
                    "rowId": f"slot_{appointment.id}_{slot['datetime'].isoformat()}"
                })
            
            sections.append({
                "title": f"📆 {date_str}",
                "rows": rows
            })
        
        result = self.send_list_message(
            phone=client.cellphone,
            title=title,
            description=description,
            button_text="Ver Horários",
            sections=sections,
            footer=f"Agendamento #{appointment.id}"
        )
        
        # Fallback para texto se lista não funcionar
        if not result.get("success"):
            return self._send_reschedule_text_fallback(client.cellphone, appointment, available_slots)
        
        return result
    
    def _send_reschedule_text_fallback(
        self, 
        phone: str, 
        appointment: Appointment, 
        available_slots: List[Dict]
    ) -> Dict[str, Any]:
        """Fallback para texto quando lista não é suportada"""
        slots_text = ""
        for i, slot in enumerate(available_slots[:10], 1):
            date_str = slot["datetime"].strftime("%d/%m/%Y")
            time_str = slot["datetime"].strftime("%H:%M")
            slots_text += f"*{i}* - {date_str} às {time_str}\n"
        
        message = (
            f"📅 *Reagendamento*\n\n"
            f"Escolha um novo horário:\n\n"
            f"{slots_text}\n"
            f"*0* - Cancelar reagendamento\n\n"
            f"_Responda com o número da opção_"
        )
        
        return self.send_text_message(phone, message)
    
    # =========================================================================
    # Cancelamento
    # =========================================================================
    
    def send_cancellation_confirmation(self, appointment: Appointment) -> Dict[str, Any]:
        """
        Envia confirmação de cancelamento
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        message = (
            f"❌ *Agendamento Cancelado*\n\n"
            f"Olá *{client.full_name}*,\n\n"
            f"Seu agendamento foi cancelado:\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n"
            f"📆 *Data:* {date_str}\n"
            f"⏰ *Horário:* {time_str}\n\n"
            f"Se desejar reagendar, entre em contato conosco.\n\n"
            f"_Agendamento #{appointment.id}_"
        )
        
        result = self.send_text_message(client.cellphone, message)
        
        if result.get("success"):
            self._log_whatsapp_message(
                appointment_id=appointment.id,
                message_type="cancellation_confirmation",
                phone=client.cellphone,
                status="sent",
                message_id=result.get("message_id")
            )
        
        return result
    
    def send_cancellation_request(self, appointment: Appointment) -> Dict[str, Any]:
        """
        Envia solicitação de confirmação de cancelamento
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        title = "❓ Confirmar Cancelamento"
        
        description = (
            f"Olá *{client.full_name}*,\n\n"
            f"Você deseja cancelar este agendamento?\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n"
            f"📆 *Data:* {date_str}\n"
            f"⏰ *Horário:* {time_str}"
        )
        
        buttons = [
            {
                "buttonId": f"confirm_cancel_{appointment.id}",
                "buttonText": {"displayText": "✅ Sim, cancelar"}
            },
            {
                "buttonId": f"keep_{appointment.id}",
                "buttonText": {"displayText": "❌ Não, manter"}
            }
        ]
        
        return self.send_button_message(
            phone=client.cellphone,
            title=title,
            description=description,
            buttons=buttons,
            footer=f"Agendamento #{appointment.id}"
        )
    
    # =========================================================================
    # Notificações de Status
    # =========================================================================
    
    def send_appointment_confirmed(self, appointment: Appointment) -> Dict[str, Any]:
        """
        Envia confirmação de que o agendamento foi confirmado
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        professional = self.db.query(User).filter(User.id == appointment.professional_id).first()
        company = self.db.query(Company).filter(Company.id == appointment.company_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        date_str = appointment.start_time.strftime("%d/%m/%Y")
        time_str = appointment.start_time.strftime("%H:%M")
        
        message = (
            f"✅ *Agendamento Confirmado!*\n\n"
            f"Olá *{client.full_name}*!\n\n"
            f"Seu agendamento está confirmado:\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n"
            f"👤 *Profissional:* {professional.full_name if professional else 'Equipe'}\n"
            f"📆 *Data:* {date_str}\n"
            f"⏰ *Horário:* {time_str}\n"
            f"🏢 *Local:* {company.name if company else 'Empresa'}\n"
        )
        
        if company and company.address:
            message += f"📍 *Endereço:* {company.address}\n"
        
        message += f"\nAguardamos você! 😊\n\n_Agendamento #{appointment.id}_"
        
        result = self.send_text_message(client.cellphone, message)
        
        if result.get("success"):
            self._log_whatsapp_message(
                appointment_id=appointment.id,
                message_type="appointment_confirmed",
                phone=client.cellphone,
                status="sent",
                message_id=result.get("message_id")
            )
        
        return result
    
    def send_appointment_rescheduled(
        self, 
        appointment: Appointment, 
        old_datetime: datetime
    ) -> Dict[str, Any]:
        """
        Envia notificação de reagendamento
        """
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        service = self.db.query(Service).filter(Service.id == appointment.service_id).first()
        
        if not client or not client.cellphone:
            return {"success": False, "error": "Cliente sem telefone cadastrado"}
        
        old_date_str = old_datetime.strftime("%d/%m/%Y às %H:%M")
        new_date_str = appointment.start_time.strftime("%d/%m/%Y")
        new_time_str = appointment.start_time.strftime("%H:%M")
        
        message = (
            f"📅 *Agendamento Reagendado*\n\n"
            f"Olá *{client.full_name}*!\n\n"
            f"Seu agendamento foi alterado:\n\n"
            f"❌ *Anterior:* {old_date_str}\n"
            f"✅ *Novo horário:* {new_date_str} às {new_time_str}\n\n"
            f"📋 *Serviço:* {service.name if service else 'Serviço'}\n\n"
            f"_Agendamento #{appointment.id}_"
        )
        
        result = self.send_text_message(client.cellphone, message)
        
        if result.get("success"):
            self._log_whatsapp_message(
                appointment_id=appointment.id,
                message_type="appointment_rescheduled",
                phone=client.cellphone,
                status="sent",
                message_id=result.get("message_id")
            )
        
        return result
    
    # =========================================================================
    # Webhook Handler
    # =========================================================================
    
    def process_webhook_message(self, payload: Dict) -> Dict[str, Any]:
        """
        Processa mensagem recebida via webhook da Evolution API
        
        Args:
            payload: Payload do webhook
            
        Returns:
            Ação a ser tomada baseada na resposta do usuário
        """
        try:
            # Extrair dados da mensagem
            data = payload.get("data", {})
            message = data.get("message", {})
            
            # Verificar tipo de mensagem
            if "buttonsResponseMessage" in message:
                # Resposta de botão
                button_id = message["buttonsResponseMessage"].get("selectedButtonId", "")
                return self._process_button_response(button_id, payload)
            
            elif "listResponseMessage" in message:
                # Resposta de lista
                row_id = message["listResponseMessage"].get("singleSelectReply", {}).get("selectedRowId", "")
                return self._process_list_response(row_id, payload)
            
            elif "conversation" in message or "extendedTextMessage" in message:
                # Mensagem de texto
                text = message.get("conversation") or message.get("extendedTextMessage", {}).get("text", "")
                phone = data.get("key", {}).get("remoteJid", "").replace("@s.whatsapp.net", "")
                return self._process_text_response(text, phone, payload)
            
            return {"action": "unknown", "message": "Tipo de mensagem não reconhecido"}
            
        except Exception as e:
            logger.error(f"Error processing webhook: {e}")
            return {"action": "error", "error": str(e)}
    
    def _process_button_response(self, button_id: str, payload: Dict) -> Dict[str, Any]:
        """Processa resposta de botão"""
        parts = button_id.split("_")
        
        if len(parts) < 2:
            return {"action": "invalid", "message": "ID de botão inválido"}
        
        action = parts[0]
        appointment_id = int(parts[1]) if parts[1].isdigit() else None
        
        if not appointment_id:
            return {"action": "invalid", "message": "ID de agendamento inválido"}
        
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            return {"action": "not_found", "message": "Agendamento não encontrado"}
        
        if action == "confirm":
            return self._handle_confirmation(appointment)
        elif action == "reschedule":
            return self._handle_reschedule_request(appointment)
        elif action == "cancel":
            return self._handle_cancel_request(appointment)
        elif action == "confirm_cancel":
            return self._handle_cancel_confirmation(appointment)
        elif action == "keep":
            return self._handle_keep_appointment(appointment)
        
        return {"action": "unknown", "message": f"Ação desconhecida: {action}"}
    
    def _process_list_response(self, row_id: str, payload: Dict) -> Dict[str, Any]:
        """Processa resposta de lista (seleção de horário)"""
        if row_id.startswith("slot_"):
            parts = row_id.split("_")
            if len(parts) >= 3:
                appointment_id = int(parts[1])
                new_datetime_str = "_".join(parts[2:])
                
                try:
                    new_datetime = datetime.fromisoformat(new_datetime_str)
                    return self._handle_reschedule_slot_selection(appointment_id, new_datetime)
                except ValueError:
                    return {"action": "invalid", "message": "Data/hora inválida"}
        
        return {"action": "unknown", "message": "Seleção não reconhecida"}
    
    def _process_text_response(self, text: str, phone: str, payload: Dict) -> Dict[str, Any]:
        """Processa resposta de texto (fallback para quando botões não funcionam)"""
        text = text.strip().lower()
        
        # Buscar último agendamento pendente de confirmação para este telefone
        client = self.db.query(Client).filter(
            Client.cellphone.contains(phone[-9:])  # Últimos 9 dígitos
        ).first()
        
        if not client:
            return {"action": "client_not_found", "message": "Cliente não encontrado"}
        
        # Buscar agendamento pendente
        appointment = self.db.query(Appointment).filter(
            Appointment.client_crm_id == client.id,
            Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
            Appointment.start_time > datetime.utcnow()
        ).order_by(Appointment.start_time).first()
        
        if not appointment:
            return {"action": "no_appointment", "message": "Nenhum agendamento pendente encontrado"}
        
        # Interpretar resposta
        if text in ["1", "sim", "confirmar", "confirmo", "ok", "confirmado"]:
            return self._handle_confirmation(appointment)
        elif text in ["2", "reagendar", "remarcar", "mudar"]:
            return self._handle_reschedule_request(appointment)
        elif text in ["3", "cancelar", "cancela", "não", "nao"]:
            return self._handle_cancel_request(appointment)
        
        return {
            "action": "unknown_response",
            "message": "Resposta não reconhecida",
            "appointment_id": appointment.id
        }
    
    # =========================================================================
    # Handlers de Ações
    # =========================================================================
    
    def _handle_confirmation(self, appointment: Appointment) -> Dict[str, Any]:
        """Processa confirmação de agendamento"""
        appointment.status = AppointmentStatus.CONFIRMED
        self.db.commit()
        
        # Enviar confirmação
        self.send_appointment_confirmed(appointment)
        
        return {
            "action": "confirmed",
            "appointment_id": appointment.id,
            "message": "Agendamento confirmado com sucesso"
        }
    
    def _handle_reschedule_request(self, appointment: Appointment) -> Dict[str, Any]:
        """Processa solicitação de reagendamento"""
        # Buscar horários disponíveis (próximos 7 dias)
        from app.services.availability_service import get_available_slots
        
        try:
            available_slots = get_available_slots(
                self.db,
                appointment.company_id,
                appointment.professional_id,
                appointment.service_id,
                days_ahead=7
            )
            
            if available_slots:
                self.send_reschedule_options(appointment, available_slots)
                return {
                    "action": "reschedule_options_sent",
                    "appointment_id": appointment.id,
                    "slots_count": len(available_slots)
                }
            else:
                # Sem horários disponíveis
                client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
                if client and client.cellphone:
                    self.send_text_message(
                        client.cellphone,
                        "😔 Desculpe, não há horários disponíveis nos próximos 7 dias. "
                        "Por favor, entre em contato conosco para reagendar."
                    )
                
                return {
                    "action": "no_slots_available",
                    "appointment_id": appointment.id
                }
                
        except Exception as e:
            logger.error(f"Error getting available slots: {e}")
            return {
                "action": "error",
                "error": str(e)
            }
    
    def _handle_reschedule_slot_selection(self, appointment_id: int, new_datetime: datetime) -> Dict[str, Any]:
        """Processa seleção de novo horário"""
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        
        if not appointment:
            return {"action": "not_found", "message": "Agendamento não encontrado"}
        
        old_datetime = appointment.start_time
        
        # Calcular nova hora de término
        duration = (appointment.end_time - appointment.start_time).total_seconds() / 60
        new_end_time = new_datetime + timedelta(minutes=duration)
        
        # Atualizar agendamento
        appointment.start_time = new_datetime
        appointment.end_time = new_end_time
        appointment.status = AppointmentStatus.CONFIRMED
        self.db.commit()
        
        # Enviar confirmação
        self.send_appointment_rescheduled(appointment, old_datetime)
        
        return {
            "action": "rescheduled",
            "appointment_id": appointment.id,
            "old_datetime": old_datetime.isoformat(),
            "new_datetime": new_datetime.isoformat()
        }
    
    def _handle_cancel_request(self, appointment: Appointment) -> Dict[str, Any]:
        """Processa solicitação de cancelamento"""
        self.send_cancellation_request(appointment)
        
        return {
            "action": "cancel_request_sent",
            "appointment_id": appointment.id
        }
    
    def _handle_cancel_confirmation(self, appointment: Appointment) -> Dict[str, Any]:
        """Processa confirmação de cancelamento"""
        appointment.status = AppointmentStatus.CANCELLED
        appointment.internal_notes = (appointment.internal_notes or "") + f"\nCancelado via WhatsApp em {datetime.utcnow()}"
        self.db.commit()
        
        # Enviar confirmação
        self.send_cancellation_confirmation(appointment)
        
        return {
            "action": "cancelled",
            "appointment_id": appointment.id,
            "message": "Agendamento cancelado com sucesso"
        }
    
    def _handle_keep_appointment(self, appointment: Appointment) -> Dict[str, Any]:
        """Processa decisão de manter agendamento"""
        client = self.db.query(Client).filter(Client.id == appointment.client_crm_id).first()
        
        if client and client.cellphone:
            self.send_text_message(
                client.cellphone,
                "✅ Ok! Seu agendamento foi mantido. Aguardamos você!"
            )
        
        return {
            "action": "kept",
            "appointment_id": appointment.id,
            "message": "Agendamento mantido"
        }
    
    # =========================================================================
    # Logging
    # =========================================================================
    
    def _log_whatsapp_message(
        self,
        appointment_id: int,
        message_type: str,
        phone: str,
        status: str,
        message_id: str = None
    ):
        """Registra mensagem enviada no banco de dados"""
        try:
            from app.models.whatsapp_marketing import WhatsAppMessage
            
            log = WhatsAppMessage(
                appointment_id=appointment_id,
                message_type=message_type,
                phone=phone,
                status=status,
                external_id=message_id,
                sent_at=datetime.utcnow()
            )
            self.db.add(log)
            self.db.commit()
        except Exception as e:
            logger.warning(f"Could not log WhatsApp message: {e}")
    
    # =========================================================================
    # Utilitários
    # =========================================================================
    
    def check_connection(self) -> Dict[str, Any]:
        """Verifica conexão com Evolution API"""
        endpoint = f"{self.api_url}/instance/connectionState/{self.instance_name}"
        
        try:
            response = requests.get(
                endpoint,
                headers=self._get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                state = data.get("instance", {}).get("state", "unknown")
                
                return {
                    "connected": state == "open",
                    "status": state,
                    "instance": self.instance_name,
                    "response": data
                }
            else:
                return {
                    "connected": False,
                    "status": "error",
                    "message": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "connected": False,
                "status": "error",
                "message": str(e)
            }


# Factory function
def get_evolution_api_service(db: Session = None) -> EvolutionAPIService:
    """Factory para criar instância do serviço"""
    if db is None:
        db = SessionLocal()
    
    return EvolutionAPIService(db)
