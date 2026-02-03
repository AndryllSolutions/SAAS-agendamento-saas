#!/usr/bin/env python3
"""
Testar autenticação para commands
"""

import requests
import json

# Configuração
BASE_URL = "https://72.62.138.239"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
COMMANDS_URL = f"{BASE_URL}/api/v1/commands"

# Credenciais
credentials = {
    "username": "andrekaidellisola@gmail.com",
    "password": "@DEDEra45ra45"
}

def test_commands_access():
    print("🔐 Testando acesso ao endpoint /commands...")
    
    # 1. Fazer login
    print("\n1. Fazendo login...")
    try:
        response = requests.post(LOGIN_URL, data=credentials, verify=False)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            print(f"✅ Login successful! Token obtido.")
            
            # 2. Testar acesso ao commands
            print("\n2. Testando acesso ao /commands...")
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            commands_response = requests.get(COMMANDS_URL, headers=headers, verify=False)
            print(f"Status: {commands_response.status_code}")
            
            if commands_response.status_code == 200:
                commands_data = commands_response.json()
                print(f"✅ Commands accessible! Total: {len(commands_data)} comandas")
                if commands_data:
                    print(f"Primeira comanda: {commands_data[0].get('number', 'N/A')}")
            else:
                print(f"❌ Erro ao acessar commands: {commands_response.status_code}")
                print(f"Response: {commands_response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    test_commands_access()
