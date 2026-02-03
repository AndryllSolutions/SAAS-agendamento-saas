"""
WhatsApp Integration Service
Handles real WhatsApp API integration
"""
import requests
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.config import settings


class WhatsAppService:
    """Service for WhatsApp API integration"""
    
    @staticmethod
    def _get_api_url() -> Optional[str]:
        """Get WhatsApp API URL from provider config or settings"""
        # Try to get from settings first
        if settings.WHATSAPP_API_URL:
            return settings.WHATSAPP_API_URL.rstrip('/')
        return None
    
    @staticmethod
    def _get_api_token() -> Optional[str]:
        """Get WhatsApp API token"""
        if settings.WHATSAPP_API_TOKEN:
            return settings.WHATSAPP_API_TOKEN
        return None
    
    @staticmethod
    def _get_phone_number() -> Optional[str]:
        """Get WhatsApp phone number"""
        if settings.WHATSAPP_PHONE_NUMBER:
            return settings.WHATSAPP_PHONE_NUMBER
        return None
    
    @staticmethod
    def send_message(
        phone_number: str,
        message: str,
        instance_id: Optional[str] = None,
        api_token: Optional[str] = None,
        api_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send WhatsApp message
        
        Args:
            phone_number: Recipient phone number (with country code, e.g., +5511999999999)
            message: Message text
            instance_id: WhatsApp instance ID (optional, uses default if not provided)
            api_token: API token (optional, uses settings if not provided)
            api_url: API URL (optional, uses settings if not provided)
        
        Returns:
            dict with 'success', 'message_id', 'status'
        """
        api_url = api_url or WhatsAppService._get_api_url()
        api_token = api_token or WhatsAppService._get_api_token()
        
        if not api_url or not api_token:
            raise ValueError("WhatsApp API não configurado. Configure WHATSAPP_API_URL e WHATSAPP_API_TOKEN")
        
        # Format phone number (remove spaces, dashes, etc.)
        phone_number = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
        
        # Common WhatsApp API endpoints (supports multiple providers)
        # Try different endpoint formats based on common WhatsApp API providers
        
        # Format 1: Evolution API / Baileys / WhatsApp Business API
        endpoint = f"{api_url}/message/sendText"
        
        headers = {
            "Content-Type": "application/json",
            "apikey": api_token
        }
        
        payload = {
            "number": phone_number,
            "text": message
        }
        
        if instance_id:
            payload["instance"] = instance_id
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("key", {}).get("id") or data.get("id"),
                    "status": "sent",
                    "response": data
                }
            else:
                # Try alternative endpoint format
                endpoint_alt = f"{api_url}/send-message"
                response_alt = requests.post(
                    endpoint_alt,
                    json={
                        "phone": phone_number,
                        "message": message
                    },
                    headers={
                        "Authorization": f"Bearer {api_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=30
                )
                
                if response_alt.status_code == 200:
                    data = response_alt.json()
                    return {
                        "success": True,
                        "message_id": data.get("message_id") or data.get("id"),
                        "status": "sent",
                        "response": data
                    }
                else:
                    return {
                        "success": False,
                        "status": "failed",
                        "error": f"HTTP {response.status_code}: {response.text}",
                        "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else None
                    }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def send_template_message(
        phone_number: str,
        template_name: str,
        template_variables: Dict[str, str],
        instance_id: Optional[str] = None,
        api_token: Optional[str] = None,
        api_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send WhatsApp template message
        
        Args:
            phone_number: Recipient phone number
            template_name: Template name (must be approved by WhatsApp)
            template_variables: Variables to replace in template
            instance_id: WhatsApp instance ID
            api_token: API token
            api_url: API URL
        
        Returns:
            dict with 'success', 'message_id', 'status'
        """
        api_url = api_url or WhatsAppService._get_api_url()
        api_token = api_token or WhatsAppService._get_api_token()
        
        if not api_url or not api_token:
            raise ValueError("WhatsApp API não configurado")
        
        phone_number = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
        
        endpoint = f"{api_url}/message/sendTemplate"
        
        headers = {
            "Content-Type": "application/json",
            "apikey": api_token
        }
        
        payload = {
            "number": phone_number,
            "template": template_name,
            "variables": template_variables
        }
        
        if instance_id:
            payload["instance"] = instance_id
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("key", {}).get("id") or data.get("id"),
                    "status": "sent",
                    "response": data
                }
            else:
                return {
                    "success": False,
                    "status": "failed",
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def check_connection(
        instance_id: Optional[str] = None,
        api_token: Optional[str] = None,
        api_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Check WhatsApp API connection
        
        Returns:
            dict with 'connected', 'status', 'qr_code' (if needed)
        """
        api_url = api_url or WhatsAppService._get_api_url()
        api_token = api_token or WhatsAppService._get_api_token()
        
        if not api_url or not api_token:
            return {
                "connected": False,
                "status": "not_configured",
                "message": "WhatsApp API não configurado"
            }
        
        # Try to get connection status
        endpoint = f"{api_url}/instance/connectionState"
        
        headers = {
            "apikey": api_token
        }
        
        if instance_id:
            endpoint = f"{api_url}/instance/connectionState/{instance_id}"
        
        try:
            response = requests.get(
                endpoint,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                state = data.get("state", "unknown")
                
                return {
                    "connected": state == "open",
                    "status": state,
                    "message": f"Status: {state}",
                    "response": data
                }
            else:
                return {
                    "connected": False,
                    "status": "error",
                    "message": f"Erro ao verificar conexão: HTTP {response.status_code}"
                }
        except requests.exceptions.RequestException as e:
            return {
                "connected": False,
                "status": "error",
                "message": f"Erro de conexão: {str(e)}"
            }

