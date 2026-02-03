#!/usr/bin/env python3

import requests
import json
import urllib3

# Desabilitar warnings de SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def test_backend_direct_nginx():
    """Testar backend via nginx com a URL correta"""
    
    # Token real
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZWthaWRlbGxpc29sYUBnbWFpbC5jb20iLCJ1c2VyX2lkIjo1LCJleHAiOjE3Njg0MDA1NzgsInR5cGUiOiJhY2Nlc3MiLCJzY29wZSI6ImNvbXBhbnkifQ.RGTXeNIdEVz8yqX-RdtVpa-qccZCgIbjHCJdUQOJyeo"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Testar URLs diferentes
    urls_to_test = [
        "https://72.62.138.239/api/settings/all",  # Sem /v1
        "https://72.62.138.239/api/v1/settings/all",  # Com /v1
    ]
    
    for url in urls_to_test:
        try:
            print(f"\n=== Testando: {url} ===")
            
            response = requests.get(
                url, 
                headers=headers, 
                timeout=10, 
                verify=False
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SUCESSO!")
                
                if data.get('details'):
                    details = data['details']
                    print(f"✅ Details: {details.get('company_name')} - {details.get('email')}")
                    print(f"\n🎯 URL CORRETA: {url}")
                    return url
                else:
                    print(f"❌ Sem details")
            else:
                print(f"❌ ERRO: {response.text}")
                
        except Exception as e:
            print(f"❌ EXCEPTION: {e}")
    
    print(f"\n❌ Nenhuma URL funcionou!")
    return None

if __name__ == "__main__":
    test_backend_direct_nginx()
