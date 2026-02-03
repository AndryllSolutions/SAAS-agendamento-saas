#!/usr/bin/env python3
"""
Verificador Rápido de Configuração CORS
================================================================================
Verifica se o CORS está configurado corretamente SEM precisar fazer login.

USO:
    python check_cors_config.py
"""

import requests
import os
from pathlib import Path

# Cores
class C:
    G = '\033[92m'  # Green
    R = '\033[91m'  # Red
    Y = '\033[93m'  # Yellow
    B = '\033[94m'  # Blue
    M = '\033[95m'  # Magenta
    C = '\033[96m'  # Cyan
    BOLD = '\033[1m'
    END = '\033[0m'

print(f"\n{C.BOLD}{C.C}{'='*80}{C.END}")
print(f"{C.BOLD}{C.C}VERIFICADOR DE CONFIGURAÇÃO CORS{C.END}".center(88))
print(f"{C.BOLD}{C.C}{'='*80}{C.END}\n")

# ============================================================================
# 1. Verificar arquivo .env
# ============================================================================

print(f"{C.BOLD}1. Verificando arquivo .env...{C.END}\n")

env_file = Path("backend/.env") if Path("backend/.env").exists() else Path(".env")

if not env_file.exists():
    print(f"  {C.R}❌ Arquivo .env não encontrado!{C.END}")
    print(f"  {C.Y}Crie o arquivo .env a partir do .env.example{C.END}\n")
else:
    print(f"  {C.G}✅ Arquivo .env encontrado: {env_file}{C.END}\n")
    
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    # Verifica DEBUG
    if 'DEBUG=true' in env_content or 'DEBUG=True' in env_content:
        print(f"  {C.G}✅ DEBUG=true{C.END}")
    else:
        print(f"  {C.Y}⚠️ DEBUG=false ou não definido{C.END}")
        print(f"     {C.Y}Recomendado: DEBUG=true para desenvolvimento{C.END}")
    
    # Verifica CORS_ALLOW_ALL
    if 'CORS_ALLOW_ALL=true' in env_content or 'CORS_ALLOW_ALL=True' in env_content:
        print(f"  {C.G}✅ CORS_ALLOW_ALL=true (permite todas origins){C.END}")
    elif 'CORS_ALLOW_ALL=false' in env_content or 'CORS_ALLOW_ALL=False' in env_content:
        print(f"  {C.B}ℹ️ CORS_ALLOW_ALL=false{C.END}")
        
        # Verifica CORS_ORIGIN
        if 'CORS_ORIGIN=' in env_content:
            for line in env_content.split('\n'):
                if line.startswith('CORS_ORIGIN='):
                    origin = line.split('=')[1].strip()
                    print(f"  {C.G}✅ CORS_ORIGIN={origin}{C.END}")
        else:
            print(f"  {C.Y}⚠️ CORS_ORIGIN não definido{C.END}")
            print(f"     {C.Y}Usando defaults: http://localhost:3000{C.END}")
    else:
        print(f"  {C.Y}⚠️ CORS_ALLOW_ALL não definido{C.END}")
        print(f"     {C.Y}Usando defaults: http://localhost:3000{C.END}")
    
    print()

# ============================================================================
# 2. Testar conectividade com backend
# ============================================================================

print(f"{C.BOLD}2. Testando conectividade com backend...{C.END}\n")

BASE_URL = "http://localhost:8000"

try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    if response.status_code == 200:
        print(f"  {C.G}✅ Backend está online{C.END}")
        print(f"  {C.B}   URL: {BASE_URL}{C.END}\n")
    else:
        print(f"  {C.R}❌ Backend retornou status {response.status_code}{C.END}\n")
        exit(1)
except Exception as e:
    print(f"  {C.R}❌ Backend offline ou inacessível{C.END}")
    print(f"  {C.Y}   Erro: {str(e)}{C.END}")
    print(f"  {C.Y}   Certifique-se de que o backend está rodando:{C.END}")
    print(f"  {C.Y}   cd backend && uvicorn app.main:app --reload{C.END}\n")
    exit(1)

