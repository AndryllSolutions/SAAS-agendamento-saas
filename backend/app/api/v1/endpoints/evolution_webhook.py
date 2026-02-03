"""
Evolution API Webhook Endpoints
Recebe e processa webhooks da Evolution API (WhatsApp)
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.services.evolution_api_service import get_evolution_api_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/webhook")
async def evolution_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Endpoint para receber webhooks da Evolution API
    
    Eventos suportados:
    - messages.upsert: Nova mensagem recebida
    - messages.update: Atualização de status de mensagem
    - connection.update: Atualização de conexão
    """
    try:
        payload = await request.json()
        
        event_type = payload.get("event")
        instance = payload.get("instance")
        
        logger.info(f"Evolution webhook received: {event_type} from {instance}")
        
        # Processar apenas eventos de mensagem
        if event_type == "messages.upsert":
            service = get_evolution_api_service(db)
            result = service.process_webhook_message(payload)
            
            return {
                "status": "processed",
                "event": event_type,
                "result": result
            }
        
        elif event_type == "messages.update":
            # Atualização de status (delivered, read, etc)
            return {
                "status": "acknowledged",
                "event": event_type
            }
        
        elif event_type == "connection.update":
            # Status de conexão
            state = payload.get("data", {}).get("state")
            logger.info(f"Evolution connection state: {state}")
            
            return {
                "status": "acknowledged",
                "event": event_type,
                "state": state
            }
        
        return {
            "status": "ignored",
            "event": event_type,
            "message": "Event type not handled"
        }
        
    except Exception as e:
        logger.error(f"Error processing Evolution webhook: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


@router.post("/webhook/{instance_name}")
async def evolution_webhook_instance(
    instance_name: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Endpoint para receber webhooks de instância específica
    """
    try:
        payload = await request.json()
        payload["instance"] = instance_name
        
        event_type = payload.get("event")
        
        logger.info(f"Evolution webhook received for instance {instance_name}: {event_type}")
        
        if event_type == "messages.upsert":
            service = get_evolution_api_service(db)
            result = service.process_webhook_message(payload)
            
            return {
                "status": "processed",
                "instance": instance_name,
                "event": event_type,
                "result": result
            }
        
        return {
            "status": "acknowledged",
            "instance": instance_name,
            "event": event_type
        }
        
    except Exception as e:
        logger.error(f"Error processing Evolution webhook for {instance_name}: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


@router.get("/status")
async def get_evolution_status(
    db: Session = Depends(get_db)
):
    """
    Verifica status da conexão com Evolution API
    """
    service = get_evolution_api_service(db)
    status = service.check_connection()
    
    return status


@router.post("/test-message")
async def test_message(
    phone: str,
    message: str = "Teste de integração Evolution API",
    db: Session = Depends(get_db)
):
    """
    Endpoint para testar envio de mensagem
    """
    service = get_evolution_api_service(db)
    result = service.send_text_message(phone, message)
    
    return result
