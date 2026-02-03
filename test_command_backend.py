#!/usr/bin/env python3
"""
Testar criação de comanda diretamente no backend
"""

import requests
import json
from datetime import datetime, timezone

# Configuração
BASE_URL = "https://72.62.138.239"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
COMMANDS_URL = f"{BASE_URL}/api/v1/commands"

# Credenciais
credentials = {
    "username": "andrekaidellisola@gmail.com",
    "password": "@DEDEra45ra45"
}

def test_command_backend():
    print("🔐 Testando criação de comanda no backend...")
    
    # 1. Fazer login
    print("\n1. Fazendo login...")
    try:
        response = requests.post(LOGIN_URL, data=credentials, verify=False)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            user_data = token_data.get('user', {})
            company_id = user_data.get('company_id')
            print(f"✅ Login successful! Company ID: {company_id}")
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # 2. Verificar clientes
            print("\n2. Verificando clientes...")
            clients_response = requests.get(f"{BASE_URL}/api/v1/clients", headers=headers, verify=False)
            print(f"Status: {clients_response.status_code}")
            
            if clients_response.status_code == 200:
                clients = clients_response.json()
                print(f"✅ Clientes: {len(clients)}")
                
                if clients:
                    client_id = clients[0].get('id')
                    print(f"✅ Usando cliente: ID {client_id}")
                    
                    # 3. Verificar serviços
                    print("\n3. Verificando serviços...")
                    services_response = requests.get(f"{BASE_URL}/api/v1/services", headers=headers, verify=False)
                    print(f"Status: {services_response.status_code}")
                    
                    if services_response.status_code == 200:
                        services = services_response.json()
                        print(f"✅ Serviços: {len(services)}")
                        
                        # 4. Criar comanda com item
                        print("\n4. Criando comanda com item...")
                        
                        if services:
                            service_id = services[0].get('id')
                            print(f"✅ Usando serviço: ID {service_id}")
                            
                            command_data = {
                                "client_id": client_id,
                                "date": datetime.now(timezone.utc).isoformat(),
                                "notes": "Comanda de teste com item",
                                "items": [
                                    {
                                        "item_type": "SERVICE",
                                        "service_id": service_id,
                                        "quantity": 1,
                                        "unit_value": "100.00",
                                        "commission_percentage": 10
                                    }
                                ]
                            }
                        else:
                            # Criar comanda sem itens
                            command_data = {
                                "client_id": client_id,
                                "date": datetime.now(timezone.utc).isoformat(),
                                "notes": "Comanda de teste sem itens",
                                "items": []
                            }
                        
                        print(f"Dados: {json.dumps(command_data, indent=2, default=str)}")
                        
                        create_response = requests.post(COMMANDS_URL, headers=headers, json=command_data, verify=False)
                        print(f"Status criação: {create_response.status_code}")
                        
                        if create_response.status_code == 201:
                            command = create_response.json()
                            print(f"✅ Comanda criada!")
                            print(f"   Número: {command.get('number')}")
                            print(f"   ID: {command.get('id')}")
                            print(f"   Total: {command.get('total_value')}")
                        else:
                            print(f"❌ Erro: {create_response.status_code}")
                            print(f"Response: {create_response.text}")
                    else:
                        print(f"❌ Erro ao listar serviços: {services_response.status_code}")
                        print(f"Response: {services_response.text}")
                else:
                    print("❌ Nenhum cliente encontrado")
            else:
                print(f"❌ Erro ao listar clientes: {clients_response.status_code}")
                print(f"Response: {clients_response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    test_command_backend()
