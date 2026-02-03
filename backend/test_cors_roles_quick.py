#!/usr/bin/env python3
"""
Teste Rápido de CORS com Roles Reais
================================================================================
Este script faz login com usuários reais e testa CORS em endpoints críticos.

ANTES DE EXECUTAR:
1. Certifique-se de que o backend está rodando
2. Certifique-se de que tem usuários criados com diferentes roles
3. Ajuste as credenciais abaixo se necessário

USO:
    python test_cors_roles_quick.py
"""

import requests
import json
from typing import Dict, List, Optional

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"
FRONTEND_ORIGIN = "http://localhost:3000"

# Credenciais de teste (AJUSTE CONFORME SEU AMBIENTE)
TEST_USERS = [
    {
        "role": "SAAS_ADMIN",
        "email": "admin@belezalatina.com",
        "password": "Admin@123",  # AJUSTE AQUI
        "description": "SaaS Admin Global"
    },
    {
        "role": "COMPANY_OWNER",
        "email": "owner@teste.com",  # AJUSTE AQUI
        "password": "senha123",  # AJUSTE AQUI
        "description": "Dono da Empresa"
    },
    {
        "role": "COMPANY_PROFESSIONAL",
        "email": "professional@teste.com",  # AJUSTE AQUI
        "password": "senha123",  # AJUSTE AQUI
        "description": "Profissional"
    },
]

# Endpoints críticos para testar
CRITICAL_ENDPOINTS = [
    {"method": "GET", "path": "/users/me", "description": "Perfil do Usuário"},
    {"method": "GET", "path": "/dashboard/stats", "description": "Dashboard"},
    {"method": "GET", "path": "/appointments", "description": "Agendamentos"},
    {"method": "GET", "path": "/clients", "description": "Clientes"},
    {"method": "GET", "path": "/services", "description": "Serviços"},
    {"method": "GET", "path": "/financial/transactions", "description": "Financeiro"},
    {"method": "GET", "path": "/saas-admin/dashboard", "description": "SaaS Admin (só SAAS_ADMIN)"},
]

# ============================================================================
# CORES
# ============================================================================

class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

# ============================================================================
# FUNÇÕES
# ============================================================================

def print_header(text: str):
    """Print header"""
    print(f"\n{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{text.center(80)}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}\n")

def check_cors_headers(headers: Dict, is_preflight: bool = False) -> tuple:
    """Verifica se headers CORS estão corretos"""
    origin = headers.get("Access-Control-Allow-Origin")
    methods = headers.get("Access-Control-Allow-Methods")
    allow_headers = headers.get("Access-Control-Allow-Headers")
    credentials = headers.get("Access-Control-Allow-Credentials")
    
    # Para requisições normais (POST/GET), só precisa verificar Origin
    # Para OPTIONS (preflight), precisa verificar todos os headers
    if is_preflight:
        is_ok = (
            origin in [FRONTEND_ORIGIN, "*"] and
            methods is not None and
            allow_headers is not None
        )
    else:
        # Requisição normal: só precisa da Origin
        is_ok = origin in [FRONTEND_ORIGIN, "*"]
    
    details = {
        "origin": origin,
        "methods": methods,
        "allow_headers": allow_headers,
        "credentials": credentials
    }
    
    return is_ok, details

def test_login(email: str, password: str) -> Optional[str]:
    """Tenta fazer login e retorna o token"""
    print(f"  {Color.CYAN}→ Fazendo login como {email}...{Color.END}")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": email, "password": password},
            headers={"Origin": FRONTEND_ORIGIN},
            timeout=10
        )
        
        # Verifica CORS no login (requisição normal, não preflight)
        is_cors_ok, cors_details = check_cors_headers(response.headers, is_preflight=False)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            
            if not is_cors_ok:
                print(f"    {Color.RED}❌ Login bem-sucedido MAS CORS bloqueado!{Color.END}")
                print(f"    {Color.YELLOW}Origin retornada: {cors_details['origin']}{Color.END}")
                print(f"    {Color.YELLOW}Origin esperada: {FRONTEND_ORIGIN}{Color.END}")
                return None
            
            print(f"    {Color.GREEN}✅ Login bem-sucedido{Color.END}")
            print(f"    {Color.GREEN}✅ CORS OK (Origin: {cors_details['origin']}){Color.END}")
            return token
        else:
            # Login falhou - verifica se é problema de CORS ou credenciais
            if not is_cors_ok:
                print(f"    {Color.RED}❌ Login falhou E CORS bloqueado!{Color.END}")
                print(f"    {Color.YELLOW}Origin retornada: {cors_details['origin']}{Color.END}")
            else:
                print(f"    {Color.RED}❌ Login falhou: {response.status_code}{Color.END}")
                print(f"    {Color.GREEN}✅ CORS OK{Color.END}")
                print(f"    {Color.YELLOW}Verifique credenciais ou se usuário existe{Color.END}")
            
            print(f"    {Color.YELLOW}Resposta: {response.text[:200]}{Color.END}")
            return None
            
    except Exception as e:
        print(f"    {Color.RED}❌ Erro: {str(e)}{Color.END}")
        return None

