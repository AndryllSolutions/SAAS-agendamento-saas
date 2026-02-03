"""
Appointment WhatsApp Integration Endpoints
Endpoints para integração de agendamentos com WhatsApp
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.appointment import Appointment
from app.models.service import Service
from app.services.whatsapp_appointment_notifications import whatsapp_appointment_service

router = APIRouter()


# ==================== SCHEMAS ====================

class SendConfirmationRequest(BaseModel):
    appointment_id: int


class SendReminderRequest(BaseModel):
    appointment_id: int
    hours_before: int = 24


class SendServiceListRequest(BaseModel):
    client_phone: str


class TestNotificationRequest(BaseModel):
    phone: str
    message: str


# ==================== ENDPOINTS ====================

@router.post("/send-confirmation/{appointment_id}")
async def send_appointment_confirmation(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Envia solicitação de confirmação de agendamento via WhatsApp
    com botões interativos (Confirmar, Reagendar, Cancelar)
    """
    # Buscar agendamento
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Enviar confirmação em background
    try:
        result = await whatsapp_appointment_service.send_appointment_confirmation_request(
            db=db,
            appointment=appointment
        )
        
        if not result.get('success'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Erro ao enviar confirmação')
            )
        
        return {
            "message": "Confirmação enviada com sucesso",
            "appointment_id": appointment_id,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/send-reminder/{appointment_id}")
async def send_appointment_reminder(
    appointment_id: int,
    hours_before: int = 24,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Envia lembrete de agendamento via WhatsApp
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    try:
        result = await whatsapp_appointment_service.send_appointment_reminder(
            db=db,
            appointment=appointment,
            hours_before=hours_before
        )
        
        if not result.get('success'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Erro ao enviar lembrete')
            )
        
        return {
            "message": "Lembrete enviado com sucesso",
            "appointment_id": appointment_id,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/send-service-list")
async def send_service_list(
    client_phone: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Envia lista de serviços disponíveis para o cliente via WhatsApp
    """
    # Buscar serviços ativos da empresa
    services = db.query(Service).filter(
        Service.company_id == current_user.company_id,
        Service.is_active == True
    ).all()
    
    if not services:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum serviço disponível"
        )
    
    try:
        result = await whatsapp_appointment_service.send_service_selection(
            db=db,
            client_phone=client_phone,
            available_services=services
        )
        
        if not result.get('success'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Erro ao enviar lista de serviços')
            )
        
        return {
            "message": "Lista de serviços enviada com sucesso",
            "services_count": len(services),
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/notify-created/{appointment_id}")
async def notify_appointment_created(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Notifica cliente sobre novo agendamento criado
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id
    ).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    try:
        result = await whatsapp_appointment_service.send_appointment_created(
            db=db,
            appointment=appointment
        )
        
        if not result.get('success'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Erro ao enviar notificação')
            )
        
        return {
            "message": "Notificação enviada com sucesso",
            "appointment_id": appointment_id,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/batch-send-reminders")
async def batch_send_reminders(
    hours_before: int = 24,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Envia lembretes em lote para todos os agendamentos
    que acontecerão nas próximas X horas
    """
    from datetime import datetime, timedelta
    
    # Calcular janela de tempo
    now = datetime.now()
    target_time = now + timedelta(hours=hours_before)
    
    # Buscar agendamentos na janela
    appointments = db.query(Appointment).filter(
        Appointment.company_id == current_user.company_id,
        Appointment.start_time >= now,
        Appointment.start_time <= target_time,
        Appointment.status.in_(['scheduled', 'confirmed'])
    ).all()
    
    results = {
        "total": len(appointments),
        "sent": 0,
        "failed": 0,
        "errors": []
    }
    
    for appointment in appointments:
        try:
            result = await whatsapp_appointment_service.send_appointment_reminder(
                db=db,
                appointment=appointment,
                hours_before=hours_before
            )
            
            if result.get('success'):
                results["sent"] += 1
            else:
                results["failed"] += 1
                results["errors"].append({
                    "appointment_id": appointment.id,
                    "error": result.get('error')
                })
                
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({
                "appointment_id": appointment.id,
                "error": str(e)
            })
    
    return results


@router.get("/webhook-status")
async def get_webhook_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Verifica status da configuração do webhook
    """
    try:
        from app.services.evolution_api import evolution_api_service
        from app.core.config import settings
        
        instance_name = getattr(settings, 'EVOLUTION_INSTANCE_NAME', 'atendo_whatsapp')
        
        result = await evolution_api_service.get_webhook(instance_name)
        
        return {
            "instance": instance_name,
            "webhook_config": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/configure-webhook")
async def configure_webhook(
    current_user: User = Depends(get_current_active_user)
):
    """
    Configura webhook para receber eventos do WhatsApp
    """
    try:
        from app.services.evolution_api import evolution_api_service
        from app.core.config import settings
        
        instance_name = getattr(settings, 'EVOLUTION_INSTANCE_NAME', 'atendo_whatsapp')
        webhook_url = f"{settings.API_URL}/api/v1/whatsapp-webhook/webhook"
        
        # Eventos que queremos receber
        events = [
            'messages.upsert',
            'messages.update',
            'send.message',
            'connection.update'
        ]
        
        result = await evolution_api_service.set_webhook(
            instance_name=instance_name,
            webhook_url=webhook_url,
            webhook_by_events=True,
            events=events
        )
        
        return {
            "message": "Webhook configurado com sucesso",
            "webhook_url": webhook_url,
            "events": events,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
