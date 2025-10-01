"""
Script para criar profissionais/funcionários mock
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
import random

def create_professionals():
    db = SessionLocal()
    
    professionals_data = [
        {
            "full_name": "Maria Silva",
            "email": "maria.silva@belezatotal.com",
            "phone": "(11) 98765-4321",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Corte Feminino", "Coloração", "Escova"],
            "bio": "Especialista em cortes femininos com 10 anos de experiência",
            "commission_rate": 40
        },
        {
            "full_name": "João Santos",
            "email": "joao.santos@belezatotal.com",
            "phone": "(11) 98765-4322",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Corte Masculino", "Barba", "Sobrancelha"],
            "bio": "Barbeiro profissional especializado em cortes modernos",
            "commission_rate": 35
        },
        {
            "full_name": "Ana Costa",
            "email": "ana.costa@belezatotal.com",
            "phone": "(11) 98765-4323",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Manicure", "Pedicure", "Unhas Decoradas"],
            "bio": "Designer de unhas com certificação internacional",
            "commission_rate": 45
        },
        {
            "full_name": "Pedro Oliveira",
            "email": "pedro.oliveira@belezatotal.com",
            "phone": "(11) 98765-4324",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Massagem", "Drenagem Linfática", "Relaxamento"],
            "bio": "Massoterapeuta com especialização em técnicas orientais",
            "commission_rate": 50
        },
        {
            "full_name": "Carla Mendes",
            "email": "carla.mendes@belezatotal.com",
            "phone": "(11) 98765-4325",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Depilação", "Limpeza de Pele", "Estética Facial"],
            "bio": "Esteticista com foco em tratamentos faciais",
            "commission_rate": 40
        },
        {
            "full_name": "Lucas Ferreira",
            "email": "lucas.ferreira@belezatotal.com",
            "phone": "(11) 98765-4326",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Personal Trainer", "Musculação", "Funcional"],
            "bio": "Personal trainer com CREF ativo",
            "commission_rate": 55
        },
        {
            "full_name": "Juliana Rocha",
            "email": "juliana.rocha@belezatotal.com",
            "phone": "(11) 98765-4327",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Maquiagem", "Design de Sobrancelhas", "Cílios"],
            "bio": "Maquiadora profissional para eventos e noivas",
            "commission_rate": 45
        },
        {
            "full_name": "Rafael Lima",
            "email": "rafael.lima@belezatotal.com",
            "phone": "(11) 98765-4328",
            "role": UserRole.PROFESSIONAL,
            "specialties": ["Tatuagem", "Piercing", "Remoção a Laser"],
            "bio": "Tatuador com 8 anos de experiência em diversos estilos",
            "commission_rate": 60
        }
    ]
    
    # Horários de trabalho padrão
    working_hours = {
        "monday": {"start": "09:00", "end": "18:00"},
        "tuesday": {"start": "09:00", "end": "18:00"},
        "wednesday": {"start": "09:00", "end": "18:00"},
        "thursday": {"start": "09:00", "end": "18:00"},
        "friday": {"start": "09:00", "end": "18:00"},
        "saturday": {"start": "09:00", "end": "14:00"}
    }
    
    created_count = 0
    
    for prof_data in professionals_data:
        # Verificar se já existe
        existing = db.query(User).filter(User.email == prof_data["email"]).first()
        if existing:
            print(f"❌ Profissional {prof_data['full_name']} já existe")
            continue
        
        # Criar profissional
        professional = User(
            email=prof_data["email"],
            full_name=prof_data["full_name"],
            phone=prof_data["phone"],
            password_hash=get_password_hash("senha123"),  # Senha padrão
            role=prof_data["role"],
            company_id=1,  # Empresa padrão
            is_active=True,
            is_verified=True,
            specialties=prof_data["specialties"],
            bio=prof_data["bio"],
            working_hours=working_hours,
            commission_rate=prof_data["commission_rate"]
        )
        
        db.add(professional)
        created_count += 1
        print(f"✅ Criado: {prof_data['full_name']} - {prof_data['email']}")
    
    try:
        db.commit()
        print(f"\n🎉 {created_count} profissionais criados com sucesso!")
        print("\n📝 Credenciais de acesso:")
        print("Email: [email do profissional]")
        print("Senha: senha123")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao criar profissionais: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Criando profissionais mock...\n")
    create_professionals()
