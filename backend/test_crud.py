"""
Teste CRUD completo de todos os modulos
"""
import requests
import json

def test_crud():
    """Testar operacoes CRUD em todos os modulos principais"""
    
    # Login
    login_data = {'username': 'dono@belezatotal.com', 'password': 'empresa123'}
    response = requests.post('http://localhost:8000/api/v1/auth/login', 
                           data=login_data, 
                           headers={'Content-Type': 'application/x-www-form-urlencoded'})
    token = response.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print('=== TESTE CRUD COMPLETO ===')
    print()
    
    results = []
    
    # ========== SERVICES CRUD ==========
    print('--- SERVICES ---')
    
    # CREATE
    service_data = {
        'name': 'Teste CRUD Service',
        'price': 99.99,
        'duration_minutes': 45,
        'description': 'Servico criado via teste CRUD',
        'is_active': True,
        'company_id': 4
    }
    resp = requests.post('http://localhost:8000/api/v1/services/', json=service_data, headers=headers)
    if resp.status_code in [200, 201]:
        service = resp.json()
        service_id = service.get('id')
        print(f'CREATE: OK - ID {service_id}')
        results.append(('SERVICES', 'CREATE', 'OK'))
    else:
        print(f'CREATE: ERRO {resp.status_code} - {resp.text[:100]}')
        results.append(('SERVICES', 'CREATE', f'ERRO {resp.status_code}'))
        service_id = None
    
    # READ
    if service_id:
        resp = requests.get(f'http://localhost:8000/api/v1/services/{service_id}', headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('name')
            print(f'READ: OK - {name}')
            results.append(('SERVICES', 'READ', 'OK'))
        else:
            print(f'READ: ERRO {resp.status_code}')
            results.append(('SERVICES', 'READ', f'ERRO {resp.status_code}'))
    
    # UPDATE
    if service_id:
        update_data = {'name': 'Teste CRUD Service UPDATED', 'price': 149.99}
        resp = requests.put(f'http://localhost:8000/api/v1/services/{service_id}', json=update_data, headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('name')
            price = resp.json().get('price')
            print(f'UPDATE: OK - {name} - R$ {price}')
            results.append(('SERVICES', 'UPDATE', 'OK'))
        else:
            print(f'UPDATE: ERRO {resp.status_code} - {resp.text[:100]}')
            results.append(('SERVICES', 'UPDATE', f'ERRO {resp.status_code}'))
    
    # DELETE
    if service_id:
        resp = requests.delete(f'http://localhost:8000/api/v1/services/{service_id}', headers=headers)
        if resp.status_code in [200, 204]:
            print('DELETE: OK')
            results.append(('SERVICES', 'DELETE', 'OK'))
        else:
            print(f'DELETE: ERRO {resp.status_code}')
            results.append(('SERVICES', 'DELETE', f'ERRO {resp.status_code}'))
    
    print()
    
    # ========== CLIENTS CRUD ==========
    print('--- CLIENTS ---')
    
    # CREATE - usar timestamp para email unico
    import time
    ts = int(time.time())
    client_data = {
        'full_name': 'Cliente Teste CRUD',
        'email': f'teste.crud.{ts}@email.com',
        'phone': f'119{ts % 100000000:08d}',
        'company_id': 4
    }
    resp = requests.post('http://localhost:8000/api/v1/clients/', json=client_data, headers=headers)
    if resp.status_code in [200, 201]:
        client = resp.json()
        client_id = client.get('id')
        print(f'CREATE: OK - ID {client_id}')
        results.append(('CLIENTS', 'CREATE', 'OK'))
    else:
        print(f'CREATE: ERRO {resp.status_code} - {resp.text[:100]}')
        results.append(('CLIENTS', 'CREATE', f'ERRO {resp.status_code}'))
        client_id = None
    
    # READ
    if client_id:
        resp = requests.get(f'http://localhost:8000/api/v1/clients/{client_id}', headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('full_name')
            print(f'READ: OK - {name}')
            results.append(('CLIENTS', 'READ', 'OK'))
        else:
            print(f'READ: ERRO {resp.status_code}')
            results.append(('CLIENTS', 'READ', f'ERRO {resp.status_code}'))
    
    # UPDATE
    if client_id:
        update_data = {'full_name': 'Cliente Teste CRUD UPDATED', 'phone': '11888888888'}
        resp = requests.put(f'http://localhost:8000/api/v1/clients/{client_id}', json=update_data, headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('full_name')
            print(f'UPDATE: OK - {name}')
            results.append(('CLIENTS', 'UPDATE', 'OK'))
        else:
            print(f'UPDATE: ERRO {resp.status_code} - {resp.text[:100]}')
            results.append(('CLIENTS', 'UPDATE', f'ERRO {resp.status_code}'))
    
    # DELETE
    if client_id:
        resp = requests.delete(f'http://localhost:8000/api/v1/clients/{client_id}', headers=headers)
        if resp.status_code in [200, 204]:
            print('DELETE: OK')
            results.append(('CLIENTS', 'DELETE', 'OK'))
        else:
            print(f'DELETE: ERRO {resp.status_code}')
            results.append(('CLIENTS', 'DELETE', f'ERRO {resp.status_code}'))
    
    print()
    
    # ========== PRODUCTS CRUD ==========
    print('--- PRODUCTS ---')
    
    # CREATE - usar campos corretos do schema
    product_data = {
        'name': 'Produto Teste CRUD',
        'sale_price': 29.99,
        'stock_current': 10,
        'company_id': 4
    }
    resp = requests.post('http://localhost:8000/api/v1/products/', json=product_data, headers=headers)
    if resp.status_code in [200, 201]:
        product = resp.json()
        product_id = product.get('id')
        print(f'CREATE: OK - ID {product_id}')
        results.append(('PRODUCTS', 'CREATE', 'OK'))
    else:
        print(f'CREATE: ERRO {resp.status_code} - {resp.text[:100]}')
        results.append(('PRODUCTS', 'CREATE', f'ERRO {resp.status_code}'))
        product_id = None
    
    # READ
    if product_id:
        resp = requests.get(f'http://localhost:8000/api/v1/products/{product_id}', headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('name')
            print(f'READ: OK - {name}')
            results.append(('PRODUCTS', 'READ', 'OK'))
        else:
            print(f'READ: ERRO {resp.status_code}')
            results.append(('PRODUCTS', 'READ', f'ERRO {resp.status_code}'))
    
    # UPDATE
    if product_id:
        update_data = {'name': 'Produto Teste CRUD UPDATED', 'price': 39.99}
        resp = requests.put(f'http://localhost:8000/api/v1/products/{product_id}', json=update_data, headers=headers)
        if resp.status_code == 200:
            name = resp.json().get('name')
            print(f'UPDATE: OK - {name}')
            results.append(('PRODUCTS', 'UPDATE', 'OK'))
        else:
            print(f'UPDATE: ERRO {resp.status_code} - {resp.text[:100]}')
            results.append(('PRODUCTS', 'UPDATE', f'ERRO {resp.status_code}'))
    
    # DELETE
    if product_id:
        resp = requests.delete(f'http://localhost:8000/api/v1/products/{product_id}', headers=headers)
        if resp.status_code in [200, 204]:
            print('DELETE: OK')
            results.append(('PRODUCTS', 'DELETE', 'OK'))
        else:
            print(f'DELETE: ERRO {resp.status_code}')
            results.append(('PRODUCTS', 'DELETE', f'ERRO {resp.status_code}'))
    
    print()
    
    # ========== RESUMO ==========
    print('=== RESUMO CRUD ===')
    total = len(results)
    ok_count = sum(1 for r in results if r[2] == 'OK')
    print(f'Total operacoes: {total}')
    print(f'Sucesso: {ok_count}')
    print(f'Erros: {total - ok_count}')
    print(f'Taxa de sucesso: {ok_count/total*100:.1f}%')
    
    if ok_count < total:
        print('\nOperacoes com erro:')
        for module, op, status in results:
            if status != 'OK':
                print(f'  - {module} {op}: {status}')

if __name__ == "__main__":
    test_crud()
