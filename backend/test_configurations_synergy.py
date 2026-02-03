"""
Script de Analise de Sinergia - Modulo de Configuracoes
Verifica integracao entre configuracoes e demais modulos do sistema
"""
import os
import re
from pathlib import Path
from typing import List, Dict, Set

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

class SynergyAnalyzer:
    def __init__(self):
        self.backend_path = Path("backend")
        self.frontend_path = Path("frontend/src")
        
        self.issues = []
        self.recommendations = []
        self.good_practices = []
        
    def log_issue(self, category, file, message):
        self.issues.append({
            'category': category,
            'file': file,
            'message': message
        })
        print(f"{Colors.RED}[PROBLEMA]{Colors.RESET} {category} - {file}")
        print(f"  {message}")
        
    def log_recommendation(self, category, message):
        self.recommendations.append({
            'category': category,
            'message': message
        })
        print(f"{Colors.YELLOW}[RECOMENDACAO]{Colors.RESET} {category}")
        print(f"  {message}")
        
    def log_good_practice(self, category, file, message):
        self.good_practices.append({
            'category': category,
            'file': file,
            'message': message
        })
        print(f"{Colors.GREEN}[BOA PRATICA]{Colors.RESET} {category} - {file}")
        print(f"  {message}")
    
    def search_in_file(self, file_path: Path, patterns: List[str]) -> Dict[str, List[int]]:
        """Busca padroes em um arquivo e retorna linhas onde foram encontrados"""
        results = {pattern: [] for pattern in patterns}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    for pattern in patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            results[pattern].append(line_num)
        except Exception as e:
            pass
            
        return results
    
    def analyze_financial_module(self):
        """Analisa integracao do modulo financeiro com Financial Settings"""
        print(f"\n{Colors.CYAN}=== ANALISANDO MODULO FINANCEIRO ==={Colors.RESET}")
        
        financial_files = [
            self.backend_path / "app/api/v1/endpoints/financial.py",
            self.backend_path / "app/models/financial.py",
        ]
        
        # Padroes a buscar
        checks = {
            'allow_retroactive_entries': 'Verifica lancamentos retroativos',
            'allow_operations_with_closed_cash': 'Verifica operacoes com caixa fechado',
            'require_category_on_transaction': 'Requer categoria em transacoes',
            'CompanyFinancialSettings': 'Usa configuracoes financeiras'
        }
        
        found_integrations = set()
        
        for file_path in financial_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Financeiro",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        # Verificar gaps
        missing = set(checks.keys()) - found_integrations
        if missing:
            self.log_issue(
                "Financeiro",
                "financial.py",
                f"Configuracoes nao utilizadas: {', '.join(missing)}"
            )
            self.log_recommendation(
                "Financeiro",
                "Implementar validacoes baseadas em CompanyFinancialSettings antes de criar/editar transacoes"
            )
    
    def analyze_notification_module(self):
        """Analisa integracao de notificacoes com Notification Settings"""
        print(f"\n{Colors.CYAN}=== ANALISANDO MODULO DE NOTIFICACOES ==={Colors.RESET}")
        
        notification_files = [
            self.backend_path / "app/api/v1/endpoints/notifications.py",
            self.backend_path / "app/models/notification.py",
            self.backend_path / "app/api/v1/endpoints/notification_system.py",
            self.backend_path / "app/api/v1/endpoints/appointments.py",
            self.backend_path / "app/services/notification_helper.py",
        ]
        
        checks = {
            'notify_new_appointment': 'Notifica novo agendamento',
            'notify_appointment_cancellation': 'Notifica cancelamento',
            'notify_client_return': 'Notifica retorno de cliente',
            'CompanyNotificationSettings': 'Usa configuracoes de notificacao',
            'notification_sound_enabled': 'Som de notificacao',
            'NotificationHelper': 'Helper de notificacoes',
            'should_send_notification': 'Verifica preferencias antes de enviar',
        }
        
        found_integrations = set()
        
        for file_path in notification_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Notificacoes",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        if not found_integrations:
            self.log_issue(
                "Notificacoes",
                "notification.py",
                "Nenhuma integracao com CompanyNotificationSettings encontrada"
            )
            self.log_recommendation(
                "Notificacoes",
                "Implementar verificacao de preferencias antes de enviar notificacoes"
            )
    
    def analyze_invoice_module(self):
        """Analisa uso de Company Details em faturas e documentos fiscais"""
        print(f"\n{Colors.CYAN}=== ANALISANDO MODULO DE FATURAS/NOTAS FISCAIS ==={Colors.RESET}")
        
        invoice_files = [
            self.backend_path / "app/api/v1/endpoints/invoices.py",
            self.backend_path / "app/models/invoice.py",
            self.backend_path / "app/api/v1/endpoints/documents.py",
        ]
        
        checks = {
            'CompanyDetails': 'Usa detalhes da empresa',
            'document_number': 'CPF/CNPJ',
            'municipal_registration': 'Inscricao Municipal',
            'state_registration': 'Inscricao Estadual',
            'company_name': 'Nome da empresa',
        }
        
        found_integrations = set()
        
        for file_path in invoice_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Faturas/Documentos",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        if 'CompanyDetails' not in found_integrations:
            self.log_issue(
                "Faturas/Documentos",
                "invoices.py",
                "Nao utiliza CompanyDetails para dados fiscais"
            )
            self.log_recommendation(
                "Faturas/Documentos",
                "Usar CompanyDetails.document_number, municipal_registration, etc em documentos fiscais"
            )
    
    def analyze_transaction_module(self):
        """Analisa uso de Admin Settings (moeda, timezone) em transacoes"""
        print(f"\n{Colors.CYAN}=== ANALISANDO MODULO DE TRANSACOES ==={Colors.RESET}")
        
        transaction_files = [
            self.backend_path / "app/models/financial.py",
            self.backend_path / "app/api/v1/endpoints/financial.py",
            self.backend_path / "app/models/payment.py",
        ]
        
        checks = {
            'CompanyAdminSettings': 'Usa configuracoes administrativas',
            'currency': 'Moeda',
            'timezone': 'Fuso horario',
            'date_format': 'Formato de data',
        }
        
        found_integrations = set()
        
        for file_path in transaction_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Transacoes",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        if 'currency' not in found_integrations:
            self.log_issue(
                "Transacoes",
                "financial.py",
                "Nao utiliza configuracao de moeda da empresa"
            )
            self.log_recommendation(
                "Transacoes",
                "Usar CompanyAdminSettings.currency para formatar valores monetarios"
            )
    
    def analyze_frontend_theme(self):
        """Analisa uso de Theme Settings no frontend"""
        print(f"\n{Colors.CYAN}=== ANALISANDO TEMA DO FRONTEND ==={Colors.RESET}")
        
        frontend_files = [
            self.frontend_path / "app/layout.tsx",
            self.frontend_path / "components/DashboardLayout.tsx",
            self.frontend_path / "components/Sidebar.tsx",
            self.frontend_path / "components/ThemeProvider.tsx",
            self.frontend_path / "hooks/useCompanyTheme.ts",
        ]
        
        checks = {
            'sidebar_color': 'Cor do menu lateral',
            'theme_mode': 'Modo do tema (light/dark)',
            'CompanyThemeSettings': 'Usa configuracoes de tema',
            'interface_language': 'Idioma da interface',
            'ThemeProvider': 'Provider de tema da empresa',
            'useCompanyTheme': 'Hook de tema da empresa',
            'applyTheme': 'Aplica configuracoes de tema',
        }
        
        found_integrations = set()
        
        for file_path in frontend_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Tema Frontend",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        if not found_integrations:
            self.log_issue(
                "Tema Frontend",
                "layout.tsx",
                "Frontend nao aplica configuracoes de tema da empresa"
            )
            self.log_recommendation(
                "Tema Frontend",
                "Carregar CompanyThemeSettings e aplicar sidebar_color, theme_mode e interface_language"
            )
    
    def analyze_appointment_module(self):
        """Analisa se agendamentos respeitam horarios de funcionamento"""
        print(f"\n{Colors.CYAN}=== ANALISANDO MODULO DE AGENDAMENTOS ==={Colors.RESET}")
        
        appointment_files = [
            self.backend_path / "app/api/v1/endpoints/appointments.py",
            self.backend_path / "app/models/appointment.py",
        ]
        
        checks = {
            'business_hours': 'Horarios de funcionamento',
            'timezone': 'Fuso horario',
            'CompanyAdminSettings': 'Configuracoes administrativas',
        }
        
        found_integrations = set()
        
        for file_path in appointment_files:
            if file_path.exists():
                results = self.search_in_file(file_path, list(checks.keys()))
                
                for pattern, lines in results.items():
                    if lines:
                        found_integrations.add(pattern)
                        self.log_good_practice(
                            "Agendamentos",
                            file_path.name,
                            f"{checks[pattern]} encontrado nas linhas {lines}"
                        )
        
        if 'timezone' not in found_integrations:
            self.log_issue(
                "Agendamentos",
                "appointments.py",
                "Nao utiliza timezone da empresa para agendar"
            )
            self.log_recommendation(
                "Agendamentos",
                "Usar CompanyAdminSettings.timezone para converter horarios corretamente"
            )
    
    def print_summary(self):
        """Imprime resumo da analise"""
        print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
        print(f"{Colors.CYAN}RESUMO DA ANALISE DE SINERGIA{Colors.RESET}")
        print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")
        
        print(f"\n{Colors.GREEN}Boas Praticas Encontradas: {len(self.good_practices)}{Colors.RESET}")
        if self.good_practices:
            categories = {}
            for item in self.good_practices:
                cat = item['category']
                categories[cat] = categories.get(cat, 0) + 1
            
            for cat, count in categories.items():
                print(f"  - {cat}: {count} integracoes")
        
        print(f"\n{Colors.RED}Problemas Identificados: {len(self.issues)}{Colors.RESET}")
        if self.issues:
            categories = {}
            for item in self.issues:
                cat = item['category']
                categories[cat] = categories.get(cat, 0) + 1
            
            for cat, count in categories.items():
                print(f"  - {cat}: {count} problemas")
        
        print(f"\n{Colors.YELLOW}Recomendacoes: {len(self.recommendations)}{Colors.RESET}")
        if self.recommendations:
            for i, rec in enumerate(self.recommendations, 1):
                print(f"  {i}. [{rec['category']}] {rec['message']}")
        
        print(f"\n{Colors.CYAN}{'='*60}{Colors.RESET}")
        
        # Calcular score de sinergia
        total_checks = len(self.good_practices) + len(self.issues)
        if total_checks > 0:
            synergy_score = (len(self.good_practices) / total_checks) * 100
            
            if synergy_score >= 80:
                color = Colors.GREEN
                status = "EXCELENTE"
            elif synergy_score >= 60:
                color = Colors.YELLOW
                status = "BOM"
            elif synergy_score >= 40:
                color = Colors.YELLOW
                status = "REGULAR"
            else:
                color = Colors.RED
                status = "NECESSITA MELHORIAS"
            
            print(f"\n{color}SCORE DE SINERGIA: {synergy_score:.1f}% - {status}{Colors.RESET}")
        
        print(f"{Colors.CYAN}{'='*60}{Colors.RESET}\n")
    
    def run_analysis(self):
        """Executa analise completa de sinergia"""
        print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")
        print(f"{Colors.CYAN}ANALISE DE SINERGIA - MODULO DE CONFIGURACOES{Colors.RESET}")
        print(f"{Colors.CYAN}{'='*60}{Colors.RESET}")
        
        self.analyze_financial_module()
        self.analyze_notification_module()
        self.analyze_invoice_module()
        self.analyze_transaction_module()
        self.analyze_frontend_theme()
        self.analyze_appointment_module()
        
        self.print_summary()
        
        return len(self.issues) == 0


if __name__ == "__main__":
    analyzer = SynergyAnalyzer()
    success = analyzer.run_analysis()
    
    exit(0 if success else 1)