def test_endpoint(endpoint: Dict, token: str, role: str) -> Dict:
    """Testa um endpoint e verifica CORS"""
    url = f"{API_URL}{endpoint['path']}"
    method = endpoint['method']
    description = endpoint['description']
    
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Primeiro testa OPTIONS (preflight)
        print(f"\n  {Color.CYAN}→ {description}{Color.END}")
        print(f"    Endpoint: {method} {endpoint['path']}")
        
        # Preflight
        print(f"    {Color.MAGENTA}Testing PREFLIGHT (OPTIONS)...{Color.END}")
        options_headers = {
            "Origin": FRONTEND_ORIGIN,
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "Content-Type, Authorization",
        }
        
        options_response = requests.options(url, headers=options_headers, timeout=5)
        is_preflight_ok, preflight_details = check_cors_headers(options_response.headers, is_preflight=True)
        
        if not is_preflight_ok:
            print(f"      {Color.RED}❌ PREFLIGHT BLOQUEADO!{Color.END}")
            print(f"      {Color.YELLOW}Origin: {preflight_details['origin']}{Color.END}")
            print(f"      {Color.YELLOW}Methods: {preflight_details['methods']}{Color.END}")
            return {
                "endpoint": endpoint['path'],
                "role": role,
                "preflight_ok": False,
                "request_ok": False,
                "cors_blocked": True,
                "status": options_response.status_code
            }
        else:
            print(f"      {Color.GREEN}✅ PREFLIGHT OK{Color.END}")
        
        # Request real
        print(f"    {Color.MAGENTA}Testing {method} request...{Color.END}")
        
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, json={}, timeout=5)
        else:
            response = requests.request(method, url, headers=headers, timeout=5)
        
        is_cors_ok, cors_details = check_cors_headers(response.headers, is_preflight=False)
        
        if not is_cors_ok:
            print(f"      {Color.RED}❌ CORS BLOQUEADO NA RESPOSTA!{Color.END}")
            print(f"      {Color.YELLOW}Origin: {cors_details['origin']}{Color.END}")
            return {
                "endpoint": endpoint['path'],
                "role": role,
                "preflight_ok": True,
                "request_ok": False,
                "cors_blocked": True,
                "status": response.status_code
            }
        
        if response.status_code == 403:
            print(f"      {Color.YELLOW}⚠️ Status: 403 (sem permissão para role {role}){Color.END}")
            print(f"      {Color.GREEN}✅ CORS OK (mas sem permissão){Color.END}")
            return {
                "endpoint": endpoint['path'],
                "role": role,
                "preflight_ok": True,
                "request_ok": False,
                "cors_blocked": False,
                "status": 403,
                "permission_denied": True
            }
        elif 200 <= response.status_code < 300:
            print(f"      {Color.GREEN}✅ Status: {response.status_code}{Color.END}")
            print(f"      {Color.GREEN}✅ CORS OK{Color.END}")
            return {
                "endpoint": endpoint['path'],
                "role": role,
                "preflight_ok": True,
                "request_ok": True,
                "cors_blocked": False,
                "status": response.status_code
            }
        else:
            print(f"      {Color.YELLOW}⚠️ Status: {response.status_code}{Color.END}")
            print(f"      {Color.GREEN}✅ CORS OK (mas erro HTTP){Color.END}")
            return {
                "endpoint": endpoint['path'],
                "role": role,
                "preflight_ok": True,
                "request_ok": False,
                "cors_blocked": False,
                "status": response.status_code
            }
            
    except requests.exceptions.ConnectionError:
        print(f"      {Color.RED}❌ Erro de conexão - Backend offline?{Color.END}")
        return {
            "endpoint": endpoint['path'],
            "role": role,
            "preflight_ok": False,
            "request_ok": False,
            "cors_blocked": False,
            "status": 0,
            "connection_error": True
        }
    except Exception as e:
        print(f"      {Color.RED}❌ Erro: {str(e)}{Color.END}")
        return {
            "endpoint": endpoint['path'],
            "role": role,
            "preflight_ok": False,
            "request_ok": False,
            "cors_blocked": False,
            "status": 0,
            "error": str(e)
        }

