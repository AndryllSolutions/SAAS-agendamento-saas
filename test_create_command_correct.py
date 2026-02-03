#!/usr/bin/env python3
"""
Teste de criação de comanda com schema correto
Baseado nos schemas CommandCreatePublic e CommandItemCreate
"""

import requests
import json
from datetime import datetime
from decimal import Decimal

# Configuração
BASE_URL = "https://atendo.website/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
COMMANDS_URL = f"{BASE_URL}/commands"

# Credenciais
EMAIL = "andrekaidellisola@gmail.com"
PASSWORD = "@DEDEra45ra45"

def login():
    """Fazer login e obter token"""
    print("🔐 Fazendo login...")
    
    login_data = {
        "username": EMAIL,
        "password": PASSWORD
    }
    
    try:
        response = requests.post(LOGIN_URL, data=login_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            print("✅ Login successful!")
            return access_token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def get_clients(token):
    """Obter lista de clientes"""
    print("👥 Obtendo clientes...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/clients", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            clients = response.json()
            print(f"✅ Found {len(clients)} clients")
            return clients
        else:
            print(f"❌ Failed to get clients: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error getting clients: {e}")
        return []

def get_services(token):
    """Obter lista de serviços"""
    print("💈 Obtendo serviços...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/services", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            services = response.json()
            print(f"✅ Found {len(services)} services")
            return services
        else:
            print(f"❌ Failed to get services: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error getting services: {e}")
        return []

def create_command(token, client_id, service_id):
    """Criar comanda com schema correto"""
    print("📋 Criando comanda...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Schema CommandCreatePublic
    command_data = {
        "client_crm_id": client_id,
        "professional_id": None,  # Opcional
        "appointment_id": None,   # Opcional
        "date": datetime.now().isoformat(),
        "notes": "Comanda de teste via script",
        "items": [
            {
                # Schema CommandItemCreate
                "item_type": "service",  # CommandItemType.SERVICE
                "service_id": service_id,
                "product_id": None,
                "package_id": None,
                "professional_id": None,
                "quantity": 1,
                "unit_value": "100.00",  # Decimal como string
                "commission_percentage": 10
            }
        ]
    }
    
    print(f"📝 Dados da comanda: {json.dumps(command_data, indent=2, default=str)}")
    
    try:
        response = requests.post(COMMANDS_URL, headers=headers, json=command_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            command = response.json()
            print("✅ Comanda criada com sucesso!")
            print(f"📋 Comanda ID: {command.get('id')}")
            print(f"📋 Número: {command.get('number')}")
            print(f"📋 Status: {command.get('status')}")
            print(f"📋 Valor Total: {command.get('total_value')}")
            return command
        else:
            print(f"❌ Failed to create command: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating command: {e}")
        return None

def main():
    """Função principal"""
    print("🚀 Teste de criação de comanda")
    print("=" * 50)
    
    # 1. Login
    token = login()
    if not token:
        return
    
    print("\n" + "=" * 50)
    
    # 2. Obter clientes
    clients = get_clients(token)
    if not clients:
        print("❌ Não foi possível obter clientes")
        return
    
    # Usar primeiro cliente
    client = clients[0]
    client_id = client.get('id')
    print(f"👤 Usando cliente: {client.get('full_name')} (ID: {client_id})")
    
    print("\n" + "=" * 50)
    
    # 3. Obter serviços
    services = get_services(token)
    if not services:
        print("❌ Não foi possível obter serviços")
        return
    
    # Usar primeiro serviço
    service = services[0]
    service_id = service.get('id')
    print(f"💈 Usando serviço: {service.get('name')} (ID: {service_id})")
    print(f"💈 Valor: {service.get('price')}")
    
    print("\n" + "=" * 50)
    
    # 4. Criar comanda
    command = create_command(token, client_id, service_id)
    
    if command:
        print("\n" + "=" * 50)
        print("🎉 SUCESSO! Comanda criada corretamente")
        print(f"📋 Detalhes completos:")
        print(json.dumps(command, indent=2, default=str))
    else:
        print("\n" + "=" * 50)
        print("❌ FALHA! Não foi possível criar a comanda")

if __name__ == "__main__":
    main()
