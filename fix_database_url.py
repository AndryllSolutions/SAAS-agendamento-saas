#!/usr/bin/env python3

import os
import psycopg2

# Simular a URL do Docker
db_url = "postgresql+psycopg2://agendamento_app:Ag3nd2026P0stgr3sS3cur3K3y@db:5432/agendamento"

print("URL original:", db_url)

# Converter para URL psycopg2 padrão
psycopg2_url = db_url.replace("postgresql+psycopg2://", "postgresql://")
print("URL psycopg2:", psycopg2_url)

# Tentar conectar com a URL convertida
try:
    conn = psycopg2.connect(psycopg2_url)
    print("✅ Conexão bem-sucedida com URL convertida!")
    conn.close()
except Exception as e:
    print(f"❌ Erro: {e}")

# Teste com parâmetros separados
try:
    conn = psycopg2.connect(
        host='db',
        port=5432,
        user='agendamento_app',
        password='Ag3nd2026P0stgr3sS3cur3K3y',
        database='agendamento'
    )
    print("✅ Conexão bem-sucedida com parâmetros separados!")
    conn.close()
except Exception as e:
    print(f"❌ Erro com parâmetros separados: {e}")
