"""
Script para verificar configuração de rede para mobile
"""
import socket
import subprocess
import platform
from colorama import init, Fore, Style

init()

SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

def get_local_ip():
    """Obtém IP local da máquina"""
    try:
        # Conecta a um servidor externo para descobrir IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None

def check_port_open(port=8000):
    """Verifica se porta está aberta"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except Exception:
        return False

def get_network_info():
    """Obtém informações de rede"""
    print(f"\n{INFO}{'='*80}{RESET}")
    print(f"{INFO}🌐 INFORMAÇÕES DE REDE PARA MOBILE{RESET}")
    print(f"{INFO}{'='*80}{RESET}\n")
    
    # IP Local
    local_ip = get_local_ip()
    if local_ip:
        print(f"{SUCCESS}✅ IP Local: {local_ip}{RESET}")
        print(f"{INFO}   Use este IP no mobile: http://{local_ip}:8000{RESET}")
    else:
        print(f"{ERROR}❌ Não foi possível obter IP local{RESET}")
    
    # Porta 8000
    port_open = check_port_open(8000)
    if port_open:
        print(f"{SUCCESS}✅ Porta 8000 está aberta{RESET}")
    else:
        print(f"{WARNING}⚠️  Porta 8000 pode não estar acessível{RESET}")
        print(f"{WARNING}   Verifique firewall e se o servidor está rodando{RESET}")
    
    # URLs para mobile
    print(f"\n{INFO}📱 URLs para usar no Mobile:{RESET}")
    if local_ip:
        print(f"{INFO}   Android Emulador: http://10.0.2.2:8000{RESET}")
        print(f"{INFO}   iOS Simulador: http://localhost:8000{RESET}")
        print(f"{INFO}   Dispositivo Físico: http://{local_ip}:8000{RESET}")
    
    # Endpoints
    print(f"\n{INFO}🔗 Endpoints de Autenticação:{RESET}")
    if local_ip:
        print(f"{INFO}   Login JSON: http://{local_ip}:8000/api/v1/auth/login/json{RESET}")
        print(f"{INFO}   Refresh JSON: http://{local_ip}:8000/api/v1/auth/refresh/json{RESET}")
    
    # Credenciais
    print(f"\n{INFO}🔐 Credenciais de Teste:{RESET}")
    print(f"{INFO}   Email: teste@mobile.com{RESET}")
    print(f"{INFO}   Senha: mobile123{RESET}")
    
    # Checklist
    print(f"\n{INFO}✅ Checklist:{RESET}")
    print(f"{INFO}   [ ] Mobile e servidor na mesma rede Wi-Fi{RESET}")
    print(f"{INFO}   [ ] Firewall permite porta 8000{RESET}")
    print(f"{INFO}   [ ] URL no mobile usa IP correto{RESET}")
    print(f"{INFO}   [ ] Endpoint usa /login/json (não /login){RESET}")
    print(f"{INFO}   [ ] Headers Content-Type: application/json{RESET}")
    
    print(f"\n{INFO}{'='*80}{RESET}")

if __name__ == "__main__":
    get_network_info()

