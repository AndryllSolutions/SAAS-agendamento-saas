#!/usr/bin/env python3
"""
Script para adicionar colunas faltantes na tabela financial_accounts
Contornando problemas com Alembic
"""

import psycopg2
import sys
from psycopg2 import OperationalError

def connect_to_db():
    """Conectar ao banco PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="agendamento_db",
            user="agendamento",
            password="agendamento123",
            port="5432"
        )
        return conn
    except OperationalError as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def check_column_exists(conn, table, column):
    """Verificar se coluna existe na tabela"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = %s AND column_name = %s;
    """, (table, column))
    return cursor.fetchone() is not None

def add_missing_columns():
    """Adicionar colunas faltantes à tabela financial_accounts"""
    conn = connect_to_db()
    if not conn:
        sys.exit(1)
    
    try:
        cursor = conn.cursor()
        
        # Verificar colunas existentes
        columns_to_add = [
            ("account_type", "VARCHAR(50) NOT NULL DEFAULT 'cash'"),
            ("balance", "NUMERIC(10,2) NOT NULL DEFAULT 0"),
            ("is_active", "BOOLEAN NOT NULL DEFAULT true")
        ]
        
        print("🔍 Verificando colunas existentes...")
        
        for column_name, column_def in columns_to_add:
            if check_column_exists(conn, "financial_accounts", column_name):
                print(f"✅ Coluna '{column_name}' já existe")
            else:
                print(f"➕ Adicionando coluna '{column_name}'...")
                cursor.execute(f"""
                    ALTER TABLE financial_accounts 
                    ADD COLUMN {column_name} {column_def};
                """)
                print(f"✅ Coluna '{column_name}' adicionada com sucesso")
        
        # Criar índice para is_active se não existir
        cursor.execute("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = 'financial_accounts' AND indexname = 'ix_financial_accounts_is_active';
        """)
        if not cursor.fetchone():
            print("➕ Criando índice 'ix_financial_accounts_is_active'...")
            cursor.execute("""
                CREATE INDEX ix_financial_accounts_is_active 
                ON financial_accounts (is_active);
            """)
            print("✅ Índice criado com sucesso")
        else:
            print("✅ Índice 'ix_financial_accounts_is_active' já existe")
        
        conn.commit()
        print("\n🎉 Todas as colunas foram adicionadas com sucesso!")
        print("📊 O módulo financeiro deve funcionar corretamente agora.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao adicionar colunas: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    add_missing_columns()
