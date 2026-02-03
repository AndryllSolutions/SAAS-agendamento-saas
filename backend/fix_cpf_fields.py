#!/usr/bin/env python3
"""
Script para corrigir tamanho dos campos CPF e CNPJ no banco de dados

Executa SQL direto para alterar os campos sem precisar de Alembic migration.

USO:
    python fix_cpf_fields.py
"""

import psycopg2
from app.core.config import settings

print("="*80)
print(" CORREÇÃO DE CAMPOS CPF/CNPJ ".center(80))
print("="*80)
print()

# Extrair dados da DATABASE_URL
db_url = settings.DATABASE_URL
print(f"Conectando ao banco: {db_url.split('@')[1] if '@' in db_url else 'localhost'}")

try:
    # Conectar ao banco
    conn = psycopg2.connect(settings.DATABASE_URL)
    cursor = conn.cursor()
    
    print("\n[1/6] Alterando clients.cpf...")
    cursor.execute("ALTER TABLE clients ALTER COLUMN cpf TYPE VARCHAR(20);")
    print("✅ clients.cpf agora é VARCHAR(20)")
    
    print("\n[2/6] Alterando clients.cnpj...")
    cursor.execute("ALTER TABLE clients ALTER COLUMN cnpj TYPE VARCHAR(20);")
    print("✅ clients.cnpj agora é VARCHAR(20)")
    
    print("\n[3/6] Alterando companies.cpf...")
    cursor.execute("ALTER TABLE companies ALTER COLUMN cpf TYPE VARCHAR(20);")
    print("✅ companies.cpf agora é VARCHAR(20)")
    
    print("\n[4/6] Alterando companies.cnpj...")
    cursor.execute("ALTER TABLE companies ALTER COLUMN cnpj TYPE VARCHAR(20);")
    print("✅ companies.cnpj agora é VARCHAR(20)")
    
    print("\n[5/6] Alterando suppliers.cpf...")
    cursor.execute("ALTER TABLE suppliers ALTER COLUMN cpf TYPE VARCHAR(20);")
    print("✅ suppliers.cpf agora é VARCHAR(20)")
    
    print("\n[6/6] Alterando suppliers.cnpj...")
    cursor.execute("ALTER TABLE suppliers ALTER COLUMN cnpj TYPE VARCHAR(20);")
    print("✅ suppliers.cnpj agora é VARCHAR(20)")
    
    # Commit
    conn.commit()
    
    print("\n" + "="*80)
    print("✅ CORREÇÃO APLICADA COM SUCESSO!".center(80))
    print("="*80)
    print()
    print("Agora você pode:")
    print("  1. Reiniciar o backend")
    print("  2. Testar criação de clientes com CPF de qualquer tamanho")
    print()
    
    # Verificar mudanças
    print("Verificando alterações...")
    cursor.execute("""
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name IN ('clients', 'companies', 'suppliers')
        AND column_name IN ('cpf', 'cnpj')
        ORDER BY table_name, column_name;
    """)
    
    results = cursor.fetchall()
    print("\nEstrutura atualizada:")
    print("-" * 60)
    print(f"{'Tabela':<15} {'Campo':<10} {'Tipo':<20} {'Tamanho':<10}")
    print("-" * 60)
    
    current_table = None
    for row in results:
        table = row[0] if len(row) > 3 else "N/A"
        column = row[0] if len(row) <= 3 else row[0]
        data_type = row[1]
        length = row[2]
        
        # Assumir estrutura correta
        if 'clients' in str(table).lower():
            table_name = 'clients'
        elif 'companies' in str(table).lower():
            table_name = 'companies'
        elif 'suppliers' in str(table).lower():
            table_name = 'suppliers'
        else:
            table_name = table
        
        print(f"{table_name:<15} {column:<10} {data_type:<20} {length:<10}")
    
    print("-" * 60)
    print()
    
    cursor.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"\n❌ Erro ao executar SQL: {e}")
    print("\nTente executar manualmente:")
    print("""
    psql -U postgres -d agendamento_saas
    
    ALTER TABLE clients ALTER COLUMN cpf TYPE VARCHAR(20);
    ALTER TABLE clients ALTER COLUMN cnpj TYPE VARCHAR(20);
    ALTER TABLE companies ALTER COLUMN cpf TYPE VARCHAR(20);
    ALTER TABLE companies ALTER COLUMN cnpj TYPE VARCHAR(20);
    ALTER TABLE suppliers ALTER COLUMN cpf TYPE VARCHAR(20);
    ALTER TABLE suppliers ALTER COLUMN cnpj TYPE VARCHAR(20);
    """)
except Exception as e:
    print(f"\n❌ Erro: {e}")
    print("\nVerifique:")
    print("  - Backend está parado?")
    print("  - DATABASE_URL está correta no .env?")
    print("  - PostgreSQL está rodando?")

