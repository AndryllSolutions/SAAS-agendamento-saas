"""
Script de Validação Completa de CORS
Testa múltiplos cenários de CORS em ambiente de pré-produção com ngrok
"""

import sys
import os
import requests
import json
import time
from typing import Dict, List, Tuple
from pathlib import Path

# Adicionar backend ao path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Importar configurações
try:
    from app.core.config import settings
    from app.core.database import engine
    from sqlalchemy import text
except ImportError as e:
    print(f"ERRO: Não foi possível importar configurações: {e}")
    print("Execute este script dentro do container Docker ou com ambiente Python configurado")
    sys.exit(1)

class CORSValidator:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip('/')
        self.api_base = f"{base_url}/api/v1"
        self.session = requests.Session()
        self.session.timeout = 10
        
        # Headers comuns para testes
        self.common_headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
        
        # Credenciais de teste
        self.test_credentials = {
            'username': 'admin@belezalatino.com',
            'password': 'admin123'
        }
        
        self.results = []
        
    def log_result(self, test_name: str, status: str, details: str = "", data: Dict = None):
        """Registrar resultado do teste"""
        result = {
            'test': test_name,
            'status': status,
            'details': details,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'data': data or {}
        }
        self.results.append(result)
        
        icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{icon} {test_name}: {status}")
        if details:
            print(f"   {details}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        print()
    
    def test_cors_preflight(self, origin: str) -> Dict:
        """Testar preflight OPTIONS request"""
        headers = {
            'Origin': origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Authorization, Content-Type',
            **self.common_headers
        }
        
        try:
            response = self.session.options(
                f"{self.api_base}/auth/me",
                headers=headers
            )
            
            cors_headers = {
                'access_control_allow_origin': response.headers.get('Access-Control-Allow-Origin'),
                'access_control_allow_credentials': response.headers.get('Access-Control-Allow-Credentials'),
                'access_control_allow_methods': response.headers.get('Access-Control-Allow-Methods'),
                'access_control_allow_headers': response.headers.get('Access-Control-Allow-Headers'),
                'status_code': response.status_code
            }
            
            return cors_headers
            
        except Exception as e:
            return {'error': str(e)}
    
    def test_authenticated_request(self, origin: str, token: str = None) -> Dict:
        """Testar request autenticada com origin específica"""
        headers = {
            'Origin': origin,
            **self.common_headers
        }
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            response = self.session.get(
                f"{self.api_base}/users/me",
                headers=headers
            )
            
            return {
                'status_code': response.status_code,
                'cors_origin': response.headers.get('Access-Control-Allow-Origin'),
                'cors_credentials': response.headers.get('Access-Control-Allow-Credentials'),
                'response_data': response.json() if response.headers.get('content-type', '').startswith('application/json') else None
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_auth_token(self, origin: str = None) -> str:
        """Obter token de autenticação"""
        headers = {
            'Origin': origin or 'http://localhost:3000',
            'Content-Type': 'application/x-www-form-urlencoded',
            **self.common_headers
        }
        
        try:
            response = self.session.post(
                f"{self.api_base}/auth/login",
                data=self.test_credentials,
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                return None
                
        except Exception as e:
            print(f"Erro ao obter token: {e}")
            return None
    
    def validate_cors_configuration(self) -> Dict:
        """Validar configuração atual de CORS"""
        print("🔍 Análise da Configuração CORS")
        print("=" * 50)
        
        # Obter configurações do settings
        cors_origins = settings.get_cors_origins()
        cors_allow_all = settings.CORS_ALLOW_ALL
        frontend_url = settings.FRONTEND_URL
        public_url = settings.PUBLIC_URL
        
        config_info = {
            'cors_origins': cors_origins,
            'cors_allow_all': cors_allow_all,
            'frontend_url': frontend_url,
            'public_url': public_url,
            'debug': settings.DEBUG,
            'environment': settings.ENVIRONMENT
        }
        
        self.log_result(
            "Configuração CORS Atual",
            "INFO",
            f"Origins: {len(cors_origins)}, Allow All: {cors_allow_all}",
            config_info
        )
        
        # Verificar uso de wildcard
        if "*" in cors_origins:
            self.log_result(
                "Uso de Wildcard (*)",
                "WARN",
                "Wildcard detectado - credentials serão desabilitados"
            )
        
        # Verificar origins de ngrok
        ngrok_origins = [o for o in cors_origins if 'ngrok' in o]
        if ngrok_origins:
            self.log_result(
                "Origens Ngrok Configuradas",
                "INFO",
                f"{len(ngrok_origins)} origens ngrok encontradas"
            )
        else:
            self.log_result(
                "Origens Ngrok Configuradas",
                "WARN",
                "Nenhuma origem ngrok explícita configurada"
            )
        
        return config_info
    
    def test_origins_list(self) -> List[str]:
        """Lista de origins para testar"""
        origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "https://random-domain.com",  # Origin não permitida
        ]
        
        # Adicionar origins configuradas
        if settings.FRONTEND_URL:
            origins.append(settings.FRONTEND_URL)
        if settings.PUBLIC_URL:
            origins.append(settings.PUBLIC_URL)
        
        # Adicionar origins de ambiente
        env_origins = [
            os.getenv("NGROK_URL"),
            os.getenv("NGROK_FRONTEND_URL"),
            os.getenv("CLOUDFLARE_TUNNEL_URL"),
            os.getenv("LOCALTUNNEL_URL")
        ]
        
        for origin in env_origins:
            if origin and origin not in origins:
                origins.append(origin)
        
        return [o for o in origins if o]
    
    def test_cors_scenarios(self):
        """Testar múltiplos cenários de CORS"""
        print("\n🧪 Testes de CORS - Cenários Múltiplos")
        print("=" * 50)
        
        origins = self.test_origins_list()
        token = self.get_auth_token("http://localhost:3000")
        
        if not token:
            self.log_result(
                "Obtenção de Token",
                "FAIL",
                "Não foi possível obter token de autenticação"
            )
            return
        
        self.log_result(
            "Obtenção de Token",
            "PASS",
            "Token obtido com sucesso"
        )
        
        # Testar cada origin
        for origin in origins:
            print(f"\n📍 Testando Origin: {origin}")
            print("-" * 40)
            
            # Test 1: Preflight OPTIONS
            preflight_result = self.test_cors_preflight(origin)
            if 'error' in preflight_result:
                self.log_result(
                    f"Preflight OPTIONS - {origin}",
                    "FAIL",
                    preflight_result['error']
                )
            else:
                # Verificar se origin está permitida
                allowed_origin = preflight_result.get('access_control_allow_origin')
                credentials = preflight_result.get('access_control_allow_credentials')
                
                if allowed_origin == origin or allowed_origin == "*":
                    self.log_result(
                        f"Preflight OPTIONS - {origin}",
                        "PASS",
                        f"Origin permitida: {allowed_origin}"
                    )
                else:
                    self.log_result(
                        f"Preflight OPTIONS - {origin}",
                        "FAIL",
                        f"Origin não permitida: {allowed_origin}"
                    )
            
            # Test 2: Request autenticada
            auth_result = self.test_authenticated_request(origin, token)
            if 'error' in auth_result:
                self.log_result(
                    f"Request Autenticada - {origin}",
                    "FAIL",
                    auth_result['error']
                )
            else:
                status = auth_result.get('status_code')
                cors_origin = auth_result.get('cors_origin')
                
                if status == 200:
                    self.log_result(
                        f"Request Autenticada - {origin}",
                        "PASS",
                        f"Status: {status}, CORS Origin: {cors_origin}"
                    )
                else:
                    self.log_result(
                        f"Request Autenticada - {origin}",
                        "FAIL",
                        f"Status inesperado: {status}"
                    )
            
            # Test 3: Request não autenticada
            auth_result_no_token = self.test_authenticated_request(origin)
            if 'error' in auth_result_no_token:
                self.log_result(
                    f"Request Não Autenticada - {origin}",
                    "FAIL",
                    auth_result_no_token['error']
                )
            else:
                status = auth_result_no_token.get('status_code')
                if status == 401:
                    self.log_result(
                        f"Request Não Autenticada - {origin}",
                        "PASS",
                        f"Status correto: {status} (não autenticado)"
                    )
                else:
                    self.log_result(
                        f"Request Não Autenticada - {origin}",
                        "WARN",
                        f"Status inesperado: {status}"
                    )
    
    def test_ngrok_regex(self):
        """Testar regex de ngrok se configurado"""
        print("\n🔗 Teste de Regex Ngrok")
        print("=" * 30)
        
        # Testar URLs de ngrok
        test_ngrok_urls = [
            "https://abc123.ngrok-free.app",
            "https://test-456.ngrok.io",
            "https://my-tunnel.ngrok-free.app",
            "https://invalid.ngrok.com",  # Não deve match
            "https://other-domain.com",    # Não deve match
        ]
        
        ngrok_regex = r"https?://[a-z0-9-]+\.ngrok-free\.app|https?://[a-z0-9-]+\.ngrok\.io"
        import re
        
        pattern = re.compile(ngrok_regex)
        
        for url in test_ngrok_urls:
            match = pattern.match(url)
            status = "PASS" if match else "FAIL"
            expected = "deve" if ('ngrok' in url and ('.ngrok-free.app' in url or '.ngrok.io' in url)) else "não deve"
            
            self.log_result(
                f"Regex Ngrok - {url}",
                status,
                f"Match: {bool(match)}, {expected} permitir"
            )
    
    def test_security_headers(self):
        """Testar headers de segurança relacionados ao CORS"""
        print("\n🔒 Headers de Segurança")
        print("=" * 30)
        
        try:
            response = self.session.get(f"{self.api_base}/auth/me")
            
            security_headers = {
                'x_content_type_options': response.headers.get('X-Content-Type-Options'),
                'x_frame_options': response.headers.get('X-Frame-Options'),
                'x_xss_protection': response.headers.get('X-XSS-Protection'),
                'strict_transport_security': response.headers.get('Strict-Transport-Security'),
                'content_security_policy': response.headers.get('Content-Security-Policy'),
            }
            
            self.log_result(
                "Headers de Segurança",
                "INFO",
                "Headers presentes no response",
                security_headers
            )
            
        except Exception as e:
            self.log_result(
                "Headers de Segurança",
                "FAIL",
                f"Erro ao obter headers: {e}"
            )
    
    def test_credentials_support(self):
        """Testar suporte a credentials (cookies, auth headers)"""
        print("\n🔑 Suporte a Credentials")
        print("=" * 35)
        
        origins = self.test_origins_list()[:3]  # Testar apenas 3 origins
        token = self.get_auth_token()
        
        if not token:
            self.log_result(
                "Teste Credentials",
                "FAIL",
                "Token não disponível"
            )
            return
        
        for origin in origins:
            # Testar com Authorization header
            headers = {
                'Origin': origin,
                'Authorization': f'Bearer {token}',
                **self.common_headers
            }
            
            try:
                response = self.session.get(f"{self.api_base}/users/me", headers=headers)
                cors_credentials = response.headers.get('Access-Control-Allow-Credentials')
                
                if cors_credentials == 'true':
                    self.log_result(
                        f"Credentials - {origin}",
                        "PASS",
                        f"CORS Credentials: {cors_credentials}"
                    )
                else:
                    self.log_result(
                        f"Credentials - {origin}",
                        "WARN",
                        f"CORS Credentials: {cors_credentials}"
                    )
                
            except Exception as e:
                self.log_result(
                    f"Credentials - {origin}",
                    "FAIL",
                    str(e)
                )
    
    def generate_report(self):
        """Gerar relatório final"""
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL DE VALIDAÇÃO CORS")
        print("=" * 60)
        
        # Contar resultados
        total_tests = len(self.results)
        passed = len([r for r in self.results if r['status'] == 'PASS'])
        failed = len([r for r in self.results if r['status'] == 'FAIL'])
        warnings = len([r for r in self.results if r['status'] == 'WARN'])
        info = len([r for r in self.results if r['status'] == 'INFO'])
        
        print(f"Total de Testes: {total_tests}")
        print(f"✅ Passaram: {passed}")
        print(f"❌ Falharam: {failed}")
        print(f"⚠️ Avisos: {warnings}")
        print(f"ℹ️ Informações: {info}")
        print()
        
        # Análise crítica
        critical_failures = []
        for result in self.results:
            if result['status'] == 'FAIL' and 'ngrok' in result.get('details', ''):
                critical_failures.append(result)
        
        if critical_failures:
            print("🚨 FALHAS CRÍTICAS IDENTIFICADAS:")
            for failure in critical_failures:
                print(f"   - {failure['test']}: {failure['details']}")
            print()
        
        # Recomendações
        print("📋 RECOMENDAÇÕES:")
        
        if failed > 0:
            print("   1. Corrigir falhas de CORS antes de ir para produção")
        
        if warnings > 0:
            print("   2. Investigar avisos de configuração")
        
        if "*" in settings.get_cors_origins():
            print("   3. Considerar usar origins explícitas em produção")
        
        if len([o for o in settings.get_cors_origins() if 'ngrok' in o]) == 0:
            print("   4. Adicionar origins de ngrok se usar túneis")
        
        print("   5. Testar com diferentes usuários (profissional, admin)")
        print("   6. Validar em ambiente de pré-produção real")
        print()
        
        # Salvar relatório em arquivo
        report_data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'summary': {
                'total': total_tests,
                'passed': passed,
                'failed': failed,
                'warnings': warnings,
                'info': info
            },
            'configuration': {
                'cors_origins': settings.get_cors_origins(),
                'cors_allow_all': settings.CORS_ALLOW_ALL,
                'environment': settings.ENVIRONMENT
            },
            'results': self.results
        }
        
        report_file = f"cors_validation_report_{int(time.time())}.json"
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)
            print(f"📄 Relatório detalhado salvo em: {report_file}")
        except Exception as e:
            print(f"⚠️ Erro ao salvar relatório: {e}")
        
        return failed == 0

