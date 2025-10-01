"""
Script para criar usuários demo para testes
"""
import sys
import os

# Adicionar o diretório raiz ao path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

def create_demo_users():
    db = SessionLocal()
    
    demo_users = [
        {
            "full_name": "Admin Demo",
            "email": "admin@demo.com",
            "password": "demo123",
            "role": UserRole.ADMIN,
            "phone": "(11) 99999-0001",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Gerente Demo",
            "email": "gerente@demo.com",
            "password": "demo123",
            "role": UserRole.MANAGER,
            "phone": "(11) 99999-0002",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Profissional Demo",
            "email": "profissional@demo.com",
            "password": "demo123",
            "role": UserRole.PROFESSIONAL,
            "phone": "(11) 99999-0003",
            "specialties": ["Corte", "Barba", "Coloração"],
            "bio": "Profissional demo para testes do sistema",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Cliente Demo",
            "email": "cliente@demo.com",
            "password": "demo123",
            "role": UserRole.CLIENT,
            "phone": "(11) 99999-0004",
            "is_active": True,
            "is_verified": True
        },
        # Usuários adicionais para demonstração
        {
            "full_name": "João Silva",
            "email": "joao@demo.com",
            "password": "demo123",
            "role": UserRole.CLIENT,
            "phone": "(11) 98888-1111",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Maria Santos",
            "email": "maria@demo.com",
            "password": "demo123",
            "role": UserRole.PROFESSIONAL,
            "phone": "(11) 98888-2222",
            "specialties": ["Manicure", "Pedicure", "Design de Unhas"],
            "bio": "Especialista em unhas com 5 anos de experiência",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Pedro Costa",
            "email": "pedro@demo.com",
            "password": "demo123",
            "role": UserRole.PROFESSIONAL,
            "phone": "(11) 98888-3333",
            "specialties": ["Massagem", "Drenagem", "Relaxamento"],
            "bio": "Massoterapeuta certificado",
            "is_active": True,
            "is_verified": True
        },
        {
            "full_name": "Ana Oliveira",
            "email": "ana@demo.com",
            "password": "demo123",
            "role": UserRole.CLIENT,
            "phone": "(11) 98888-4444",
            "is_active": True,
            "is_verified": True
        },
    ]
    
    created_count = 0
    
    print("🚀 Criando usuários demo...\n")
    
    for user_data in demo_users:
        # Verificar se já existe
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"⚠️  {user_data['full_name']} ({user_data['email']}) já existe")
            continue
        
        # Criar usuário
        password = user_data.pop("password")
        user = User(
            **user_data,
            password_hash=get_password_hash(password),
            company_id=1  # Empresa padrão
        )
        
        db.add(user)
        created_count += 1
        print(f"✅ Criado: {user.full_name} ({user.email}) - Role: {user.role}")
    
    try:
        db.commit()
        print(f"\n🎉 {created_count} usuários demo criados com sucesso!")
        print("\n" + "="*60)
        print("📋 CREDENCIAIS DE ACESSO DEMO")
        print("="*60)
        print("\n🔴 ADMIN:")
        print("   Email: admin@demo.com")
        print("   Senha: demo123")
        print("\n🔵 GERENTE:")
        print("   Email: gerente@demo.com")
        print("   Senha: demo123")
        print("\n🟢 PROFISSIONAL:")
        print("   Email: profissional@demo.com")
        print("   Senha: demo123")
        print("\n🟣 CLIENTE:")
        print("   Email: cliente@demo.com")
        print("   Senha: demo123")
        print("\n" + "="*60)
        print("💡 OUTROS USUÁRIOS DEMO:")
        print("="*60)
        print("   joao@demo.com (Cliente)")
        print("   maria@demo.com (Profissional - Manicure)")
        print("   pedro@demo.com (Profissional - Massagem)")
        print("   ana@demo.com (Cliente)")
        print("\n   Senha para todos: demo123")
        print("="*60)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao criar usuários: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_users()
