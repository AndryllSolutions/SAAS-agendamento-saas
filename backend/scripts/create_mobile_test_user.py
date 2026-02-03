"""
Script para criar usuário de teste para mobile
"""
import sys
import os

# Adicionar o diretório raiz ao path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.company import Company
from app.core.security import get_password_hash

def create_mobile_test_user():
    """Cria usuário de teste para mobile"""
    db = SessionLocal()
    
    try:
        # Verificar se já existe empresa
        company = db.query(Company).first()
        if not company:
            # Criar empresa de teste
            company = Company(
                name='Empresa Teste Mobile',
                slug='teste-mobile',
                email='teste@mobile.com',
                subscription_plan='PREMIUM',
                is_active=True
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f'✅ Empresa criada: {company.name} (ID: {company.id})')
        else:
            print(f'📋 Usando empresa existente: {company.name} (ID: {company.id})')
        
        # Dados do usuário de teste
        test_email = "teste@mobile.com"
        test_password = "mobile123"
        
        # Verificar se usuário já existe
        existing_user = db.query(User).filter(User.email == test_email).first()
        
        if existing_user:
            print(f'\n⚠️  Usuário já existe: {test_email}')
            print(f'   ID: {existing_user.id}')
            print(f'   Nome: {existing_user.full_name}')
            print(f'   Role: {existing_user.role.value}')
            print(f'   Ativo: {existing_user.is_active}')
            print(f'\n💡 Para resetar a senha, delete o usuário e execute novamente')
            print(f'\n📋 CREDENCIAIS:')
            print(f'   Email: {test_email}')
            print(f'   Senha: {test_password}')
            return
        
        # Criar usuário de teste
        user = User(
            email=test_email,
            password_hash=get_password_hash(test_password),
            full_name='Usuário Teste Mobile',
            phone='(11) 99999-9999',
            role=UserRole.CLIENT,  # Role de cliente para testes
            company_id=company.id,
            is_active=True,
            is_verified=True
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f'\n✅ Usuário de teste criado com sucesso!')
        print(f'\n' + '='*60)
        print(f'📋 CREDENCIAIS PARA TESTE NO MOBILE')
        print(f'='*60)
        print(f'\n📧 Email: {test_email}')
        print(f'🔑 Senha: {test_password}')
        print(f'\n👤 Dados do Usuário:')
        print(f'   ID: {user.id}')
        print(f'   Nome: {user.full_name}')
        print(f'   Role: {user.role.value}')
        print(f'   Company ID: {user.company_id}')
        print(f'   Ativo: {user.is_active}')
        print(f'\n🌐 Endpoint para Login:')
        print(f'   POST /api/v1/auth/login/json')
        print(f'\n📱 Exemplo de requisição:')
        print(f'   {{')
        print(f'     "email": "{test_email}",')
        print(f'     "password": "{test_password}"')
        print(f'   }}')
        print(f'\n' + '='*60)
        
    except Exception as e:
        db.rollback()
        print(f'\n❌ Erro ao criar usuário: {e}')
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_mobile_test_user()

