#!/usr/bin/env python3
"""
Verificar agendamentos no banco de dados
"""

import requests
import json

# Configuração
BASE_URL = "https://atendo.website/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"

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

def check_appointments(token):
    """Verificar agendamentos"""
    print("\n📅 Verificando agendamentos...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Verificar overview
    print("\n1️⃣ Overview:")
    url = f"{BASE_URL}/dashboard/overview"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"   Total appointments: {data.get('appointments', {}).get('total', 0)}")
            print(f"   Completed: {data.get('appointments', {}).get('completed', 0)}")
            print(f"   Cancelled: {data.get('appointments', {}).get('cancelled', 0)}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Verificar appointments direto
    print("\n2️⃣ Appointments direto:")
    url = f"{BASE_URL}/appointments"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            appointments = data.get('data', [])
            print(f"   Total appointments na API: {len(appointments)}")
            
            if appointments:
                print(f"   Primeiro appointment: {appointments[0]}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Verificar appointments por status
    print("\n3️⃣ Appointments by status:")
    url = f"{BASE_URL}/dashboard/appointments-by-status"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"   Data: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def main():
    """Função principal"""
    print("🚀 Verificação de Agendamentos")
    print("=" * 50)
    
    # 1. Login
    token = login()
    if not token:
        return
    
    # 2. Verificar agendamentos
    check_appointments(token)
    
    print("\n" + "=" * 50)
    print("🎉 Verificação concluída!")

if __name__ == "__main__":
    main()
