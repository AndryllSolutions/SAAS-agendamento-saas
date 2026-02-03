"""
Script para atualizar Super Admin com saas_role correto
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User


def update_super_admin():
    """Atualizar Super Admin com saas_role"""
    db: Session = SessionLocal()
    
    try:
        # Buscar Super Admin
        admin = db.query(User).filter(
            User.email == "admin@Expectropatrono.com.br"
        ).first()
        
        if not admin:
            print("❌ Super Admin não encontrado!")
            return
        
        print("📋 Super Admin atual:")
        print(f"   Email: {admin.email}")
        print(f"   Role: {admin.role}")
        print(f"   SaaS Role: {admin.saas_role}")
        print(f"   Company ID: {admin.company_id}")
        
        # Atualizar saas_role
        admin.saas_role = "SAAS_OWNER"
        
        db.commit()
        db.refresh(admin)
        
        print("\n✅ Super Admin atualizado com sucesso!")
        print(f"   Email: {admin.email}")
        print(f"   Role: {admin.role}")
        print(f"   SaaS Role: {admin.saas_role}")
        print(f"   Company ID: {admin.company_id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao atualizar Super Admin: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🔧 Atualizando Super Admin...")
    print("=" * 60)
    update_super_admin()
    print("=" * 60)
