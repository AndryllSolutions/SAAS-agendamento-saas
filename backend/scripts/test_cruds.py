"""
Script simples para testar todos os CRUDs
Uso: python scripts/test_cruds.py
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tests.test_all_cruds import CRUDTester

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🧪 TESTE DE TODOS OS CRUDs")
    print("="*80)
    print("\nCertifique-se de que o servidor está rodando em http://localhost:8000")
    print("Execute: uvicorn app.main:app --reload\n")
    
    tester = CRUDTester()
    tester.run_all_tests()

