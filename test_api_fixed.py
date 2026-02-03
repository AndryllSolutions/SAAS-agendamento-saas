#!/usr/bin/env python3
"""
Testar se Evolution API está funcionando após patch do logger
"""
import requests
import json
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

print("=" * 70)
print("🧪 TESTANDO EVOLUTION API - APÓS PATCH DO LOGGER")
print("=" * 70)

# Aguardar um pouco para garantir que API inicializou
print("\n⏳ Aguardando API inicializar...")
time.sleep(5)

# Teste 1: Health Check
print("\n📡 Teste 1: API Health Check")
try:
    response = requests.get(EVOLUTION_API_URL, timeout=10)
    result = response.json()
    print(f"✅ Status: {response.status_code}")
    print(f"📄 Versão: {result.get('version', 'N/A')}")
    print(f"📄 Message: {result.get('message', 'N/A')}")
    
    if response.status_code == 200:
        print("\n🎉 API ESTÁ FUNCIONANDO!")
    else:
        print(f"\n⚠️ Status inesperado: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    print("\n⏳ API pode ainda estar inicializando. Aguarde mais alguns segundos.")
    exit(1)

# Teste 2: Tentar conectar instância existente
print("\n📡 Teste 2: Tentar obter QR Code")
instance_name = "Atendo-chat-bot"
url = f"{EVOLUTION_API_URL}/instance/connect/{instance_name}"
headers = {"apikey": API_KEY}

print(f"🔄 Conectando instância: {instance_name}")
try:
    response = requests.get(url, headers=headers, timeout=30)
    print(f"✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        
        # Verificar se tem QR Code
        if 'qrcode' in result or 'base64' in result:
            print("\n🎉 QR CODE GERADO COM SUCESSO!")
            print("📱 Acesse o Manager para visualizar o QR Code:")
            print(f"   http://72.62.138.239:8080/manager")
        else:
            print(f"\n📄 Response: {json.dumps(result, indent=2)}")
    else:
        print(f"⚠️ Status: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 70)
print("✅ TESTES CONCLUÍDOS")
print("=" * 70)
