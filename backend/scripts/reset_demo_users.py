"""
Script para deletar e recriar usuários demo com novo hash
"""
import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def reset_demo_users():
    db = SessionLocal()
    
    demo_emails = [
        'admin@demo.com',
        'gerente@demo.com',
        'profissional@demo.com',
        'cliente@demo.com',
        'joao@demo.com',
        'maria@demo.com',
        'pedro@demo.com',
        'ana@demo.com'
    ]
    
    print("🗑️  Deletando usuários demo antigos...\n")
    
    deleted_count = 0
    for email in demo_emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.delete(user)
            deleted_count += 1
            print(f"❌ Deletado: {email}")
    
    try:
        db.commit()
        print(f"\n✅ {deleted_count} usuários deletados!")
        print("\n🔄 Agora execute: python scripts/create_demo_users.py")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_demo_users()
