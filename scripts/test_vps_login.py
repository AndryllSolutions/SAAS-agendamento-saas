"""
Script para testar autenticacao no VPS com credenciais de teste
"""
import requests
import json
from datetime import datetime
import urllib3

# Suprimir avisos de SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuracoes
VPS_URL = "http://72.62.138.239"
API_BASE = f"{VPS_URL}/api/api/v1"

# Credenciais de teste
TEST_CREDENTIALS = {
    "username": "admin.teste.vps@exemplo.com",
    "password": "AdminTeste2026!",
    "grant_type": "password"
}

def print_section(title):
    """Imprime secao formatada"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def test_health():
    """Testa endpoint de health"""
    print_section("1. Testando Health Check")
    try:
        response = requests.get(f"{VPS_URL}/api/health", timeout=10, verify=False)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Erro: {e}")
        return False

def test_login():
    """Testa login com credenciais fornecidas"""
    print_section("2. Testando Login")
    
    print(f"\nCredenciais:")
    print(f"  Email: {TEST_CREDENTIALS['username']}")
    print(f"  Senha: {'*' * len(TEST_CREDENTIALS['password'])}")
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json=TEST_CREDENTIALS,
            headers={"Content-Type": "application/json"},
            timeout=10,
            verify=False
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nLogin bem-sucedido!")
            print(f"\nDados do usuario:")
            user = data.get('user', {})
            print(f"  ID: {user.get('id')}")
            print(f"  Nome: {user.get('full_name')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Role: {user.get('role')}")
            print(f"  SAAS Role: {user.get('saas_role')}")
            print(f"  Company Role: {user.get('company_role')}")
            print(f"  Company ID: {user.get('company_id')}")
            
            print(f"\nTokens:")
            print(f"  Access Token: {data.get('access_token', '')[:50]}...")
            print(f"  Refresh Token: {data.get('refresh_token', '')[:50]}...")
            
            return {
                'success': True,
                'user': user,
                'access_token': data.get('access_token'),
                'refresh_token': data.get('refresh_token')
            }
        else:
            print(f"\nFalha no login!")
            print(f"Response: {response.text}")
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f"\nErro na requisicao: {e}")
        return {'success': False, 'error': str(e)}

def test_authenticated_request(access_token):
    """Testa requisicao autenticada"""
    print_section("3. Testando Requisicao Autenticada")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Testar endpoint /me
        response = requests.get(
            f"{API_BASE}/auth/me",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nDados do usuario autenticado:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"\nFalha na requisicao autenticada!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\nErro na requisicao: {e}")
        return False

def main():
    """Funcao principal"""
    print("\n" + "=" * 60)
    print(" TESTE DE AUTENTICACAO VPS")
    print(" Data/Hora:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)
    
    print(f"\nURL Base: {VPS_URL}")
    print(f"API Base: {API_BASE}")
    
    # 1. Testar health
    health_ok = test_health()
    if not health_ok:
        print("\nAVISO: Health check falhou, mas continuando...")
    
    # 2. Testar login
    login_result = test_login()
    
    if not login_result.get('success'):
        print("\n" + "=" * 60)
        print(" TESTE FALHOU: Nao foi possivel fazer login")
        print("=" * 60)
        return
    
    # 3. Testar requisicao autenticada
    access_token = login_result.get('access_token')
    if access_token:
        auth_ok = test_authenticated_request(access_token)
        
        if auth_ok:
            print("\n" + "=" * 60)
            print(" TODOS OS TESTES PASSARAM COM SUCESSO!")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print(" AVISO: Login OK, mas requisicao autenticada falhou")
            print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print(" AVISO: Login OK, mas sem access token")
        print("=" * 60)

if __name__ == "__main__":
    main()