def main():
    """Função principal"""
    
    print_header("TESTE RÁPIDO DE CORS POR ROLE")
    
    print(f"{Color.BOLD}Configurações:{Color.END}")
    print(f"  Base URL: {BASE_URL}")
    print(f"  Frontend Origin: {FRONTEND_ORIGIN}")
    print(f"  Roles a testar: {len(TEST_USERS)}")
    print(f"  Endpoints a testar: {len(CRITICAL_ENDPOINTS)}")
    
    # Teste de conectividade
    print(f"\n{Color.BOLD}Testando conectividade...{Color.END}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"  {Color.GREEN}✅ Backend está online{Color.END}")
        else:
            print(f"  {Color.RED}❌ Backend retornou status {response.status_code}{Color.END}")
            return
    except Exception as e:
        print(f"  {Color.RED}❌ Backend offline: {e}{Color.END}")
        print(f"  {Color.YELLOW}Certifique-se de que o backend está rodando{Color.END}")
        return
    
    # Testa cada usuário
    all_results = []
    
    for user in TEST_USERS:
        print_header(f"TESTANDO ROLE: {user['role']} ({user['description']})")
        
        # Login
        token = test_login(user['email'], user['password'])
        
        if not token:
            print(f"\n{Color.RED}❌ Não foi possível fazer login. Pulando testes para esta role.{Color.END}")
            print(f"{Color.YELLOW}Verifique se o usuário existe e a senha está correta.{Color.END}")
            continue
        
        # Testa endpoints
        print(f"\n{Color.BOLD}Testando endpoints:{Color.END}")
        
        for endpoint in CRITICAL_ENDPOINTS:
            result = test_endpoint(endpoint, token, user['role'])
            result['user_email'] = user['email']
            all_results.append(result)
    
    # Resumo final
    print_header("RESUMO FINAL")
    
    # Agrupa por role
    by_role = {}
    for result in all_results:
        role = result['role']
        if role not in by_role:
            by_role[role] = {
                "total": 0,
                "cors_blocked": 0,
                "permission_denied": 0,
                "success": 0,
                "other_errors": 0,
                "blocked_endpoints": []
            }
        
        by_role[role]["total"] += 1
        
        if result.get("cors_blocked"):
            by_role[role]["cors_blocked"] += 1
            by_role[role]["blocked_endpoints"].append(result['endpoint'])
        elif result.get("permission_denied"):
            by_role[role]["permission_denied"] += 1
        elif result.get("request_ok"):
            by_role[role]["success"] += 1
        else:
            by_role[role]["other_errors"] += 1
    
    # Print resumo por role
    for role, stats in by_role.items():
        print(f"\n{Color.BOLD}{Color.CYAN}Role: {role}{Color.END}")
        print(f"  Total testado: {stats['total']}")
        print(f"  {Color.GREEN}✅ Sucesso: {stats['success']}{Color.END}")
        print(f"  {Color.RED}❌ CORS Bloqueado: {stats['cors_blocked']}{Color.END}")
        print(f"  {Color.YELLOW}🔒 Sem Permissão: {stats['permission_denied']}{Color.END}")
        print(f"  {Color.YELLOW}⚠️ Outros Erros: {stats['other_errors']}{Color.END}")
        
        if stats['blocked_endpoints']:
            print(f"  {Color.RED}Endpoints bloqueados por CORS:{Color.END}")
            for ep in stats['blocked_endpoints']:
                print(f"    - {ep}")
    
    # Conclusão
    total_cors_blocked = sum(stats['cors_blocked'] for stats in by_role.values())
    
    print(f"\n{Color.BOLD}{'='*80}{Color.END}")
    
    if total_cors_blocked > 0:
        print(f"{Color.RED}{Color.BOLD}⚠️ ENCONTRADOS {total_cors_blocked} BLOQUEIOS DE CORS!{Color.END}")
        print(f"\n{Color.YELLOW}Verifique as configurações CORS em:{Color.END}")
        print(f"  - backend/app/main.py (CORS Middleware)")
        print(f"  - backend/app/core/config.py (CORS_ORIGIN, CORS_ALLOW_ALL)")
        print(f"  - Variável de ambiente CORS_ORIGIN no .env")
    else:
        print(f"{Color.GREEN}{Color.BOLD}✅ NENHUM BLOQUEIO DE CORS DETECTADO!{Color.END}")
        print(f"{Color.GREEN}Todos os endpoints testados estão com CORS configurado corretamente.{Color.END}")
    
    print(f"{Color.BOLD}{'='*80}{Color.END}\n")

if __name__ == "__main__":
    main()


