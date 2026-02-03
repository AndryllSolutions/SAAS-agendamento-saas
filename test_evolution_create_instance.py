#!/usr/bin/env python3
"""
Script para testar criação de instância WhatsApp no Evolution API
"""
import requests
import json

# Configurações
EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

def create_instance(instance_name: str):
    """Cria uma instância WhatsApp"""
    url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "instanceName": instance_name,
        "qrcode": True
    }
    
    print(f"🔄 Criando instância: {instance_name}")
    print(f"📡 URL: {url}")
    print(f"📦 Payload: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        print(f"\n✅ Status Code: {response.status_code}")
        print(f"📄 Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        return None

def get_qrcode(instance_name: str):
    """Obtém o QR Code da instância"""
    url = f"{EVOLUTION_API_URL}/instance/connect/{instance_name}"
    headers = {
        "apikey": API_KEY
    }
    
    print(f"\n🔄 Obtendo QR Code para: {instance_name}")
    print(f"📡 URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"\n✅ Status Code: {response.status_code}")
        result = response.json()
        print(f"📄 Response: {json.dumps(result, indent=2)}")
        
        if 'qrcode' in result:
            print(f"\n📱 QR Code disponível!")
            print(f"🔗 Base64: {result['qrcode']['base64'][:100]}...")
        
        return result
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        return None

def list_instances():
    """Lista todas as instâncias"""
    url = f"{EVOLUTION_API_URL}/instance/fetchInstances"
    headers = {
        "apikey": API_KEY
    }
    
    print(f"\n🔄 Listando instâncias...")
    print(f"📡 URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        print(f"\n✅ Status Code: {response.status_code}")
        result = response.json()
        print(f"📄 Response: {json.dumps(result, indent=2)}")
        return result
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 TESTE EVOLUTION API - CRIAR INSTÂNCIA WHATSAPP")
    print("=" * 60)
    
    # 1. Listar instâncias existentes
    print("\n📋 PASSO 1: Listar instâncias existentes")
    list_instances()
    
    # 2. Criar nova instância
    print("\n📋 PASSO 2: Criar nova instância")
    instance_name = "company_1_whatsapp"
    result = create_instance(instance_name)
    
    # 3. Obter QR Code
    if result and result.get('status') in [200, 201]:
        print("\n📋 PASSO 3: Obter QR Code")
        get_qrcode(instance_name)
    
    print("\n" + "=" * 60)
    print("✅ TESTE CONCLUÍDO")
    print("=" * 60)
