#!/usr/bin/env python3
"""
Script de Teste de CORS por ROLE
================================================================================
Testa CORS em todos os endpoints para cada role do sistema e identifica bloqueios.

Uso:
    python test_cors_roles.py

Roles Testadas:
    - SAAS_OWNER (SaaS Admin Global)
    - SAAS_STAFF (SaaS Staff Global)
    - COMPANY_OWNER (Dono da Empresa)
    - COMPANY_MANAGER (Gerente)
    - COMPANY_PROFESSIONAL (Profissional)
    - COMPANY_RECEPTIONIST (Recepcionista)
    - COMPANY_FINANCE (Financeiro)
    - COMPANY_CLIENT (Cliente)
    - COMPANY_READ_ONLY (Somente Leitura)
"""

import requests
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import sys
from datetime import datetime

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

# Simular origem do frontend
FRONTEND_ORIGIN = "http://localhost:3000"

# Cores para output
class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

# ============================================================================
# ROLES DO SISTEMA
# ============================================================================

class SaaSRole(str, Enum):
    SAAS_OWNER = "SAAS_OWNER"
    SAAS_STAFF = "SAAS_STAFF"

class CompanyRole(str, Enum):
    COMPANY_OWNER = "COMPANY_OWNER"
    COMPANY_MANAGER = "COMPANY_MANAGER"
    COMPANY_OPERATOR = "COMPANY_OPERATOR"
    COMPANY_PROFESSIONAL = "COMPANY_PROFESSIONAL"
    COMPANY_RECEPTIONIST = "COMPANY_RECEPTIONIST"
    COMPANY_FINANCE = "COMPANY_FINANCE"
    COMPANY_CLIENT = "COMPANY_CLIENT"
    COMPANY_READ_ONLY = "COMPANY_READ_ONLY"

# ============================================================================
# ENDPOINTS PARA TESTAR
# ============================================================================

ENDPOINTS_TO_TEST = [
    # Auth (público)
    {"method": "POST", "path": "/auth/login", "requires_auth": False, "description": "Login"},
    {"method": "POST", "path": "/auth/register", "requires_auth": False, "description": "Registro"},
    
    # Dashboard
    {"method": "GET", "path": "/dashboard/stats", "requires_auth": True, "description": "Dashboard Stats"},
    
    # Users
    {"method": "GET", "path": "/users/me", "requires_auth": True, "description": "Perfil do Usuário"},
    {"method": "GET", "path": "/users", "requires_auth": True, "description": "Lista Usuários"},
    
    # Companies
    {"method": "GET", "path": "/companies", "requires_auth": True, "description": "Lista Empresas"},
    
    # Services
    {"method": "GET", "path": "/services", "requires_auth": True, "description": "Lista Serviços"},
    
    # Appointments
    {"method": "GET", "path": "/appointments", "requires_auth": True, "description": "Lista Agendamentos"},
    
    # Clients
    {"method": "GET", "path": "/clients", "requires_auth": True, "description": "Lista Clientes"},
    
    # Products
    {"method": "GET", "path": "/products", "requires_auth": True, "description": "Lista Produtos"},
    
    # Financial
    {"method": "GET", "path": "/financial/transactions", "requires_auth": True, "description": "Transações Financeiras"},
    {"method": "GET", "path": "/financial/accounts", "requires_auth": True, "description": "Contas Financeiras"},
    
    # Commands
    {"method": "GET", "path": "/commands", "requires_auth": True, "description": "Lista Comandas"},
    
    # Commissions
    {"method": "GET", "path": "/commissions", "requires_auth": True, "description": "Lista Comissões"},
    
    # Notifications
    {"method": "GET", "path": "/notifications", "requires_auth": True, "description": "Lista Notificações"},
    
    # SaaS Admin (SAAS_OWNER only)
    {"method": "GET", "path": "/saas-admin/dashboard", "requires_auth": True, "description": "SaaS Admin Dashboard"},
    {"method": "GET", "path": "/saas-admin/companies", "requires_auth": True, "description": "SaaS Admin Companies"},
]

# ============================================================================
# DATACLASSES
# ============================================================================

@dataclass
class CORSTestResult:
    endpoint: str
    method: str
    role: str
    status_code: int
    has_cors_headers: bool
    cors_headers: Dict[str, str]
    cors_origin: Optional[str]
    cors_methods: Optional[str]
    cors_headers_allowed: Optional[str]
    cors_credentials: Optional[str]
    is_cors_blocked: bool
    error_message: Optional[str]
    response_time_ms: float