def main():
    """Função principal"""
    print("🔍 VALIDAÇÃO COMPLETA DE CORS")
    print("Ambiente: Pré-produção com Ngrok")
    print("=" * 50)
    
    # Verificar se backend está rodando
    try:
        response = requests.get("http://localhost:8000/api/v1/", timeout=5)
        if response.status_code not in [200, 404]:  # 404 é OK, significa que API está respondendo
            print("❌ Backend não está saudável")
            return False
    except Exception as e:
        print(f"❌ Backend não está acessível: {e}")
        print("   Verifique se o container está rodando em localhost:8000")
        return False
    
    print("✅ Backend está acessível")
    print()
    
    # Iniciar validação
    validator = CORSValidator()
    
    try:
        # 1. Validar configuração
        validator.validate_cors_configuration()
        
        # 2. Testar cenários de CORS
        validator.test_cors_scenarios()
        
        # 3. Testar regex de ngrok
        validator.test_ngrok_regex()
        
        # 4. Testar headers de segurança
        validator.test_security_headers()
        
        # 5. Testar suporte a credentials
        validator.test_credentials_support()
        
        # 6. Gerar relatório
        success = validator.generate_report()
        
        if success:
            print("\n🎉 VALIDAÇÃO CORS CONCLUÍDA COM SUCESSO!")
            return True
        else:
            print("\n❌ VALIDAÇÃO CORS IDENTIFICOU PROBLEMAS!")
            return False
            
    except Exception as e:
        print(f"\n💥 ERRO DURANTE VALIDAÇÃO: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
