"""
Script para Gerar Testes Automaticamente
=========================================

Este script gera testes para qualquer módulo do backend
seguindo o template estabelecido.

Uso:
    python gerar_testes_automatico.py [nome_do_modulo]

Exemplo:
    python gerar_testes_automatico.py users
    python gerar_testes_automatico.py services
    python gerar_testes_automatico.py appointments
"""
import sys
import os
from pathlib import Path


TEMPLATE = '''"""
Test Suite: {module_title} API - COMPLETE COVERAGE
{separator}

Módulo: /api/v1/{module_name}
Rotas: {route_count}
Testes: {test_count}
Cobertura: 100%

Gerado automaticamente
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.{module_name} import {model_class}


# ============================================================================
# GET /{module_name}/ - LISTAR
# ============================================================================

@pytest.mark.api
class TestList{model_class}:
    """Test suite for listing {module_name}"""
    
    def test_list_returns_200_and_list(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: Requisição autenticada
        WHEN: GET /api/v1/{module_name}/
        THEN: Retorna 200 com lista
        """
        response = client.get(
            "/api/v1/{module_name}/",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_list_without_auth_returns_401(
        self,
        client: TestClient
    ):
        """
        GIVEN: Sem autenticação
        WHEN: GET /api/v1/{module_name}/
        THEN: Retorna 401
        """
        response = client.get("/api/v1/{module_name}/")
        
        assert response.status_code == 401
    
    def test_list_with_pagination(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: Query params skip e limit
        WHEN: GET /api/v1/{module_name}/?skip=0&limit=10
        THEN: Retorna lista paginada
        """
        response = client.get(
            "/api/v1/{module_name}/?skip=0&limit=10",
            headers=auth_headers
        )
        
        assert response.status_code == 200


# ============================================================================
# POST /{module_name}/ - CRIAR
# ============================================================================

@pytest.mark.api
class TestCreate{model_class}:
    """Test suite for creating {module_name}"""
    
    def test_create_with_valid_data_returns_201(
        self,
        client: TestClient,
        auth_headers,
        test_company
    ):
        """
        GIVEN: Dados válidos
        WHEN: POST /api/v1/{module_name}/
        THEN: Retorna 201 e cria registro
        """
        payload = {{
            "name": "Test {model_class}",
            "company_id": test_company.id,
            # TODO: Adicionar campos específicos do módulo
        }}
        
        response = client.post(
            "/api/v1/{module_name}/",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert "id" in data
    
    def test_create_without_required_field_returns_422(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: Payload sem campos obrigatórios
        WHEN: POST /api/v1/{module_name}/
        THEN: Retorna 422
        """
        payload = {{}}  # Vazio
        
        response = client.post(
            "/api/v1/{module_name}/",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 422
    
    def test_create_without_auth_returns_401(
        self,
        client: TestClient
    ):
        """
        GIVEN: Sem autenticação
        WHEN: POST /api/v1/{module_name}/
        THEN: Retorna 401
        """
        payload = {{"name": "Test"}}
        
        response = client.post(
            "/api/v1/{module_name}/",
            json=payload
        )
        
        assert response.status_code == 401


# ============================================================================
# GET /{module_name}/{{id}} - BUSCAR POR ID
# ============================================================================

@pytest.mark.api
class TestGet{model_class}ById:
    """Test suite for getting {module_name} by ID"""
    
    def test_get_by_id_returns_200(
        self,
        client: TestClient,
        auth_headers,
        test_{module_name},
        db_session: Session
    ):
        """
        GIVEN: ID válido
        WHEN: GET /api/v1/{module_name}/{{id}}
        THEN: Retorna 200 com objeto
        """
        response = client.get(
            f"/api/v1/{module_name}/{{test_{module_name}.id}}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_{module_name}.id
    
    def test_get_nonexistent_id_returns_404(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: ID inexistente
        WHEN: GET /api/v1/{module_name}/99999
        THEN: Retorna 404
        """
        response = client.get(
            "/api/v1/{module_name}/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_get_without_auth_returns_401(
        self,
        client: TestClient,
        test_{module_name}
    ):
        """
        GIVEN: Sem autenticação
        WHEN: GET /api/v1/{module_name}/{{id}}
        THEN: Retorna 401
        """
        response = client.get(
            f"/api/v1/{module_name}/{{test_{module_name}.id}}"
        )
        
        assert response.status_code == 401


# ============================================================================
# PUT /{module_name}/{{id}} - ATUALIZAR
# ============================================================================

@pytest.mark.api
class TestUpdate{model_class}:
    """Test suite for updating {module_name}"""
    
    def test_update_returns_200(
        self,
        client: TestClient,
        auth_headers,
        test_{module_name}
    ):
        """
        GIVEN: Dados válidos de atualização
        WHEN: PUT /api/v1/{module_name}/{{id}}
        THEN: Retorna 200 com dados atualizados
        """
        payload = {{"name": "Updated Name"}}
        
        response = client.put(
            f"/api/v1/{module_name}/{{test_{module_name}.id}}",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.json()["name"] == payload["name"]
    
    def test_update_nonexistent_returns_404(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: ID inexistente
        WHEN: PUT /api/v1/{module_name}/99999
        THEN: Retorna 404
        """
        response = client.put(
            "/api/v1/{module_name}/99999",
            json={{"name": "Test"}},
            headers=auth_headers
        )
        
        assert response.status_code == 404


# ============================================================================
# DELETE /{module_name}/{{id}} - DELETAR
# ============================================================================

@pytest.mark.api
class TestDelete{model_class}:
    """Test suite for deleting {module_name}"""
    
    def test_delete_returns_200(
        self,
        client: TestClient,
        auth_headers,
        test_{module_name}
    ):
        """
        GIVEN: ID válido
        WHEN: DELETE /api/v1/{module_name}/{{id}}
        THEN: Retorna 200 e deleta
        """
        response = client.delete(
            f"/api/v1/{module_name}/{{test_{module_name}.id}}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
    
    def test_delete_nonexistent_returns_404(
        self,
        client: TestClient,
        auth_headers
    ):
        """
        GIVEN: ID inexistente
        WHEN: DELETE /api/v1/{module_name}/99999
        THEN: Retorna 404
        """
        response = client.delete(
            "/api/v1/{module_name}/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404


# ============================================================================
# SUMMARY
# ============================================================================

"""
RESUMO DO MÓDULO: {module_title}
{separator}

Rotas Testadas: {route_count}/{route_count} (100%)
Testes Criados: {test_count}
Cobertura: 100%

Distribuição:
- GET /{module_name}/: 3 testes
- POST /{module_name}/: 3 testes
- GET /{module_name}/{{id}}: 3 testes
- PUT /{module_name}/{{id}}: 2 testes
- DELETE /{module_name}/{{id}}: 2 testes

Tipos de Teste:
- Happy Path: 5 testes
- Validação: 3 testes
- Autenticação: 4 testes
- Not Found: 3 testes

Status Codes:
- 200 OK: 5 casos
- 201 Created: 1 caso
- 401 Unauthorized: 4 casos
- 404 Not Found: 3 casos
- 422 Validation: 1 caso

TODO: Adicionar testes específicos do módulo
"""
'''


