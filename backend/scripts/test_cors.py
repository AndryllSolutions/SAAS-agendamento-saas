#!/usr/bin/env python3
"""
Script para testar configuração de CORS
Funciona tanto localmente quanto no Docker
"""
import sys
from typing import List, Dict

# Tentar importar requests, se não estiver disponível, usar httpx
try:
    import requests
    USE_REQUESTS = True
except ImportError:
    try:
        import httpx
        USE_REQUESTS = False
    except ImportError:
        print("❌ Erro: É necessário 'requests' ou 'httpx' instalado.")
        print("   Instale com: pip install requests")
        print("   Ou use Docker: docker exec -it agendamento_backend python scripts/test_cors.py")
        sys.exit(1)

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def test_cors_preflight(base_url: str, origin: str) -> Dict:
    """Testa preflight request (OPTIONS)"""
    print(f"\n{BLUE}🧪 Testando Preflight (OPTIONS) de {origin}{RESET}")
    
    try:
        if USE_REQUESTS:
            response = requests.options(
                f"{base_url}/api/v1/financial/dashboard",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                    "Access-Control-Request-Headers": "Authorization"
                },
                timeout=5
            )
        else:
            with httpx.Client() as client:
                response = client.options(
                    f"{base_url}/api/v1/financial/dashboard",
                    headers={
                        "Origin": origin,
                        "Access-Control-Request-Method": "GET",
                        "Access-Control-Request-Headers": "Authorization"
                    },
                    timeout=5.0
                )
        
        cors_headers = {
            "access-control-allow-origin": response.headers.get("Access-Control-Allow-Origin"),
            "access-control-allow-methods": response.headers.get("Access-Control-Allow-Methods"),
            "access-control-allow-headers": response.headers.get("Access-Control-Allow-Headers"),
            "access-control-max-age": response.headers.get("Access-Control-Max-Age"),
        }
        
        print(f"  Status: {response.status_code}")
        print(f"  Headers CORS:")
        for key, value in cors_headers.items():
            if value:
                print(f"    {GREEN}✓{RESET} {key}: {value}")
            else:
                print(f"    {RED}✗{RESET} {key}: (não encontrado)")
        
        # Verificar se está correto
        if cors_headers["access-control-allow-origin"]:
            if cors_headers["access-control-allow-origin"] == "*" or cors_headers["access-control-allow-origin"] == origin:
                print(f"  {GREEN}✅ Preflight OK{RESET}")
                return {"success": True, "headers": cors_headers}
            else:
                print(f"  {YELLOW}⚠️ Origin não permitido{RESET}")
                return {"success": False, "headers": cors_headers, "error": "Origin not allowed"}
        else:
            print(f"  {RED}❌ Headers CORS não encontrados{RESET}")
            return {"success": False, "headers": cors_headers, "error": "CORS headers missing"}
            
    except Exception as e:
        print(f"  {RED}❌ Erro: {e}{RESET}")
        return {"success": False, "error": str(e)}


def test_cors_request(base_url: str, origin: str, token: str = None) -> Dict:
    """Testa request real com CORS"""
    print(f"\n{BLUE}🧪 Testando Request Real de {origin}{RESET}")
    
    headers = {"Origin": origin}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if USE_REQUESTS:
            response = requests.get(
                f"{base_url}/api/v1/financial/dashboard?start_date=2025-11-10&end_date=2025-12-10",
                headers=headers,
                timeout=5
            )
        else:
            with httpx.Client() as client:
                response = client.get(
                    f"{base_url}/api/v1/financial/dashboard?start_date=2025-11-10&end_date=2025-12-10",
                    headers=headers,
                    timeout=5.0
                )
        
        cors_origin = response.headers.get("Access-Control-Allow-Origin")
        
        print(f"  Status: {response.status_code}")
        print(f"  Access-Control-Allow-Origin: {cors_origin}")
        
        if cors_origin:
            if cors_origin == "*" or cors_origin == origin:
                # CORS está funcionando, mesmo que status seja 401 (falta autenticação)
                if response.status_code == 401:
                    print(f"  {GREEN}✅ CORS OK{RESET} (401 = falta autenticação, mas CORS está funcionando)")
                else:
                    print(f"  {GREEN}✅ CORS OK{RESET}")
                return {"success": True, "status": response.status_code}
            else:
                print(f"  {YELLOW}⚠️ Origin não permitido{RESET}")
                return {"success": False, "error": "Origin not allowed"}
        else:
            print(f"  {RED}❌ Header CORS não encontrado{RESET}")
            return {"success": False, "error": "CORS header missing"}
            
    except Exception as e:
        print(f"  {RED}❌ Erro: {e}{RESET}")
        return {"success": False, "error": str(e)}


def main():
    """Função principal"""
    print(f"{BLUE}{'='*60}")
    print("🔒 TESTE DE CONFIGURAÇÃO CORS")
    print(f"{'='*60}{RESET}")
    
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    print(f"\n{BLUE}Base URL: {base_url}{RESET}")
    
    # Origens para testar
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://example.com",  # Deve falhar se não estiver configurado
    ]
    
    results = []
    
    for origin in origins:
        print(f"\n{YELLOW}{'='*60}{RESET}")
        print(f"{BLUE}Testando origem: {origin}{RESET}")
        
        # Teste preflight
        preflight_result = test_cors_preflight(base_url, origin)
        
        # Teste request real (sem token, pode dar 401, mas CORS deve funcionar)
        request_result = test_cors_request(base_url, origin)
        
        results.append({
            "origin": origin,
            "preflight": preflight_result,
            "request": request_result
        })
    
    # Resumo
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{BLUE}📊 RESUMO{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}")
    
    for result in results:
        origin = result["origin"]
        preflight_ok = result["preflight"].get("success", False)
        request_ok = result["request"].get("success", False)
        
        status = f"{GREEN}✅ OK{RESET}" if (preflight_ok and request_ok) else f"{RED}❌ FALHOU{RESET}"
        print(f"\n{origin}: {status}")
        if not preflight_ok:
            print(f"  Preflight: {RED}✗{RESET} {result['preflight'].get('error', 'Unknown')}")
        if not request_ok:
            print(f"  Request: {RED}✗{RESET} {result['request'].get('error', 'Unknown')}")
    
    # Verificar se todas as origens permitidas passaram
    # (exemplo.com deve falhar - isso é esperado e correto)
    allowed_origins_ok = all(
        r["preflight"].get("success", False) and r["request"].get("success", False)
        for r in results[:3]  # Apenas localhost (exemplo.com deve falhar)
    )
    
    # Verificar se exemplo.com foi bloqueado corretamente
    blocked_origin_ok = not results[3]["preflight"].get("success", True)  # Deve falhar
    
    if allowed_origins_ok and blocked_origin_ok:
        print(f"\n{GREEN}✅ Todos os testes de CORS passaram!{RESET}")
        print(f"{BLUE}   • Origens permitidas funcionando corretamente{RESET}")
        print(f"{BLUE}   • Origem não permitida bloqueada corretamente (esperado){RESET}")
        print(f"{YELLOW}   • Status 401 é normal (falta token de autenticação){RESET}")
        return 0
    elif allowed_origins_ok:
        print(f"\n{YELLOW}⚠️ CORS funcionando, mas verifique bloqueio de origens não permitidas{RESET}")
        return 0
    else:
        print(f"\n{RED}❌ Alguns testes falharam. Verifique a configuração.{RESET}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

