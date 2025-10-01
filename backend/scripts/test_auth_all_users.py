"""
Script para testar autenticação de todos os usuários demo
Verifica se os hashes de senha estão corretos
"""
import requests
from colorama import init, Fore, Style

init()

BASE_URL = "http://localhost:8000"

# Cores
SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

# Usuários demo para testar
DEMO_USERS = [
    {
        "name": "Admin Demo",
        "email": "admin@demo.com",
        "password": "demo123",
        "role": "admin",
        "icon": "🔴"
    },
    {
        "name": "Gerente Demo",
        "email": "gerente@demo.com",
        "password": "demo123",
        "role": "manager",
        "icon": "🔵"
    },
    {
        "name": "Profissional Demo",
        "email": "profissional@demo.com",
        "password": "demo123",
        "role": "professional",
        "icon": "🟢"
    },
    {
        "name": "Cliente Demo",
        "email": "cliente@demo.com",
        "password": "demo123",
        "role": "client",
        "icon": "🟣"
    },
    {
        "name": "João Silva",
        "email": "joao@demo.com",
        "password": "demo123",
        "role": "client",
        "icon": "👤"
    },
    {
        "name": "Maria Santos",
        "email": "maria@demo.com",
        "password": "demo123",
        "role": "professional",
        "icon": "💅"
    },
    {
        "name": "Pedro Costa",
        "email": "pedro@demo.com",
        "password": "demo123",
        "role": "professional",
        "icon": "💆"
    },
    {
        "name": "Ana Oliveira",
        "email": "ana@demo.com",
        "password": "demo123",
        "role": "client",
        "icon": "👤"
    },
]

def test_login(email, password):
    """Testa login de um usuário"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={
                "username": email,
                "password": password,
                "grant_type": "password"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            return True, data.get("access_token"), None
        else:
            return False, None, f"Status {response.status_code}: {response.text}"
    except Exception as e:
        return False, None, str(e)

def test_get_user_info(token):
    """Testa obter informações do usuário autenticado"""
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if response.status_code == 200:
            return True, response.json(), None
        else:
            return False, None, f"Status {response.status_code}"
    except Exception as e:
        return False, None, str(e)

def test_wrong_password(email):
    """Testa login com senha errada"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            data={
                "username": email,
                "password": "senha_errada_123",
                "grant_type": "password"
            },
            timeout=5
        )
        
        # Deve retornar 401 (não autorizado)
        return response.status_code == 401
    except Exception:
        return False

def main():
    print("\n" + "="*80)
    print(f"{INFO}🔐 TESTE DE AUTENTICAÇÃO - TODOS OS USUÁRIOS{RESET}")
    print("="*80 + "\n")
    
    results = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    for user in DEMO_USERS:
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{user['icon']} Testando: {user['name']} ({user['email']})")
        print(f"{INFO}{'='*80}{RESET}\n")
        
        results["total"] += 1
        user_success = True
        
        # Teste 1: Login com senha correta
        print(f"  1️⃣  Login com senha correta...", end=" ")
        success, token, error = test_login(user["email"], user["password"])
        
        if success:
            print(f"{SUCCESS}✅ SUCESSO{RESET}")
        else:
            print(f"{ERROR}❌ FALHOU - {error}{RESET}")
            user_success = False
            results["details"].append({
                "user": user["name"],
                "test": "Login",
                "error": error
            })
        
        # Teste 2: Obter informações do usuário
        if success and token:
            print(f"  2️⃣  Obter informações do usuário...", end=" ")
            info_success, user_data, error = test_get_user_info(token)
            
            if info_success:
                print(f"{SUCCESS}✅ SUCESSO{RESET}")
                print(f"      Nome: {user_data.get('full_name')}")
                print(f"      Email: {user_data.get('email')}")
                print(f"      Role: {user_data.get('role')}")
                
                # Verificar se o role está correto
                if user_data.get('role') == user['role']:
                    print(f"      {SUCCESS}✅ Role correto!{RESET}")
                else:
                    print(f"      {ERROR}❌ Role incorreto! Esperado: {user['role']}, Recebido: {user_data.get('role')}{RESET}")
                    user_success = False
            else:
                print(f"{ERROR}❌ FALHOU - {error}{RESET}")
                user_success = False
                results["details"].append({
                    "user": user["name"],
                    "test": "Get User Info",
                    "error": error
                })
        
        # Teste 3: Login com senha errada (deve falhar)
        print(f"  3️⃣  Login com senha errada (deve falhar)...", end=" ")
        wrong_pass_success = test_wrong_password(user["email"])
        
        if wrong_pass_success:
            print(f"{SUCCESS}✅ SUCESSO (bloqueou corretamente){RESET}")
        else:
            print(f"{ERROR}❌ FALHOU (não bloqueou senha errada!){RESET}")
            user_success = False
            results["details"].append({
                "user": user["name"],
                "test": "Wrong Password",
                "error": "Sistema não bloqueou senha incorreta"
            })
        
        # Teste 4: Verificar hash da senha
        print(f"  4️⃣  Hash da senha...", end=" ")
        if success:
            print(f"{SUCCESS}✅ Hash válido (login funcionou){RESET}")
        else:
            print(f"{ERROR}❌ Hash inválido ou senha incorreta{RESET}")
        
        # Resultado do usuário
        if user_success:
            print(f"\n  {SUCCESS}🎉 TODOS OS TESTES PASSARAM!{RESET}")
            results["success"] += 1
        else:
            print(f"\n  {ERROR}❌ ALGUNS TESTES FALHARAM!{RESET}")
            results["failed"] += 1
    
    # Resumo Final
    print("\n" + "="*80)
    print(f"{INFO}📊 RESUMO FINAL{RESET}")
    print("="*80 + "\n")
    
    print(f"Total de usuários testados: {results['total']}")
    print(f"{SUCCESS}✅ Sucessos: {results['success']}{RESET}")
    print(f"{ERROR}❌ Falhas: {results['failed']}{RESET}")
    
    success_rate = (results['success'] / results['total']) * 100 if results['total'] > 0 else 0
    print(f"\n{INFO}Taxa de sucesso: {success_rate:.1f}%{RESET}")
    
    # Detalhes dos erros
    if results["details"]:
        print(f"\n{ERROR}❌ DETALHES DOS ERROS:{RESET}")
        print("-" * 80)
        for detail in results["details"]:
            print(f"\n  Usuário: {detail['user']}")
            print(f"  Teste: {detail['test']}")
            print(f"  Erro: {detail['error']}")
    
    # Conclusão
    print("\n" + "="*80)
    if success_rate == 100:
        print(f"{SUCCESS}🎉 PERFEITO! Todos os usuários autenticam corretamente!{RESET}")
        print(f"{SUCCESS}✅ Hashes de senha funcionando perfeitamente!{RESET}")
        print(f"{SUCCESS}✅ Validação de senha funcionando!{RESET}")
    elif success_rate >= 75:
        print(f"{WARNING}⚠️  BOM! Maioria dos usuários funcionando, mas há problemas.{RESET}")
    else:
        print(f"{ERROR}❌ CRÍTICO! Muitos usuários com problemas de autenticação!{RESET}")
        print(f"{ERROR}🔧 Verifique os hashes de senha no banco de dados!{RESET}")
    
    print("="*80 + "\n")
    
    # Instruções
    if results["failed"] > 0:
        print(f"{WARNING}💡 COMO CORRIGIR:{RESET}")
        print("   1. Execute: python scripts/reset_demo_users.py")
        print("   2. Execute: python scripts/create_demo_users.py")
        print("   3. Execute este teste novamente\n")

if __name__ == "__main__":
    main()
