"""
Evolution API Integration Service
Serviço para integração com Evolution API para WhatsApp
"""
import httpx
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)


class EvolutionAPIService:
    """Serviço de integração com Evolution API"""
    
    def __init__(self):
        self.base_url = getattr(settings, 'EVOLUTION_API_URL', 'http://localhost:8080')
        self.api_key = getattr(settings, 'EVOLUTION_API_KEY', 'evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7')
        self.headers = {
            'apikey': self.api_key,
            'Content-Type': 'application/json'
        }
        self.timeout = 30.0
    
    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Faz requisição para Evolution API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    params=params
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Evolution API request failed: {e}")
            raise Exception(f"Erro ao comunicar com Evolution API: {str(e)}")
    
    # ==================== INSTANCE MANAGEMENT ====================
    
    async def create_instance(self, instance_name: str, qrcode: bool = True) -> Dict[str, Any]:
        """Cria uma nova instância do WhatsApp"""
        data = {
            "instanceName": instance_name,
            "qrcode": qrcode,
            "integration": "WHATSAPP-BAILEYS"
        }
        return await self._request('POST', '/instance/create', data)
    
    async def get_instance(self, instance_name: str) -> Dict[str, Any]:
        """Obtém informações de uma instância"""
        return await self._request('GET', f'/instance/connectionState/{instance_name}')
    
    async def delete_instance(self, instance_name: str) -> Dict[str, Any]:
        """Deleta uma instância"""
        return await self._request('DELETE', f'/instance/delete/{instance_name}')
    
    async def logout_instance(self, instance_name: str) -> Dict[str, Any]:
        """Faz logout de uma instância"""
        return await self._request('DELETE', f'/instance/logout/{instance_name}')
    
    async def restart_instance(self, instance_name: str) -> Dict[str, Any]:
        """Reinicia uma instância"""
        return await self._request('PUT', f'/instance/restart/{instance_name}')
    
    async def get_qrcode(self, instance_name: str) -> Dict[str, Any]:
        """Obtém QR Code para conectar WhatsApp"""
        return await self._request('GET', f'/instance/connect/{instance_name}')
    
    # ==================== MESSAGE SENDING ====================
    
    async def send_text(
        self, 
        instance_name: str, 
        number: str, 
        text: str,
        delay: int = 1200
    ) -> Dict[str, Any]:
        """Envia mensagem de texto"""
        data = {
            "number": number,
            "text": text,
            "delay": delay
        }
        return await self._request('POST', f'/message/sendText/{instance_name}', data)
    
    async def send_media(
        self,
        instance_name: str,
        number: str,
        media_url: str,
        caption: Optional[str] = None,
        media_type: str = 'image'
    ) -> Dict[str, Any]:
        """Envia mídia (imagem, vídeo, documento)"""
        data = {
            "number": number,
            "mediatype": media_type,
            "media": media_url
        }
        if caption:
            data["caption"] = caption
        
        return await self._request('POST', f'/message/sendMedia/{instance_name}', data)
    
    async def send_buttons(
        self,
        instance_name: str,
        number: str,
        title: str,
        description: str,
        footer: str,
        buttons: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Envia mensagem com botões"""
        data = {
            "number": number,
            "title": title,
            "description": description,
            "footer": footer,
            "buttons": buttons
        }
        return await self._request('POST', f'/message/sendButtons/{instance_name}', data)
    
    async def send_list(
        self,
        instance_name: str,
        number: str,
        title: str,
        description: str,
        button_text: str,
        sections: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Envia mensagem com lista de opções"""
        data = {
            "number": number,
            "title": title,
            "description": description,
            "buttonText": button_text,
            "sections": sections
        }
        return await self._request('POST', f'/message/sendList/{instance_name}', data)
    
    # ==================== CONTACTS & CHATS ====================
    
    async def get_contacts(self, instance_name: str) -> List[Dict[str, Any]]:
        """Lista todos os contatos"""
        result = await self._request('GET', f'/chat/findContacts/{instance_name}')
        return result if isinstance(result, list) else []
    
    async def get_chats(self, instance_name: str) -> List[Dict[str, Any]]:
        """Lista todas as conversas"""
        result = await self._request('GET', f'/chat/findChats/{instance_name}')
        return result if isinstance(result, list) else []
    
    async def get_messages(
        self, 
        instance_name: str, 
        number: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Obtém mensagens de uma conversa"""
        params = {"limit": limit}
        result = await self._request(
            'GET', 
            f'/chat/findMessages/{instance_name}',
            params={**params, "number": number}
        )
        return result if isinstance(result, list) else []
    
    # ==================== GROUPS ====================
    
    async def create_group(
        self,
        instance_name: str,
        subject: str,
        participants: List[str]
    ) -> Dict[str, Any]:
        """Cria um grupo"""
        data = {
            "subject": subject,
            "participants": participants
        }
        return await self._request('POST', f'/group/create/{instance_name}', data)
    
    async def get_groups(self, instance_name: str) -> List[Dict[str, Any]]:
        """Lista todos os grupos"""
        result = await self._request('GET', f'/group/findGroups/{instance_name}')
        return result if isinstance(result, list) else []
    
    async def add_participant(
        self,
        instance_name: str,
        group_id: str,
        participants: List[str]
    ) -> Dict[str, Any]:
        """Adiciona participantes ao grupo"""
        data = {
            "groupJid": group_id,
            "participants": participants
        }
        return await self._request('POST', f'/group/updateParticipant/{instance_name}', data)
    
    # ==================== WEBHOOKS ====================
    
    async def set_webhook(
        self,
        instance_name: str,
        webhook_url: str,
        webhook_by_events: bool = False,
        events: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Configura webhook para receber eventos"""
        data = {
            "url": webhook_url,
            "webhook_by_events": webhook_by_events
        }
        if events:
            data["events"] = events
        
        return await self._request('POST', f'/webhook/set/{instance_name}', data)
    
    async def get_webhook(self, instance_name: str) -> Dict[str, Any]:
        """Obtém configuração do webhook"""
        return await self._request('GET', f'/webhook/find/{instance_name}')
    
    # ==================== PROFILE ====================
    
    async def update_profile_name(
        self,
        instance_name: str,
        name: str
    ) -> Dict[str, Any]:
        """Atualiza nome do perfil"""
        data = {"name": name}
        return await self._request('POST', f'/chat/updateProfileName/{instance_name}', data)
    
    async def update_profile_status(
        self,
        instance_name: str,
        status: str
    ) -> Dict[str, Any]:
        """Atualiza status do perfil"""
        data = {"status": status}
        return await self._request('POST', f'/chat/updateProfileStatus/{instance_name}', data)
    
    async def get_profile_picture(
        self,
        instance_name: str,
        number: str
    ) -> Dict[str, Any]:
        """Obtém foto de perfil de um contato"""
        return await self._request('GET', f'/chat/getProfilePicUrl/{instance_name}', params={"number": number})
    
    # ==================== UTILITIES ====================
    
    async def check_number(
        self,
        instance_name: str,
        numbers: List[str]
    ) -> List[Dict[str, Any]]:
        """Verifica se números estão no WhatsApp"""
        data = {"numbers": numbers}
        result = await self._request('POST', f'/chat/whatsappNumbers/{instance_name}', data)
        return result if isinstance(result, list) else []
    
    async def mark_as_read(
        self,
        instance_name: str,
        number: str
    ) -> Dict[str, Any]:
        """Marca mensagens como lidas"""
        data = {
            "readMessages": [{
                "remoteJid": number,
                "fromMe": False
            }]
        }
        return await self._request('POST', f'/chat/markMessageAsRead/{instance_name}', data)
    
    async def get_presence(
        self,
        instance_name: str,
        number: str
    ) -> Dict[str, Any]:
        """Obtém presença (online/offline) de um contato"""
        return await self._request('GET', f'/chat/presence/{instance_name}', params={"number": number})


# Singleton instance
evolution_api_service = EvolutionAPIService()
