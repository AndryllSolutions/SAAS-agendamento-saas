#!/usr/bin/env python3
"""
Força geração de QR Code e salva como imagem PNG
"""
import requests
import base64
from PIL import Image
from io import BytesIO
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"
INSTANCE_NAME = "Atendo-chat-bot"

def force_disconnect():
    """Força desconexão para poder gerar novo QR Code"""
    url = f"{EVOLUTION_API_URL}/instance/logout/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print("🔌 Desconectando instância (se estiver conectada)...")
    try:
        response = requests.delete(url, headers=headers)
        print(f"   Status: {response.status_code}")
    except:
        pass

def get_qrcode_with_retry():
    """Tenta obter QR Code com múltiplas tentativas"""
    url = f"{EVOLUTION_API_URL}/instance/connect/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print("\n🔄 Gerando QR Code...")
    print("=" * 70)
    
    max_attempts = 15
    
    for attempt in range(1, max_attempts + 1):
        print(f"\n📡 Tentativa {attempt}/{max_attempts}...")
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code != 200:
                print(f"   Status: {response.status_code}")
                time.sleep(3)
                continue
            
            result = response.json()
            
            # Procurar QR Code em diferentes formatos
            base64_data = None
            
            # Formato 1: result['qrcode']['base64']
            if 'qrcode' in result and isinstance(result['qrcode'], dict):
                if 'base64' in result['qrcode']:
                    base64_data = result['qrcode']['base64']
                    print("   ✅ QR Code encontrado (formato 1)")
            
            # Formato 2: result['qrcode'] (string direta)
            elif 'qrcode' in result and isinstance(result['qrcode'], str):
                base64_data = result['qrcode']
                print("   ✅ QR Code encontrado (formato 2)")
            
            # Formato 3: result['base64']
            elif 'base64' in result:
                base64_data = result['base64']
                print("   ✅ QR Code encontrado (formato 3)")
            
            # Formato 4: result['pairingCode'] (código de pareamento)
            elif 'pairingCode' in result:
                print(f"   📱 Código de pareamento: {result['pairingCode']}")
                print("   Use este código no WhatsApp em vez do QR Code")
            
            if base64_data:
                # Remove prefixo data:image se existir
                if ',' in base64_data:
                    base64_data = base64_data.split(',')[1]
                
                # Decodifica base64
                try:
                    image_data = base64.b64decode(base64_data)
                    image = Image.open(BytesIO(image_data))
                    
                    # Aumentar tamanho para facilitar escaneamento
                    width, height = image.size
                    new_size = (width * 3, height * 3)
                    image = image.resize(new_size, Image.Resampling.NEAREST)
                    
                    # Salvar
                    filename = "QRCODE_WHATSAPP_ATENDO.png"
                    image.save(filename)
                    
                    print("\n" + "=" * 70)
                    print("🎉 SUCESSO! QR CODE GERADO!")
                    print("=" * 70)
                    print(f"\n📱 Arquivo salvo: {filename}")
                    print(f"📏 Tamanho: {new_size[0]}x{new_size[1]} pixels")
                    print("\n📝 COMO USAR:")
                    print("1. Abra o arquivo: QRCODE_WHATSAPP_ATENDO.png")
                    print("2. Abra WhatsApp Business no celular")
                    print("3. Vá em 'Dispositivos Conectados'")
                    print("4. Toque em 'Conectar um dispositivo'")
                    print("5. Escaneie o QR Code da imagem")
                    print("6. Aguarde a conexão (pode levar alguns segundos)")
                    print("=" * 70)
                    
                    # Tentar abrir automaticamente
                    try:
                        import os
                        os.startfile(filename)
                        print("\n✅ Imagem aberta automaticamente!")
                    except:
                        print("\n📂 Abra o arquivo manualmente na pasta do projeto")
                    
                    return True
                    
                except Exception as e:
                    print(f"   ❌ Erro ao processar imagem: {e}")
            
            # Se não encontrou, verificar se tem erro
            if result.get('error'):
                print(f"   ⚠️ Erro na resposta: {result.get('message', 'Unknown')}")
            else:
                print(f"   ⏳ Aguardando QR Code ser gerado...")
            
        except Exception as e:
            print(f"   ❌ Erro na requisição: {e}")
        
        if attempt < max_attempts:
            print(f"   ⏳ Aguardando 4 segundos...")
            time.sleep(4)
    
    print("\n" + "=" * 70)
    print("❌ NÃO FOI POSSÍVEL GERAR QR CODE")
    print("=" * 70)
    print("\n🔧 ALTERNATIVA - USE O MANAGER:")
    print("1. Acesse: http://72.62.138.239:8080/manager")
    print("2. Clique na instância 'Atendo-chat-bot'")
    print("3. Clique no botão 'CONNECT' ou ícone de QR Code")
    print("4. O QR Code deve aparecer na tela do navegador")
    print("5. Tire um print da tela se necessário")
    print("=" * 70)
    
    return False

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 GERADOR DE QR CODE - WHATSAPP EVOLUTION API")
    print("=" * 70)
    
    # Passo 1: Garantir que está desconectado
    force_disconnect()
    time.sleep(2)
    
    # Passo 2: Gerar QR Code
    get_qrcode_with_retry()
