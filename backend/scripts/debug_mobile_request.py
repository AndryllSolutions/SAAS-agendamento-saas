"""
Script para simular exatamente o que o mobile faz
e ver qual é o erro
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("🧪 Simulando requisição do mobile...\n")

# Teste 1: Login JSON (correto)
print("1️⃣ Teste: Login JSON (formato correto)")
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login/json",
        json={
            "email": "admin@belezalatino.com",
            "password": "admin123"
        },
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    if response.status_code == 200:
        print("   ✅ SUCESSO")
    else:
        print("   ❌ FALHOU")
except Exception as e:
    print(f"   ❌ ERRO: {e}")

# Teste 2: Login com endpoint antigo (errado)
print("\n2️⃣ Teste: Login endpoint antigo (pode ser o problema)")
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={
            "email": "admin@belezalatino.com",
            "password": "admin123"
        },
        headers={
            "Content-Type": "application/json"
        },
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    if response.status_code == 200:
        print("   ✅ Funciona (mas não é o ideal)")
    else:
        print("   ❌ FALHOU (esperado - endpoint antigo precisa form-data)")
except Exception as e:
    print(f"   ❌ ERRO: {e}")

# Teste 3: Login com campos errados
print("\n3️⃣ Teste: Login com campos errados (username ao invés de email)")
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login/json",
        json={
            "username": "admin@belezalatino.com",  # ERRADO
            "password": "admin123"
        },
        headers={
            "Content-Type": "application/json"
        },
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    if response.status_code == 422:
        print("   ⚠️  Erro 422 (validação) - Campos errados")
except Exception as e:
    print(f"   ❌ ERRO: {e}")

print("\n" + "="*60)
print("💡 DICAS:")
print("="*60)
print("1. Verifique qual URL o mobile está usando")
print("2. Verifique se está usando /login/json (não /login)")
print("3. Verifique se está enviando JSON (não form-data)")
print("4. Verifique os campos: 'email' e 'password' (não 'username')")
print("5. Verifique os logs: docker-compose logs -f backend")

