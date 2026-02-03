"""
Script para verificar a documentacao da API e encontrar o endpoint correto de login
"""
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

print("\n" + "=" * 70)
print(" VERIFICANDO DOCUMENTACAO DA API")
print("=" * 70)

try:
    response = requests.get(f"{VPS_URL}/openapi.json", timeout=10, verify=False)
    
    if response.status_code == 200:
        openapi = response.json()
        
        print(f"\nAPI: {openapi['info']['title']}")
        print(f"Version: {openapi['info']['version']}")
        print(f"\nEndpoints relacionados a autenticacao:\n")
        
        paths = openapi.get('paths', {})
        
        for path, methods in paths.items():
            if 'auth' in path.lower() or 'login' in path.lower():
                print(f"\n{path}")
                for method, details in methods.items():
                    if method.upper() in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']:
                        summary = details.get('summary', 'N/A')
                        print(f"  {method.upper()}: {summary}")
                        
                        # Mostrar parametros se for POST
                        if method.upper() == 'POST':
                            request_body = details.get('requestBody', {})
                            if request_body:
                                content = request_body.get('content', {})
                                if 'application/x-www-form-urlencoded' in content:
                                    print(f"       Content-Type: application/x-www-form-urlencoded")
                                elif 'application/json' in content:
                                    print(f"       Content-Type: application/json")
                                    schema = content['application/json'].get('schema', {})
                                    if '$ref' in schema:
                                        print(f"       Schema: {schema['$ref']}")
        
        print("\n" + "=" * 70)
        print(" TODOS OS ENDPOINTS DA API")
        print("=" * 70 + "\n")
        
        for path in sorted(paths.keys()):
            methods_list = [m.upper() for m in paths[path].keys() if m.upper() in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']]
            print(f"{', '.join(methods_list):20} {path}")
            
    else:
        print(f"Erro ao buscar documentacao: {response.status_code}")
        
except Exception as e:
    print(f"Erro: {e}")
