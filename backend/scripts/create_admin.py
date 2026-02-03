"""
Script para criar usuário admin inicial
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import get_db, SessionLocal
from app.models.user import User, UserRole
from app.models.company import Company
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    
    try:
        # Verificar se já existe empresa
        existing_company = db.query(Company).first()
        if existing_company:
            print(f'⚠️  Empresa já existe: {existing_company.name}')
            company = existing_company
        else:
            # Criar empresa
            company = Company(
                name='BelezaLatinoAmericana',
                slug='belezalatino',
                email='contato@belezalatino.com',
                subscription_plan='PREMIUM',
                is_active=True
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f'✅ Empresa criada: {company.name} (ID: {company.id})')
        
        # Verificar se já existe admin
        existing_admin = db.query(User).filter(
            User.email == 'admin@belezalatino.com',
            User.company_id == company.id
        ).first()
        
        if existing_admin:
            print(f'⚠️  Admin já existe: {existing_admin.email}')
            print(f'   Para resetar a senha, delete o usuário e execute novamente')
        else:
            # Criar admin
            admin = User(
                email='admin@belezalatino.com',
                password_hash=get_password_hash('admin123'),
                full_name='Administrador',
                role=UserRole.OWNER,
                company_id=company.id,
                is_active=True,
                is_verified=True
            )
            db.add(admin)
            db.commit()
            print(f'✅ Admin criado: {admin.email}')
            print(f'   Senha: admin123')
            print(f'   Role: {admin.role.value}')
        
        print('\n🎉 Setup completo!')
        print(f'   Acesse: http://localhost:3000')
        print(f'   Email: admin@belezalatino.com')
        print(f'   Senha: admin123')
        
    except Exception as e:
        print(f'❌ Erro ao criar admin: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    create_admin()

