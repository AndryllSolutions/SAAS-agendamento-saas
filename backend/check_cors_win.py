# -*- coding: utf-8 -*-
"""
Verificador Simples de Configuracao CORS (Windows)
============================================================
Verifica configuracao CORS no .env e arquivos de configuracao.

USO:
    python check_cors_win.py
"""

import os
from pathlib import Path
import sys

print("\n" + "="*80)
print(" VERIFICADOR DE CONFIGURACAO CORS ".center(80))
print("="*80 + "\n")

# ==================================================================
# 1. Verificar arquivo .env
# ==================================================================

print("\n[1] Verificando arquivo .env\n")

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
    print("[X] Arquivo .env NAO encontrado!")
    print("    Procurei em:", ', '.join(str(p) for p in env_paths))
    print("    Crie o arquivo .env a partir do .env.example\n")
    sys.exit(1)
else:
    print(f"[OK] Arquivo .env encontrado: {env_file}\n")

# Le .env
with open(env_file, 'r', encoding='utf-8') as f:
    env_content = f.read()

env_vars = {}
for line in env_content.split('\n'):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        key, value = line.split('=', 1)
        env_vars[key.strip()] = value.strip()

# Verifica variaveis CORS
print("Variaveis de Ambiente CORS:\n")

# DEBUG
debug_value = env_vars.get('DEBUG', 'false').lower()
if debug_value == 'true':
    print("  [OK] DEBUG=true")
    print("       Logs de CORS serao exibidos no backend")
else:
    print(f"  [!] DEBUG={debug_value}")
    print("      Recomendado: DEBUG=true para ver logs CORS")

# CORS_ALLOW_ALL
cors_allow_all = env_vars.get('CORS_ALLOW_ALL', 'false').lower()
if cors_allow_all == 'true':
    print("  [OK] CORS_ALLOW_ALL=true")
    print("       Todas origins sao permitidas (desenvolvimento)")
    print("       [!] NUNCA use isso em producao!")
else:
    print("  [i] CORS_ALLOW_ALL=false")
    print("      Origins especificas serao usadas")

# CORS_ORIGIN
cors_origin = env_vars.get('CORS_ORIGIN')
if cors_origin:
    print("  [OK] CORS_ORIGIN definido:")
    origins = [o.strip() for o in cors_origin.split(',')]
    for origin in origins:
        print(f"       - {origin}")
else:
    print("  [!] CORS_ORIGIN nao definido")
    print("      Usando defaults:")
    print("      - http://localhost:3000")
    print("      - http://localhost:3001")
    print("      - http://127.0.0.1:3000")

# FRONTEND_URL
frontend_url = env_vars.get('FRONTEND_URL', 'http://localhost:3000')
print(f"  [i] FRONTEND_URL={frontend_url}")

print()

# ==================================================================
# 2. Verificar main.py
# ==================================================================

print("\n[2] Verificando configuracao em main.py\n")

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
    print("[X] Arquivo app/main.py NAO encontrado!\n")
else:
    print(f"[OK] Arquivo main.py encontrado: {main_py}\n")
    
    with open(main_py, 'r', encoding='utf-8') as f:
        main_content = f.read()
    
    # Verifica imports
    if 'from fastapi.middleware.cors import CORSMiddleware' in main_content:
        print("  [OK] CORSMiddleware importado")
    else:
        print("  [X] CORSMiddleware NAO importado!")
    
    # Verifica se middleware foi adicionado
    if 'app.add_middleware(CORSMiddleware' in main_content or 'app.add_middleware(\n        CORSMiddleware' in main_content:
        print("  [OK] CORSMiddleware adicionado ao app")
        
        # Verifica allow_origins
        if 'allow_origins=' in main_content:
            print("  [OK] allow_origins configurado")
        
        # Verifica allow_methods
        if 'allow_methods=' in main_content:
            print("  [OK] allow_methods configurado")
        
        # Verifica allow_headers
        if 'allow_headers=' in main_content:
            print("  [OK] allow_headers configurado")
            
            # Verifica se Authorization esta nos headers
            if '"Authorization"' in main_content or "'Authorization'" in main_content:
                print("  [OK] Authorization header permitido")
            else:
                print("  [X] Authorization header NAO esta explicitamente permitido!")
                print("      Adicione 'Authorization' em allow_headers")
        
    else:
        print("  [X] CORSMiddleware NAO foi adicionado!")
        print("      Adicione o middleware em main.py")

print()

# ==================================================================
# 3. Verificar config.py
# ==================================================================

print("\n[3] Verificando config.py\n")

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
    print("[X] Arquivo config.py NAO encontrado!\n")
else:
    print(f"[OK] Arquivo config.py encontrado: {config_py}\n")
    
    with open(config_py, 'r', encoding='utf-8') as f:
        config_content = f.read()
    
    # Verifica get_cors_origins
    if 'def get_cors_origins' in config_content:
        print("  [OK] Funcao get_cors_origins() definida")
        
        if 'CORS_ALLOW_ALL' in config_content:
            print("  [OK] Verifica CORS_ALLOW_ALL")
        
        if 'CORS_ORIGIN' in config_content:
            print("  [OK] Verifica CORS_ORIGIN")
        
    else:
        print("  [!] Funcao get_cors_origins() nao encontrada")

print()

# ==================================================================
# RESUMO E RECOMENDACOES
# ==================================================================

print("\n" + "="*80)
print(" RESUMO ".center(80))
print("="*80 + "\n")

issues_found = []
warnings_found = []

# Verifica issues
if not env_file:
    issues_found.append("Arquivo .env nao encontrado")

if debug_value != 'true':
    warnings_found.append("DEBUG nao esta true - logs CORS nao serao exibidos")

if cors_allow_all != 'true' and not cors_origin:
    warnings_found.append("CORS_ORIGIN nao definido e CORS_ALLOW_ALL=false")

# Print issues
if issues_found:
    print("[X] PROBLEMAS ENCONTRADOS:\n")
    for issue in issues_found:
        print(f"  - {issue}")
    print()

if warnings_found:
    print("[!] AVISOS:\n")
    for warning in warnings_found:
        print(f"  - {warning}")
    print()

if not issues_found and not warnings_found:
    print("[OK] CONFIGURACAO CORS PARECE OK!\n")
    print("Se ainda tiver problemas de CORS:\n")
    print("  1. Certifique-se de que o backend esta rodando")
    print("  2. Abra test_cors_browser.html no navegador para testar")
    print("  3. Execute: python test_cors_roles_quick.py (apos instalar requests)")
    print()
else:
    print("PROXIMOS PASSOS:\n")
    print("  1. Corrija os problemas acima")
    print("  2. Reinicie o backend")
    print("  3. Execute novamente este script")
    print("  4. Se ainda tiver problemas, abra test_cors_browser.html no navegador")
    print()

print("FERRAMENTAS DISPONIVEIS:\n")
print("  [HTML] test_cors_browser.html       - Teste visual no navegador (RECOMENDADO)")
print("  [PY]   check_cors_config.py         - Teste completo (precisa requests)")
print("  [PY]   test_cors_roles_quick.py     - Teste com login real (precisa requests)")
print("  [MD]   GUIA_TESTE_CORS_ROLES.md     - Guia completo de diagnostico")
print("  [MD]   SOLUCAO_CORS_ROLES.md        - Solucoes para problemas comuns")
print()

print("PARA INSTALAR REQUESTS:")
print("  pip install requests")
print()

print("="*80 + "\n")


