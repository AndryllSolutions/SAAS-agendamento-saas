#!/usr/bin/env python3
"""
Script para criar usuário de teste no banco de dados
"""
import psycopg2
from datetime import datetime

# Configuração do banco
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "agendamento_db",
    "user": "agendamento",
    "password": "agendamento123"
}

def create_test_user():
    """Cria um usuário de teste no banco de dados"""
    print("Conectando ao banco de dados...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Verifica se já existe um usuário de teste
        cursor.execute("SELECT id, email FROM users WHERE email = 'teste@atendo.com'")
        existing = cursor.fetchone()
        
        if existing:
            print(f"✅ Usuário de teste já existe: ID={existing[0]}, Email={existing[1]}")
            print("   Senha: senha123")
            return True
        
        # Cria hash da senha (usando bcrypt simples para teste)
        # Em produção, use o mesmo método do backend (argon2)
        import bcrypt
        password_hash = bcrypt.hashpw("senha123".encode(), bcrypt.gensalt()).decode()
        
        # Insere o usuário de teste
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role, is_active, is_verified, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            "teste@atendo.com",
            password_hash,
            "Usuário de Teste",
            "OWNER",
            True,
            True,
            datetime.utcnow(),
            datetime.utcnow()
        ))
        
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        print(f"✅ Usuário de teste criado com sucesso!")
        print(f"   ID: {user_id}")
        print(f"   Email: teste@atendo.com")
        print(f"   Senha: senha123")
        print(f"   Role: OWNER")
        
        cursor.close()
        conn.close()
        return True
        
    except ImportError:
        print("❌ bcrypt não instalado. Instale com: pip install bcrypt")
        print("\nAlternativa: Crie um usuário manualmente via API de registro ou pgAdmin")
        return False
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    create_test_user()
