#!/usr/bin/env python3
"""
Teste de migração de senhas - argon2 + bcrypt
"""

import asyncio
import sys
import os

# Adicionar o diretório backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import verify_password, get_password_hash, pwd_context
from passlib.context import CryptContext

def test_password_migration():
    """Testa diferentes cenários de migração de senhas"""
    
    print("🔧 Testando migração de senhas...")
    
    # Cenários de teste
    test_cases = [
        {
            "name": "Senha curta com bcrypt",
            "password": "test123",
            "hash_func": lambda p: CryptContext(schemes=["bcrypt"]).hash(p)
        },
        {
            "name": "Senha curta com argon2",
            "password": "test123",
            "hash_func": lambda p: CryptContext(schemes=["argon2"]).hash(p)
        },
        {
            "name": "Senha longa (>72 chars) com argon2",
            "password": "a" * 100,  # Senha muito longa
            "hash_func": lambda p: CryptContext(schemes=["argon2"]).hash(p)
        }
    ]
    
    for case in test_cases:
        print(f"\n📋 Teste: {case['name']}")
        
        # Gerar hash
        hashed = case['hash_func'](case['password'])
        print(f"   Hash gerado: {hashed[:50]}...")
        
        # Testar verificação
        try:
            result = verify_password(case['password'], hashed)
            print(f"   ✅ Verificação: {'SUCESSO' if result else 'FALHOU'}")
        except Exception as e:
            print(f"   ❌ Erro na verificação: {e}")
            
            # Tentar contexto específico
            try:
                if 'bcrypt' in case['name']:
                    bcrypt_context = CryptContext(schemes=["bcrypt"])
                    result = bcrypt_context.verify(case['password'], hashed)
                else:
                    argon2_context = CryptContext(schemes=["argon2"])
                    result = argon2_context.verify(case['password'], hashed)
                print(f"   🔄 Verificação alternativa: {'SUCESSO' if result else 'FALHOU'}")
            except Exception as e2:
                print(f"   ❌ Erro alternativo: {e2}")

def test_database_users():
    """Testa usuários existentes no banco"""
    
    print("\n🔍 Verificando usuários no banco de dados...")
    
    try:
        db: Session = SessionLocal()
        
        # Buscar alguns usuários (limitar para não sobrecarregar)
        from app.models.user import User
        users = db.query(User).limit(5).all()
        
        for user in users:
            print(f"\n👤 Usuário: {user.email}")
            print(f"   Hash tipo: {user.password_hash[:10]}...")
            
            # Não podemos testar a senha real sem conhecê-la,
            # mas podemos verificar se o hash é reconhecido
            try:
                # Tentar identificar o tipo de hash
                record = pwd_context._identify_record(user.password_hash)
                print(f"   ✅ Hash reconhecido: {record.scheme}")
            except Exception as e:
                print(f"   ⚠️  Hash não reconhecido: {e}")
                
        db.close()
        
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")

if __name__ == "__main__":
    test_password_migration()
    test_database_users()
    print("\n🎉 Teste concluído!")