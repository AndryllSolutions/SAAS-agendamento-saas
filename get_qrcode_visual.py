#!/usr/bin/env python3
"""
Script para obter QR Code do WhatsApp e exibir visualmente
"""
import requests
import json
import base64
from PIL import Image
from io import BytesIO
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"
INSTANCE_NAME = "Atendo-chat-bot"

def connect_instance():
    """Conecta a instância e tenta obter QR Code"""
    url = f"{EVOLUTION_API_URL}/instance/connect/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Tentando conectar instância: {INSTANCE_NAME}")
    print(f"📡 URL: {url}\n")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"✅ Status Code: {response.status_code}")
        result = response.json()
        print(f"📄 Response: {json.dumps(result, indent=2)}\n")
        return result
    except Exception as e:
        print(f"❌ Erro: {e}\n")
        return None

def get_instance_status():
    """Verifica status da instância"""
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print(f"🔍 Verificando status da instância...")
    response = requests.get(url, headers=headers)
    result = response.json()
    print(f"Status: {json.dumps(result, indent=2)}\n")
    return result

def fetch_instances():
    """Lista todas as instâncias"""
    url = f"{EVOLUTION_API_URL}/instance/fetchInstances"
    headers = {"apikey": API_KEY}
    
    print(f"📋 Listando instâncias...")
    response = requests.get(url, headers=headers)
    instances = response.json()
    
    for inst in instances:
        print(f"\n📱 Instância: {inst.get('name')}")
        print(f"   Status: {inst.get('connectionStatus')}")
        print(f"   Owner: {inst.get('ownerJid', 'N/A')}")
        print(f"   Number: {inst.get('number', 'N/A')}")
    
    return instances

def display_qrcode_from_base64(base64_string):
    """Exibe QR Code a partir de base64"""
    try:
        # Remove prefixo se existir
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decodifica base64
        image_data = base64.b64decode(base64_string)
        
        # Cria imagem
        image = Image.open(BytesIO(image_data))
        
        # Salva arquivo
        filename = f"qrcode_{INSTANCE_NAME}.png"
        image.save(filename)
        print(f"💾 QR Code salvo em: {filename}")
        
        # Tenta abrir automaticamente
        try:
            image.show()
            print(f"📱 QR Code aberto automaticamente!")
        except:
            print(f"📱 Abra o arquivo manualmente: {filename}")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao processar QR Code: {e}")
        return False

def restart_instance():
    """Reinicia a instância"""
    url = f"{EVOLUTION_API_URL}/instance/restart/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Reiniciando instância...")
    response = requests.put(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.json()

def logout_instance():
    """Desconecta a instância"""
    url = f"{EVOLUTION_API_URL}/instance/logout/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    print(f"🔌 Desconectando instância...")
    response = requests.delete(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.json()

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 OBTER QR CODE DO WHATSAPP - EVOLUTION API")
    print("=" * 70)
    
    # Passo 1: Verificar status atual
    print("\n📋 PASSO 1: Verificar status atual")
    print("-" * 70)
    instances = fetch_instances()
    status = get_instance_status()
    
    # Verificar se já está conectado
    if status.get('instance', {}).get('state') == 'open':
        print("\n✅ INSTÂNCIA JÁ ESTÁ CONECTADA!")
        print("📱 WhatsApp já está vinculado a esta instância.")
        print("\nSe quiser reconectar:")
        print("1. Desconecte primeiro (logout)")
        print("2. Depois conecte novamente para obter novo QR Code")
        
        choice = input("\nDeseja desconectar e gerar novo QR Code? (s/n): ")
        if choice.lower() == 's':
            print("\n📋 PASSO 2: Desconectando...")
            print("-" * 70)
            logout_instance()
            time.sleep(3)
        else:
            print("\n✅ Mantendo conexão atual.")
            exit(0)
    
    # Passo 2: Tentar conectar e obter QR Code
    print("\n📋 PASSO 2: Conectar e obter QR Code")
    print("-" * 70)
    
    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        print(f"\n🔄 Tentativa {attempt}/{max_attempts}")
        
        result = connect_instance()
        
        if result:
            # Verificar se tem QR Code
            qr_found = False
            
            if 'qrcode' in result:
                if isinstance(result['qrcode'], dict) and 'base64' in result['qrcode']:
                    print("✅ QR Code encontrado!")
                    display_qrcode_from_base64(result['qrcode']['base64'])
                    qr_found = True
                elif isinstance(result['qrcode'], str):
                    print("✅ QR Code encontrado!")
                    display_qrcode_from_base64(result['qrcode'])
                    qr_found = True
            
            if 'base64' in result:
                print("✅ QR Code encontrado!")
                display_qrcode_from_base64(result['base64'])
                qr_found = True
            
            if qr_found:
                print("\n" + "=" * 70)
                print("🎉 SUCESSO! QR CODE OBTIDO!")
                print("=" * 70)
                print("\n📱 PRÓXIMOS PASSOS:")
                print("1. Abra o WhatsApp Business no seu celular")
                print("2. Vá em 'Dispositivos Conectados'")
                print("3. Toque em 'Conectar um dispositivo'")
                print("4. Escaneie o QR Code que foi aberto/salvo")
                print("5. Aguarde a conexão ser estabelecida")
                print("=" * 70)
                break
            
            # Se não encontrou QR Code mas não deu erro
            if not result.get('error'):
                print("⏳ Aguardando QR Code ser gerado...")
        
        if attempt < max_attempts:
            print(f"⏳ Aguardando 5 segundos antes da próxima tentativa...")
            time.sleep(5)
    else:
        print("\n" + "=" * 70)
        print("❌ NÃO FOI POSSÍVEL OBTER QR CODE")
        print("=" * 70)
        print("\n🔧 SOLUÇÕES ALTERNATIVAS:")
        print("\n1. USAR O MANAGER WEB:")
        print("   - Acesse: http://72.62.138.239:8080/manager")
        print("   - Clique na instância 'Atendo-chat-bot'")
        print("   - Procure por botão 'Connect' ou ícone de QR Code")
        print("\n2. VERIFICAR LOGS DO EVOLUTION API:")
        print("   ssh root@72.62.138.239")
        print("   cd /opt/evolution-api-v2")
        print("   docker compose logs evolution --tail 50")
        print("\n3. REINICIAR A INSTÂNCIA:")
        print("   - No Manager, clique em 'RESTART'")
        print("   - Ou execute este script novamente")
        print("=" * 70)
