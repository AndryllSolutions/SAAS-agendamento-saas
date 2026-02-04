#!/usr/bin/env python3
"""
Script para criar usuário de teste no ambiente Docker
"""
import sys
import os

# Adicionar o diretório do app ao Python path
sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

def create_test_user():
    # Criar engine e sessão
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar se usuário já existe
        user = db.query(User).filter(User.email == "admin@teste.com").first()
        if user:
            print("Usuário de teste já existe!")
            print("Email: admin@teste.com")
            print("Senha: admin123")
            return
        
        # Criar usuário de teste
        hashed_password = get_password_hash("admin123")
        user = User(
            email="admin@teste.com",
            hashed_password=hashed_password,
            full_name="Administrador Teste",
            is_active=True,
            is_superuser=True,
            role="saas_admin"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("✅ Usuário de teste criado com sucesso!")
        print("📧 Email: admin@teste.com")
        print("🔑 Senha: admin123")
        print(f"🆔 ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
