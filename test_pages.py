#!/usr/bin/env python3
"""
Script para testar todas as páginas do sistema
"""
import requests
import time

BASE_URL = "http://localhost:3001"

# Lista de páginas principais para testar
pages = [
    "/",
    "/login",
    "/register", 
    "/dashboard",
    "/users",
    "/clients",
    "/professionals",
    "/agenda",
    "/calendar",
    "/financial",
    "/services",
    "/products",
    "/reports",
    "/marketing",
    "/admin",
    "/settings",
    "/whatsapp",
    "/notifications",
    "/saas-admin",
    "/help",
    "/support"
]

def test_pages():
    print("🧪 Testando páginas do Sistema Agendamento SaaS")
    print("=" * 50)
    
    for page in pages:
        url = f"{BASE_URL}{page}"
        try:
            response = requests.get(url, timeout=5)
            status = "✅" if response.status_code == 200 else f"❌ ({response.status_code})"
            print(f"{status} {page}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {page} - Erro: {str(e)[:50]}")
        time.sleep(0.1)  # Pequena pausa entre requisições

if __name__ == "__main__":
    test_pages()
