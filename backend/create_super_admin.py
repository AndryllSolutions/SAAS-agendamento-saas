"""
Script para criar Super Admin do SaaS
Este usuário gerencia todos os tenants e não está vinculado a nenhuma empresa
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def create_super_admin():
    """Criar Super Admin do SaaS"""
    db: Session = SessionLocal()
    
    try:
        # Verificar se já existe
        existing_admin = db.query(User).filter(
            User.email == "admin@Expectropatrono.com.br"
        ).first()
        
        if existing_admin:
            print("❌ Super Admin já existe!")
            print(f"   Email: {existing_admin.email}")
            print(f"   Role: {existing_admin.role}")
            print(f"   Company ID: {existing_admin.company_id}")
            return
        
        # Criar Super Admin
        super_admin = User(
            email="admin@Expectropatrono.com.br",
            password_hash=get_password_hash("PlwXUaKVDOucmggr5l7aGeC19Lz"),
            full_name="Super Admin SaaS",
            role=UserRole.SAAS_ADMIN,
            company_id=None,  # Não vinculado a nenhuma empresa
            is_active=True,
            is_verified=True
        )
        
        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)
        
        print("✅ Super Admin criado com sucesso!")
        print(f"   ID: {super_admin.id}")
        print(f"   Email: {super_admin.email}")
        print(f"   Nome: {super_admin.full_name}")
        print(f"   Role: {super_admin.role}")
        print(f"   Company ID: {super_admin.company_id} (None = gerencia todos os tenants)")
        print(f"   Ativo: {super_admin.is_active}")
        print(f"   Verificado: {super_admin.is_verified}")
        print("\n🔑 Credenciais de acesso:")
        print(f"   Email: admin@Expectropatrono.com.br")
        print(f"   Senha: PlwXUaKVDOucmggr5l7aGeC19Lz")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar Super Admin: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Criando Super Admin do SaaS...")
    print("=" * 60)
    create_super_admin()
    print("=" * 60)
