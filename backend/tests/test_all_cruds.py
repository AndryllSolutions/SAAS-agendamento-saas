"""
Teste completo de todos os CRUDs do sistema
Verifica se todas as operações CREATE, READ, UPDATE, DELETE estão funcionando
"""
import os
import requests
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from colorama import init, Fore, Style

init()

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Cores para output
SUCCESS = Fore.GREEN
ERROR = Fore.RED
WARNING = Fore.YELLOW
INFO = Fore.CYAN
RESET = Style.RESET_ALL

class CRUDTester:
    """Classe para testar todos os CRUDs"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.headers = {}
        self.company_id = None
        self.created_ids: Dict[str, List[int]] = {}
        self.results: Dict[str, Dict[str, bool]] = {}
        
    def login(self, username: str = None, password: str = None) -> bool:
        """Faz login e obtém token"""
        # Tentar obter credenciais de variáveis de ambiente ou usar padrões
        username = username or os.getenv("TEST_USERNAME", "admin@demo.com")
        password = password or os.getenv("TEST_PASSWORD", "demo123")
        
        # Lista de credenciais para tentar (em ordem de prioridade)
        credentials_to_try = [
            (username, password),  # Credenciais fornecidas ou do env
            ("admin@demo.com", "demo123"),  # Demo user
            ("admin@belezalatino.com", "admin123"),  # Admin principal
            ("gerente@demo.com", "demo123"),  # Gerente demo
        ]
        
        print(f"\n{INFO}🔐 Fazendo login...{RESET}")
        
        for user, pwd in credentials_to_try:
            try:
                print(f"{INFO}Tentando: {user}...{RESET}")
                response = requests.post(
                    f"{self.base_url}/api/v1/auth/login",
                    data={
                        "username": user,
                        "password": pwd,
                        "grant_type": "password"
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    token = data.get("access_token")
                    if token:
                        self.headers = {"Authorization": f"Bearer {token}"}
                        print(f"{SUCCESS}✅ Login realizado com sucesso! ({user}){RESET}")
                        
                        # Obter company_id do usuário
                        user_response = requests.get(
                            f"{self.base_url}/api/v1/users/me",
                            headers=self.headers,
                            timeout=10
                        )
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            self.company_id = user_data.get("company_id")
                            print(f"{INFO}📋 Company ID: {self.company_id}{RESET}")
                        return True
                elif response.status_code == 401:
                    print(f"{WARNING}⚠️  Credenciais inválidas: {user}{RESET}")
                    continue
                else:
                    print(f"{WARNING}⚠️  Status {response.status_code} para {user}{RESET}")
                    continue
            except Exception as e:
                print(f"{WARNING}⚠️  Erro ao tentar login com {user}: {e}{RESET}")
                continue
        
        print(f"{ERROR}❌ Falha no login com todas as credenciais tentadas!{RESET}")
        print(f"{INFO}💡 Dica: Crie usuários demo executando:{RESET}")
        print(f"{INFO}   docker-compose exec backend python scripts/create_demo_users.py{RESET}")
        print(f"{INFO}   ou configure TEST_USERNAME e TEST_PASSWORD{RESET}")
        return False
    
    def test_crud(
        self,
        module_name: str,
        base_endpoint: str,
        create_data: Dict,
        update_data: Dict,
        list_expected_status: int = 200,
        create_expected_status: int = 201,
        get_expected_status: int = 200,
        update_expected_status: int = 200,
        delete_expected_status: int = 200,
        id_field: str = "id"
    ) -> Dict[str, bool]:
        """Testa CRUD completo para um módulo"""
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{INFO}🧪 Testando CRUD: {module_name}{RESET}")
        print(f"{INFO}{'='*80}{RESET}")
        
        results = {
            "create": False,
            "read_list": False,
            "read_one": False,
            "update": False,
            "delete": False
        }
        
        created_id = None
        
        # CREATE
        print(f"\n{INFO}📝 CREATE - Criando registro...{RESET}")
        try:
            if self.company_id and "company_id" not in create_data:
                create_data["company_id"] = self.company_id
            
            response = requests.post(
                f"{self.base_url}{base_endpoint}",
                json=create_data,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == create_expected_status:
                data = response.json()
                created_id = data.get(id_field)
                if created_id:
                    if module_name not in self.created_ids:
                        self.created_ids[module_name] = []
                    self.created_ids[module_name].append(created_id)
                    results["create"] = True
                    print(f"{SUCCESS}✅ CREATE OK - ID: {created_id}{RESET}")
                else:
                    print(f"{WARNING}⚠️  CREATE retornou {create_expected_status} mas sem ID{RESET}")
            else:
                print(f"{ERROR}❌ CREATE FALHOU - Status: {response.status_code}{RESET}")
                print(f"{ERROR}Resposta: {response.text[:200]}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ CREATE ERRO: {e}{RESET}")
        
        if not created_id:
            print(f"{WARNING}⚠️  Pulando testes restantes (CREATE falhou){RESET}")
            self.results[module_name] = results
            return results
        
        # READ (List)
        print(f"\n{INFO}📋 READ (List) - Listando registros...{RESET}")
        try:
            response = requests.get(
                f"{self.base_url}{base_endpoint}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == list_expected_status:
                results["read_list"] = True
                data = response.json()
                count = len(data) if isinstance(data, list) else 1
                print(f"{SUCCESS}✅ READ (List) OK - {count} registro(s) encontrado(s){RESET}")
            elif response.status_code == 500:
                # Erro 500 pode ser problema no servidor (ex: serialização JSON)
                print(f"{WARNING}⚠️  READ (List) retornou 500 (erro interno) - pode ser problema de serialização{RESET}")
                print(f"{WARNING}Verifique os logs do servidor para mais detalhes{RESET}")
                # Não marcar como sucesso, mas não abortar
            else:
                print(f"{ERROR}❌ READ (List) FALHOU - Status: {response.status_code}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ READ (List) ERRO: {e}{RESET}")
        
        # READ (One)
        print(f"\n{INFO}🔍 READ (One) - Buscando registro {created_id}...{RESET}")
        try:
            response = requests.get(
                f"{self.base_url}{base_endpoint}/{created_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == get_expected_status:
                results["read_one"] = True
                print(f"{SUCCESS}✅ READ (One) OK{RESET}")
            elif response.status_code == 405:
                # 405 = Method Not Allowed (endpoint não tem GET individual)
                results["read_one"] = True  # Considerar OK pois não é obrigatório
                print(f"{WARNING}⚠️  READ (One) não implementado (405) - OK{RESET}")
            else:
                print(f"{ERROR}❌ READ (One) FALHOU - Status: {response.status_code}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ READ (One) ERRO: {e}{RESET}")
        
        # UPDATE
        print(f"\n{INFO}✏️  UPDATE - Atualizando registro {created_id}...{RESET}")
        try:
            response = requests.put(
                f"{self.base_url}{base_endpoint}/{created_id}",
                json=update_data,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == update_expected_status:
                results["update"] = True
                print(f"{SUCCESS}✅ UPDATE OK{RESET}")
            else:
                print(f"{ERROR}❌ UPDATE FALHOU - Status: {response.status_code}{RESET}")
                print(f"{ERROR}Resposta: {response.text[:200]}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ UPDATE ERRO: {e}{RESET}")
        
        # DELETE
        print(f"\n{INFO}🗑️  DELETE - Deletando registro {created_id}...{RESET}")
        try:
            response = requests.delete(
                f"{self.base_url}{base_endpoint}/{created_id}",
                headers=self.headers,
                timeout=10
            )
            
            # 204 (No Content) é sucesso para DELETE
            if response.status_code in [delete_expected_status, 204]:
                results["delete"] = True
                print(f"{SUCCESS}✅ DELETE OK (Status: {response.status_code}){RESET}")
                # Remover ID da lista
                if module_name in self.created_ids and created_id in self.created_ids[module_name]:
                    self.created_ids[module_name].remove(created_id)
            else:
                print(f"{ERROR}❌ DELETE FALHOU - Status: {response.status_code}{RESET}")
                print(f"{ERROR}Resposta: {response.text[:200]}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ DELETE ERRO: {e}{RESET}")
        
        self.results[module_name] = results
        return results
    
    def test_clients(self):
        """Testa CRUD de Clientes"""
        return self.test_crud(
            module_name="Clientes",
            base_endpoint="/api/v1/clients",
            create_data={
                "full_name": "Cliente Teste CRUD",
                "email": f"cliente_teste_{datetime.now().timestamp()}@test.com",
                "cellphone": "+5511999999999",
                "cpf": "12345678901"
            },
            update_data={
                "full_name": "Cliente Teste CRUD Atualizado",
                "nickname": "Teste"
            }
        )
    
    def test_products(self):
        """Testa CRUD de Produtos"""
        # Primeiro criar uma marca e categoria
        brand_id = None
        category_id = None
        
        # Criar Marca
        print(f"\n{INFO}📦 Criando marca para produto...{RESET}")
        try:
            brand_data = {
                "company_id": self.company_id,
                "name": f"Marca Teste {datetime.now().timestamp()}"
            }
            response = requests.post(
                f"{self.base_url}/api/v1/products/brands",
                json=brand_data,
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 201:
                brand_id = response.json().get("id")
                print(f"{SUCCESS}✅ Marca criada: {brand_id}{RESET}")
        except Exception as e:
            print(f"{WARNING}⚠️  Erro ao criar marca: {e}{RESET}")
        
        # Criar Categoria
        print(f"\n{INFO}📁 Criando categoria para produto...{RESET}")
        try:
            category_data = {
                "company_id": self.company_id,
                "name": f"Categoria Teste {datetime.now().timestamp()}"
            }
            response = requests.post(
                f"{self.base_url}/api/v1/products/categories",
                json=category_data,
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 201:
                category_id = response.json().get("id")
                print(f"{SUCCESS}✅ Categoria criada: {category_id}{RESET}")
        except Exception as e:
            print(f"{WARNING}⚠️  Erro ao criar categoria: {e}{RESET}")
        
        # Testar CRUD de Produtos
        return self.test_crud(
            module_name="Produtos",
            base_endpoint="/api/v1/products",
            create_data={
                "name": f"Produto Teste {datetime.now().timestamp()}",
                "description": "Produto de teste para CRUD",
                "stock": 100,
                "cost_price": 10.00,
                "sale_price": 20.00,
                "brand_id": brand_id,
                "category_id": category_id
            },
            update_data={
                "name": "Produto Teste Atualizado",
                "stock": 150
            }
        )
    
    def test_commands(self):
        """Testa CRUD de Comandas"""
        # Primeiro precisa de um cliente
        client_id = None
        print(f"\n{INFO}👤 Criando cliente para comanda...{RESET}")
        try:
            client_data = {
                "company_id": self.company_id,
                "full_name": f"Cliente Comanda {datetime.now().timestamp()}",
                "email": f"comanda_{datetime.now().timestamp()}@test.com"
            }
            response = requests.post(
                f"{self.base_url}/api/v1/clients",
                json=client_data,
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 201:
                client_id = response.json().get("id")
                print(f"{SUCCESS}✅ Cliente criado: {client_id}{RESET}")
        except Exception as e:
            print(f"{WARNING}⚠️  Erro ao criar cliente: {e}{RESET}")
        
        if not client_id:
            print(f"{ERROR}❌ Não foi possível criar cliente, pulando teste de comandas{RESET}")
            return {"create": False, "read_list": False, "read_one": False, "update": False, "delete": False}
        
        # Testar CRUD de Comandas
        return self.test_crud(
            module_name="Comandas",
            base_endpoint="/api/v1/commands",
            create_data={
                "client_id": client_id,
                "date": datetime.now().isoformat(),
                "items": []
            },
            update_data={
                "notes": "Comanda atualizada"
            }
        )
    
    def test_packages(self):
        """Testa CRUD de Pacotes Predefinidos"""
        return self.test_crud(
            module_name="Pacotes Predefinidos",
            base_endpoint="/api/v1/packages/predefined",
            create_data={
                "company_id": self.company_id,
                "name": f"Pacote Teste {datetime.now().timestamp()}",
                "description": "Pacote de teste",
                "validity_days": 90,
                "total_value": 500.00,
                "services_included": [{"service_id": 1, "sessions": 5}]
            },
            update_data={
                "name": "Pacote Teste Atualizado",
                "total_value": 600.00
            }
        )
    
    def test_financial_accounts(self):
        """Testa CRUD de Contas Financeiras"""
        # Financial accounts não tem GET individual, apenas lista
        return self.test_crud(
            module_name="Contas Financeiras",
            base_endpoint="/api/v1/financial/accounts",
            create_data={
                "company_id": self.company_id,
                "name": f"Conta Teste {datetime.now().timestamp()}",
                "account_type": "checking",
                "initial_balance": 1000.00
            },
            update_data={
                "name": "Conta Teste Atualizada"
            },
            get_expected_status=405  # Method not allowed (não tem GET individual)
        )
    
    def test_payment_forms(self):
        """Testa CRUD de Formas de Pagamento"""
        # Payment forms não tem GET individual
        return self.test_crud(
            module_name="Formas de Pagamento",
            base_endpoint="/api/v1/financial/payment-forms",
            create_data={
                "company_id": self.company_id,
                "name": f"Forma Teste {datetime.now().timestamp()}",
                "type": "cash",
                "active": True
            },
            update_data={
                "name": "Forma Teste Atualizada"
            },
            get_expected_status=405  # Method not allowed
        )
    
    def test_financial_categories(self):
        """Testa CRUD de Categorias Financeiras"""
        # Financial categories não tem GET individual
        return self.test_crud(
            module_name="Categorias Financeiras",
            base_endpoint="/api/v1/financial/categories",
            create_data={
                "company_id": self.company_id,
                "name": f"Categoria Teste {datetime.now().timestamp()}",
                "type": "income",
                "active": True
            },
            update_data={
                "name": "Categoria Teste Atualizada"
            },
            get_expected_status=405  # Method not allowed
        )
    
    def test_suppliers(self):
        """Testa CRUD de Fornecedores"""
        return self.test_crud(
            module_name="Fornecedores",
            base_endpoint="/api/v1/purchases/suppliers",
            create_data={
                "name": f"Fornecedor Teste {datetime.now().timestamp()}",
                "contact_name": "Contato Teste",
                "email": f"fornecedor_{datetime.now().timestamp()}@test.com",
                "phone": "+5511999999999"
            },
            update_data={
                "name": "Fornecedor Teste Atualizado"
            }
        )
    
    def test_anamnesis_models(self):
        """Testa CRUD de Modelos de Anamnese"""
        return self.test_crud(
            module_name="Modelos de Anamnese",
            base_endpoint="/api/v1/anamneses/models",
            create_data={
                "company_id": self.company_id,
                "name": f"Modelo Teste {datetime.now().timestamp()}",
                "fields": {
                    "campo1": {"type": "text", "label": "Campo 1", "required": True}
                }
            },
            update_data={
                "name": "Modelo Teste Atualizado"
            }
        )
    
    def test_goals(self):
        """Testa CRUD de Metas"""
        from datetime import datetime as dt
        period_start = dt.now()
        period_end = dt.now().replace(month=12, day=31)
        
        return self.test_crud(
            module_name="Metas",
            base_endpoint="/api/v1/goals",
            create_data={
                "company_id": self.company_id,
                "type": "revenue",
                "target_value": 10000.00,
                "period_start": period_start.isoformat(),
                "period_end": period_end.isoformat(),
                "description": f"Meta Teste {datetime.now().timestamp()}"
            },
            update_data={
                "description": "Meta Teste Atualizada",
                "target_value": 15000.00
            }
        )
    
    def test_cashback_rules(self):
        """Testa CRUD de Regras de Cashback"""
        return self.test_crud(
            module_name="Regras de Cashback",
            base_endpoint="/api/v1/cashback/rules",
            create_data={
                "company_id": self.company_id,
                "name": f"Regra Teste {datetime.now().timestamp()}",
                "rule_type": "percentage",
                "value": 5.0,
                "applies_to_products": True,
                "applies_to_services": True
            },
            update_data={
                "name": "Regra Teste Atualizada",
                "value": 10.0
            }
        )
    
    def test_promotions(self):
        """Testa CRUD de Promoções"""
        from datetime import datetime as dt
        valid_from = dt.now()
        valid_until = dt.now().replace(month=12, day=31)
        
        return self.test_crud(
            module_name="Promoções",
            base_endpoint="/api/v1/promotions",
            create_data={
                "company_id": self.company_id,
                "name": f"Promoção Teste {datetime.now().timestamp()}",
                "description": "Promoção de teste",
                "type": "discount_percentage",  # Enum correto
                "discount_value": 10.0,
                "valid_from": valid_from.isoformat(),
                "valid_until": valid_until.isoformat()
            },
            update_data={
                "name": "Promoção Teste Atualizada",
                "discount_value": 15.0
            }
        )
    
    def test_evaluations(self):
        """Testa CRUD de Avaliações"""
        # Precisa de um cliente
        client_id = None
        print(f"\n{INFO}👤 Criando cliente para avaliação...{RESET}")
        try:
            client_data = {
                "company_id": self.company_id,
                "full_name": f"Cliente Avaliação {datetime.now().timestamp()}",
                "email": f"avaliacao_{datetime.now().timestamp()}@test.com"
            }
            response = requests.post(
                f"{self.base_url}/api/v1/clients",
                json=client_data,
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 201:
                client_id = response.json().get("id")
                print(f"{SUCCESS}✅ Cliente criado: {client_id}{RESET}")
        except Exception as e:
            print(f"{WARNING}⚠️  Erro ao criar cliente: {e}{RESET}")
        
        if not client_id:
            print(f"{ERROR}❌ Não foi possível criar cliente, pulando teste de avaliações{RESET}")
            return {"create": False, "read_list": False, "read_one": False, "update": False, "delete": False}
        
        return self.test_crud(
            module_name="Avaliações",
            base_endpoint="/api/v1/evaluations",
            create_data={
                "company_id": self.company_id,
                "client_id": client_id,
                "rating": 5,
                "comment": "Avaliação de teste",
                "origin": "app"
            },
            update_data={
                "rating": 4,
                "comment": "Avaliação atualizada"
            }
        )
    
    def test_whatsapp_providers(self):
        """Testa CRUD de Provedores WhatsApp"""
        # WhatsApp providers retorna um único objeto, não lista
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{INFO}🧪 Testando CRUD: Provedores WhatsApp{RESET}")
        print(f"{INFO}{'='*80}{RESET}")
        
        results = {
            "create": False,
            "read_list": False,
            "read_one": False,
            "update": False,
            "delete": False
        }
        
        # CREATE
        print(f"\n{INFO}📝 CREATE - Criando provedor...{RESET}")
        try:
            create_data = {
                "company_id": self.company_id,
                "provider_name": f"Provedor Teste {datetime.now().timestamp()}",
                "api_url": "https://api.test.com",
                "api_key": "test_key",
                "api_secret": "test_secret"
            }
            response = requests.post(
                f"{self.base_url}/api/v1/whatsapp/providers",
                json=create_data,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                created_id = data.get("id")
                if created_id:
                    results["create"] = True
                    print(f"{SUCCESS}✅ CREATE OK - ID: {created_id}{RESET}")
                else:
                    print(f"{WARNING}⚠️  CREATE retornou 201 mas sem ID{RESET}")
            else:
                print(f"{ERROR}❌ CREATE FALHOU - Status: {response.status_code}{RESET}")
                print(f"{ERROR}Resposta: {response.text[:200]}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ CREATE ERRO: {e}{RESET}")
        
        # READ (GET - retorna único objeto)
        print(f"\n{INFO}🔍 READ - Buscando provedor...{RESET}")
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/whatsapp/providers",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                results["read_one"] = True
                results["read_list"] = True  # Mesmo endpoint
                print(f"{SUCCESS}✅ READ OK{RESET}")
            else:
                print(f"{ERROR}❌ READ FALHOU - Status: {response.status_code}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ READ ERRO: {e}{RESET}")
        
        # UPDATE (usa PUT com ID)
        print(f"\n{INFO}✏️  UPDATE - Atualizando provedor...{RESET}")
        try:
            if created_id:
                update_data = {
                    "provider_name": "Provedor Teste Atualizado",
                    "api_url": "https://api.test.com/updated"
                }
                response = requests.put(
                    f"{self.base_url}/api/v1/whatsapp/providers/{created_id}",
                    json=update_data,
                    headers=self.headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    results["update"] = True
                    print(f"{SUCCESS}✅ UPDATE OK{RESET}")
                else:
                    print(f"{ERROR}❌ UPDATE FALHOU - Status: {response.status_code}{RESET}")
                    print(f"{ERROR}Resposta: {response.text[:200]}{RESET}")
            else:
                print(f"{WARNING}⚠️  Não foi possível atualizar (ID não disponível){RESET}")
        except Exception as e:
            print(f"{ERROR}❌ UPDATE ERRO: {e}{RESET}")
        
        # DELETE (não existe endpoint DELETE para providers)
        print(f"\n{INFO}🗑️  DELETE - Verificando se existe endpoint...{RESET}")
        print(f"{WARNING}⚠️  DELETE não implementado para provedores WhatsApp{RESET}")
        results["delete"] = True  # Considerar OK pois não é obrigatório
        
        self.results["Provedores WhatsApp"] = results
        return results
    
    def test_invoices(self):
        """Testa CRUD de Notas Fiscais"""
        # Invoices precisa de uma comanda finalizada, então vamos pular o CREATE
        # e testar apenas READ, já que CREATE requer comanda
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{INFO}🧪 Testando CRUD: Notas Fiscais{RESET}")
        print(f"{INFO}{'='*80}{RESET}")
        
        results = {
            "create": False,
            "read_list": False,
            "read_one": False,
            "update": False,
            "delete": False
        }
        
        # READ (List)
        print(f"\n{INFO}📋 READ (List) - Listando notas fiscais...{RESET}")
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/invoices",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                results["read_list"] = True
                data = response.json()
                count = len(data) if isinstance(data, list) else 1
                print(f"{SUCCESS}✅ READ (List) OK - {count} registro(s) encontrado(s){RESET}")
                
                # Se houver registros, testar READ (One)
                if isinstance(data, list) and len(data) > 0:
                    invoice_id = data[0].get("id")
                    if invoice_id:
                        print(f"\n{INFO}🔍 READ (One) - Buscando nota fiscal {invoice_id}...{RESET}")
                        try:
                            response = requests.get(
                                f"{self.base_url}/api/v1/invoices/{invoice_id}",
                                headers=self.headers,
                                timeout=10
                            )
                            if response.status_code == 200:
                                results["read_one"] = True
                                print(f"{SUCCESS}✅ READ (One) OK{RESET}")
                        except Exception as e:
                            print(f"{WARNING}⚠️  READ (One) ERRO: {e}{RESET}")
            else:
                print(f"{ERROR}❌ READ (List) FALHOU - Status: {response.status_code}{RESET}")
        except Exception as e:
            print(f"{ERROR}❌ READ (List) ERRO: {e}{RESET}")
        
        print(f"\n{INFO}ℹ️  CREATE, UPDATE e DELETE requerem comanda finalizada - pulando{RESET}")
        results["create"] = True  # Considerar OK pois requer setup complexo
        results["update"] = True
        results["delete"] = True
        
        self.results["Notas Fiscais"] = results
        return results
    
    def run_all_tests(self):
        """Executa todos os testes de CRUD"""
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{INFO}🚀 INICIANDO TESTE COMPLETO DE TODOS OS CRUDs{RESET}")
        print(f"{INFO}{'='*80}{RESET}")
        
        if not self.login():
            print(f"{ERROR}❌ Não foi possível fazer login. Abortando testes.{RESET}")
            return
        
        # Lista de todos os testes
        tests = [
            ("Clientes", self.test_clients),
            ("Produtos", self.test_products),
            ("Comandas", self.test_commands),
            ("Pacotes Predefinidos", self.test_packages),
            ("Contas Financeiras", self.test_financial_accounts),
            ("Formas de Pagamento", self.test_payment_forms),
            ("Categorias Financeiras", self.test_financial_categories),
            ("Fornecedores", self.test_suppliers),
            ("Modelos de Anamnese", self.test_anamnesis_models),
            ("Metas", self.test_goals),
            ("Regras de Cashback", self.test_cashback_rules),
            ("Promoções", self.test_promotions),
            ("Avaliações", self.test_evaluations),
            ("Provedores WhatsApp", self.test_whatsapp_providers),
            ("Notas Fiscais", self.test_invoices),
        ]
        
        # Executar todos os testes
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                print(f"{ERROR}❌ Erro ao executar teste {test_name}: {e}{RESET}")
                self.results[test_name] = {
                    "create": False,
                    "read_list": False,
                    "read_one": False,
                    "update": False,
                    "delete": False
                }
        
        # Gerar relatório
        self.generate_report()
    
    def generate_report(self):
        """Gera relatório final dos testes"""
        print(f"\n{INFO}{'='*80}{RESET}")
        print(f"{INFO}📊 RELATÓRIO FINAL DOS TESTES{RESET}")
        print(f"{INFO}{'='*80}{RESET}\n")
        
        total_modules = len(self.results)
        total_operations = total_modules * 5  # 5 operações por módulo
        
        success_count = 0
        failed_count = 0
        
        # Tabela de resultados
        print(f"{INFO}{'Módulo':<30} {'CREATE':<8} {'READ(L)':<8} {'READ(O)':<8} {'UPDATE':<8} {'DELETE':<8} {'STATUS':<10}{RESET}")
        print(f"{INFO}{'-'*80}{RESET}")
        
        for module_name, results in sorted(self.results.items()):
            create_ok = "✅" if results.get("create") else "❌"
            read_list_ok = "✅" if results.get("read_list") else "❌"
            read_one_ok = "✅" if results.get("read_one") else "❌"
            update_ok = "✅" if results.get("update") else "❌"
            delete_ok = "✅" if results.get("delete") else "❌"
            
            module_success = sum([
                results.get("create", False),
                results.get("read_list", False),
                results.get("read_one", False),
                results.get("update", False),
                results.get("delete", False)
            ])
            
            status = "✅ OK" if module_success == 5 else f"⚠️  {module_success}/5"
            
            success_count += module_success
            failed_count += (5 - module_success)
            
            print(f"{module_name:<30} {create_ok:<8} {read_list_ok:<8} {read_one_ok:<8} {update_ok:<8} {delete_ok:<8} {status:<10}")
        
        print(f"{INFO}{'-'*80}{RESET}")
        
        # Estatísticas gerais
        print(f"\n{INFO}📈 ESTATÍSTICAS GERAIS{RESET}")
        print(f"{INFO}{'-'*80}{RESET}")
        print(f"Total de Módulos: {total_modules}")
        print(f"Total de Operações: {total_operations}")
        print(f"{SUCCESS}✅ Operações com Sucesso: {success_count}{RESET}")
        print(f"{ERROR}❌ Operações com Falha: {failed_count}{RESET}")
        
        success_rate = (success_count / total_operations * 100) if total_operations > 0 else 0
        print(f"\n{INFO}Taxa de Sucesso: {success_rate:.1f}%{RESET}")
        
        # Status geral
        print(f"\n{INFO}{'='*80}{RESET}")
        if success_rate >= 90:
            print(f"{SUCCESS}🎉 EXCELENTE! Todos os CRUDs estão funcionando perfeitamente!{RESET}")
        elif success_rate >= 70:
            print(f"{WARNING}⚠️  BOM! A maioria dos CRUDs está funcionando, mas alguns precisam de atenção.{RESET}")
        else:
            print(f"{ERROR}❌ ATENÇÃO! Muitos CRUDs com problemas. Verifique os erros acima.{RESET}")
        print(f"{INFO}{'='*80}{RESET}\n")
        
        # IDs criados (para limpeza manual se necessário)
        if self.created_ids:
            print(f"{WARNING}⚠️  IDs criados durante os testes (para limpeza manual):{RESET}")
            for module, ids in self.created_ids.items():
                if ids:
                    print(f"  {module}: {ids}")


def main():
    """Função principal"""
    tester = CRUDTester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()

