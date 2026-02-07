#!/usr/bin/env python3
"""
Teste de Login Mobile - Diagnóstico
Testa o endpoint /api/v1/auth/login/json usado pelo mobile
"""

import requests
import json
import sys

# Configuração
BASE_URL = "http://localhost:8001/api/v1"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login/json"

def test_login(email: str, password: str):
    """Testa o login no endpoint mobile"""
    print(f"\n{'='*60}")
    print(f"TESTANDO LOGIN MOBILE")
    print(f"{'='*60}")
    print(f"URL: {LOGIN_ENDPOINT}")
    print(f"Email: {email}")
    print(f"Senha: {'*' * len(password)}")
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "email": email,
        "password": password
    }
    
    print(f"\nHeaders: {json.dumps(headers, indent=2)}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"\n{'='*60}")
        print(f"STATUS: {response.status_code}")
        print(f"{'='*60}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ LOGIN BEM-SUCEDIDO!")
            print(f"Access Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"Token Type: {data.get('token_type', 'N/A')}")
            user = data.get('user', {})
            print(f"User ID: {user.get('id', 'N/A')}")
            print(f"User Email: {user.get('email', 'N/A')}")
            print(f"User Role: {user.get('role', 'N/A')}")
            return True
            
        elif response.status_code == 401:
            print(f"❌ CREDENCIAIS INVÁLIDAS")
            print(f"Detalhe: {response.text}")
            return False
            
        elif response.status_code == 422:
            print(f"❌ ERRO DE VALIDAÇÃO")
            print(f"Detalhe: {response.text}")
            return False
            
        elif response.status_code == 500:
            print(f"❌ ERRO INTERNO DO SERVIDOR (500)")
            print(f"Resposta: {response.text}")
            print(f"\n⚠️  Isso indica um problema no backend!")
            print(f"Verifique os logs do servidor backend.")
            return False
            
        else:
            print(f"❌ ERRO INESPERADO")
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ ERRO DE CONEXÃO")
        print(f"Não foi possível conectar ao servidor em {BASE_URL}")
        print(f"Verifique se o backend está rodando na porta 8001")
        return False
        
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT")
        print(f"A requisição demorou muito para responder")
        return False
        
    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        return False

def test_health_check():
    """Verifica se o backend está online"""
    print(f"\n{'='*60}")
    print(f"VERIFICANDO BACKEND")
    print(f"{'='*60}")
    
    try:
        # Tenta acessar um endpoint simples (docs ou health)
        response = requests.get(f"http://localhost:8001/docs", timeout=5)
        print(f"✅ Backend está ONLINE (status: {response.status_code})")
        return True
    except:
        print(f"❌ Backend parece estar OFFLINE")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════════╗
║           TESTE DE LOGIN MOBILE - ATENDO APP                 ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verifica se o backend está online
    if not test_health_check():
        print("\n⚠️  Backend não está acessível. Verifique se o Docker está rodando:")
        print("   docker-compose ps")
        print("   docker-compose logs backend")
        sys.exit(1)
    
    # Credenciais para teste (usuário pode alterar)
    # Tenta ler do argumento de linha de comando ou usa padrão
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        password = sys.argv[2]
    else:
        # Credenciais padrão - ALTERE CONFORME NECESSÁRIO
        email = input("\nDigite o email de teste: ").strip() or "teste@exemplo.com"
        password = input("Digite a senha: ").strip() or "senha123"
    
    # Executa o teste
    success = test_login(email, password)
    
    print(f"\n{'='*60}")
    if success:
        print(f"✅ TESTE CONCLUÍDO - LOGIN FUNCIONANDO!")
    else:
        print(f"❌ TESTE CONCLUÍDO - LOGIN FALHOU")
    print(f"{'='*60}\n")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
