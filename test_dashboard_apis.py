#!/usr/bin/env python3
"""
Teste das APIs do dashboard que estão dando erro 500
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

def test_dashboard_api(token, endpoint, description):
    """Testar API do dashboard"""
    print(f"\n📊 Testando {description}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/dashboard/{endpoint}?start_date=2025-12-15&end_date=2026-01-14"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {description} - Success!")
            print(f"📊 Data: {json.dumps(data, indent=2, default=str)[:500]}...")
        else:
            print(f"❌ {description} - Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ {description} - Error: {e}")

def main():
    """Função principal"""
    print("🚀 Teste das APIs do Dashboard")
    print("=" * 50)
    
    # 1. Login
    token = login()
    if not token:
        return
    
    # 2. Testar APIs do dashboard
    test_dashboard_api(token, "sales-by-category", "Vendas por Categoria")
    test_dashboard_api(token, "appointments-funnel", "Funil de Agendamentos")
    test_dashboard_api(token, "revenue-forecast", "Previsão de Receita")
    test_dashboard_api(token, "monthly-revenue", "Receita Mensal")
    
    print("\n" + "=" * 50)
    print("🎉 Teste concluído!")

if __name__ == "__main__":
    main()
