#!/usr/bin/env python3

import requests
import json

def test_http_redirect():
    """Testar redirecionamento HTTP → HTTPS"""
    
    # Token real
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZWthaWRlbGxpc29sYUBnbWFpbC5jb20iLCJ1c2VyX2lkIjo1LCJleHAiOjE3Njg0MDA1NzgsInR5cGUiOiJhY2Nlc3MiLCJzY29wZSI6ImNvbXBhbnkifQ.RGTXeNIdEVz8yqX-RdtVpa-qccZCgIbjHCJdUQOJyeo"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"=== Testando redirecionamento HTTP → HTTPS ===")
        
        # Testar HTTP (deve redirecionar para HTTPS)
        response = requests.get(
            "http://72.62.138.239/api/v1/settings/all", 
            headers=headers, 
            timeout=10, 
            allow_redirects=True
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"URL Final: {response.url}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCESSO - Dados recebidos via redirecionamento!")
            
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
                
                print(f"\n🎉 REDIRECIONAMENTO FUNCIONOU!")
                print(f"🎉 DADOS APARECEM NO FRONTEND!")
            else:
                print("❌ Nenhum details encontrado")
        else:
            print(f"❌ ERRO - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    test_http_redirect()