@dataclass
class RoleTestSummary:
    role: str
    total_endpoints: int
    successful: int
    cors_blocked: int
    other_errors: int
    blocked_endpoints: List[str]

# ============================================================================
# FUNÇÕES DE TESTE
# ============================================================================

def print_header(text: str):
    """Print header formatado"""
    print(f"\n{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{text.center(80)}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}\n")

def print_subheader(text: str):
    """Print subheader formatado"""
    print(f"\n{Color.BOLD}{Color.BLUE}{'-'*80}{Color.END}")
    print(f"{Color.BOLD}{Color.BLUE}{text}{Color.END}")
    print(f"{Color.BOLD}{Color.BLUE}{'-'*80}{Color.END}")

def test_cors_preflight(url: str, method: str) -> CORSTestResult:
    """
    Testa requisição OPTIONS (preflight) para verificar CORS
    """
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Access-Control-Request-Method": method,
        "Access-Control-Request-Headers": "Content-Type, Authorization",
    }
    
    start_time = datetime.now()
    
    try:
        response = requests.options(url, headers=headers, timeout=5)
        
        end_time = datetime.now()
        response_time_ms = (end_time - start_time).total_seconds() * 1000
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
            "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
            "Access-Control-Max-Age": response.headers.get("Access-Control-Max-Age"),
        }
        
        has_cors_headers = any(v is not None for v in cors_headers.values())
        
        # Verifica se CORS está bloqueado
        is_cors_blocked = False
        error_message = None
        
        if not has_cors_headers:
            is_cors_blocked = True
            error_message = "CORS headers não retornados"
        elif cors_headers["Access-Control-Allow-Origin"] not in [FRONTEND_ORIGIN, "*"]:
            is_cors_blocked = True
            error_message = f"Origin não permitida: {cors_headers['Access-Control-Allow-Origin']}"
        elif method not in (cors_headers.get("Access-Control-Allow-Methods", "")):
            is_cors_blocked = True
            error_message = f"Method {method} não permitido"
        
        return CORSTestResult(
            endpoint=url,
            method="OPTIONS",
            role="PREFLIGHT",
            status_code=response.status_code,
            has_cors_headers=has_cors_headers,
            cors_headers=cors_headers,
            cors_origin=cors_headers.get("Access-Control-Allow-Origin"),
            cors_methods=cors_headers.get("Access-Control-Allow-Methods"),
            cors_headers_allowed=cors_headers.get("Access-Control-Allow-Headers"),
            cors_credentials=cors_headers.get("Access-Control-Allow-Credentials"),
            is_cors_blocked=is_cors_blocked,
            error_message=error_message,
            response_time_ms=response_time_ms
        )
        
    except Exception as e:
        return CORSTestResult(
            endpoint=url,
            method="OPTIONS",
            role="PREFLIGHT",
            status_code=0,
            has_cors_headers=False,
            cors_headers={},
            cors_origin=None,
            cors_methods=None,
            cors_headers_allowed=None,
            cors_credentials=None,
            is_cors_blocked=True,
            error_message=f"Erro na requisição: {str(e)}",
            response_time_ms=0
        )

def test_endpoint_with_role(
    endpoint: Dict,
    token: Optional[str] = None,
    role: str = "PUBLIC"
) -> CORSTestResult:
    """
    Testa um endpoint específico com uma role
    """
    url = f"{API_URL}{endpoint['path']}"
    method = endpoint['method']
    
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Content-Type": "application/json",
    }
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    start_time = datetime.now()
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=headers, json={}, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json={}, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            response = requests.get(url, headers=headers, timeout=5)
        
        end_time = datetime.now()
        response_time_ms = (end_time - start_time).total_seconds() * 1000
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
            "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
        }
        
        has_cors_headers = any(v is not None for v in cors_headers.values())
        
        # Verifica se CORS está bloqueado
        is_cors_blocked = False
        error_message = None
        
        if not has_cors_headers:
            is_cors_blocked = True
            error_message = "CORS headers não retornados na resposta"
        elif cors_headers["Access-Control-Allow-Origin"] not in [FRONTEND_ORIGIN, "*"]:
            is_cors_blocked = True
            error_message = f"Origin não permitida: {cors_headers['Access-Control-Allow-Origin']}"
        
        # Se recebeu 403, pode ser problema de permissão, não CORS
        if response.status_code == 403:
            error_message = f"Acesso negado (403) - Possível problema de permissão da role {role}"
        
        return CORSTestResult(
            endpoint=url,
            method=method,
            role=role,
            status_code=response.status_code,
            has_cors_headers=has_cors_headers,
            cors_headers=cors_headers,
            cors_origin=cors_headers.get("Access-Control-Allow-Origin"),
            cors_methods=cors_headers.get("Access-Control-Allow-Methods"),
            cors_headers_allowed=cors_headers.get("Access-Control-Allow-Headers"),
            cors_credentials=cors_headers.get("Access-Control-Allow-Credentials"),
            is_cors_blocked=is_cors_blocked,
            error_message=error_message,
            response_time_ms=response_time_ms
        )
        
    except Exception as e:
        return CORSTestResult(
            endpoint=url,
            method=method,
            role=role,
            status_code=0,
            has_cors_headers=False,
            cors_headers={},
            cors_origin=None,
            cors_methods=None,
            cors_headers_allowed=None,
            cors_credentials=None,
            is_cors_blocked=True,
            error_message=f"Erro na requisição: {str(e)}",
            response_time_ms=0
        )

