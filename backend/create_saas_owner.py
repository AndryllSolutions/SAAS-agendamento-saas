#!/usr/bin/env python3
"""
Script para criar o usuário SAAS_OWNER
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def create_saas_owner():
    """Criar o usuário SAAS_OWNER"""
    db = SessionLocal()
    
    try:
        # Verificar se já existe
        existing = db.query(User).filter(User.email == 'admin@belezalatina.com').first()
        
        if existing:
            print('❌ Usuário admin@belezalatina.com já existe!')
            print(f'   ID: {existing.id}')
            print(f'   Email: {existing.email}')
            print(f'   Role: {existing.role}')
            print(f'   SaaS Role: {existing.saas_role}')
            return False
        
        # Criar novo usuário
        password_hash = get_password_hash('admin123')
        
        admin = User(
            email='admin@belezalatina.com',
            password_hash=password_hash,
            full_name='Administrador SaaS',
            role=UserRole.ADMIN,
            saas_role='SAAS_OWNER',
            is_active=True,
            is_verified=True,
            company_id=None  # SAAS_OWNER não está vinculado a nenhuma empresa
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print('=' * 60)
        print('✅ USUÁRIO SAAS_OWNER CRIADO COM SUCESSO!')
        print('=' * 60)
        print()
        print(f'   ID: {admin.id}')
        print(f'   Email: {admin.email}')
        print(f'   Senha: admin123')
        print(f'   Nome: {admin.full_name}')
        print(f'   Role: {admin.role}')
        print(f'   SaaS Role: {admin.saas_role}')
        print(f'   Ativo: {admin.is_active}')
        print(f'   Verificado: {admin.is_verified}')
        print(f'   Company ID: {admin.company_id}')
        print()
        print('=' * 60)
        print('🎉 Agora você pode fazer login!')
        print('=' * 60)
        
        return True
        
    except Exception as e:
        print(f'❌ Erro ao criar usuário: {e}')
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == '__main__':
    create_saas_owner()

