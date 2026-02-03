#!/usr/bin/env python3
"""
Verificador Simples de Configuração CORS (sem dependências externas)
================================================================================
Verifica configuração CORS no .env e arquivos de configuração.

USO:
    python check_cors_simple.py
"""

import os
from pathlib import Path
import sys

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

def print_header(text):
    print(f"\n{C.BOLD}{C.C}{'='*80}{C.END}")
    print(f"{C.BOLD}{C.C}{text.center(80)}{C.END}")
    print(f"{C.BOLD}{C.C}{'='*80}{C.END}\n")

def print_section(text):
    print(f"\n{C.BOLD}{text}{C.END}\n")

print_header("VERIFICADOR DE CONFIGURAÇÃO CORS")

# ============================================================================
# 1. Verificar arquivo .env
# ============================================================================

print_section("1. Verificando arquivo .env")

env_paths = [
    Path(".env"),
    Path("backend/.env"),
    Path("../.env"),
]

env_file = None
for path in env_paths:
    if path.exists():
        env_file = path
        break

if not env_file:
    print(f"{C.R}[X] Arquivo .env não encontrado!{C.END}")
    print(f"{C.Y}   Procurei em: {', '.join(str(p) for p in env_paths)}{C.END}")
    print(f"{C.Y}   Crie o arquivo .env a partir do .env.example{C.END}\n")
    sys.exit(1)
else:
    print(f"{C.G}[OK] Arquivo .env encontrado: {env_file}{C.END}\n", flush=True)

# Lê .env
with open(env_file, 'r', encoding='utf-8') as f:
    env_content = f.read()

env_vars = {}
for line in env_content.split('\n'):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        key, value = line.split('=', 1)
        env_vars[key.strip()] = value.strip()

# Verifica variáveis CORS
print(f"{C.BOLD}Variáveis de Ambiente CORS:{C.END}\n")

# DEBUG
debug_value = env_vars.get('DEBUG', 'false').lower()
if debug_value == 'true':
    print(f"  {C.G}[OK] DEBUG=true{C.END}")
    print(f"     {C.B}Logs de CORS serao exibidos no backend{C.END}")
else:
    print(f"  {C.Y}[!] DEBUG={debug_value}{C.END}")
    print(f"     {C.Y}Recomendado: DEBUG=true para ver logs CORS{C.END}")

# CORS_ALLOW_ALL
cors_allow_all = env_vars.get('CORS_ALLOW_ALL', 'false').lower()
if cors_allow_all == 'true':
    print(f"  {C.G}[OK] CORS_ALLOW_ALL=true{C.END}")
    print(f"     {C.G}Todas origins sao permitidas (desenvolvimento){C.END}")
    print(f"     {C.Y}[!] NUNCA use isso em producao!{C.END}")
else:
    print(f"  {C.B}[i] CORS_ALLOW_ALL=false{C.END}")
    print(f"     {C.B}Origins especificas serao usadas{C.END}")

# CORS_ORIGIN
cors_origin = env_vars.get('CORS_ORIGIN')
if cors_origin:
    print(f"  {C.G}[OK] CORS_ORIGIN definido:{C.END}")
    origins = [o.strip() for o in cors_origin.split(',')]
    for origin in origins:
        print(f"     - {origin}")
else:
    print(f"  {C.Y}[!] CORS_ORIGIN nao definido{C.END}")
    print(f"     {C.Y}Usando defaults:{C.END}")
    print(f"     - http://localhost:3000")
    print(f"     - http://localhost:3001")
    print(f"     - http://127.0.0.1:3000")

# FRONTEND_URL
frontend_url = env_vars.get('FRONTEND_URL', 'http://localhost:3000')
print(f"  {C.B}[i] FRONTEND_URL={frontend_url}{C.END}")

print()

# ============================================================================
# 2. Verificar main.py
# ============================================================================

print_section("2. Verificando configuração em main.py")

main_py_paths = [
    Path("app/main.py"),
    Path("backend/app/main.py"),
]

main_py = None
for path in main_py_paths:
    if path.exists():
        main_py = path
        break

if not main_py:
    print(f"{C.R}❌ Arquivo app/main.py não encontrado!{C.END}\n")
