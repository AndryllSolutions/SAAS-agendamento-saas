"""
Script de Auditoria do Modulo de Configuracoes da Empresa
Testa todos os endpoints e funcionalidades do modulo
"""
import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8001/api/v1"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

class ConfigurationAudit:
    def __init__(self):
        self.token = None
        self.company_id = None
        self.passed_tests = 0
        self.failed_tests = 0
        self.warnings = 0
        
    def log_success(self, message):
        print(f"{Colors.GREEN}[OK]{Colors.RESET} {message}")
        self.passed_tests += 1
        
    def log_error(self, message):
        print(f"{Colors.RED}[ERRO]{Colors.RESET} {message}")
        self.failed_tests += 1
        
    def log_warning(self, message):
        print(f"{Colors.YELLOW}[AVISO]{Colors.RESET} {message}")
        self.warnings += 1
        
    def log_info(self, message):
        print(f"{Colors.BLUE}[INFO]{Colors.RESET} {message}")
    
    def authenticate(self):
        """Autentica e obtém token"""
        print("\n=== FASE 1: AUTENTICACAO ===")
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login-json",
                json={
                    "email": "admin@belezalatino.com",
                    "password": "admin123"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.company_id = data.get("user", {}).get("company_id")
                self.log_success(f"Autenticacao realizada - Company ID: {self.company_id}")
                return True
            else:
                self.log_error(f"Falha na autenticacao: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro na autenticacao: {str(e)}")
            return False
    
    def get_headers(self):
        """Retorna headers com autenticacao"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_get_all_settings(self):
        """Testa GET /settings/all"""
        print("\n=== TESTE 1: GET /settings/all ===")
        
        try:
            response = requests.get(
                f"{BASE_URL}/settings/all",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verificar estrutura
                required_keys = ['details', 'financial', 'notifications', 'theme', 'admin']
                missing_keys = [key for key in required_keys if key not in data]
                
                if missing_keys:
                    self.log_error(f"Chaves ausentes na resposta: {missing_keys}")
                else:
                    self.log_success("Endpoint /settings/all retornou estrutura completa")
                    
                # Verificar se criou registros padrao
                if all(data[key] is not None for key in required_keys):
                    self.log_success("Todos os registros padrao foram criados")
                else:
                    self.log_warning("Alguns registros estao nulos")
                    
                return data
            else:
                self.log_error(f"GET /settings/all falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return None
                
        except Exception as e:
            self.log_error(f"Erro no teste GET /settings/all: {str(e)}")
            return None
    
    def test_company_details(self):
        """Testa endpoints de Company Details"""
        print("\n=== TESTE 2: COMPANY DETAILS ===")
        
        # GET Details
        try:
            response = requests.get(
                f"{BASE_URL}/settings/details",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                self.log_success("GET /settings/details funcionando")
                details = response.json()
            else:
                self.log_error(f"GET /settings/details falhou: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erro ao obter details: {str(e)}")
            return False
        
        # PUT Details - Atualizar com dados validos
        update_data = {
            "company_type": "pessoa_juridica",
            "document_number": "12345678000190",
            "company_name": "Empresa Teste LTDA",
            "email": "contato@empresateste.com",
            "phone": "(45) 99999-9999",
            "whatsapp": "(45) 99999-9999",
            "postal_code": "85851-000",
            "address": "Rua Teste",
            "address_number": "123",
            "neighborhood": "Centro",
            "city": "Foz do Iguacu",
            "state": "PR",
            "country": "BR"
        }
        
        try:
            response = requests.put(
                f"{BASE_URL}/settings/details",
                headers=self.get_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                self.log_success("PUT /settings/details funcionando")
                updated = response.json()
                
                # Verificar se dados foram atualizados
                if updated.get("company_name") == update_data["company_name"]:
                    self.log_success("Dados atualizados corretamente")
                else:
                    self.log_warning("Dados podem nao ter sido atualizados corretamente")
            else:
                self.log_error(f"PUT /settings/details falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro ao atualizar details: {str(e)}")
            return False
        
        return True
    
    def test_financial_settings(self):
        """Testa endpoints de Financial Settings"""
        print("\n=== TESTE 3: FINANCIAL SETTINGS ===")
        
        # GET Financial
        try:
            response = requests.get(
                f"{BASE_URL}/settings/financial",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                self.log_success("GET /settings/financial funcionando")
            else:
                self.log_error(f"GET /settings/financial falhou: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erro ao obter financial: {str(e)}")
            return False
        
        # PUT Financial
        update_data = {
            "allow_retroactive_entries": True,
            "allow_invoice_edit_after_conference": True,
            "edit_only_value_after_conference": False,
            "allow_operations_with_closed_cash": False,
            "require_category_on_transaction": True,
            "require_payment_form_on_transaction": True
        }
        
        try:
            response = requests.put(
                f"{BASE_URL}/settings/financial",
                headers=self.get_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                self.log_success("PUT /settings/financial funcionando")
                updated = response.json()
                
                # Verificar atualizacao
                if updated.get("allow_retroactive_entries") == True:
                    self.log_success("Configuracoes financeiras atualizadas corretamente")
                else:
                    self.log_warning("Configuracoes financeiras podem nao ter sido atualizadas")
            else:
                self.log_error(f"PUT /settings/financial falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro ao atualizar financial: {str(e)}")
            return False
        
        return True
    
    def test_notification_settings(self):
        """Testa endpoints de Notification Settings"""
        print("\n=== TESTE 4: NOTIFICATION SETTINGS ===")
        
        # GET Notifications
        try:
            response = requests.get(
                f"{BASE_URL}/settings/notifications",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                self.log_success("GET /settings/notifications funcionando")
            else:
                self.log_error(f"GET /settings/notifications falhou: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erro ao obter notifications: {str(e)}")
            return False
        
        # PUT Notifications
        update_data = {
            "notify_new_appointment": True,
            "notify_appointment_cancellation": True,
            "notify_appointment_deletion": False,
            "notify_new_review": True,
            "notify_sms_response": False,
            "notify_client_return": True,
            "notify_goal_achievement": True,
            "notify_client_waiting": False,
            "notification_sound_enabled": True,
            "notification_duration_seconds": 10
        }
        
        try:
            response = requests.put(
                f"{BASE_URL}/settings/notifications",
                headers=self.get_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                self.log_success("PUT /settings/notifications funcionando")
                updated = response.json()
                
                # Verificar atualizacao
                if updated.get("notification_duration_seconds") == 10:
                    self.log_success("Configuracoes de notificacao atualizadas corretamente")
                else:
                    self.log_warning("Configuracoes de notificacao podem nao ter sido atualizadas")
            else:
                self.log_error(f"PUT /settings/notifications falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro ao atualizar notifications: {str(e)}")
            return False
        
        return True
    
    def test_theme_settings(self):
        """Testa endpoints de Theme Settings"""
        print("\n=== TESTE 5: THEME SETTINGS ===")
        
        # GET Theme
        try:
            response = requests.get(
                f"{BASE_URL}/settings/theme",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                self.log_success("GET /settings/theme funcionando")
            else:
                self.log_error(f"GET /settings/theme falhou: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erro ao obter theme: {str(e)}")
            return False
        
        # PUT Theme
        update_data = {
            "interface_language": "pt_BR",
            "sidebar_color": "#FF5733",
            "theme_mode": "dark",
            "custom_logo_url": "https://example.com/logo.png"
        }
        
        try:
            response = requests.put(
                f"{BASE_URL}/settings/theme",
                headers=self.get_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                self.log_success("PUT /settings/theme funcionando")
                updated = response.json()
                
                # Verificar atualizacao
                if updated.get("sidebar_color") == "#FF5733":
                    self.log_success("Configuracoes de tema atualizadas corretamente")
                else:
                    self.log_warning("Configuracoes de tema podem nao ter sido atualizadas")
            else:
                self.log_error(f"PUT /settings/theme falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro ao atualizar theme: {str(e)}")
            return False
        
        return True
    
    def test_admin_settings(self):
        """Testa endpoints de Admin Settings"""
        print("\n=== TESTE 6: ADMIN SETTINGS ===")
        
        # GET Admin
        try:
            response = requests.get(
                f"{BASE_URL}/settings/admin",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                self.log_success("GET /settings/admin funcionando")
            else:
                self.log_error(f"GET /settings/admin falhou: {response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Erro ao obter admin: {str(e)}")
            return False
        
        # PUT Admin
        update_data = {
            "default_message_language": "pt_BR",
            "currency": "BRL",
            "country": "BR",
            "timezone": "America/Sao_Paulo",
            "date_format": "DD/MM/YYYY",
            "time_format": "HH:mm",
            "additional_settings": {
                "teste": "valor_teste"
            }
        }
        
        try:
            response = requests.put(
                f"{BASE_URL}/settings/admin",
                headers=self.get_headers(),
                json=update_data
            )
            
            if response.status_code == 200:
                self.log_success("PUT /settings/admin funcionando")
                updated = response.json()
                
                # Verificar atualizacao
                if updated.get("currency") == "BRL":
                    self.log_success("Configuracoes administrativas atualizadas corretamente")
                else:
                    self.log_warning("Configuracoes administrativas podem nao ter sido atualizadas")
            else:
                self.log_error(f"PUT /settings/admin falhou: {response.status_code}")
                self.log_error(f"Resposta: {response.text}")
                return False
                
        except Exception as e:
            self.log_error(f"Erro ao atualizar admin: {str(e)}")
            return False
        
        return True
    
    def test_validations(self):
        """Testa validacoes dos schemas"""
        print("\n=== TESTE 7: VALIDACOES ===")
        
        # Testar email invalido
        try:
            response = requests.put(
                f"{BASE_URL}/settings/details",
                headers=self.get_headers(),
                json={"email": "email_invalido"}
            )
            
            if response.status_code == 422:
                self.log_success("Validacao de email funcionando (rejeitou email invalido)")
            else:
                self.log_warning(f"Validacao de email pode estar incorreta: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erro ao testar validacao de email: {str(e)}")
        
        # Testar cor invalida
        try:
            response = requests.put(
                f"{BASE_URL}/settings/theme",
                headers=self.get_headers(),
                json={"sidebar_color": "cor_invalida"}
            )
            
            if response.status_code == 422:
                self.log_success("Validacao de cor funcionando (rejeitou cor invalida)")
            else:
                self.log_warning(f"Validacao de cor pode estar incorreta: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erro ao testar validacao de cor: {str(e)}")
        
        # Testar notification_duration_seconds fora do range
        try:
            response = requests.put(
                f"{BASE_URL}/settings/notifications",
                headers=self.get_headers(),
                json={"notification_duration_seconds": 100}
            )
            
            if response.status_code == 422:
                self.log_success("Validacao de duracao de notificacao funcionando")
            else:
                self.log_warning(f"Validacao de duracao pode estar incorreta: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erro ao testar validacao de duracao: {str(e)}")
    
    def test_permissions(self):
        """Testa permissoes de acesso"""
        print("\n=== TESTE 8: PERMISSOES ===")
        
        # Tentar acessar sem token
        try:
            response = requests.get(f"{BASE_URL}/settings/all")
            
            if response.status_code == 401:
                self.log_success("Protecao de autenticacao funcionando")
            else:
                self.log_warning(f"Endpoint pode estar desprotegido: {response.status_code}")
        except Exception as e:
            self.log_error(f"Erro ao testar autenticacao: {str(e)}")
    
    def print_summary(self):
        """Imprime resumo da auditoria"""
        print("\n" + "="*60)
        print("RESUMO DA AUDITORIA")
        print("="*60)
        print(f"{Colors.GREEN}Testes Aprovados: {self.passed_tests}{Colors.RESET}")
        print(f"{Colors.RED}Testes Falhados: {self.failed_tests}{Colors.RESET}")
        print(f"{Colors.YELLOW}Avisos: {self.warnings}{Colors.RESET}")
        print("="*60)
        
        if self.failed_tests == 0:
            print(f"{Colors.GREEN}AUDITORIA CONCLUIDA COM SUCESSO!{Colors.RESET}")
            return 0
        else:
            print(f"{Colors.RED}AUDITORIA ENCONTROU PROBLEMAS!{Colors.RESET}")
            return 1
    
    def run_audit(self):
        """Executa auditoria completa"""
        print("="*60)
        print("AUDITORIA DO MODULO DE CONFIGURACOES DA EMPRESA")
        print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # Autenticar
        if not self.authenticate():
            print("\nERRO: Nao foi possivel autenticar. Verifique se o backend esta rodando.")
            return 1
        
        # Executar testes
        self.test_get_all_settings()
        self.test_company_details()
        self.test_financial_settings()
        self.test_notification_settings()
        self.test_theme_settings()
        self.test_admin_settings()
        self.test_validations()
        self.test_permissions()
        
        # Resumo
        return self.print_summary()


if __name__ == "__main__":
    audit = ConfigurationAudit()
    exit_code = audit.run_audit()
    sys.exit(exit_code)