def print_test_result(result: CORSTestResult):
    """Print resultado do teste formatado"""
    
    # Ícone de status
    if result.is_cors_blocked:
        status_icon = f"{Color.RED}❌ BLOQUEADO{Color.END}"
    elif result.status_code >= 200 and result.status_code < 300:
        status_icon = f"{Color.GREEN}✅ OK{Color.END}"
    elif result.status_code == 403:
        status_icon = f"{Color.YELLOW}🔒 PERMISSÃO{Color.END}"
    elif result.status_code >= 400:
        status_icon = f"{Color.YELLOW}⚠️ ERRO{Color.END}"
    else:
        status_icon = f"{Color.RED}❌ ERRO{Color.END}"
    
    print(f"{status_icon} {Color.BOLD}{result.method:7}{Color.END} {result.endpoint}")
    print(f"   Status: {result.status_code} | Tempo: {result.response_time_ms:.0f}ms")
    
    if result.has_cors_headers:
        print(f"   {Color.GREEN}✓ CORS Headers presentes:{Color.END}")
        print(f"     Origin: {result.cors_origin}")
        print(f"     Methods: {result.cors_methods}")
        print(f"     Credentials: {result.cors_credentials}")
    else:
        print(f"   {Color.RED}✗ CORS Headers ausentes!{Color.END}")
    
    if result.error_message:
        print(f"   {Color.RED}Erro: {result.error_message}{Color.END}")
    
    print()

def test_role_endpoints(role: str, token: Optional[str] = None) -> RoleTestSummary:
    """
    Testa todos endpoints para uma role específica
    """
    print_subheader(f"Testando Role: {role}")
    
    results = []
    blocked_endpoints = []
    
    for endpoint in ENDPOINTS_TO_TEST:
        # Se requer auth e não tem token, pula
        if endpoint['requires_auth'] and not token:
            continue
        
        print(f"\n{Color.CYAN}→ Testando: {endpoint['description']}{Color.END}")
        
        # Teste PREFLIGHT (OPTIONS)
        preflight_result = test_cors_preflight(
            f"{API_URL}{endpoint['path']}",
            endpoint['method']
        )
        print(f"  {Color.MAGENTA}PREFLIGHT:{Color.END}")
        print_test_result(preflight_result)
        
        # Teste real
        result = test_endpoint_with_role(endpoint, token, role)
        print(f"  {Color.MAGENTA}REQUEST:{Color.END}")
        print_test_result(result)
        
        results.append(result)
        
        if result.is_cors_blocked:
            blocked_endpoints.append(endpoint['path'])
    
    # Resumo
    total = len(results)
    successful = sum(1 for r in results if not r.is_cors_blocked and r.status_code < 400)
    cors_blocked = sum(1 for r in results if r.is_cors_blocked)
    other_errors = sum(1 for r in results if not r.is_cors_blocked and r.status_code >= 400)
    
    return RoleTestSummary(
        role=role,
        total_endpoints=total,
        successful=successful,
        cors_blocked=cors_blocked,
        other_errors=other_errors,
        blocked_endpoints=blocked_endpoints
    )

