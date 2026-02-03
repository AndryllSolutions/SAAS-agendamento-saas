"""
Script para corrigir admin@belezalatina.com para SAAS_OWNER
Atualiza:
- saas_role = "SAAS_OWNER"
- role = OWNER (não cliente)
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.user import User, UserRole


def fix_admin_role():
    db = SessionLocal()
    
    try:
        # Buscar admin@belezalatina.com
        admin = db.query(User).filter(User.email == 'admin@belezalatina.com').first()
        
        if not admin:
            print('[ERRO] Usuario admin@belezalatina.com nao encontrado')
            return False
        
        print(f'Usuario encontrado:')
        print(f'   ID: {admin.id}')
        print(f'   Email: {admin.email}')
        print(f'   Nome: {admin.full_name}')
        print(f'   Role atual: {admin.role}')
        print(f'   SaaS Role atual: {admin.saas_role}')
        print(f'   Company ID: {admin.company_id}')
        print()
        
        # Atualizar para SAAS_OWNER
        old_role = admin.role
        old_saas_role = admin.saas_role
        
        admin.saas_role = "SAAS_OWNER"
        admin.role = UserRole.OWNER  # Nao CLIENT
        
        db.commit()
        db.refresh(admin)
        
        print('[OK] Usuario atualizado com sucesso!')
        print()
        print('Alteracoes:')
        print(f'   Role: {old_role} -> {admin.role}')
        print(f'   SaaS Role: {old_saas_role} -> {admin.saas_role}')
        print()
        print('Agora o usuario admin@belezalatina.com e SAAS_OWNER!')
        print('   - Pode acessar /saas-admin')
        print('   - Pode impersonar empresas')
        print('   - Pode gerenciar todas as empresas')
        print('   - Pode promover outros usuarios a SaaS Admin')
        
        return True
        
    except Exception as e:
        print(f'[ERRO] {e}')
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == '__main__':
    print('=' * 60)
    print('FIX: admin@belezalatina.com -> SAAS_OWNER')
    print('=' * 60)
    print()
    
    fix_admin_role()
    
    print()
    print('=' * 60)

