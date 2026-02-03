#!/usr/bin/env python3
"""
Quick fix para adicionar colunas faltantes usando SQLAlchemy
sem depender de Alembic ou psycopg2 diretamente
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_financial_columns():
    """Adicionar colunas faltantes à tabela financial_accounts"""
    try:
        # Conectar usando SQLAlchemy
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Verificar colunas existentes
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'financial_accounts' 
                ORDER BY ordinal_position;
            """))
            existing_columns = [row[0] for row in result]
            print(f"Colunas existentes: {existing_columns}")
            
            # Colunas para adicionar
            columns_to_add = [
                ("account_type", "VARCHAR(50) NOT NULL DEFAULT 'cash'"),
                ("balance", "NUMERIC(10,2) NOT NULL DEFAULT 0"),
                ("is_active", "BOOLEAN NOT NULL DEFAULT true")
            ]
            
            # Adicionar colunas faltantes
            for column_name, column_def in columns_to_add:
                if column_name not in existing_columns:
                    print(f"➕ Adicionando coluna '{column_name}'...")
                    conn.execute(text(f"""
                        ALTER TABLE financial_accounts 
                        ADD COLUMN {column_name} {column_def};
                    """))
                    print(f"✅ Coluna '{column_name}' adicionada")
                else:
                    print(f"✅ Coluna '{column_name}' já existe")
            
            # Verificar e criar índice
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'financial_accounts' AND indexname = 'ix_financial_accounts_is_active';
            """))
            if not result.fetchone():
                print("➕ Criando índice 'ix_financial_accounts_is_active'...")
                conn.execute(text("""
                    CREATE INDEX ix_financial_accounts_is_active 
                    ON financial_accounts (is_active);
                """))
                print("✅ Índice criado")
            else:
                print("✅ Índice já existe")
            
            conn.commit()
            print("\n🎉 Fix aplicado com sucesso! O módulo financeiro deve funcionar agora.")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_financial_columns()
