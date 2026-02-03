"""
Script para testar todos os metodos de login disponiveis
"""
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

CREDENTIALS = {
    "username": "admin.teste.vps@exemplo.com",
    "password": "AdminTeste2026!",
}

print("\n" + "=" * 70)
print(" TESTANDO TODOS OS METODOS DE LOGIN")
print("=" * 70)

# Teste 1: /api/v1/auth/login com form data
print("\n1. POST /api/v1/auth/login (form data)")
try:
    response = requests.post(
        f"{VPS_URL}/api/v1/auth/login",
        data=CREDENTIALS,
        timeout=10,
        verify=False
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   SUCESSO!")
        data = response.json()
        print(f"   Usuario: {data.get('user', {}).get('full_name')}")
    else:
        print(f"   Erro: {response.text[:100]}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 2: /api/v1/auth/login com JSON
print("\n2. POST /api/v1/auth/login (JSON)")
try:
    response = requests.post(
        f"{VPS_URL}/api/v1/auth/login",
        json=CREDENTIALS,
        headers={"Content-Type": "application/json"},
        timeout=10,
        verify=False
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   SUCESSO!")
        data = response.json()
        print(f"   Usuario: {data.get('user', {}).get('full_name')}")
    else:
        print(f"   Erro: {response.text[:100]}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 3: /api/v1/auth/login-json com JSON
print("\n3. POST /api/v1/auth/login-json (JSON)")
try:
    response = requests.post(
        f"{VPS_URL}/api/v1/auth/login-json",
        json=CREDENTIALS,
        headers={"Content-Type": "application/json"},
        timeout=10,
        verify=False
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   SUCESSO!")
        data = response.json()
        print(f"   Usuario: {data.get('user', {}).get('full_name')}")
    else:
        print(f"   Erro: {response.text[:100]}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 4: /api/v1/auth/login/json com JSON
print("\n4. POST /api/v1/auth/login/json (JSON)")
try:
    response = requests.post(
        f"{VPS_URL}/api/v1/auth/login/json",
        json=CREDENTIALS,
        headers={"Content-Type": "application/json"},
        timeout=10,
        verify=False
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   SUCESSO!")
        data = response.json()
        print(f"   Usuario: {data.get('user', {}).get('full_name')}")
    else:
        print(f"   Erro: {response.text[:100]}")
except Exception as e:
    print(f"   Erro: {e}")

# Teste 5: GET em /api/v1/auth/login para ver metodos permitidos
print("\n5. OPTIONS /api/v1/auth/login")
try:
    response = requests.options(
        f"{VPS_URL}/api/v1/auth/login",
        timeout=10,
        verify=False
    )
    print(f"   Status: {response.status_code}")
    print(f"   Allow: {response.headers.get('Allow', 'N/A')}")
except Exception as e:
    print(f"   Erro: {e}")

print("\n" + "=" * 70)
