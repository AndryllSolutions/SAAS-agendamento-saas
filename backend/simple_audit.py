"""
Auditoria simples de módulos - sem complexidade
"""
import requests
import json

def simple_audit():
    """Auditoria simples dos módulos"""
    
    # Login
    login_data = {'username': 'admin@belezalatino.com', 'password': 'admin123'}
    response = requests.post('http://localhost:8000/api/v1/auth/login', 
                           data=login_data, 
                           headers={'Content-Type': 'application/x-www-form-urlencoded'})
    
    if response.status_code != 200:
        print("ERRO: Falha no login")
        return
    
    token = response.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    
    print('=== AUDITORIA DE MODULOS ===')
    print('Token OK')
    print()
    
    # Lista de endpoints para testar
    endpoints = [
        ('AUTH', 'GET', '/api/v1/auth/me', 'Dados do usuário'),
        ('USERS', 'GET', '/api/v1/users/me', 'Perfil usuário'),
        ('COMPANIES', 'GET', '/api/v1/companies/4', 'Empresa específica'),
        ('SERVICES', 'GET', '/api/v1/services/', 'Listar serviços'),
        ('APPOINTMENTS', 'GET', '/api/v1/appointments/', 'Listar agendamentos'),
        ('PROFESSIONALS', 'GET', '/api/v1/professionals/public?company_slug=salao-beleza-total', 'Profissionais públicos'),
        ('PLANS', 'GET', '/api/v1/plans/', 'Listar planos'),
        ('PLANS', 'GET', '/api/v1/plans/current', 'Plano atual'),
        ('DASHBOARD', 'GET', '/api/v1/dashboard/stats', 'Estatísticas dashboard'),
        ('FINANCIAL', 'GET', '/api/v1/financial/summary', 'Resumo financeiro'),
        ('CLIENTS', 'GET', '/api/v1/clients/', 'Listar clientes'),
        ('PRODUCTS', 'GET', '/api/v1/products/', 'Listar produtos'),
        ('REPORTS', 'GET', '/api/v1/reports/', 'Listar relatórios'),
        ('SETTINGS', 'GET', '/api/v1/settings/', 'Configurações da empresa'),
    ]
    
    working = 0
    total = len(endpoints)
    
    for module, method, url, desc in endpoints:
        try:
            if method == 'GET':
                resp = requests.get(f'http://localhost:8000{url}', headers=headers, timeout=10)
            
            status = resp.status_code
            if status == 200:
                result = 'OK'
                try:
                    data = resp.json()
                    if isinstance(data, list):
                        result = f'OK ({len(data)} itens)'
                    else:
                        result = 'OK (object)'
                except:
                    result = 'OK (non-json)'
                working += 1
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
            result = f'ERROR: {str(e)[:30]}'
        
        print(f'{module:12} | {method:4} | {url:50} | {result}')
    
    print()
    print(f'=== RESUMO ===')
    print(f'Total: {total}')
    print(f'Funcionando: {working}')
    print(f'Com erro: {total - working}')
    print(f'Sucesso: {working/total*100:.1f}%')

if __name__ == "__main__":
    simple_audit()