def print_summary(summaries: List[RoleTestSummary]):
    """Print resumo final"""
    print_header("RESUMO FINAL - TESTE CORS POR ROLE")
    
    for summary in summaries:
        print(f"\n{Color.BOLD}{Color.CYAN}Role: {summary.role}{Color.END}")
        print(f"  Total de endpoints testados: {summary.total_endpoints}")
        print(f"  {Color.GREEN}✅ Sucesso: {summary.successful}{Color.END}")
        print(f"  {Color.RED}❌ Bloqueados por CORS: {summary.cors_blocked}{Color.END}")
        print(f"  {Color.YELLOW}⚠️ Outros erros: {summary.other_errors}{Color.END}")
        
        if summary.blocked_endpoints:
            print(f"  {Color.RED}Endpoints bloqueados:{Color.END}")
            for endpoint in summary.blocked_endpoints:
                print(f"    - {endpoint}")
    
    # Estatísticas gerais
    total_cors_blocked = sum(s.cors_blocked for s in summaries)
    total_tests = sum(s.total_endpoints for s in summaries)
    
    print(f"\n{Color.BOLD}{Color.YELLOW}ESTATÍSTICAS GERAIS:{Color.END}")
    print(f"  Total de testes: {total_tests}")
    print(f"  Total bloqueados por CORS: {total_cors_blocked}")
    print(f"  Taxa de bloqueio: {(total_cors_blocked/total_tests*100) if total_tests > 0 else 0:.1f}%")

def get_mock_token(role: str) -> str:
    """
    Gera um token mock para teste
    NOTA: Em produção, você deve fazer login real para cada role
    """
    # Para testes reais, faça login com credenciais reais
    # Aqui retornamos um token vazio como exemplo
    return "mock_token_" + role

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Função principal"""
    
    print_header("TESTE DE CORS POR ROLE - SAAS AGENDAMENTO")
    
    print(f"{Color.BOLD}Configurações:{Color.END}")
    print(f"  Base URL: {BASE_URL}")
    print(f"  API URL: {API_URL}")
    print(f"  Frontend Origin: {FRONTEND_ORIGIN}")
    print(f"  Total de Endpoints: {len(ENDPOINTS_TO_TEST)}")
    
    # Teste de conectividade
    print(f"\n{Color.BOLD}Testando conectividade...{Color.END}")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"{Color.GREEN}✅ Backend está online{Color.END}")
        else:
            print(f"{Color.RED}❌ Backend retornou status {response.status_code}{Color.END}")
            sys.exit(1)
    except Exception as e:
        print(f"{Color.RED}❌ Erro ao conectar ao backend: {e}{Color.END}")
        print(f"{Color.YELLOW}Certifique-se de que o backend está rodando em {BASE_URL}{Color.END}")
        sys.exit(1)
    
    summaries = []
    
    # Teste endpoints públicos (sem auth)
    summary = test_role_endpoints("PUBLIC", None)
    summaries.append(summary)
    
    # NOTA: Para testar com roles reais, você precisa:
    # 1. Criar usuários com cada role
    # 2. Fazer login e obter tokens reais
    # 3. Passar os tokens para test_role_endpoints
    
    # Exemplo de como testar com roles reais (descomente e adapte):
    """
    roles_to_test = [
        ("SAAS_OWNER", "admin@example.com", "password"),
        ("COMPANY_OWNER", "owner@company.com", "password"),
        ("COMPANY_MANAGER", "manager@company.com", "password"),
        ("COMPANY_PROFESSIONAL", "professional@company.com", "password"),
    ]
    
    for role, email, password in roles_to_test:
        # Fazer login
        login_response = requests.post(
            f"{API_URL}/auth/login",
            json={"email": email, "password": password}
        )
        
        if login_response.status_code == 200:
            token = login_response.json().get("access_token")
            summary = test_role_endpoints(role, token)
            summaries.append(summary)
        else:
            print(f"{Color.RED}Erro ao fazer login como {role}{Color.END}")
    """
    
    # Print resumo final
    print_summary(summaries)
    
    print(f"\n{Color.BOLD}{Color.GREEN}Teste concluído!{Color.END}\n")
    
    # Retorna código de erro se houver bloqueios
    total_blocked = sum(s.cors_blocked for s in summaries)
    if total_blocked > 0:
        print(f"{Color.RED}⚠️ Encontrados {total_blocked} endpoints bloqueados por CORS{Color.END}")
        sys.exit(1)
    else:
        print(f"{Color.GREEN}✅ Nenhum bloqueio de CORS detectado{Color.END}")
        sys.exit(0)

if __name__ == "__main__":
    main()


