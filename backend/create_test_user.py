#!/usr/bin/env python3
"""Script para criar/atualizar usuário de teste"""
import sys
sys.path.insert(0, '/app')

from passlib.hash import argon2
from sqlalchemy import create_engine, text
from datetime import datetime

# Conectar ao banco
DATABASE_URL = "postgresql://agendamento:agendamento123@db:5432/agendamento_db"
engine = create_engine(DATABASE_URL)

# Gerar hash da senha
password = "senha123"
hashed = argon2.hash(password)
print(f"Hash gerado: {hashed}")

with engine.connect() as conn:
    # Verifica se usuário existe
    result = conn.execute(text("SELECT id FROM users WHERE email = 'teste@atendo.com'"))
    user = result.fetchone()
    
    if user:
        # Atualiza senha
        conn.execute(
            text("UPDATE users SET password_hash = :hash WHERE email = 'teste@atendo.com'"),
            {"hash": hashed}
        )
        print(f"✅ Senha atualizada para usuário existente (ID: {user[0]})")
    else:
        # Insere novo usuário
        result = conn.execute(
            text("""
                INSERT INTO users (email, password_hash, full_name, role, is_active, is_verified, created_at, updated_at)
                VALUES ('teste@atendo.com', :hash, 'Usuario Teste', 'OWNER', true, true, :now, :now)
                RETURNING id
            """),
            {"hash": hashed, "now": datetime.utcnow()}
        )
        user_id = result.fetchone()[0]
        print(f"✅ Novo usuário criado com ID: {user_id}")
    
    conn.commit()

print("✅ Pronto! Use: teste@atendo.com / senha123")
