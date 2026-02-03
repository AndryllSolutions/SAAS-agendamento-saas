#!/usr/bin/env python3
"""
Gera QR Code do WhatsApp como imagem PNG
"""
import requests
import base64
from PIL import Image
from io import BytesIO

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"
INSTANCE_NAME = "Atendo-chat-bot"

def get_and_save_qrcode():
    """Obtém QR Code e salva como imagem"""
    
    # Tentar conectar
    url = f"{EVOLUTION_API_URL}/instance/connect/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print("🔄 Obtendo QR Code...")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        result = response.json()
        
        # Extrair base64 do QR Code
        base64_data = None
        
        if 'qrcode' in result and isinstance(result['qrcode'], dict):
            base64_data = result['qrcode'].get('base64')
        elif 'qrcode' in result and isinstance(result['qrcode'], str):
            base64_data = result['qrcode']
        elif 'base64' in result:
            base64_data = result['base64']
        
        if base64_data:
            # Remove prefixo se existir
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
            
            # Decodifica e salva
            image_data = base64.b64decode(base64_data)
            image = Image.open(BytesIO(image_data))
            
            # Salvar como PNG
            filename = "QRCODE_WHATSAPP.png"
            image.save(filename)
            
            print(f"✅ QR Code salvo: {filename}")
            print(f"📱 Abra o arquivo e escaneie com WhatsApp!")
            
            # Tentar abrir automaticamente
            try:
                image.show()
            except:
                pass
            
            return True
        else:
            print(f"❌ QR Code não encontrado na resposta")
            print(f"Response: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    get_and_save_qrcode()
