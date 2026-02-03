#!/usr/bin/env python3

import requests
import json

def test_all_settings():
    # URL do endpoint
    url = "http://localhost:8000/api/v1/settings/all"
    
    # Tentar fazer login primeiro para obter token
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "andrekaidellisola@gmail.com",
        "password": "senha123"  # Senha padrão de teste
    }
    
    try:
        print("=== Testando Login ===")
        login_response = requests.post(login_url, json=login_data, timeout=10)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get("access_token")
            print(f"Token obtido: {access_token[:20]}...")
            
            # Testar endpoint com autenticação
            print("\n=== Testando /settings/all ===")
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                # Verificar se details tem dados
                if data.get('details'):
                    print(f"\n✅ Details encontrados:")
                    details = data['details']
                    print(f"  - Company Type: {details.get('company_type')}")
                    print(f"  - Document: {details.get('document_number')}")
                    print(f"  - Company Name: {details.get('company_name')}")
                    print(f"  - Email: {details.get('email')}")
                    print(f"  - Phone: {details.get('phone')}")
                else:
                    print("\n❌ Nenhum details encontrado")
                    
            else:
                print(f"Error Response: {response.text}")
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_all_settings()
