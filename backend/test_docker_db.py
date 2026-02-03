#!/usr/bin/env python3
"""
Testar conexão com banco Docker e aplicar fix
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from sqlalchemy import create_engine, text
    from app.core.config import settings
    
    print("🔍 Testando conexão com banco Docker...")
    print(f"📡 URL: {settings.DATABASE_URL}")
    
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("✅ Conexão bem-sucedida!")
        
        # Verificar se tabela financial_accounts existe
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'financial_accounts'
            );
        """))
        table_exists = result.fetchone()[0]
        
        if table_exists:
            print("✅ Tabela financial_accounts existe")
            
            # Verificar colunas
            result = conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'financial_accounts' 
                AND column_name IN ('account_type', 'balance', 'is_active')
                ORDER BY column_name;
            """))
            columns = [row[0] for row in result]
            
            print(f"📊 Colunas existentes: {columns}")
            
            if len(columns) == 3:
                print("🎉 Todas as colunas necessárias existem!")
                print("💰 O módulo financeiro deve funcionar!")
            else:
                print("⚠️  Colunas faltando. Execute o SQL fix_financial_columns.sql")
        else:
            print("❌ Tabela financial_accounts não existe")
            print("🔧 Execute as migrations primeiro")
            
except Exception as e:
    print(f"❌ Erro na conexão: {e}")
    print("💡 Verifique se o container Docker está rodando")
