"""
Script para verificar se os usuários demo existem no banco
"""
import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def verificar_usuarios_demo():
    db = SessionLocal()
    
    demo_emails = [
        'admin@demo.com',
        'gerente@demo.com',
        'profissional@demo.com',
        'cliente@demo.com'
    ]
    
    print("🔍 Verificando usuários demo no banco de dados...\n")
    
    encontrados = []
    nao_encontrados = []
    
    for email in demo_emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            encontrados.append({
                'email': email,
                'nome': user.full_name,
                'role': user.role.value if hasattr(user.role, 'value') else str(user.role),
                'ativo': user.is_active,
                'verificado': user.is_verified
            })
        else:
            nao_encontrados.append(email)
    
    print("="*60)
    print("✅ USUÁRIOS ENCONTRADOS:")
    print("="*60)
    for user in encontrados:
        print(f"\n📧 Email: {user['email']}")
        print(f"   Nome: {user['nome']}")
        print(f"   Role: {user['role']}")
        print(f"   Ativo: {'✅' if user['ativo'] else '❌'}")
        print(f"   Verificado: {'✅' if user['verificado'] else '❌'}")
    
    if nao_encontrados:
        print("\n" + "="*60)
        print("❌ USUÁRIOS NÃO ENCONTRADOS:")
        print("="*60)
        for email in nao_encontrados:
            print(f"   - {email}")
        print("\n💡 Execute: python scripts/create_demo_users.py")
    
    print("\n" + "="*60)
    print(f"📊 Total: {len(encontrados)} encontrados, {len(nao_encontrados)} faltando")
    print("="*60)
    
    db.close()
    
    return len(nao_encontrados) == 0

if __name__ == "__main__":
    sucesso = verificar_usuarios_demo()
    sys.exit(0 if sucesso else 1)
