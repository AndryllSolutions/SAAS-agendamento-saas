#!/usr/bin/env python3
"""
Script final para criar instância WhatsApp e obter QR Code
"""
import requests
import json
import base64
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

def create_instance(instance_name: str):
    """Cria uma instância WhatsApp"""
    url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {"apikey": API_KEY, "Content-Type": "application/json"}
    data = {
        "instanceName": instance_name,
        "integration": "WHATSAPP-BAILEYS"
    }
    
    print(f"🔄 Criando instância: {instance_name}")
    response = requests.post(url, headers=headers, json=data)
    print(f"✅ Status: {response.status_code}")
    result = response.json()
    print(f"📄 Response: {json.dumps(result, indent=2)}\n")
    return result

def connect_instance(instance_name: str):
    """Conecta a instância e obtém QR Code"""
    url = f"{EVOLUTION_API_URL}/instance/connect/{instance_name}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Conectando instância: {instance_name}")
    response = requests.get(url, headers=headers)
    print(f"✅ Status: {response.status_code}")
    result = response.json()
    print(f"📄 Response: {json.dumps(result, indent=2)}\n")
    return result

def get_instance_status(instance_name: str):
    """Obtém status da instância"""
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{instance_name}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Verificando status: {instance_name}")
    response = requests.get(url, headers=headers)
    print(f"✅ Status: {response.status_code}")
    result = response.json()
    print(f"📄 Response: {json.dumps(result, indent=2)}\n")
    return result

def save_qrcode_image(base64_data: str, filename: str):
    """Salva QR Code como imagem"""
    try:
        # Remove o prefixo data:image/png;base64, se existir
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        image_data = base64.b64decode(base64_data)
        with open(filename, 'wb') as f:
            f.write(image_data)
        print(f"💾 QR Code salvo em: {filename}")
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar QR Code: {e}")
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 EVOLUTION API - CRIAR INSTÂNCIA WHATSAPP E OBTER QR CODE")
    print("=" * 70)
    
    instance_name = "company_1_whatsapp"
    
    # Passo 1: Criar instância
    print("\n📋 PASSO 1: Criar instância")
    print("-" * 70)
    create_result = create_instance(instance_name)
    
    if create_result.get('instance'):
        instance_id = create_result['instance'].get('instanceId')
        print(f"✅ Instância criada com sucesso!")
        print(f"📱 Instance ID: {instance_id}")
        print(f"📱 Instance Name: {instance_name}")
        
        # Aguardar um pouco
        print("\n⏳ Aguardando 3 segundos...")
        time.sleep(3)
        
        # Passo 2: Conectar e obter QR Code
        print("\n📋 PASSO 2: Conectar instância e obter QR Code")
        print("-" * 70)
        connect_result = connect_instance(instance_name)
        
        if 'qrcode' in connect_result:
            qrcode_data = connect_result['qrcode']
            print(f"\n🎉 QR CODE OBTIDO COM SUCESSO!")
            print(f"📱 Code: {qrcode_data.get('code', 'N/A')}")
            
            if 'base64' in qrcode_data:
                base64_preview = qrcode_data['base64'][:100]
                print(f"📱 Base64 (preview): {base64_preview}...")
                
                # Salvar QR Code como imagem
                filename = f"qrcode_{instance_name}.png"
                save_qrcode_image(qrcode_data['base64'], filename)
                print(f"\n📸 Escaneie o QR Code com seu WhatsApp Business!")
                print(f"📸 Arquivo: {filename}")
        
        # Passo 3: Verificar status
        print("\n📋 PASSO 3: Verificar status da instância")
        print("-" * 70)
        get_instance_status(instance_name)
        
    else:
        print(f"❌ Erro ao criar instância")
    
    print("\n" + "=" * 70)
    print("✅ PROCESSO CONCLUÍDO")
    print("=" * 70)
    print("\n📝 PRÓXIMOS PASSOS:")
    print("1. Abra o WhatsApp Business no seu celular")
    print("2. Vá em 'Dispositivos Conectados'")
    print("3. Escaneie o QR Code gerado")
    print("4. Aguarde a conexão ser estabelecida")
    print("=" * 70)
