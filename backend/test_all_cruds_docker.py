"""
Teste completo de todos os CRUDs do sistema - Versão Docker
Ajusta a URL base para usar o nome do serviço Docker
"""
import os
import sys

# Importar o teste original
from tests.test_all_cruds import CRUDTester

# Obter URL base do ambiente ou usar padrão Docker
BASE_URL = os.getenv("BASE_URL", "http://backend:8000")

def main():
    """Função principal para Docker"""
    print("\n" + "="*80)
    print("🧪 TESTE DE TODOS OS CRUDs - DOCKER")
    print("="*80)
    print(f"\nConectando em: {BASE_URL}")
    print("Certifique-se de que o servidor backend está rodando!\n")
    
    tester = CRUDTester(base_url=BASE_URL)
    tester.run_all_tests()

if __name__ == "__main__":
    main()

