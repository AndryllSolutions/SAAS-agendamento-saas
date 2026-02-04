#!/usr/bin/env python3
"""
Script para criar usuário de teste via SQL direto
"""
import psycopg2
from psycopg2.extras import RealDictCursor

def create_test_user_sql():
    # Conexão direta com o banco
    try:
        conn = psycopg2.connect(
            host="db",
            database="agendamento",
            user="agendamento_app",
            password="Ag3nd2026P0stgr3sS3cur3K3y"
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar se usuário já existe
        cursor.execute("SELECT * FROM users WHERE email = %s", ("admin@teste.com",))
        user = cursor.fetchone()
        
        if user:
            print("✅ Usuário de teste já existe!")
            print("📧 Email: admin@teste.com")
            print("🔑 Senha: admin123")
            return
        
        # Inserir usuário manualmente
        cursor.execute("""
            INSERT INTO users (
                email, password_hash, full_name, is_active, saas_role, role, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """, (
            "admin@teste.com",
            "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G",  # admin123
            "Administrador Teste",
            True,
            "SAAS_ADMIN",
            "SAAS_ADMIN"
        ))
        
        conn.commit()
        
        print("✅ Usuário de teste criado com sucesso!")
        print("📧 Email: admin@teste.com")
        print("🔑 Senha: admin123")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_test_user_sql()
