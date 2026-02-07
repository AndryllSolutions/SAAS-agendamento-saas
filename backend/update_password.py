#!/usr/bin/env python3
"""Script para atualizar senha do usuário de teste"""
import sys
sys.path.insert(0, '/app')

from passlib.hash import argon2
from sqlalchemy import create_engine, text

# Conectar ao banco
DATABASE_URL = "postgresql://agendamento:agendamento123@db:5432/agendamento_db"
engine = create_engine(DATABASE_URL)

# Gerar hash da senha
password = "senha123"
hashed = argon2.hash(password)
print(f"Hash gerado: {hashed}")

# Atualizar no banco
with engine.connect() as conn:
    result = conn.execute(
        text("UPDATE users SET password_hash = :hash WHERE email = 'teste@atendo.com'"),
        {"hash": hashed}
    )
    conn.commit()
    print(f"Linhas atualizadas: {result.rowcount}")

print("✅ Senha atualizada com sucesso!")
