#!/usr/bin/env python3
"""
Testar criação de comandas
"""

import requests
import json

# Configuração
BASE_URL = "https://72.62.138.239"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
COMMANDS_URL = f"{BASE_URL}/api/v1/commands"
CLIENTS_URL = f"{BASE_URL}/api/v1/clients"

# Credenciais
credentials = {
    "username": "andrekaidellisola@gmail.com",
    "password": "@DEDEra45ra45"
}

def test_create_command():
    print("🔐 Testando criação de comanda...")
    
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
            
            # 2. Verificar clientes disponíveis
            print("\n2. Verificando clientes disponíveis...")
            clients_response = requests.get(CLIENTS_URL, headers=headers, verify=False)
            print(f"Status: {clients_response.status_code}")
            
            if clients_response.status_code == 200:
                clients = clients_response.json()
                print(f"✅ Clientes encontrados: {len(clients)}")
                
                if not clients:
                    print("❌ Nenhum cliente encontrado. Criando cliente de teste...")
                    # Criar cliente de teste
                    client_data = {
                        "full_name": "Cliente Teste Comanda",
                        "email": "cliente.teste@exemplo.com",
                        "phone": "11999999999",
                        "address": "Rua Teste, 123",
                        "city": "São Paulo",
                        "state": "SP",
                        "postal_code": "01234-567"
                    }
                    
                    create_client_response = requests.post(CLIENTS_URL, headers=headers, json=client_data, verify=False)
                    print(f"Status criação cliente: {create_client_response.status_code}")
                    
                    if create_client_response.status_code == 201:
                        new_client = create_client_response.json()
                        client_id = new_client.get('id')
                        print(f"✅ Cliente criado: ID {client_id}")
                    else:
                        print(f"❌ Erro ao criar cliente: {create_client_response.text}")
                        return
                else:
                    client_id = clients[0].get('id')
                    print(f"✅ Usando cliente existente: ID {client_id}")
                
                # 3. Tentar criar comanda
                print("\n3. Criando comanda...")
                from datetime import datetime, timezone
                command_data = {
                    "client_id": client_id,
                    "date": datetime.now(timezone.utc).isoformat(),
                    "notes": "Comanda de teste",
                    "items": []  # Lista vazia para criar comanda sem itens
                }
                
                create_command_response = requests.post(COMMANDS_URL, headers=headers, json=command_data, verify=False)
                print(f"Status criação comanda: {create_command_response.status_code}")
                
                if create_command_response.status_code == 201:
                    new_command = create_command_response.json()
                    print(f"✅ Comanda criada com sucesso!")
                    print(f"   Número: {new_command.get('number')}")
                    print(f"   ID: {new_command.get('id')}")
                    print(f"   Cliente: {new_command.get('client', {}).get('full_name')}")
                else:
                    print(f"❌ Erro ao criar comanda: {create_command_response.status_code}")
                    print(f"Response: {create_command_response.text}")
                    
                    # Verificar se há campos obrigatórios faltando
                    try:
                        error_data = create_command_response.json()
                        print(f"Detalhes do erro: {error_data}")
                    except:
                        pass
                
            else:
                print(f"❌ Erro ao listar clientes: {clients_response.status_code}")
                print(f"Response: {clients_response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    test_create_command()
