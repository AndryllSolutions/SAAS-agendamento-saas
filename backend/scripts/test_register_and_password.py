"""
Script para testar Register e Reset Password
"""
import requests
import random
import string
from colorama import init, Fore, Style

init()

BASE_URL = "http://localhost:8000"

# Cores
SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

def generate_random_email():
    """Gera email aleatório para teste"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@test.com"

def test_register():
    """Testa registro de novo usuário"""
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}📝 TESTE 1: REGISTRO DE NOVO USUÁRIO{RESET}")
    print(f"{INFO}{'='*80}{RESET}\n")
    
    email = generate_random_email()
    password = "test123456"
    
    data = {
        "email": email,
        "password": password,
        "full_name": "Usuário Teste",
        "phone": "(11) 99999-9999",
        "role": "client",
        "company_id": 1
    }
    
    print(f"  📧 Email: {email}")
    print(f"  🔑 Senha: {password}")
    print(f"  👤 Nome: {data['full_name']}")
    print(f"  📱 Telefone: {data['phone']}\n")
    
    try:
        print(f"  ⏳ Enviando requisição...", end=" ")
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data, timeout=5)
        
        if response.status_code == 201:
            user_data = response.json()
            print(f"{SUCCESS}✅ SUCESSO!{RESET}\n")
            print(f"  {SUCCESS}✅ Usuário criado com ID: {user_data.get('id')}{RESET}")
            print(f"  {SUCCESS}✅ Email: {user_data.get('email')}{RESET}")
            print(f"  {SUCCESS}✅ Role: {user_data.get('role')}{RESET}")
            
            # Testar login com o usuário criado
            print(f"\n  🔐 Testando login com usuário criado...", end=" ")
            login_response = requests.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={
                    "username": email,
                    "password": password,
                    "grant_type": "password"
                },
                timeout=5
            )
            
            if login_response.status_code == 200:
                print(f"{SUCCESS}✅ LOGIN FUNCIONOU!{RESET}")
                return True, email, password, login_response.json()["access_token"]
            else:
                print(f"{ERROR}❌ LOGIN FALHOU!{RESET}")
                return False, None, None, None
        else:
            print(f"{ERROR}❌ FALHOU!{RESET}")
            print(f"  {ERROR}Status: {response.status_code}{RESET}")
            print(f"  {ERROR}Erro: {response.text}{RESET}")
            return False, None, None, None
    except Exception as e:
        print(f"{ERROR}❌ ERRO: {e}{RESET}")
        return False, None, None, None

def test_register_duplicate(email):
    """Testa registro com email duplicado"""
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}📝 TESTE 2: REGISTRO COM EMAIL DUPLICADO (Deve Falhar){RESET}")
    print(f"{INFO}{'='*80}{RESET}\n")
    
    data = {
        "email": email,
        "password": "qualquer_senha",
        "full_name": "Teste Duplicado",
        "phone": "(11) 88888-8888",
        "role": "client",
        "company_id": 1
    }
    
    print(f"  📧 Tentando registrar novamente: {email}\n")
    
    try:
        print(f"  ⏳ Enviando requisição...", end=" ")
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data, timeout=5)
        
        if response.status_code == 400:
            print(f"{SUCCESS}✅ SUCESSO (Bloqueou corretamente)!{RESET}")
            print(f"  {SUCCESS}✅ Sistema detectou email duplicado{RESET}")
            return True
        else:
            print(f"{ERROR}❌ FALHOU!{RESET}")
            print(f"  {ERROR}Sistema não bloqueou email duplicado!{RESET}")
            print(f"  {ERROR}Status: {response.status_code}{RESET}")
            return False
    except Exception as e:
        print(f"{ERROR}❌ ERRO: {e}{RESET}")
        return False

def test_change_password(email, old_password, token):
    """Testa alteração de senha"""
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}🔐 TESTE 3: ALTERAÇÃO DE SENHA{RESET}")
    print(f"{INFO}{'='*80}{RESET}\n")
    
    new_password = "nova_senha_123"
    
    data = {
        "old_password": old_password,
        "new_password": new_password
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"  🔑 Senha antiga: {old_password}")
    print(f"  🔑 Senha nova: {new_password}\n")
    
    try:
        print(f"  ⏳ Alterando senha...", end=" ")
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/change-password",
            json=data,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"{SUCCESS}✅ SUCESSO!{RESET}\n")
            
            # Testar login com senha antiga (deve falhar)
            print(f"  🔐 Testando login com senha ANTIGA (deve falhar)...", end=" ")
            old_login = requests.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={
                    "username": email,
                    "password": old_password,
                    "grant_type": "password"
                },
                timeout=5
            )
            
            if old_login.status_code == 401:
                print(f"{SUCCESS}✅ Bloqueou corretamente!{RESET}")
            else:
                print(f"{ERROR}❌ Não bloqueou senha antiga!{RESET}")
                return False
            
            # Testar login com senha nova (deve funcionar)
            print(f"  🔐 Testando login com senha NOVA (deve funcionar)...", end=" ")
            new_login = requests.post(
                f"{BASE_URL}/api/v1/auth/login",
                data={
                    "username": email,
                    "password": new_password,
                    "grant_type": "password"
                },
                timeout=5
            )
            
            if new_login.status_code == 200:
                print(f"{SUCCESS}✅ Login funcionou!{RESET}")
                return True
            else:
                print(f"{ERROR}❌ Login com nova senha falhou!{RESET}")
                return False
        else:
            print(f"{ERROR}❌ FALHOU!{RESET}")
            print(f"  {ERROR}Status: {response.status_code}{RESET}")
            print(f"  {ERROR}Erro: {response.text}{RESET}")
            return False
    except Exception as e:
        print(f"{ERROR}❌ ERRO: {e}{RESET}")
        return False

def test_reset_password():
    """Testa reset de senha (forgot password)"""
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}🔄 TESTE 4: RESET DE SENHA (Forgot Password){RESET}")
    print(f"{INFO}{'='*80}{RESET}\n")
    
    print(f"  ⏳ Verificando se endpoint existe...", end=" ")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/forgot-password",
            json={"email": "admin@demo.com"},
            timeout=5
        )
        
        if response.status_code == 404:
            print(f"{WARNING}⚠️  ENDPOINT NÃO IMPLEMENTADO{RESET}")
            print(f"\n  {WARNING}💡 Endpoint /forgot-password não existe ainda{RESET}")
            print(f"  {WARNING}💡 Funcionalidade precisa ser implementada{RESET}")
            return False
        else:
            print(f"{SUCCESS}✅ ENDPOINT EXISTE!{RESET}")
            return True
    except Exception as e:
        print(f"{ERROR}❌ ERRO: {e}{RESET}")
        return False

def main():
    print("\n" + "="*80)
    print(f"{INFO}🧪 TESTE COMPLETO - REGISTER E PASSWORD{RESET}")
    print("="*80 + "\n")
    
    results = {
        "total": 0,
        "success": 0,
        "failed": 0
    }
    
    # Teste 1: Registro
    results["total"] += 1
    success, email, password, token = test_register()
    if success:
        results["success"] += 1
    else:
        results["failed"] += 1
        print(f"\n{ERROR}❌ Teste de registro falhou. Abortando testes seguintes.{RESET}")
        return
    
    # Teste 2: Email duplicado
    results["total"] += 1
    if test_register_duplicate(email):
        results["success"] += 1
    else:
        results["failed"] += 1
    
    # Teste 3: Alteração de senha
    results["total"] += 1
    if test_change_password(email, password, token):
        results["success"] += 1
    else:
        results["failed"] += 1
    
    # Teste 4: Reset de senha
    results["total"] += 1
    if test_reset_password():
        results["success"] += 1
    else:
        results["failed"] += 1
    
    # Resumo
    print("\n" + "="*80)
    print(f"{INFO}📊 RESUMO DOS TESTES{RESET}")
    print("="*80 + "\n")
    
    print(f"Total de testes: {results['total']}")
    print(f"{SUCCESS}✅ Sucessos: {results['success']}{RESET}")
    print(f"{ERROR}❌ Falhas: {results['failed']}{RESET}")
    
    success_rate = (results['success'] / results['total']) * 100 if results['total'] > 0 else 0
    print(f"\n{INFO}Taxa de sucesso: {success_rate:.1f}%{RESET}")
    
    if success_rate == 100:
        print(f"\n{SUCCESS}🎉 PERFEITO! Todos os testes passaram!{RESET}")
    elif success_rate >= 75:
        print(f"\n{WARNING}⚠️  BOM! Maioria dos testes passaram.{RESET}")
    else:
        print(f"\n{ERROR}❌ ATENÇÃO! Muitos testes falharam!{RESET}")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
