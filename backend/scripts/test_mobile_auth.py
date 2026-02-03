"""
Script para testar autenticação mobile
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

def test_login_json():
    """Testa login JSON"""
    print(f"\n{INFO}🧪 Testando Login JSON...{RESET}")
    print(f"{INFO}Endpoint: POST /api/v1/auth/login/json{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login/json",
            json={
                "email": "admin@belezalatino.com",
                "password": "admin123"
            },
            headers={
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"{INFO}Status Code: {response.status_code}{RESET}")
        print(f"{INFO}Headers: {dict(response.headers)}{RESET}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{SUCCESS}✅ Login JSON FUNCIONOU!{RESET}")
            print(f"{SUCCESS}Access Token: {data.get('access_token', '')[:50]}...{RESET}")
            print(f"{SUCCESS}Refresh Token: {data.get('refresh_token', '')[:50]}...{RESET}")
            return True, data
        else:
            print(f"{ERROR}❌ Login JSON FALHOU!{RESET}")
            print(f"{ERROR}Status: {response.status_code}{RESET}")
            print(f"{ERROR}Resposta: {response.text}{RESET}")
            return False, None
    except Exception as e:
        print(f"{ERROR}❌ Erro ao testar login JSON: {e}{RESET}")
        return False, None

def test_login_form():
    """Testa login form (original)"""
    print(f"\n{INFO}🧪 Testando Login Form (original)...{RESET}")
    print(f"{INFO}Endpoint: POST /api/v1/auth/login{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={
                "username": "admin@belezalatino.com",
                "password": "admin123",
                "grant_type": "password"
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout=10
        )
        
        print(f"{INFO}Status Code: {response.status_code}{RESET}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{SUCCESS}✅ Login Form FUNCIONOU!{RESET}")
            return True, data
        else:
            print(f"{ERROR}❌ Login Form FALHOU!{RESET}")
            print(f"{ERROR}Status: {response.status_code}{RESET}")
            print(f"{ERROR}Resposta: {response.text}{RESET}")
            return False, None
    except Exception as e:
        print(f"{ERROR}❌ Erro ao testar login form: {e}{RESET}")
        return False, None

def test_refresh_json(refresh_token):
    """Testa refresh token JSON"""
    print(f"\n{INFO}🧪 Testando Refresh Token JSON...{RESET}")
    print(f"{INFO}Endpoint: POST /api/v1/auth/refresh/json{RESET}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/refresh/json",
            json={
                "refresh_token": refresh_token
            },
            headers={
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"{INFO}Status Code: {response.status_code}{RESET}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{SUCCESS}✅ Refresh Token JSON FUNCIONOU!{RESET}")
            return True, data
        else:
            print(f"{ERROR}❌ Refresh Token JSON FALHOU!{RESET}")
            print(f"{ERROR}Status: {response.status_code}{RESET}")
            print(f"{ERROR}Resposta: {response.text}{RESET}")
            return False, None
    except Exception as e:
        print(f"{ERROR}❌ Erro ao testar refresh token: {e}{RESET}")
        return False, None

def main():
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}🧪 TESTE DE AUTENTICAÇÃO MOBILE{RESET}")
    print(f"{INFO}{'='*80}{RESET}")
    
    # Teste 1: Login JSON
    success_json, data_json = test_login_json()
    
    # Teste 2: Login Form (comparação)
    success_form, data_form = test_login_form()
    
    # Teste 3: Refresh Token (se login funcionou)
    if success_json and data_json:
        refresh_token = data_json.get("refresh_token")
        if refresh_token:
            test_refresh_json(refresh_token)
    
    # Resumo
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}📊 RESUMO{RESET}")
    print(f"{INFO}{'='*80}{RESET}")
    print(f"Login JSON: {'✅ OK' if success_json else '❌ FALHOU'}")
    print(f"Login Form: {'✅ OK' if success_form else '❌ FALHOU'}")
    
    if not success_json:
        print(f"\n{WARNING}⚠️  PROBLEMAS ENCONTRADOS:{RESET}")
        print(f"{WARNING}1. Verifique se o servidor está rodando{RESET}")
        print(f"{WARNING}2. Verifique se o servidor foi reiniciado após as mudanças{RESET}")
        print(f"{WARNING}3. Verifique os logs do servidor: docker-compose logs backend{RESET}")
        print(f"{WARNING}4. Verifique se o endpoint existe: http://localhost:8000/docs{RESET}")

if __name__ == "__main__":
    main()