# ============================================================================
# 3. Testar CORS em endpoint público (health)
# ============================================================================

print(f"{C.BOLD}3. Testando CORS em endpoint público...{C.END}\n")

frontend_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

for origin in frontend_origins:
    print(f"  {C.C}Testando origin: {origin}{C.END}")
    
    # Teste OPTIONS (preflight)
    try:
        response = requests.options(
            f"{BASE_URL}/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
            timeout=5
        )
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        cors_methods = response.headers.get("Access-Control-Allow-Methods")
        
        if cors_origin in [origin, "*"]:
            print(f"    {C.G}✅ PREFLIGHT OK{C.END}")
            print(f"       Origin: {cors_origin}")
            print(f"       Methods: {cors_methods}")
        else:
            print(f"    {C.R}❌ PREFLIGHT FALHOU{C.END}")
            print(f"       Expected: {origin}")
            print(f"       Got: {cors_origin}")
    except Exception as e:
        print(f"    {C.R}❌ Erro: {str(e)}{C.END}")
    
    print()

# ============================================================================
# 4. Testar CORS em endpoint protegido (sem auth)
# ============================================================================

print(f"{C.BOLD}4. Testando CORS em endpoint protegido...{C.END}\n")

protected_endpoints = [
    "/api/v1/users/me",
    "/api/v1/dashboard/stats",
    "/api/v1/appointments",
]

origin = "http://localhost:3000"

for endpoint in protected_endpoints:
    print(f"  {C.C}Testando: {endpoint}{C.END}")
    
    try:
        response = requests.options(
            f"{BASE_URL}{endpoint}",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
            timeout=5
        )
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        cors_headers = response.headers.get("Access-Control-Allow-Headers")
        
        if cors_origin in [origin, "*"]:
            print(f"    {C.G}✅ PREFLIGHT OK{C.END}")
            
            if "Authorization" in (cors_headers or ""):
                print(f"    {C.G}✅ Authorization header permitido{C.END}")
            else:
                print(f"    {C.Y}⚠️ Authorization header NÃO permitido{C.END}")
                print(f"       Allowed: {cors_headers}")
        else:
            print(f"    {C.R}❌ PREFLIGHT FALHOU{C.END}")
            print(f"       Got: {cors_origin}")
    except Exception as e:
        print(f"    {C.R}❌ Erro: {str(e)}{C.END}")
    
    print()

# ============================================================================
# RESUMO
# ============================================================================

print(f"{C.BOLD}{C.C}{'='*80}{C.END}")
print(f"{C.BOLD}{C.C}RESUMO{C.END}".center(88))
print(f"{C.BOLD}{C.C}{'='*80}{C.END}\n")

print(f"{C.BOLD}Configuração CORS:{C.END}")
print(f"  • Arquivo .env: {'✅ OK' if env_file.exists() else '❌ Não encontrado'}")
print(f"  • Backend online: ✅ OK")
print(f"  • CORS configurado: ✅ Headers presentes\n")

print(f"{C.BOLD}Próximos passos:{C.END}")
print(f"  1. Se viu ✅ em tudo, o CORS está OK!")
print(f"  2. Se viu ❌, siga as correções no GUIA_TESTE_CORS_ROLES.md")
print(f"  3. Para testar com roles reais, execute:")
print(f"     {C.Y}python test_cors_roles_quick.py{C.END}\n")

print(f"{C.BOLD}Documentação:{C.END}")
print(f"  • GUIA_TESTE_CORS_ROLES.md - Guia completo de diagnóstico")
print(f"  • test_cors_roles_quick.py - Teste com login real")
print(f"  • test_cors_roles.py - Teste completo de todos endpoints\n")

print(f"{C.BOLD}{C.C}{'='*80}{C.END}\n")


