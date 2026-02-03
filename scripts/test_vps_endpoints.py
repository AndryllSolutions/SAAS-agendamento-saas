"""
Script para descobrir a estrutura correta de endpoints no VPS
"""
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

# Testar diferentes combinacoes de paths
test_paths = [
    "/health",
    "/api/health",
    "/api/v1/health",
    "/api/api/v1/health",
    "/docs",
    "/api/docs",
    "/api/v1/docs",
    "/api/api/v1/docs",
    "/openapi.json",
    "/api/openapi.json",
    "/api/v1/openapi.json",
    "/api/api/v1/openapi.json",
]

print("\n" + "=" * 70)
print(" DESCOBRINDO ESTRUTURA DE ENDPOINTS DO VPS")
print("=" * 70)
print(f"\nVPS URL: {VPS_URL}\n")

for path in test_paths:
    url = f"{VPS_URL}{path}"
    try:
        response = requests.get(url, timeout=5, verify=False)
        status = response.status_code
        
        if status == 200:
            print(f"[OK {status}] {path}")
            if 'json' in path or 'health' in path:
                try:
                    data = response.json()
                    print(f"         Response: {str(data)[:100]}")
                except:
                    pass
        elif status == 404:
            print(f"[404   ] {path}")
        else:
            print(f"[{status}   ] {path}")
    except Exception as e:
        print(f"[ERROR ] {path} - {str(e)[:50]}")

# Testar login em diferentes paths
print("\n" + "=" * 70)
print(" TESTANDO ENDPOINTS DE LOGIN")
print("=" * 70 + "\n")

login_paths = [
    "/auth/login",
    "/api/auth/login",
    "/api/v1/auth/login",
    "/api/api/v1/auth/login",
]

credentials = {
    "username": "admin.teste.vps@exemplo.com",
    "password": "AdminTeste2026!",
    "grant_type": "password"
}

for path in login_paths:
    url = f"{VPS_URL}{path}"
    try:
        response = requests.post(
            url,
            json=credentials,
            headers={"Content-Type": "application/json"},
            timeout=5,
            verify=False
        )
        status = response.status_code
        
        if status == 200:
            print(f"[OK {status}] {path}")
            print(f"         LOGIN BEM-SUCEDIDO!")
            data = response.json()
            if 'user' in data:
                print(f"         Usuario: {data['user'].get('full_name')}")
        elif status == 404:
            print(f"[404   ] {path}")
        elif status == 401:
            print(f"[401   ] {path} - Credenciais invalidas")
        elif status == 422:
            print(f"[422   ] {path} - Erro de validacao")
            try:
                print(f"         {response.json()}")
            except:
                pass
        else:
            print(f"[{status}   ] {path}")
    except Exception as e:
        print(f"[ERROR ] {path} - {str(e)[:50]}")

print("\n" + "=" * 70)