else:
    print(f"{C.G}✅ Arquivo main.py encontrado: {main_py}{C.END}\n")
    
    with open(main_py, 'r', encoding='utf-8') as f:
        main_content = f.read()
    
    # Verifica imports
    if 'from fastapi.middleware.cors import CORSMiddleware' in main_content:
        print(f"  {C.G}✅ CORSMiddleware importado{C.END}")
    else:
        print(f"  {C.R}❌ CORSMiddleware NÃO importado!{C.END}")
    
    # Verifica se middleware foi adicionado
    if 'app.add_middleware(CORSMiddleware' in main_content or 'app.add_middleware(\n        CORSMiddleware' in main_content:
        print(f"  {C.G}✅ CORSMiddleware adicionado ao app{C.END}")
        
        # Verifica allow_origins
        if 'allow_origins=' in main_content:
            print(f"  {C.G}✅ allow_origins configurado{C.END}")
        
        # Verifica allow_methods
        if 'allow_methods=' in main_content:
            print(f"  {C.G}✅ allow_methods configurado{C.END}")
        
        # Verifica allow_headers
        if 'allow_headers=' in main_content:
            print(f"  {C.G}✅ allow_headers configurado{C.END}")
            
            # Verifica se Authorization está nos headers
            if '"Authorization"' in main_content or "'Authorization'" in main_content:
                print(f"  {C.G}✅ Authorization header permitido{C.END}")
            else:
                print(f"  {C.R}❌ Authorization header NÃO está explicitamente permitido!{C.END}")
                print(f"     {C.Y}Adicione 'Authorization' em allow_headers{C.END}")
        
    else:
        print(f"  {C.R}❌ CORSMiddleware NÃO foi adicionado!{C.END}")
        print(f"     {C.Y}Adicione o middleware em main.py{C.END}")

print()

# ============================================================================
# 3. Verificar config.py
# ============================================================================

print_section("3. Verificando config.py")

config_py_paths = [
    Path("app/core/config.py"),
    Path("backend/app/core/config.py"),
]

config_py = None
for path in config_py_paths:
    if path.exists():
        config_py = path
        break

if not config_py:
    print(f"{C.R}❌ Arquivo config.py não encontrado!{C.END}\n")
else:
    print(f"{C.G}✅ Arquivo config.py encontrado: {config_py}{C.END}\n")
    
    with open(config_py, 'r', encoding='utf-8') as f:
        config_content = f.read()
    
    # Verifica get_cors_origins
    if 'def get_cors_origins' in config_content:
        print(f"  {C.G}✅ Função get_cors_origins() definida{C.END}")
        
        if 'CORS_ALLOW_ALL' in config_content:
            print(f"  {C.G}✅ Verifica CORS_ALLOW_ALL{C.END}")
        
        if 'CORS_ORIGIN' in config_content:
            print(f"  {C.G}✅ Verifica CORS_ORIGIN{C.END}")
        
    else:
        print(f"  {C.Y}⚠️ Função get_cors_origins() não encontrada{C.END}")

print()

# ============================================================================
# RESUMO E RECOMENDAÇÕES
# ============================================================================

print_header("RESUMO")

issues_found = []
warnings_found = []

# Verifica issues
if not env_file:
    issues_found.append("Arquivo .env não encontrado")

if debug_value != 'true':
    warnings_found.append("DEBUG não está true - logs CORS não serão exibidos")

if cors_allow_all != 'true' and not cors_origin:
    warnings_found.append("CORS_ORIGIN não definido e CORS_ALLOW_ALL=false")

# Print issues
if issues_found:
    print(f"{C.BOLD}{C.R}❌ PROBLEMAS ENCONTRADOS:{C.END}\n")
    for issue in issues_found:
        print(f"  • {issue}")
    print()

if warnings_found:
    print(f"{C.BOLD}{C.Y}⚠️ AVISOS:{C.END}\n")
    for warning in warnings_found:
        print(f"  • {warning}")
    print()

if not issues_found and not warnings_found:
    print(f"{C.BOLD}{C.G}✅ CONFIGURAÇÃO CORS PARECE OK!{C.END}\n")
    print(f"Se ainda tiver problemas de CORS:\n")
    print(f"  1. Certifique-se de que o backend está rodando")
    print(f"  2. Abra test_cors_browser.html no navegador para testar")
    print(f"  3. Execute: python test_cors_roles_quick.py (após instalar requests)")
    print()
else:
    print(f"{C.BOLD}{C.Y}PRÓXIMOS PASSOS:{C.END}\n")
    print(f"  1. Corrija os problemas acima")
    print(f"  2. Reinicie o backend")
    print(f"  3. Execute novamente este script")
    print(f"  4. Se ainda tiver problemas, abra test_cors_browser.html no navegador")
    print()

print(f"{C.BOLD}FERRAMENTAS DISPONÍVEIS:{C.END}\n")
print(f"  📄 test_cors_browser.html          - Teste visual no navegador (RECOMENDADO)")
print(f"  🔍 check_cors_config.py            - Este script (precisa requests)")
print(f"  🧪 test_cors_roles_quick.py        - Teste com login real (precisa requests)")
print(f"  📚 GUIA_TESTE_CORS_ROLES.md        - Guia completo de diagnóstico")
print(f"  📖 SOLUCAO_CORS_ROLES.md           - Soluções para problemas comuns")
print()

print(f"{C.BOLD}PARA INSTALAR REQUESTS:{C.END}")
print(f"  pip install requests")
print()

print(f"{C.BOLD}{C.C}{'='*80}{C.END}\n")

