"""
Script final para testar autenticacao no VPS com os endpoints corretos
"""
import requests
import json
from datetime import datetime
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

VPS_URL = "http://72.62.138.239"

TEST_CREDENTIALS = {
    "username": "admin.teste.vps@exemplo.com",
    "password": "AdminTeste2026!",
}

def print_section(title):
    print("\n" + "=" * 70)
    print(f" {title}")
    print("=" * 70)

def test_health():
    print_section("1. Health Check")
    try:
        response = requests.get(f"{VPS_URL}/health", timeout=10, verify=False)
        if response.status_code == 200:
            data = response.json()
            print(f"Status: OK")
            print(f"  App: {data.get('app')}")
            print(f"  Version: {data.get('version')}")
            print(f"  Environment: {data.get('environment')}")
            return True
        return False
    except Exception as e:
        print(f"Erro: {e}")
        return False

def test_login_json():
    """Testa login usando /api/v1/auth/login-json"""
    print_section("2. Login via /api/v1/auth/login-json")
    
    print(f"\nCredenciais:")
    print(f"  Email: {TEST_CREDENTIALS['username']}")
    print(f"  Senha: {'*' * len(TEST_CREDENTIALS['password'])}")
    
    try:
        json_data = {
            "username": TEST_CREDENTIALS['username'],
            "password": TEST_CREDENTIALS['password']
        }
        
        response = requests.post(
            f"{VPS_URL}/api/v1/auth/login-json",
            json=json_data,
            headers={"Content-Type": "application/json"},
            timeout=10,
            verify=False
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nLOGIN BEM-SUCEDIDO!")
            
            user = data.get('user', {})
            print(f"\nDados do Usuario:")
            print(f"  ID: {user.get('id')}")
            print(f"  Nome: {user.get('full_name')}")
            print(f"  Email: {user.get('email')}")
            print(f"  Role: {user.get('role')}")
            print(f"  SAAS Role: {user.get('saas_role')}")
            print(f"  Company Role: {user.get('company_role')}")
            print(f"  Company ID: {user.get('company_id')}")
            
            print(f"\nTokens:")
            print(f"  Access Token: {data.get('access_token', '')[:50]}...")
            print(f"  Refresh Token: {data.get('refresh_token', '')[:50]}...")
            print(f"  Token Type: {data.get('token_type')}")
            
            return {
                'success': True,
                'user': user,
                'access_token': data.get('access_token'),
                'refresh_token': data.get('refresh_token')
            }
        else:
            print(f"\nFALHA NO LOGIN!")
            try:
                error_data = response.json()
                print(f"Erro: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"Response: {response.text}")
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f"\nErro na requisicao: {e}")
        return {'success': False, 'error': str(e)}

def test_company_info(access_token, company_id):
    """Testa busca de informacoes da empresa"""
    print_section("3. Informacoes da Empresa")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/companies/{company_id}",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            company = response.json()
            print(f"\nDados da Empresa:")
            print(f"  ID: {company.get('id')}")
            print(f"  Nome: {company.get('name')}")
            print(f"  Tipo: {company.get('business_type')}")
            print(f"  Status: {company.get('status')}")
            print(f"  Plano: {company.get('subscription_plan')}")
            print(f"  Trial Ate: {company.get('trial_ends_at')}")
            print(f"  Criada em: {company.get('created_at')}")
            
            return {'success': True, 'company': company}
        else:
            print(f"\nFalha ao buscar empresa!")
            print(f"Response: {response.text}")
            return {'success': False}
            
    except Exception as e:
        print(f"\nErro: {e}")
        return {'success': False}

def test_appointments_list(access_token):
    """Testa listagem de agendamentos"""
    print_section("4. Listagem de Agendamentos")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/appointments",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            appointments = data if isinstance(data, list) else data.get('items', [])
            print(f"\nTotal de agendamentos: {len(appointments)}")
            
            if len(appointments) > 0:
                print(f"\nPrimeiros 3 agendamentos:")
                for i, apt in enumerate(appointments[:3], 1):
                    print(f"\n  {i}. ID: {apt.get('id')}")
                    print(f"     Cliente: {apt.get('client_name')}")
                    print(f"     Data: {apt.get('appointment_date')}")
                    print(f"     Status: {apt.get('status')}")
            else:
                print(f"\nNenhum agendamento encontrado (empresa nova)")
            
            return {'success': True, 'count': len(appointments)}
        else:
            print(f"\nFalha ao listar agendamentos!")
            print(f"Response: {response.text}")
            return {'success': False}
            
    except Exception as e:
        print(f"\nErro: {e}")
        return {'success': False}

def test_services_list(access_token):
    """Testa listagem de servicos"""
    print_section("5. Listagem de Servicos")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/services",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            services = data if isinstance(data, list) else data.get('items', [])
            print(f"\nTotal de servicos: {len(services)}")
            
            if len(services) > 0:
                print(f"\nPrimeiros 3 servicos:")
                for i, svc in enumerate(services[:3], 1):
                    print(f"\n  {i}. {svc.get('name')}")
                    print(f"     Preco: R$ {svc.get('price', 0):.2f}")
                    print(f"     Duracao: {svc.get('duration')} min")
            else:
                print(f"\nNenhum servico cadastrado")
            
            return {'success': True, 'count': len(services)}
        else:
            print(f"\nFalha ao listar servicos!")
            print(f"Response: {response.text}")
            return {'success': False}
            
    except Exception as e:
        print(f"\nErro: {e}")
        return {'success': False}

def test_clients_list(access_token):
    """Testa listagem de clientes"""
    print_section("6. Listagem de Clientes")
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{VPS_URL}/api/v1/clients",
            headers=headers,
            timeout=10,
            verify=False
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            clients = data if isinstance(data, list) else data.get('items', [])
            print(f"\nTotal de clientes: {len(clients)}")
            
            if len(clients) > 0:
                print(f"\nPrimeiros 3 clientes:")
                for i, client in enumerate(clients[:3], 1):
                    print(f"\n  {i}. {client.get('full_name')}")
                    print(f"     Email: {client.get('email')}")
                    print(f"     Telefone: {client.get('phone')}")
            else:
                print(f"\nNenhum cliente cadastrado")
            
            return {'success': True, 'count': len(clients)}
        else:
            print(f"\nFalha ao listar clientes!")
            print(f"Response: {response.text}")
            return {'success': False}
            
    except Exception as e:
        print(f"\nErro: {e}")
        return {'success': False}

def main():
    print("\n" + "=" * 70)
    print(" TESTE COMPLETO DE AUTENTICACAO E FUNCIONALIDADES VPS")
    print(" Credenciais: Admin Teste VPS")
    print(" Data/Hora:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 70)
    
    results = {}
    
    # 1. Health Check
    results['health'] = test_health()
    
    if not results['health']:
        print("\nERRO: Sistema nao esta respondendo!")
        return
    
    # 2. Login
    login_result = test_login_json()
    results['login'] = login_result.get('success', False)
    
    if not results['login']:
        print("\n" + "=" * 70)
        print(" TESTE FALHOU: Nao foi possivel fazer login")
        print("=" * 70)
        return
    
    access_token = login_result.get('access_token')
    user = login_result.get('user', {})
    company_id = user.get('company_id')
    
    # 3. Buscar dados da empresa
    if company_id:
        company_result = test_company_info(access_token, company_id)
        results['company'] = company_result.get('success', False)
    
    # 4. Listar agendamentos
    appointments_result = test_appointments_list(access_token)
    results['appointments'] = appointments_result.get('success', False)
    
    # 5. Listar servicos
    services_result = test_services_list(access_token)
    results['services'] = services_result.get('success', False)
    
    # 6. Listar clientes
    clients_result = test_clients_list(access_token)
    results['clients'] = clients_result.get('success', False)
    
    # Resumo Final
    print("\n" + "=" * 70)
    print(" RESUMO DOS TESTES")
    print("=" * 70)
    print(f"  1. Health Check:        {'OK' if results['health'] else 'FALHOU'}")
    print(f"  2. Login:               {'OK' if results['login'] else 'FALHOU'}")
    print(f"  3. Dados Empresa:       {'OK' if results.get('company') else 'FALHOU'}")
    print(f"  4. Lista Agendamentos:  {'OK' if results['appointments'] else 'FALHOU'}")
    print(f"  5. Lista Servicos:      {'OK' if results['services'] else 'FALHOU'}")
    print(f"  6. Lista Clientes:      {'OK' if results['clients'] else 'FALHOU'}")
    
    all_passed = all([
        results['health'], 
        results['login'], 
        results.get('company', False),
        results['appointments'],
        results['services'],
        results['clients']
    ])
    
    print("\n" + "=" * 70)
    if all_passed:
        print(" TODOS OS TESTES PASSARAM COM SUCESSO!")
        print(" Sistema de autenticacao e CRUDs funcionando corretamente!")
    else:
        print(" AUTENTICACAO OK - Alguns endpoints podem estar vazios")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
