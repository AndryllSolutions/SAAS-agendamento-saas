"""
Test Script - API Key Authentication
Demonstra como usar API Keys para acessar a API
"""
import requests
import json
from datetime import datetime

# Configuração
API_URL = "https://4ea50f2d433a.ngrok-free.app/api/v1"
API_KEY = "SEU_API_KEY_AQUI"  # Substituir com sua API Key

# Headers
headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

print("=" * 60)
print("   TESTE DE API KEY - AGENDAMENTO SAAS")
print("=" * 60)
print()

# Teste 1: Listar Agendamentos
print("1️⃣  Testando: Listar Agendamentos")
print("-" * 60)
try:
    response = requests.get(
        f"{API_URL}/appointments",
        headers=headers
    )
    
    if response.status_code == 200:
        appointments = response.json()
        print(f"✅ Sucesso! Encontrados {len(appointments)} agendamentos")
        if appointments:
            print(f"\nPrimeiro agendamento:")
            first = appointments[0]
            print(f"  ID: {first.get('id')}")
            print(f"  Cliente: {first.get('client_name')}")
            print(f"  Serviço: {first.get('service_id')}")
            print(f"  Data: {first.get('start_time')}")
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"Mensagem: {response.json()}")
except Exception as e:
    print(f"❌ Erro na requisição: {e}")

print()
print()

# Teste 2: Criar Cliente
print("2️⃣  Testando: Criar Cliente")
print("-" * 60)
try:
    new_client = {
        "full_name": "Cliente API Test",
        "email": "cliente_api@test.com",
        "phone": "(11) 98765-4321",
        "cellphone": "(11) 98765-4321"
    }
    
    response = requests.post(
        f"{API_URL}/clients",
        headers=headers,
        json=new_client
    )
    
    if response.status_code == 201:
        client = response.json()
        print(f"✅ Sucesso! Cliente criado:")
        print(f"  ID: {client.get('id')}")
        print(f"  Nome: {client.get('full_name')}")
        print(f"  Email: {client.get('email')}")
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"Mensagem: {response.json()}")
except Exception as e:
    print(f"❌ Erro na requisição: {e}")

print()
print()

# Teste 3: Listar Serviços
print("3️⃣  Testando: Listar Serviços")
print("-" * 60)
try:
    response = requests.get(
        f"{API_URL}/services",
        headers=headers
    )
    
    if response.status_code == 200:
        services = response.json()
        print(f"✅ Sucesso! Encontrados {len(services)} serviços")
        if services:
            print(f"\nPrimeiro serviço:")
            first = services[0]
            print(f"  ID: {first.get('id')}")
            print(f"  Nome: {first.get('name')}")
            print(f"  Preço: R$ {first.get('price', 0):.2f}")
            print(f"  Duração: {first.get('duration', 0)} min")
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"Mensagem: {response.json()}")
except Exception as e:
    print(f"❌ Erro na requisição: {e}")

print()
print()

# Teste 4: Criar Agendamento
print("4️⃣  Testando: Criar Agendamento")
print("-" * 60)
try:
    # Precisa ter service_id e professional_id válidos
    new_appointment = {
        "service_id": 1,  # Ajustar conforme seu banco
        "professional_id": 1,  # Ajustar conforme seu banco
        "start_time": "2025-12-20T14:00:00",
        "client_name": "Cliente API Test",
        "client_email": "cliente_api@test.com",
        "client_phone": "(11) 98765-4321",
        "notes": "Agendamento criado via API Key"
    }
    
    response = requests.post(
        f"{API_URL}/appointments",
        headers=headers,
        json=new_appointment
    )
    
    if response.status_code in [200, 201]:
        appointment = response.json()
        print(f"✅ Sucesso! Agendamento criado:")
        print(f"  ID: {appointment.get('id')}")
        print(f"  Cliente: {appointment.get('client_name')}")
        print(f"  Data: {appointment.get('start_time')}")
    else:
        print(f"❌ Erro: {response.status_code}")
        print(f"Mensagem: {response.json()}")
except Exception as e:
    print(f"❌ Erro na requisição: {e}")

print()
print()

# Teste 5: Testar Scope Inválido
print("5️⃣  Testando: Acesso Negado (Scope Inválido)")
print("-" * 60)
try:
    # Tentar acessar endpoint sem permissão
    response = requests.get(
        f"{API_URL}/financial/transactions",  # Requer financial:read
        headers=headers
    )
    
    if response.status_code == 403:
        print(f"✅ Sucesso! Acesso negado como esperado")
        print(f"Mensagem: {response.json().get('detail')}")
    elif response.status_code == 200:
        print(f"⚠️  Warning: Acesso permitido (sua key tem scope financial:read)")
    else:
        print(f"❌ Erro inesperado: {response.status_code}")
except Exception as e:
    print(f"❌ Erro na requisição: {e}")

print()
print("=" * 60)
print("   TESTES CONCLUÍDOS")
print("=" * 60)

