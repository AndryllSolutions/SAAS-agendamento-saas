"""
Evolution API WhatsApp Endpoints
Endpoints para integração com Evolution API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.security import get_current_active_user
from app.services.evolution_api import evolution_api_service
from app.models.user import User

router = APIRouter()


# ==================== SCHEMAS ====================

class InstanceCreate(BaseModel):
    instance_name: str = Field(..., description="Nome da instância")
    qrcode: bool = Field(True, description="Gerar QR Code")


class MessageText(BaseModel):
    number: str = Field(..., description="Número do destinatário")
    text: str = Field(..., description="Texto da mensagem")
    delay: int = Field(1200, description="Delay em ms")


class MessageMedia(BaseModel):
    number: str = Field(..., description="Número do destinatário")
    media_url: str = Field(..., description="URL da mídia")
    caption: Optional[str] = Field(None, description="Legenda")
    media_type: str = Field("image", description="Tipo de mídia")


class MessageButtons(BaseModel):
    number: str = Field(..., description="Número do destinatário")
    title: str = Field(..., description="Título")
    description: str = Field(..., description="Descrição")
    footer: str = Field(..., description="Rodapé")
    buttons: List[dict] = Field(..., description="Lista de botões")


class MessageList(BaseModel):
    number: str = Field(..., description="Número do destinatário")
    title: str = Field(..., description="Título")
    description: str = Field(..., description="Descrição")
    button_text: str = Field(..., description="Texto do botão")
    sections: List[dict] = Field(..., description="Seções da lista")


class GroupCreate(BaseModel):
    subject: str = Field(..., description="Nome do grupo")
    participants: List[str] = Field(..., description="Participantes")


class WebhookConfig(BaseModel):
    webhook_url: str = Field(..., description="URL do webhook")
    webhook_by_events: bool = Field(False, description="Webhook por eventos")
    events: Optional[List[str]] = Field(None, description="Lista de eventos")


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Nome do perfil")
    status: Optional[str] = Field(None, description="Status do perfil")


class NumberCheck(BaseModel):
    numbers: List[str] = Field(..., description="Lista de números")


# ==================== INSTANCE ENDPOINTS ====================

@router.post("/instance/create")
async def create_instance(
    data: InstanceCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Cria uma nova instância do WhatsApp"""
    try:
        result = await evolution_api_service.create_instance(
            instance_name=data.instance_name,
            qrcode=data.qrcode
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/instance/{instance_name}/status")
async def get_instance_status(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Obtém status de uma instância"""
    try:
        result = await evolution_api_service.get_instance(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/instance/{instance_name}/qrcode")
async def get_qrcode(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Obtém QR Code para conectar WhatsApp"""
    try:
        result = await evolution_api_service.get_qrcode(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/instance/{instance_name}")
async def delete_instance(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Deleta uma instância"""
    try:
        result = await evolution_api_service.delete_instance(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/instance/{instance_name}/logout")
async def logout_instance(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Faz logout de uma instância"""
    try:
        result = await evolution_api_service.logout_instance(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/instance/{instance_name}/restart")
async def restart_instance(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Reinicia uma instância"""
    try:
        result = await evolution_api_service.restart_instance(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== MESSAGE ENDPOINTS ====================

@router.post("/message/{instance_name}/text")
async def send_text_message(
    instance_name: str,
    data: MessageText,
    current_user: User = Depends(get_current_active_user)
):
    """Envia mensagem de texto"""
    try:
        result = await evolution_api_service.send_text(
            instance_name=instance_name,
            number=data.number,
            text=data.text,
            delay=data.delay
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/message/{instance_name}/media")
async def send_media_message(
    instance_name: str,
    data: MessageMedia,
    current_user: User = Depends(get_current_active_user)
):
    """Envia mensagem com mídia"""
    try:
        result = await evolution_api_service.send_media(
            instance_name=instance_name,
            number=data.number,
            media_url=data.media_url,
            caption=data.caption,
            media_type=data.media_type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/message/{instance_name}/buttons")
async def send_buttons_message(
    instance_name: str,
    data: MessageButtons,
    current_user: User = Depends(get_current_active_user)
):
    """Envia mensagem com botões"""
    try:
        result = await evolution_api_service.send_buttons(
            instance_name=instance_name,
            number=data.number,
            title=data.title,
            description=data.description,
            footer=data.footer,
            buttons=data.buttons
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/message/{instance_name}/list")
async def send_list_message(
    instance_name: str,
    data: MessageList,
    current_user: User = Depends(get_current_active_user)
):
    """Envia mensagem com lista"""
    try:
        result = await evolution_api_service.send_list(
            instance_name=instance_name,
            number=data.number,
            title=data.title,
            description=data.description,
            button_text=data.button_text,
            sections=data.sections
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== CONTACTS & CHATS ENDPOINTS ====================

@router.get("/chat/{instance_name}/contacts")
async def get_contacts(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lista todos os contatos"""
    try:
        result = await evolution_api_service.get_contacts(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/chat/{instance_name}/chats")
async def get_chats(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as conversas"""
    try:
        result = await evolution_api_service.get_chats(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/chat/{instance_name}/messages/{number}")
async def get_messages(
    instance_name: str,
    number: str,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user)
):
    """Obtém mensagens de uma conversa"""
    try:
        result = await evolution_api_service.get_messages(
            instance_name=instance_name,
            number=number,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== GROUP ENDPOINTS ====================

@router.post("/group/{instance_name}/create")
async def create_group(
    instance_name: str,
    data: GroupCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Cria um grupo"""
    try:
        result = await evolution_api_service.create_group(
            instance_name=instance_name,
            subject=data.subject,
            participants=data.participants
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/group/{instance_name}/list")
async def get_groups(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Lista todos os grupos"""
    try:
        result = await evolution_api_service.get_groups(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== WEBHOOK ENDPOINTS ====================

@router.post("/webhook/{instance_name}/set")
async def set_webhook(
    instance_name: str,
    data: WebhookConfig,
    current_user: User = Depends(get_current_active_user)
):
    """Configura webhook"""
    try:
        result = await evolution_api_service.set_webhook(
            instance_name=instance_name,
            webhook_url=data.webhook_url,
            webhook_by_events=data.webhook_by_events,
            events=data.events
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/webhook/{instance_name}")
async def get_webhook(
    instance_name: str,
    current_user: User = Depends(get_current_active_user)
):
    """Obtém configuração do webhook"""
    try:
        result = await evolution_api_service.get_webhook(instance_name)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ==================== UTILITY ENDPOINTS ====================

@router.post("/util/{instance_name}/check-numbers")
async def check_numbers(
    instance_name: str,
    data: NumberCheck,
    current_user: User = Depends(get_current_active_user)
):
    """Verifica se números estão no WhatsApp"""
    try:
        result = await evolution_api_service.check_number(
            instance_name=instance_name,
            numbers=data.numbers
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/profile/{instance_name}")
async def update_profile(
    instance_name: str,
    data: ProfileUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Atualiza perfil do WhatsApp"""
    try:
        results = {}
        if data.name:
            results['name'] = await evolution_api_service.update_profile_name(
                instance_name=instance_name,
                name=data.name
            )
        if data.status:
            results['status'] = await evolution_api_service.update_profile_status(
                instance_name=instance_name,
                status=data.status
            )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
