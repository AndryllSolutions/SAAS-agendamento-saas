#!/usr/bin/env python3

import requests
import json

def test_with_real_token():
    # URL do endpoint
    url = "http://localhost:8000/api/v1/settings/all"
    
    # Token real do usuário
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbmRyZWthaWRlbGxpc29sYUBnbWFpbC5jb20iLCJ1c2VyX2lkIjo1LCJleHAiOjE3Njg0MDA1NzgsInR5cGUiOiJhY2Nlc3MiLCJzY29wZSI6ImNvbXBhbnkifQ.RGTXeNIdEVz8yqX-RdtVpa-qccZCgIbjHCJdUQOJyeo"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        print("=== Testando /settings/all com token real ===")
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
                print(f"  - WhatsApp: {details.get('whatsapp')}")
                print(f"  - Address: {details.get('address')}")
                print(f"  - City: {details.get('city')}")
                print(f"  - State: {details.get('state')}")
                print(f"  - Country: {details.get('country')}")
                print(f"  - Postal Code: {details.get('postal_code')}")
            else:
                print("\n❌ Nenhum details encontrado")
                
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_with_real_token()
