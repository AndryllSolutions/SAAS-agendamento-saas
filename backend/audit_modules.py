"""
Auditoria completa de módulos do sistema
Verifica todos os endpoints e comportamentos CRUD
"""
import requests
import json
import sys

def audit_all_modules():
    """Auditar todos os módulos do sistema"""
    
    # Login como admin para testes completos
    login_data = {'username': 'admin@belezalatino.com', 'password': 'admin123'}
    response = requests.post('http://localhost:8000/api/v1/auth/login', 
                           data=login_data, 
                           headers={'Content-Type': 'application/x-www-form-urlencoded'})
    
    if response.status_code != 200:
        print("ERRO: Falha no login")
        return False
    
    token = response.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    
    print('=== AUDITORIA COMPLETA DE MODULOS ===')
    print('Token obtido:', bool(token))
    print()
    
    # Lista de módulos para testar
    modules = [
        {'name': 'AUTH', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/auth/me', 'desc': 'Dados do usuário'},
            {'method': 'GET', 'url': '/api/v1/users/me', 'desc': 'Perfil usuário'},
        ]},
        {'name': 'COMPANIES', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/companies/4', 'desc': 'Empresa específica'},
        ]},
        {'name': 'USERS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/users/me', 'desc': 'Dados usuário logado'},
        ]},
        {'name': 'SERVICES', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/services/', 'desc': 'Listar serviços'},
            {'method': 'POST', 'url': '/api/v1/services/', 'desc': 'Criar serviço', 
             'data': {'name': 'Teste API', 'price': 50.0, 'duration_minutes': 30, 'company_id': 4}},
        ]},
        {'name': 'APPOINTMENTS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/appointments/', 'desc': 'Listar agendamentos'},
        ]},
        {'name': 'PROFESSIONALS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/professionals/public?company_slug=salao-beleza-total', 'desc': 'Profissionais públicos'},
        ]},
        {'name': 'PLANS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/plans/', 'desc': 'Listar planos'},
            {'method': 'GET', 'url': '/api/v1/plans/current', 'desc': 'Plano atual'},
        ]},
        {'name': 'DASHBOARD', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/dashboard/stats', 'desc': 'Estatísticas dashboard'},
        ]},
        {'name': 'FINANCIAL', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/financial/summary', 'desc': 'Resumo financeiro'},
        ]},
        {'name': 'CLIENTS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/clients/', 'desc': 'Listar clientes'},
        ]},
        {'name': 'PRODUCTS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/products/', 'desc': 'Listar produtos'},
        ]},
        {'name': 'REPORTS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/reports/', 'desc': 'Listar relatórios'},
        ]},
        {'name': 'SETTINGS', 'endpoints': [
            {'method': 'GET', 'url': '/api/v1/settings/', 'desc': 'Configurações da empresa'},
        ]},
    ]
    
    results = {}
    
    for module in modules:
        print(f'=== {module["name"]} ===')
        module_results = []
        
        for endpoint in module['endpoints']:
            method = endpoint['method']
            url = endpoint['url']
            desc = endpoint['desc']
            
            try:
                if method == 'GET':
                    resp = requests.get(f'http://localhost:8000{url}', headers=headers, timeout=10)
                elif method == 'POST':
                    data = endpoint.get('data', {})
                    resp = requests.post(f'http://localhost:8000{url}', json=data, headers=headers, timeout=10)
                
                status = resp.status_code
                if status == 200:
                    result = 'OK'
                    if method == 'GET':
                        try:
                            data = resp.json()
                            if isinstance(data, list):
                                result = f'OK ({len(data)} itens)'
                            else:
                                result = 'OK (object)'
                        except:
                            result = 'OK (non-json)'
                elif status == 201:
                    result = 'CREATED'
                elif status == 404:
                    result = 'NOT_FOUND'
                elif status == 401:
                    result = 'UNAUTHORIZED'
                elif status == 403:
                    result = 'FORBIDDEN'
                elif status == 500:
                    result = 'ERROR_500'
                else:
                    result = f'HTTP_{status}'
                    
            except Exception as e:
                result = f'ERROR: {str(e)[:50]}'
            
            module_results.append({
                'endpoint': desc,
                'method': method,
                'url': url,
                'result': result
            })
            
            print(f'  {method} {url}: {result}')
        
        results[module['name']] = module_results
        print()
    
    # Resumo
    print('=== RESUMO DA AUDITORIA ===')
    total_endpoints = sum(len(m['endpoints']) for m in modules)
    working_endpoints = 0
    for m in modules:
        for e in m['endpoints']:
            if e['result'].startswith('OK') or e['result'] == 'CREATED':
                working_endpoints += 1
    error_endpoints = total_endpoints - working_endpoints
    
    print(f'Total de endpoints testados: {total_endpoints}')
    print(f'Funcionando: {working_endpoints}')
    print(f'Com erro: {error_endpoints}')
    print(f'Sucesso rate: {working_endpoints/total_endpoints*100:.1f}%')
    
    if error_endpoints > 0:
        print('\nEndpoints com erros:')
        for name, module_results in results.items():
            for r in module_results:
                if not (r['result'].startswith('OK') or r['result'] == 'CREATED'):
                    print(f'  - {name}: {r["endpoint"]} -> {r["result"]}')
    
    print(f'\nAuditoria concluída: {working_endpoints}/{total_endpoints} funcionando')
    return working_endpoints, total_endpoints

if __name__ == "__main__":
    try:
        working, total = audit_all_modules()
        sys.exit(0 if working == total else 1)
    except Exception as e:
        print(f"Erro na auditoria: {e}")
        sys.exit(1)
