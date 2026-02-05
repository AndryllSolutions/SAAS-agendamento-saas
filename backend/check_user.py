#!/usr/bin/env python3
"""
Script para verificar se o usuário existe no banco de dados
e diagnosticar erro de login
"""

import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.user import User
from sqlalchemy import text

print("🔍 Verificando banco de dados...")

try:
    db = SessionLocal()
    
    # Verificar conexão
    result = db.execute(text("SELECT 1"))
    print("✅ Conexão com banco de dados OK")
    
    # Verificar se tabela users existe
    result = db.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users'"))
    count = result.scalar()
    if count == 0:
        print("❌ Tabela 'users' não existe!")
    else:
        print("✅ Tabela 'users' existe")
    
    # Verificar usuários existentes
    result = db.execute(text("SELECT COUNT(*) FROM users"))
    user_count = result.scalar()
    print(f"📊 Total de usuários: {user_count}")
    
    # Verificar usuário específico
    user = db.query(User).filter(User.email == 'andrekaidellisola@gmail.com').first()
    if user:
        print(f"✅ Usuário encontrado: {user.email}")
        print(f"   - ID: {user.id}")
        print(f"   - Ativo: {user.is_active}")
        print(f"   - Role: {user.role}")
        print(f"   - SAAS Role: {user.saas_role}")
        print(f"   - Company ID: {user.company_id}")
    else:
        print("❌ Usuário 'andrekaidellisola@gmail.com' NÃO encontrado")
        
    # Listar todos os usuários
    print("\n📋 Lista de usuários:")
    users = db.query(User).limit(10).all()
    for u in users:
        print(f"   - {u.email} (ID: {u.id}, Ativo: {u.is_active})")
        
    db.close()
    print("\n✅ Verificação concluída!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
