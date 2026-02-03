"""
Script para resetar senha de usuário específico
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_password(email: str, new_password: str = "admin123"):
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"ERRO: Usuario {email} nao encontrado!")
            return False
        
        print(f"Usuario encontrado:")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Nome: {user.full_name}")
        print(f"  Role: {user.role}")
        print(f"  SaaS Role: {user.saas_role}")
        print(f"  Ativo: {user.is_active}")
        print()
        
        # Resetar senha
        user.password_hash = get_password_hash(new_password)
        db.commit()
        
        print(f"OK Senha resetada com sucesso!")
        print(f"  Email: {user.email}")
        print(f"  Nova senha: {new_password}")
        
        return True
        
    except Exception as e:
        print(f"ERRO: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python reset_user_password.py <email> [nova_senha]")
        print("Exemplo: python reset_user_password.py admin@example.com admin123")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    
    print("=" * 70)
    print("RESET DE SENHA - AGENDAMENTO SAAS")
    print("=" * 70)
    print()
    
    reset_password(email, password)

