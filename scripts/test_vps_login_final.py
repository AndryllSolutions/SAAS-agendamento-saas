"""
Script para testar autenticacao no VPS com a estrutura correta de endpoints
"""
import requests
import json
from datetime import datetime
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

# Credenciais de teste
TEST_CREDENTIALS = {
    "username": "admin.teste.vps@exemplo.com",
    "password": "AdminTeste2026!",
}

def print_section(title):
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def test_health():
    print_section("1. Testando Health Check")
    try:
        response = requests.get(f"{VPS_URL}/health", timeout=10, verify=False)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response:")
            print(f"  App: {data.get('app')}")
            print(f"  Version: {data.get('version')}")
            print(f"  Environment: {data.get('environment')}")
            print(f"  Status: {data.get('status')}")
            return True
        return False
    except Exception as e:
        print(f"Erro: {e}")
        return False

def test_login_form_data():
    """Testa login usando form data (OAuth2 padrao)"""
    print_section("2. Testando Login (Form Data - OAuth2)")
    
    print(f"\nCredenciais:")
    print(f"  Email: {TEST_CREDENTIALS['username']}")
    print(f"  Senha: {'*' * len(TEST_CREDENTIALS['password'])}")
    
    try:
        # OAuth2 usa form data, nao JSON
        form_data = {
            "username": TEST_CREDENTIALS['username'],
            "password": TEST_CREDENTIALS['password'],
            "grant_type": "password"
        }
        
        response = requests.post(
            f"{VPS_URL}/api/v1/auth/login",
            data=form_data,  # Usar data em vez de json
            timeout=10,
            verify=False
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nLOGIN BEM-SUCEDIDO!")
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
            print(f"  Token Type: {data.get('token_type')}")
            
            return {
                'success': True,
                'user': user,
                'access_token': data.get('access_token'),
                'refresh_token': data.get('refresh_token')
            }
        else:
            print(f"\nFALHA NO LOGIN!")
            print(f"Response: {response.text}")
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f"\nErro na requisicao: {e}")
        return {'success': False, 'error': str(e)}

def test_authenticated_request(access_token):
    """Testa requisicao autenticada"""
    print_section("3. Testando Requisicao Autenticada (/api/v1/auth/me)")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/auth/me",
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

def test_company_info(access_token, company_id):
    """Testa busca de informacoes da empresa"""
    print_section("4. Testando Informacoes da Empresa")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/companies/{company_id}",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nInformacoes da Empresa:")
            print(f"  ID: {data.get('id')}")
            print(f"  Nome: {data.get('name')}")
            print(f"  Tipo: {data.get('business_type')}")
            print(f"  Status: {data.get('status')}")
            print(f"  Plano: {data.get('subscription_plan')}")
            return True
        else:
            print(f"\nFalha ao buscar empresa!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\nErro na requisicao: {e}")
        return False

def main():
    print("\n" + "=" * 70)
    print(" TESTE COMPLETO DE AUTENTICACAO VPS")
    print(" Data/Hora:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 70)
    
    print(f"\nURL Base: {VPS_URL}")
    
    # 1. Testar health
    health_ok = test_health()
    if not health_ok:
        print("\nERRO: Health check falhou!")
        return
    
    # 2. Testar login
    login_result = test_login_form_data()
    
    if not login_result.get('success'):
        print("\n" + "=" * 70)
        print(" TESTE FALHOU: Nao foi possivel fazer login")
        print("=" * 70)
        return
    
    # 3. Testar requisicao autenticada
    access_token = login_result.get('access_token')
    user = login_result.get('user', {})
    company_id = user.get('company_id')
    
    if access_token:
        auth_ok = test_authenticated_request(access_token)
        
        # 4. Testar informacoes da empresa
        if auth_ok and company_id:
            company_ok = test_company_info(access_token, company_id)
        
        print("\n" + "=" * 70)
        print(" RESUMO DOS TESTES")
        print("=" * 70)
        print(f"  Health Check: {'OK' if health_ok else 'FALHOU'}")
        print(f"  Login: {'OK' if login_result.get('success') else 'FALHOU'}")
        print(f"  Autenticacao: {'OK' if auth_ok else 'FALHOU'}")
        if company_id:
            print(f"  Info Empresa: {'OK' if company_ok else 'FALHOU'}")
        
        if health_ok and login_result.get('success') and auth_ok:
            print("\n" + "=" * 70)
            print(" TODOS OS TESTES PASSARAM COM SUCESSO!")
            print("=" * 70)
        else:
            print("\n" + "=" * 70)
            print(" ALGUNS TESTES FALHARAM")
            print("=" * 70)

if __name__ == "__main__":
    main()
