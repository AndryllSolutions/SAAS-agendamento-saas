#!/usr/bin/env python3
"""
Obter QR Code diretamente da instância criada
"""
import requests
import json
import base64
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

def list_instances():
    """Lista instâncias"""
    url = f"{EVOLUTION_API_URL}/instance/fetchInstances"
    headers = {"apikey": API_KEY}
    response = requests.get(url, headers=headers)
    print(f"📋 Instâncias: {json.dumps(response.json(), indent=2)}\n")
    return response.json()

def delete_instance(instance_name: str):
    """Deleta instância"""
    url = f"{EVOLUTION_API_URL}/instance/delete/{instance_name}"
    headers = {"apikey": API_KEY}
    response = requests.delete(url, headers=headers)
    print(f"🗑️ Deletar {instance_name}: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    return response.json()

def create_instance_with_qrcode(instance_name: str):
    """Cria instância e solicita QR Code"""
    url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {"apikey": API_KEY, "Content-Type": "application/json"}
    data = {
        "instanceName": instance_name,
        "integration": "WHATSAPP-BAILEYS",
        "qrcode": True  # Solicitar QR Code na criação
    }
    
    print(f"🔄 Criando instância com QR Code: {instance_name}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}\n")
    return result

def get_qrcode_base64(instance_name: str):
    """Obtém QR Code em base64"""
    url = f"{EVOLUTION_API_URL}/instance/qrcode/{instance_name}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Obtendo QR Code: {instance_name}")
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}\n")
    return result

def save_qrcode(base64_data: str, filename: str):
    """Salva QR Code como imagem"""
    try:
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        image_data = base64.b64decode(base64_data)
        with open(filename, 'wb') as f:
            f.write(image_data)
        print(f"💾 QR Code salvo: {filename}\n")
        return True
    except Exception as e:
        print(f"❌ Erro: {e}\n")
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 EVOLUTION API - OBTER QR CODE")
    print("=" * 70)
    
    instance_name = "company_1_whatsapp"
    
    # Listar instâncias existentes
    print("\n📋 PASSO 1: Listar instâncias existentes")
    print("-" * 70)
    instances = list_instances()
    
    # Deletar instância se já existir
    if any(inst.get('instance', {}).get('instanceName') == instance_name for inst in instances):
        print(f"\n🗑️ PASSO 2: Deletar instância existente")
        print("-" * 70)
        delete_instance(instance_name)
        time.sleep(2)
    
    # Criar nova instância
    print(f"\n📋 PASSO 3: Criar nova instância")
    print("-" * 70)
    result = create_instance_with_qrcode(instance_name)
    
    # Aguardar processamento
    print("⏳ Aguardando 5 segundos...")
    time.sleep(5)
    
    # Tentar obter QR Code
    print(f"\n📋 PASSO 4: Obter QR Code")
    print("-" * 70)
    qr_result = get_qrcode_base64(instance_name)
    
    if 'base64' in qr_result:
        filename = f"qrcode_{instance_name}.png"
        save_qrcode(qr_result['base64'], filename)
        print(f"✅ QR Code obtido com sucesso!")
        print(f"📸 Arquivo: {filename}")
    elif 'qrcode' in qr_result and 'base64' in qr_result['qrcode']:
        filename = f"qrcode_{instance_name}.png"
        save_qrcode(qr_result['qrcode']['base64'], filename)
        print(f"✅ QR Code obtido com sucesso!")
        print(f"📸 Arquivo: {filename}")
    
    print("\n" + "=" * 70)
    print("✅ PROCESSO CONCLUÍDO")
    print("=" * 70)
