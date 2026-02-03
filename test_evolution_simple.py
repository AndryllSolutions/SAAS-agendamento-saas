#!/usr/bin/env python3
"""
Script para testar criação de instância WhatsApp - Versão Simplificada
"""
import requests
import json

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

# Teste 1: Criar instância sem integration
print("=" * 60)
print("TESTE 1: Criar instância SEM integration")
print("=" * 60)

url = f"{EVOLUTION_API_URL}/instance/create"
headers = {"apikey": API_KEY, "Content-Type": "application/json"}
data = {"instanceName": "test_instance_1"}

print(f"Payload: {json.dumps(data, indent=2)}")
response = requests.post(url, headers=headers, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}\n")

# Teste 2: Criar instância com integration vazio
print("=" * 60)
print("TESTE 2: Criar instância COM integration vazio")
print("=" * 60)

data = {
    "instanceName": "test_instance_2",
    "integration": "WHATSAPP-BAILEYS"
}

print(f"Payload: {json.dumps(data, indent=2)}")
response = requests.post(url, headers=headers, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}\n")

# Teste 3: Criar instância com todos os campos
print("=" * 60)
print("TESTE 3: Criar instância COMPLETA")
print("=" * 60)

data = {
    "instanceName": "company_1_whatsapp",
    "integration": "WHATSAPP-BAILEYS",
    "qrcode": True,
    "number": ""
}

print(f"Payload: {json.dumps(data, indent=2)}")
response = requests.post(url, headers=headers, json=data)
print(f"Status: {response.status_code}")
result = response.json()
print(f"Response: {json.dumps(result, indent=2)}\n")

# Se criou com sucesso, obter QR Code
if response.status_code in [200, 201]:
    print("=" * 60)
    print("✅ INSTÂNCIA CRIADA! Obtendo QR Code...")
    print("=" * 60)
    
    qr_url = f"{EVOLUTION_API_URL}/instance/connect/company_1_whatsapp"
    qr_response = requests.get(qr_url, headers={"apikey": API_KEY})
    print(f"Status: {qr_response.status_code}")
    qr_result = qr_response.json()
    
    if 'qrcode' in qr_result:
        print(f"\n📱 QR Code Base64: {qr_result['qrcode']['base64'][:100]}...")
        print(f"📱 QR Code Code: {qr_result['qrcode'].get('code', 'N/A')}")
    else:
        print(f"Response: {json.dumps(qr_result, indent=2)}")

print("\n" + "=" * 60)
print("TESTES CONCLUÍDOS")
print("=" * 60)
