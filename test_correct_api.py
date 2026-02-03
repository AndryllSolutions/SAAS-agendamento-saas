#!/usr/bin/env python3

import requests
import json

def test_correct_api():
    """Testar API com URL correta"""
    
    # URL correta - sem /api/v1 duplicado
    api_url = "http://72.62.138.239/api/settings/all"
    
    # Token real
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZWthaWRlbGxpc29sYUBnbWFpbC5jb20iLCJ1c2VyX2lkIjo1LCJleHAiOjE3Njg0MDA1NzgsInR5cGUiOiJhY2Nlc3MiLCJzY29wZSI6ImNvbXBhbnkifQ.RGTXeNIdEVz8yqX-RdtVpa-qccZCgIbjHCJdUQOJyeo"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"=== Testando API com URL correta ===")
        print(f"URL: {api_url}")
        
        response = requests.get(api_url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCESSO - Dados recebidos!")
            
            if data.get('details'):
                details = data['details']
                print(f"✅ Details encontrados:")
                print(f"  - Company Name: {details.get('company_name')}")
                print(f"  - Email: {details.get('email')}")
                print(f"  - Document: {details.get('document_number')}")
                print(f"  - Phone: {details.get('phone')}")
                print(f"  - Address: {details.get('address')}")
                print(f"  - City: {details.get('city')}")
                print(f"  - State: {details.get('state')}")
                print(f"  - Country: {details.get('country')}")
                print(f"  - Postal Code: {details.get('postal_code')}")
                
                print(f"\n✅ FRONTEND CONSEGUE PUXAR DADOS DO BANCO!")
                print(f"✅ PROBLEMA RESOLVIDO!")
            else:
                print("❌ Nenhum details encontrado")
                
        else:
            print(f"❌ ERRO - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    test_correct_api()