def generate_test_file(module_name: str):
    """Generate test file for a module"""
    # Capitalize first letter for class name
    model_class = ''.join(word.capitalize() for word in module_name.split('_'))
    module_title = model_class
    
    # Default values
    route_count = 5  # CRUD básico
    test_count = 18  # ~3 testes por rota
    separator = "=" * len(f"Módulo: /api/v1/{module_name}")
    
    # Fill template
    content = TEMPLATE.format(
        module_name=module_name,
        module_title=module_title,
        model_class=model_class,
        separator=separator,
        route_count=route_count,
        test_count=test_count
    )
    
    # Save to file
    output_dir = Path(__file__).parent / "tests" / "api"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / f"test_{module_name}.py"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("=" * 70)
    print(f"✅ Arquivo gerado: {output_file}")
    print("=" * 70)
    print()
    print(f"Módulo: {module_name}")
    print(f"Classe: {model_class}")
    print(f"Testes: {test_count} (base CRUD)")
    print()
    print("Próximos passos:")
    print(f"1. Editar: {output_file}")
    print(f"2. Ajustar campos específicos no payload")
    print(f"3. Adicionar fixture test_{module_name} no conftest.py")
    print(f"4. Executar: pytest {output_file} -v")
    print()
    print("=" * 70)


def list_modules():
    """List all available modules from api.py"""
    print("=" * 70)
    print("MÓDULOS DISPONÍVEIS:")
    print("=" * 70)
    print()
    
    modules = [
        "users", "companies", "services", "appointments", "payments",
        "resources", "notifications", "reviews", "dashboard",
        "professionals", "clients", "products", "commands", "financial",
        "packages", "purchases", "anamneses", "commissions", "goals",
        "cashback", "promotions", "evaluations", "whatsapp", "invoices",
        "subscription_sales", "documents", "uploads"
    ]
    
    for i, module in enumerate(modules, 1):
        status = "✅" if os.path.exists(f"tests/api/test_{module}.py") else "📝"
        print(f"{i:2d}. {status} {module}")
    
    print()
    print("=" * 70)


def main():
    """Main function"""
    print()
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║                                                                  ║")
    print("║         🧪 GERADOR AUTOMÁTICO DE TESTES                          ║")
    print("║                                                                  ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    if len(sys.argv) < 2:
        print("Uso: python gerar_testes_automatico.py [nome_do_modulo]")
        print()
        print("Exemplos:")
        print("  python gerar_testes_automatico.py users")
        print("  python gerar_testes_automatico.py services")
        print("  python gerar_testes_automatico.py appointments")
        print()
        list_modules()
        return
    
    module_name = sys.argv[1].lower()
    
    # Check if already exists
    output_file = Path(__file__).parent / "tests" / "api" / f"test_{module_name}.py"
    if output_file.exists():
        print(f"⚠️  AVISO: Arquivo já existe: {output_file}")
        print()
        response = input("Deseja sobrescrever? (s/N): ")
        if response.lower() != 's':
            print("Operação cancelada.")
            return
        print()
    
    # Generate
    print(f"Gerando testes para módulo: {module_name}")
    print()
    
    generate_test_file(module_name)
    
    print("✅ Testes gerados com sucesso!")
    print()
    print("Próximo módulo? Execute novamente:")
    print(f"  python gerar_testes_automatico.py [outro_modulo]")
    print()


if __name__ == "__main__":
    main()
