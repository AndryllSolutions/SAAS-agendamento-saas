#!/usr/bin/env python3

import requests
import json

def test_details_endpoint():
    # URL do endpoint
    url = "http://localhost:8000/api/v1/settings/details"
    
    # Headers (sem autenticação para teste básico)
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"Testing endpoint: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {json.dumps(data, indent=2)}")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_details_endpoint()
