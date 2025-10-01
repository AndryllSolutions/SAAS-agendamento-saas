"""
Script para testar todas as rotas do backend
"""
import requests
import json
from colorama import init, Fore, Style

init()

BASE_URL = "http://localhost:8000"

# Cores
SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

def print_result(method, endpoint, status_code, expected_codes, response_time):
    """Imprime resultado do teste"""
    success = status_code in expected_codes
    color = SUCCESS if success else ERROR
    icon = "✅" if success else "❌"
    
    print(f"{icon} {color}{method:6} {endpoint:50} {status_code} ({response_time:.2f}s){RESET}")
    return success

def test_endpoint(method, endpoint, expected_codes=[200, 201], headers=None, data=None, json_data=None):
    """Testa um endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, data=data, json=json_data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json_data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return False
        
        return print_result(method, endpoint, response.status_code, expected_codes, response.elapsed.total_seconds())
    except Exception as e:
        print(f"❌ {ERROR}{method:6} {endpoint:50} ERROR: {str(e)}{RESET}")
        return False

def main():
    print("\n" + "="*80)
    print(f"{INFO}🧪 TESTE COMPLETO DE ROTAS - BACKEND{RESET}")
    print("="*80 + "\n")
    
    results = {
        "total": 0,
        "success": 0,
        "failed": 0
    }
    
    # Login para obter token
    print(f"\n{INFO}📝 1. AUTENTICAÇÃO{RESET}")
    print("-" * 80)
    
    login_data = {
        "username": "admin@demo.com",
        "password": "demo123",
        "grant_type": "password"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", data=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print(f"{SUCCESS}✅ Login realizado com sucesso!{RESET}")
        else:
            print(f"{ERROR}❌ Falha no login! Status: {response.status_code}{RESET}")
            headers = {}
    except Exception as e:
        print(f"{ERROR}❌ Erro ao fazer login: {e}{RESET}")
        headers = {}
    
    # Testes de Autenticação
    tests = [
        ("POST", "/api/v1/auth/login", [200], None, login_data, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Usuários
    print(f"\n{INFO}👥 2. USUÁRIOS{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/users", [200], headers, None, None),
        ("GET", "/api/v1/users/me", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Serviços
    print(f"\n{INFO}💼 3. SERVIÇOS{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/services", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Agendamentos
    print(f"\n{INFO}📅 4. AGENDAMENTOS{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/appointments", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Profissionais
    print(f"\n{INFO}👨‍💼 5. PROFISSIONAIS{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/professionals", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Dashboard
    print(f"\n{INFO}📊 6. DASHBOARD{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/dashboard/overview", [200], headers, None, None),
        ("GET", "/api/v1/dashboard/top-services", [200], headers, None, None),
        ("GET", "/api/v1/dashboard/top-professionals", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Pagamentos
    print(f"\n{INFO}💰 7. PAGAMENTOS{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/payments", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Avaliações
    print(f"\n{INFO}⭐ 8. AVALIAÇÕES{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/reviews", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Testes de Notificações
    print(f"\n{INFO}🔔 9. NOTIFICAÇÕES{RESET}")
    print("-" * 80)
    
    tests = [
        ("GET", "/api/v1/notifications", [200], headers, None, None),
    ]
    
    for method, endpoint, expected, hdrs, data, json_data in tests:
        results["total"] += 1
        if test_endpoint(method, endpoint, expected, hdrs, data, json_data):
            results["success"] += 1
        else:
            results["failed"] += 1
    
    # Resumo
    print("\n" + "="*80)
    print(f"{INFO}📊 RESUMO DOS TESTES{RESET}")
    print("="*80)
    print(f"\nTotal de testes: {results['total']}")
    print(f"{SUCCESS}✅ Sucesso: {results['success']}{RESET}")
    print(f"{ERROR}❌ Falhas: {results['failed']}{RESET}")
    
    success_rate = (results['success'] / results['total']) * 100 if results['total'] > 0 else 0
    print(f"\n{INFO}Taxa de sucesso: {success_rate:.1f}%{RESET}")
    
    if success_rate >= 90:
        print(f"\n{SUCCESS}🎉 EXCELENTE! Sistema funcionando perfeitamente!{RESET}")
    elif success_rate >= 70:
        print(f"\n{WARNING}⚠️  BOM! Alguns endpoints com problemas.{RESET}")
    else:
        print(f"\n{ERROR}❌ ATENÇÃO! Muitos endpoints com falhas!{RESET}")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
