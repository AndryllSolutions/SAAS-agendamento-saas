"""
Script para testar endpoints de Online Booking Services
"""
import sys
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def get_auth_token():
    """Obter token de autenticação"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": "admin@belezalatino.com",
            "password": "admin123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Erro no login: {response.status_code}")
        print(response.text)
        return None

def test_online_booking_services():
    """Testar os 3 endpoints de services"""
    
    print("=" * 70)
    print("TESTE: Endpoints Online Booking Services")
    print("=" * 70)
    
    # Obter token
    print("\n[1] Obtendo token de autenticacao...")
    token = get_auth_token()
    
    if not token:
        print("ERRO: Nao foi possivel obter token")
        return False
    
    print(f"[OK] Token obtido: {token[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Teste 1: GET /online-booking/services/available
    print("\n[2] Testando GET /online-booking/services/available")
    response = requests.get(
        f"{BASE_URL}/online-booking/services/available",
        headers=headers
    )
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"    [OK] {len(services)} servicos disponiveis encontrados")
        if services:
            print(f"    Exemplo: {services[0].get('name', 'N/A')}")
    else:
        print(f"    [ERRO] {response.text[:100]}")
        return False
    
    # Teste 2: GET /online-booking/services/unavailable
    print("\n[3] Testando GET /online-booking/services/unavailable")
    response = requests.get(
        f"{BASE_URL}/online-booking/services/unavailable",
        headers=headers
    )
    print(f"    Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"    [OK] {len(services)} servicos indisponiveis encontrados")
    else:
        print(f"    [ERRO] {response.text[:100]}")
        return False
    
    # Teste 3: PUT /online-booking/services/{id}/availability
    print("\n[4] Testando PUT /online-booking/services/{id}/availability")
    
    # Primeiro, pegar um serviço qualquer
    response = requests.get(f"{BASE_URL}/services", headers=headers)
    if response.status_code == 200:
        all_services = response.json()
        if all_services:
            test_service_id = all_services[0]["id"]
            print(f"    Usando servico ID: {test_service_id}")
            
            # Testar toggle
            response = requests.put(
                f"{BASE_URL}/online-booking/services/{test_service_id}/availability",
                headers=headers,
                params={"available": True}
            )
            print(f"    Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"    [OK] {result.get('message', 'Success')}")
            else:
                print(f"    [ERRO] {response.text[:100]}")
                return False
        else:
            print("    [AVISO] Nenhum servico cadastrado para testar")
    
    print("\n" + "=" * 70)
    print("RESULTADO: TODOS OS ENDPOINTS FUNCIONAIS!")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    try:
        success = test_online_booking_services()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\nERRO durante testes: {e}")
        exit(1)
