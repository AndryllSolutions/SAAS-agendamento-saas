#!/usr/bin/env python3

import requests
import json

def test_frontend_backend_connection():
    """Testar se o frontend consegue acessar o backend"""
    
    # Testar endpoint de health do backend via proxy nginx
    try:
        print("=== Testando conexão Frontend → Backend ===")
        
        # Testar via proxy nginx (porta 80)
        health_url = "http://localhost/api/health"
        response = requests.get(health_url, timeout=10)
        print(f"Health via nginx: {response.status_code}")
        
        if response.status_code == 200:
            print(f"Health response: {response.json()}")
        
        # Testar endpoint de settings via proxy nginx
        settings_url = "http://localhost/api/api/v1/settings/all"
        print(f"\nTestando: {settings_url}")
        
        # Usar token real
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZWthaWRlbGxpc29sYUBnbWFpbC5jb20iLCJ1c2VyX2lkIjo1LCJleHAiOjE3Njg0MDA1NzgsInR5cGUiOiJhY2Nlc3MiLCJzY29wZSI6ImNvbXBhbnkifQ.RGTXeNIdEVz8yqX-RdtVpa-qccZCgIbjHCJdUQOJyeo"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(settings_url, headers=headers, timeout=10)
        print(f"Settings via nginx: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('details'):
                print(f"✅ Details encontrados via nginx!")
                details = data['details']
                print(f"  - Company Name: {details.get('company_name')}")
                print(f"  - Email: {details.get('email')}")
                print(f"  - Document: {details.get('document_number')}")
            else:
                print(f"❌ Nenhum details encontrado")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_frontend_backend_connection()
