"""
WhatsApp Webhook Handler
Processa respostas e interações dos clientes via WhatsApp
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging
from datetime import datetime

from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.client import Client
from app.services.whatsapp_appointment_notifications import whatsapp_appointment_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/webhook")
async def handle_whatsapp_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Recebe e processa webhooks do Evolution API
    Eventos: mensagens, botões, listas, status
    """
    try:
        data = await request.json()
        
        # Log do evento recebido
        logger.info(f"Webhook recebido: {data.get('event', 'unknown')}")
        
        event = data.get('event')
        
        # Processar diferentes tipos de eventos
        if event == 'messages.upsert':
            return await handle_message_received(data, db)
        
        elif event == 'messages.update':
            return await handle_message_update(data, db)
        
        elif event == 'send.message':
            return await handle_message_sent(data, db)
        
        elif event == 'connection.update':
            return await handle_connection_update(data, db)
        
        else:
            logger.warning(f"Evento não tratado: {event}")
            return {"status": "ignored", "event": event}
        
    except Exception as e:
        logger.error(f"Erro ao processar webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def handle_message_received(data: Dict[str, Any], db: Session):
    """Processa mensagem recebida do cliente"""
    try:
        message_data = data.get('data', {})
        
        # Extrair informações da mensagem
        message_type = message_data.get('messageType')
        from_number = message_data.get('key', {}).get('remoteJid', '').replace('@s.whatsapp.net', '')
        message_content = message_data.get('message', {})
        
        # Processar botões clicados
        if message_type == 'buttonsResponseMessage':
            button_id = message_content.get('buttonsResponseMessage', {}).get('selectedButtonId')
            return await handle_button_response(button_id, from_number, db)
        
        # Processar lista selecionada
        elif message_type == 'listResponseMessage':
            list_id = message_content.get('listResponseMessage', {}).get('singleSelectReply', {}).get('selectedRowId')
            return await handle_list_response(list_id, from_number, db)
        
        # Processar mensagem de texto
        elif message_type == 'conversation' or message_type == 'extendedTextMessage':
            text = message_content.get('conversation') or message_content.get('extendedTextMessage', {}).get('text', '')
            return await handle_text_message(text, from_number, db)
        
        return {"status": "processed", "type": message_type}
        
    except Exception as e:
        logger.error(f"Erro ao processar mensagem recebida: {e}")
        return {"status": "error", "error": str(e)}


async def handle_button_response(button_id: str, from_number: str, db: Session):
    """Processa resposta de botão clicado"""
    try:
        logger.info(f"Botão clicado: {button_id} por {from_number}")
        
        # Extrair ação e ID do agendamento
        parts = button_id.split('_')
        if len(parts) < 2:
            return {"status": "invalid_button_id"}
        
        action = parts[0]
        appointment_id = int(parts[1])
        
        # Buscar agendamento
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            logger.warning(f"Agendamento {appointment_id} não encontrado")
            return {"status": "appointment_not_found"}
        
        # Processar ação
        if action == 'confirm':
            # Confirmar agendamento
            appointment.status = AppointmentStatus.CONFIRMED
            appointment.confirmed_at = datetime.now()
            db.commit()
            
            # Enviar mensagem de confirmação
            await whatsapp_appointment_service.send_appointment_confirmed(db, appointment)
            
            logger.info(f"Agendamento {appointment_id} confirmado")
            return {"status": "confirmed", "appointment_id": appointment_id}
        
        elif action == 'reschedule':
            # Iniciar fluxo de reagendamento
            # TODO: Implementar fluxo de reagendamento
            logger.info(f"Solicitação de reagendamento para {appointment_id}")
            return {"status": "reschedule_requested", "appointment_id": appointment_id}
        
        elif action == 'cancel':
            # Cancelar agendamento
            appointment.status = AppointmentStatus.CANCELLED
            appointment.cancelled_at = datetime.now()
            db.commit()
            
            # Enviar mensagem de cancelamento
            await whatsapp_appointment_service.send_appointment_cancelled(db, appointment)
            
            logger.info(f"Agendamento {appointment_id} cancelado")
            return {"status": "cancelled", "appointment_id": appointment_id}
        
        return {"status": "unknown_action", "action": action}
        
    except Exception as e:
        logger.error(f"Erro ao processar botão: {e}")
        return {"status": "error", "error": str(e)}


async def handle_list_response(list_id: str, from_number: str, db: Session):
    """Processa resposta de lista selecionada"""
    try:
        logger.info(f"Item de lista selecionado: {list_id} por {from_number}")
        
        # Extrair tipo e ID
        parts = list_id.split('_')
        if len(parts) < 2:
            return {"status": "invalid_list_id"}
        
        item_type = parts[0]
        item_id = parts[1]
        
        if item_type == 'service':
            # Cliente selecionou um serviço
            # TODO: Continuar fluxo de agendamento (selecionar profissional, data, horário)
            logger.info(f"Serviço {item_id} selecionado por {from_number}")
            return {"status": "service_selected", "service_id": item_id}
        
        elif item_type == 'time':
            # Cliente selecionou um horário
            # TODO: Criar agendamento com horário selecionado
            logger.info(f"Horário {item_id} selecionado por {from_number}")
            return {"status": "time_selected", "time": item_id}
        
        return {"status": "unknown_list_type", "type": item_type}
        
    except Exception as e:
        logger.error(f"Erro ao processar lista: {e}")
        return {"status": "error", "error": str(e)}


async def handle_text_message(text: str, from_number: str, db: Session):
    """Processa mensagem de texto do cliente"""
    try:
        logger.info(f"Mensagem de texto recebida de {from_number}: {text}")
        
        # Aqui você pode implementar lógica de NLP ou comandos simples
        text_lower = text.lower().strip()
        
        # Comandos simples
        if text_lower in ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite']:
            # Saudação
            return {"status": "greeting", "action": "send_menu"}
        
        elif 'agendar' in text_lower or 'marcar' in text_lower:
            # Solicitar agendamento
            return {"status": "schedule_request", "action": "send_services"}
        
        elif 'cancelar' in text_lower:
            # Solicitar cancelamento
            return {"status": "cancel_request", "action": "list_appointments"}
        
        elif 'horário' in text_lower or 'horario' in text_lower:
            # Consultar horários
            return {"status": "time_request", "action": "send_available_times"}
        
        # Mensagem genérica
        return {"status": "text_received", "text": text}
        
    except Exception as e:
        logger.error(f"Erro ao processar texto: {e}")
        return {"status": "error", "error": str(e)}


async def handle_message_update(data: Dict[str, Any], db: Session):
    """Processa atualização de status de mensagem (lida, entregue, etc)"""
    try:
        logger.debug(f"Atualização de mensagem: {data}")
        # Aqui você pode atualizar o status de entrega das mensagens no banco
        return {"status": "message_update_processed"}
        
    except Exception as e:
        logger.error(f"Erro ao processar atualização: {e}")
        return {"status": "error", "error": str(e)}


async def handle_message_sent(data: Dict[str, Any], db: Session):
    """Processa confirmação de mensagem enviada"""
    try:
        logger.debug(f"Mensagem enviada: {data}")
        return {"status": "message_sent_processed"}
        
    except Exception as e:
        logger.error(f"Erro ao processar envio: {e}")
        return {"status": "error", "error": str(e)}


async def handle_connection_update(data: Dict[str, Any], db: Session):
    """Processa atualização de status de conexão"""
    try:
        connection_data = data.get('data', {})
        state = connection_data.get('state')
        
        logger.info(f"Status de conexão: {state}")
        
        # Você pode armazenar o status da conexão no banco
        # e notificar administradores se a conexão cair
        
        return {"status": "connection_update_processed", "state": state}
        
    except Exception as e:
        logger.error(f"Erro ao processar conexão: {e}")
        return {"status": "error", "error": str(e)}
