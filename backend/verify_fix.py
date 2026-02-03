#!/usr/bin/env python3
"""
Verificar se as colunas foram adicionadas corretamente
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

try:
    from sqlalchemy import create_engine, text
    from app.core.config import settings
    
    print("🔍 Verificando se o fix foi aplicado...")
    
    # Tentar conectar ao banco
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Verificar colunas na tabela financial_accounts
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'financial_accounts' 
            ORDER BY ordinal_position;
        """))
        
        columns = result.fetchall()
        print(f"\n📊 Colunas encontradas em financial_accounts:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]}) - Default: {col[3]}")
        
        # Verificar colunas específicas que precisamos
        required_columns = ['account_type', 'balance', 'is_active']
        existing_columns = [col[0] for col in columns]
        
        print(f"\n✅ Verificação de colunas necessárias:")
        all_good = True
        for req_col in required_columns:
            if req_col in existing_columns:
                print(f"  ✅ {req_col} - EXISTE")
            else:
                print(f"  ❌ {req_col} - FALTANDO")
                all_good = False
        
        # Verificar índice
        result = conn.execute(text("""
            SELECT indexname FROM pg_indexes 
            WHERE tablename = 'financial_accounts' AND indexname = 'ix_financial_accounts_is_active';
        """))
        index_exists = result.fetchone() is not None
        
        if index_exists:
            print(f"  ✅ Índice ix_financial_accounts_is_active - EXISTE")
        else:
            print(f"  ❌ Índice ix_financial_accounts_is_active - FALTANDO")
            all_good = False
        
        # Testar query do dashboard
        try:
            result = conn.execute(text("""
                SELECT 
                    COUNT(*) as total_accounts,
                    COUNT(CASE WHEN account_type = 'bank' AND is_active = true THEN 1 END) as bank_accounts,
                    COALESCE(SUM(CASE WHEN account_type = 'bank' AND is_active = true THEN balance ELSE 0 END), 0) as bank_position
                FROM financial_accounts 
                WHERE company_id = 1;
            """))
            
            test_data = result.fetchone()
            print(f"\n📈 Teste de query do dashboard:")
            print(f"  - Total contas: {test_data[0]}")
            print(f"  - Contas banco ativas: {test_data[1]}")
            print(f"  - Posição bancária: R$ {float(test_data[2]):.2f}")
            
        except Exception as e:
            print(f"  ❌ Erro na query do dashboard: {e}")
            all_good = False
        
        if all_good:
            print(f"\n🎉 SUCESSO! O fix foi aplicado corretamente.")
            print(f"💰 O módulo financeiro deve funcionar agora.")
        else:
            print(f"\n⚠️  Problema: Algumas colunas/índices ainda faltam.")
            print(f"📝 Execute o SQL fix_financial_columns.sql manualmente.")
        
except Exception as e:
    print(f"❌ Erro ao conectar ao banco: {e}")
    print(f"💡 Verifique se o PostgreSQL está rodando e se as credenciais estão corretas.")
