#!/usr/bin/env python3
"""
Testar envio de mensagem WhatsApp via Evolution API
"""
import requests
import json

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"
INSTANCE_NAME = "Atendo-chat-bot"

print("=" * 70)
print("🚀 TESTE DE ENVIO DE MENSAGEM WHATSAPP")
print("=" * 70)

# Passo 1: Verificar detalhes da instância
print("\n📋 PASSO 1: Verificar detalhes da instância")
print("-" * 70)

url = f"{EVOLUTION_API_URL}/instance/fetchInstances"
headers = {"apikey": API_KEY}

response = requests.get(url, headers=headers)
instances = response.json()

for inst in instances:
    if inst.get('name') == INSTANCE_NAME:
        print(f"✅ Instância encontrada: {INSTANCE_NAME}")
        print(f"📱 Status: {inst.get('connectionStatus')}")
        print(f"📱 Número: {inst.get('number', 'N/A')}")
        print(f"📱 Owner JID: {inst.get('ownerJid', 'N/A')}")
        print(f"📱 Profile: {inst.get('profileName', 'N/A')}")
        print(f"📊 Contatos: {inst.get('_count', {}).get('Contact', 0)}")
        print(f"📊 Chats: {inst.get('_count', {}).get('Chat', 0)}")
        print(f"📊 Mensagens: {inst.get('_count', {}).get('Message', 0)}")
        
        if inst.get('connectionStatus') != 'open':
            print(f"\n⚠️ Instância não está conectada!")
            print(f"Status atual: {inst.get('connectionStatus')}")
            exit(1)
        
        break
else:
    print(f"❌ Instância {INSTANCE_NAME} não encontrada")
    exit(1)

# Passo 2: Solicitar número para teste
print("\n📋 PASSO 2: Enviar mensagem de teste")
print("-" * 70)

# IMPORTANTE: Substitua pelo seu número com DDI+DDD (ex: 5511999999999)
test_number = input("\n📱 Digite o número para teste (com DDI+DDD, ex: 5511999999999): ").strip()

if not test_number:
    print("❌ Número não fornecido. Teste cancelado.")
    exit(1)

# Enviar mensagem
url = f"{EVOLUTION_API_URL}/message/sendText/{INSTANCE_NAME}"
headers = {"apikey": API_KEY, "Content-Type": "application/json"}
data = {
    "number": test_number,
    "text": "🎉 *Teste do Sistema Atendo SaaS*\n\nSistema de notificações WhatsApp funcionando!\n\n✅ Evolution API conectada\n✅ Multi-tenant configurado\n✅ Pronto para enviar notificações de agendamento"
}

print(f"\n🔄 Enviando mensagem para: {test_number}")
print(f"📝 Texto: {data['text'][:50]}...")

try:
    response = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"\n✅ Status: {response.status_code}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"📄 Response: {json.dumps(result, indent=2)}")
        print("\n🎉 MENSAGEM ENVIADA COM SUCESSO!")
        print("📱 Verifique o WhatsApp do número de teste")
    else:
        print(f"⚠️ Erro ao enviar mensagem")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 70)
print("✅ TESTE CONCLUÍDO")
print("=" * 70)
print("\n📝 PRÓXIMOS PASSOS:")
print("1. Verificar se a mensagem chegou no WhatsApp")
print("2. Integrar com o sistema de agendamentos do SaaS")
print("3. Configurar notificações automáticas")
print("=" * 70)
