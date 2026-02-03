"""
Script para testar conectividade mobile
"""
import requests
import json
from colorama import init, Fore, Style

init()

BASE_URL = "http://localhost:8000"

SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

def test_cors():
    """Testa CORS"""
    print(f"\n{INFO}🧪 Testando CORS...{RESET}")
    
    try:
        # Simular requisição OPTIONS (preflight)
        response = requests.options(
            f"{BASE_URL}/api/v1/auth/login/json",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        print(f"{INFO}Status: {response.status_code}{RESET}")
        print(f"{INFO}CORS Headers:{RESET}")
        for key, value in response.headers.items():
            if "access-control" in key.lower():
                print(f"  {key}: {value}")
        
        if response.status_code == 200:
            print(f"{SUCCESS}✅ CORS OK{RESET}")
            return True
        else:
            print(f"{ERROR}❌ CORS pode ter problema{RESET}")
            return False
    except Exception as e:
        print(f"{ERROR}❌ Erro ao testar CORS: {e}{RESET}")
        return False

def test_login_json():
    """Testa login JSON"""
    print(f"\n{INFO}🧪 Testando Login JSON...{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login/json",
            json={
                "email": "teste@mobile.com",
                "password": "mobile123"
            },
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000"
            },
            timeout=10
        )
        
        print(f"{INFO}Status: {response.status_code}{RESET}")
        print(f"{INFO}Headers:{RESET}")
        for key, value in response.headers.items():
            if "access-control" in key.lower() or "content-type" in key.lower():
                print(f"  {key}: {value}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{SUCCESS}✅ Login OK{RESET}")
            print(f"{SUCCESS}Access Token: {data.get('access_token', '')[:50]}...{RESET}")
            return True, data.get('access_token')
        else:
            print(f"{ERROR}❌ Login FALHOU{RESET}")
            print(f"{ERROR}Response: {response.text[:200]}{RESET}")
            return False, None
    except Exception as e:
        print(f"{ERROR}❌ Erro: {e}{RESET}")
        return False, None

def test_with_token(token):
    """Testa requisição autenticada"""
    print(f"\n{INFO}🧪 Testando Requisição Autenticada...{RESET}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/users/me",
            headers={
                "Authorization": f"Bearer {token}",
                "Origin": "http://localhost:3000"
            },
            timeout=10
        )
        
        print(f"{INFO}Status: {response.status_code}{RESET}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{SUCCESS}✅ Requisição autenticada OK{RESET}")
            print(f"{SUCCESS}User: {data.get('email', 'N/A')}{RESET}")
            return True
        else:
            print(f"{ERROR}❌ Requisição autenticada FALHOU{RESET}")
            print(f"{ERROR}Response: {response.text[:200]}{RESET}")
            return False
    except Exception as e:
        print(f"{ERROR}❌ Erro: {e}{RESET}")
        return False

def test_server_reachable():
    """Testa se servidor está acessível"""
    print(f"\n{INFO}🧪 Testando Acessibilidade do Servidor...{RESET}")
    
    try:
        response = requests.get(
            f"{BASE_URL}/health",
            timeout=5
        )
        
        print(f"{INFO}Status: {response.status_code}{RESET}")
        
        if response.status_code == 200:
            print(f"{SUCCESS}✅ Servidor acessível{RESET}")
            return True
        else:
            print(f"{WARNING}⚠️  Servidor respondeu mas com status {response.status_code}{RESET}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"{ERROR}❌ Servidor NÃO está acessível{RESET}")
        print(f"{ERROR}Verifique se o servidor está rodando em {BASE_URL}{RESET}")
        return False
    except Exception as e:
        print(f"{ERROR}❌ Erro: {e}{RESET}")
        return False

def main():
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}🔍 DIAGNÓSTICO DE CONECTIVIDADE MOBILE{RESET}")
    print(f"{INFO}{'='*80}{RESET}")
    
    # Teste 1: Servidor acessível
    server_ok = test_server_reachable()
    if not server_ok:
        print(f"\n{WARNING}⚠️  Servidor não está acessível. Verifique:{RESET}")
        print(f"{WARNING}1. Servidor está rodando?{RESET}")
        print(f"{WARNING}2. URL está correta?{RESET}")
        print(f"{WARNING}3. Firewall bloqueando?{RESET}")
        return
    
    # Teste 2: CORS
    cors_ok = test_cors()
    
    # Teste 3: Login JSON
    login_ok, token = test_login_json()
    
    # Teste 4: Requisição autenticada
    if token:
        test_with_token(token)
    
    # Resumo
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}📊 RESUMO{RESET}")
    print(f"{INFO}{'='*80}{RESET}")
    print(f"Servidor acessível: {'✅' if server_ok else '❌'}")
    print(f"CORS: {'✅' if cors_ok else '⚠️'}")
    print(f"Login JSON: {'✅' if login_ok else '❌'}")
    
    if not login_ok:
        print(f"\n{WARNING}⚠️  PROBLEMAS ENCONTRADOS:{RESET}")
        print(f"{WARNING}1. Verifique se o usuário existe: teste@mobile.com{RESET}")
        print(f"{WARNING}2. Verifique se o endpoint /login/json está funcionando{RESET}")
        print(f"{WARNING}3. Verifique os logs do servidor{RESET}")

if __name__ == "__main__":
    main()

