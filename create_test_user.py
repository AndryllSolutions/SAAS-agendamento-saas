#!/usr/bin/env python3
"""
Script para criar usuario de teste no banco de dados
"""
import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.core.security import get_password_hash
from sqlalchemy import text

db = SessionLocal()

try:
    # Verificar usuarios existentes
    users = db.query(User).all()
    print(f"Total de usuarios no banco: {len(users)}")
    
    if len(users) > 0:
        print("\nUsuarios existentes:")
        for u in users[:5]:
            print(f"  - {u.email} (ID: {u.id}, Company: {u.company_id}, Role: {u.role})")
        
        # Usar primeiro usuario encontrado
        test_user = users[0]
        print(f"\n[OK] Usando usuario existente: {test_user.email}")
        print(f"     ID: {test_user.id}")
        print(f"     Company ID: {test_user.company_id}")
        print(f"     Role: {test_user.role}")
    else:
        print("\n[INFO] Nenhum usuario encontrado. Criando usuario de teste...")
        
        # Criar empresa de teste
        company = Company(
            name="Empresa Teste",
            email="empresa@teste.com",
            phone="(11) 99999-9999",
            is_active=True
        )
        db.add(company)
        db.flush()
        
        print(f"[OK] Empresa criada: {company.name} (ID: {company.id})")
        
        # Criar usuario admin de teste
        test_user = User(
            email="admin@teste.com",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Admin Teste",
            company_id=company.id,
            role="admin",
            is_active=True,
            is_superuser=True
        )
        db.add(test_user)
        db.commit()
        
        print(f"[OK] Usuario criado: {test_user.email}")
        print(f"     Senha: Admin@123")
        print(f"     ID: {test_user.id}")
        print(f"     Company ID: {test_user.company_id}")
        print(f"     Role: {test_user.role}")
    
    # Salvar credenciais em arquivo
    with open('/tmp/test_credentials.txt', 'w') as f:
        f.write(f"email={test_user.email}\n")
        f.write(f"user_id={test_user.id}\n")
        f.write(f"company_id={test_user.company_id}\n")
        f.write(f"role={test_user.role}\n")
    
    print("\n[OK] Credenciais salvas em /tmp/test_credentials.txt")
    
except Exception as e:
    print(f"\n[ERRO] {str(e)}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
