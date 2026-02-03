#!/usr/bin/env python3
"""
Test script to debug public API endpoints
"""
import requests
import json

def test_public_endpoints():
    base_url = "https://atendo.website"
    
    endpoints = [
        "/api/v1/services/public",
        "/api/v1/professionals/public", 
        "/health"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"\n🔍 Testing: {endpoint}")
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"Response type: {type(data)}")
                    if isinstance(data, list):
                        print(f"Items count: {len(data)}")
                        if data:
                            print(f"First item keys: {list(data[0].keys()) if data else 'Empty'}")
                    elif isinstance(data, dict):
                        print(f"Keys: {list(data.keys())}")
                except:
                    print("Response is not JSON")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    test_public_endpoints()
