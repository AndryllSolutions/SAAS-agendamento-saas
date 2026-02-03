#!/usr/bin/env python3
"""
Verifica status da conexão WhatsApp
"""
import requests
import json

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"
INSTANCE_NAME = "Atendo-chat-bot"

def check_status():
    """Verifica status completo da instância"""
    
    # 1. Status de conexão
    print("=" * 70)
    print("📊 STATUS DA INSTÂNCIA WHATSAPP")
    print("=" * 70)
    
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{INSTANCE_NAME}"
    headers = {"apikey": API_KEY}
    
    response = requests.get(url, headers=headers)
    status = response.json()
    
    state = status.get('instance', {}).get('state', 'unknown')
    
    print(f"\n📱 Instância: {INSTANCE_NAME}")
    print(f"🔌 Estado: {state}")
    
    if state == 'open':
        print("✅ STATUS: CONECTADO E FUNCIONANDO!")
        print("\n🎉 WhatsApp está vinculado e pronto para uso!")
        
        # Buscar detalhes
        url2 = f"{EVOLUTION_API_URL}/instance/fetchInstances"
        response2 = requests.get(url2, headers=headers)
        instances = response2.json()
        
        for inst in instances:
            if inst.get('name') == INSTANCE_NAME:
                print(f"\n📋 DETALHES:")
                print(f"   Número: {inst.get('number', 'N/A')}")
                print(f"   Owner JID: {inst.get('ownerJid', 'N/A')}")
                print(f"   Profile: {inst.get('profileName', 'N/A')}")
                print(f"   Contatos: {inst.get('_count', {}).get('Contact', 0)}")
                print(f"   Chats: {inst.get('_count', {}).get('Chat', 0)}")
                print(f"   Mensagens: {inst.get('_count', {}).get('Message', 0)}")
        
        print("\n" + "=" * 70)
        print("✅ SISTEMA PRONTO PARA ENVIAR MENSAGENS!")
        print("=" * 70)
        
        return True
        
    elif state == 'close':
        print("❌ STATUS: DESCONECTADO")
        print("\n⚠️ Você precisa escanear o QR Code primeiro!")
        print("\n📝 COMO OBTER QR CODE:")
        print("1. Acesse: http://72.62.138.239:8080/manager")
        print("2. Clique na instância 'Atendo-chat-bot'")
        print("3. Procure por botão 'Connect' ou ícone de QR Code")
        print("4. Escaneie com WhatsApp Business")
        
        return False
    else:
        print(f"⚠️ STATUS: {state}")
        print(json.dumps(status, indent=2))
        return False

if __name__ == "__main__":
    check_status()
