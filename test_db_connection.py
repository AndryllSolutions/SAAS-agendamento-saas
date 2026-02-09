#!/usr/bin/env python3

import os
import psycopg2
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.production')

# Obter variáveis
db_url = os.getenv('DATABASE_URL')
postgres_user = os.getenv('POSTGRES_USER')
postgres_password = os.getenv('POSTGRES_PASSWORD')
postgres_db = os.getenv('POSTGRES_DB')

print("=== Teste de Conexão com Banco de Dados ===")
print(f"DATABASE_URL: {db_url}")
print(f"POSTGRES_USER: {postgres_user}")
print(f"POSTGRES_PASSWORD: {postgres_password}")
print(f"POSTGRES_DB: {postgres_db}")
print()

# Testar conexão direta
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user=postgres_user,
        password=postgres_password,
        database=postgres_db
    )
    print("✅ Conexão direta bem-sucedida!")
    conn.close()
except Exception as e:
    print(f"❌ Erro na conexão direta: {e}")

# Testar com URL completa
try:
    conn = psycopg2.connect(db_url)
    print("✅ Conexão via URL bem-sucedida!")
    conn.close()
except Exception as e:
    print(f"❌ Erro na conexão via URL: {e}")
