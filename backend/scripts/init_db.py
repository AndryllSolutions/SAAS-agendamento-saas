"""
Script to initialize database with sample data
"""
import sys
sys.path.append('.')

from app.core.database import SessionLocal, engine, Base
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.service import Service, ServiceCategory
from app.core.security import get_password_hash


def init_db():
    """Initialize database with sample data"""
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_company = db.query(Company).first()
        if existing_company:
            print("Database already initialized!")
            return
        
        # Create sample company
        company = Company(
            name="Salão Beleza Total",
            slug="salao-beleza-total",
            email="contato@belezatotal.com",
            phone="(11) 99999-9999",
            description="Salão de beleza completo com os melhores profissionais",
            address="Rua das Flores, 123",
            city="São Paulo",
            state="SP",
            country="Brasil",
            postal_code="01234-567",
            timezone="America/Sao_Paulo",
            currency="BRL",
            business_hours={
                "monday": {"start": "09:00", "end": "19:00"},
                "tuesday": {"start": "09:00", "end": "19:00"},
                "wednesday": {"start": "09:00", "end": "19:00"},
                "thursday": {"start": "09:00", "end": "19:00"},
                "friday": {"start": "09:00", "end": "20:00"},
                "saturday": {"start": "09:00", "end": "18:00"},
                "sunday": {"start": "10:00", "end": "16:00"}
            },
            subscription_plan="pro",
            features={
                "whatsapp": True,
                "sms": True,
                "email": True,
                "online_payment": True,
                "calendar_integration": True
            }
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        print(f"✅ Company created: {company.name}")
        
        # Create admin user
        admin = User(
            email="admin@belezatotal.com",
            password_hash=get_password_hash("admin123"),
            full_name="Administrador Sistema",
            phone="(11) 98888-8888",
            role=UserRole.ADMIN,
            company_id=company.id,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        
        # Create manager user
        manager = User(
            email="gerente@belezatotal.com",
            password_hash=get_password_hash("gerente123"),
            full_name="Maria Gerente",
            phone="(11) 97777-7777",
            role=UserRole.MANAGER,
            company_id=company.id,
            is_active=True,
            is_verified=True
        )
        db.add(manager)
        
        # Create professional users
        professional1 = User(
            email="joao@belezatotal.com",
            password_hash=get_password_hash("prof123"),
            full_name="João Silva",
            phone="(11) 96666-6666",
            role=UserRole.PROFESSIONAL,
            company_id=company.id,
            is_active=True,
            is_verified=True,
            specialties=["Corte Masculino", "Barba", "Coloração"],
            working_hours={
                "monday": {"start": "09:00", "end": "18:00"},
                "tuesday": {"start": "09:00", "end": "18:00"},
                "wednesday": {"start": "09:00", "end": "18:00"},
                "thursday": {"start": "09:00", "end": "18:00"},
                "friday": {"start": "09:00", "end": "18:00"}
            },
            commission_rate=40
        )
        db.add(professional1)
        
        professional2 = User(
            email="ana@belezatotal.com",
            password_hash=get_password_hash("prof123"),
            full_name="Ana Santos",
            phone="(11) 95555-5555",
            role=UserRole.PROFESSIONAL,
            company_id=company.id,
            is_active=True,
            is_verified=True,
            specialties=["Manicure", "Pedicure", "Design de Sobrancelhas"],
            working_hours={
                "tuesday": {"start": "10:00", "end": "19:00"},
                "wednesday": {"start": "10:00", "end": "19:00"},
                "thursday": {"start": "10:00", "end": "19:00"},
                "friday": {"start": "10:00", "end": "19:00"},
                "saturday": {"start": "09:00", "end": "17:00"}
            },
            commission_rate=35
        )
        db.add(professional2)
        
        # Create client user
        client = User(
            email="cliente@example.com",
            password_hash=get_password_hash("cliente123"),
            full_name="Carlos Cliente",
            phone="(11) 94444-4444",
            role=UserRole.CLIENT,
            company_id=company.id,
            is_active=True,
            is_verified=True
        )
        db.add(client)
        
        db.commit()
        
        print("✅ Users created:")
        print("   - Admin: admin@belezatotal.com / admin123")
        print("   - Manager: gerente@belezatotal.com / gerente123")
        print("   - Professional 1: joao@belezatotal.com / prof123")
        print("   - Professional 2: ana@belezatotal.com / prof123")
        print("   - Client: cliente@example.com / cliente123")
        
        # Create service categories
        cat_cabelo = ServiceCategory(
            name="Cabelo",
            description="Serviços para cabelo",
            icon="scissors",
            color="#3B82F6",
            company_id=company.id
        )
        db.add(cat_cabelo)
        
        cat_manicure = ServiceCategory(
            name="Manicure e Pedicure",
            description="Serviços de manicure e pedicure",
            icon="hand",
            color="#10B981",
            company_id=company.id
        )
        db.add(cat_manicure)
        
        cat_estetica = ServiceCategory(
            name="Estética",
            description="Serviços de estética facial e corporal",
            icon="sparkles",
            color="#8B5CF6",
            company_id=company.id
        )
        db.add(cat_estetica)
        
        db.commit()
        db.refresh(cat_cabelo)
        db.refresh(cat_manicure)
        db.refresh(cat_estetica)
        
        print("✅ Service categories created")
        
        # Create services
        services = [
            Service(
                name="Corte Masculino",
                description="Corte de cabelo masculino com lavagem",
                price=50.00,
                duration_minutes=45,
                category_id=cat_cabelo.id,
                company_id=company.id,
                commission_rate=40
            ),
            Service(
                name="Corte Feminino",
                description="Corte de cabelo feminino com lavagem e finalização",
                price=80.00,
                duration_minutes=60,
                category_id=cat_cabelo.id,
                company_id=company.id,
                commission_rate=40
            ),
            Service(
                name="Coloração",
                description="Coloração completa do cabelo",
                price=150.00,
                duration_minutes=120,
                category_id=cat_cabelo.id,
                company_id=company.id,
                commission_rate=35
            ),
            Service(
                name="Barba",
                description="Corte e modelagem de barba",
                price=35.00,
                duration_minutes=30,
                category_id=cat_cabelo.id,
                company_id=company.id,
                commission_rate=40
            ),
            Service(
                name="Manicure",
                description="Manicure completa com esmaltação",
                price=40.00,
                duration_minutes=45,
                category_id=cat_manicure.id,
                company_id=company.id,
                commission_rate=35
            ),
            Service(
                name="Pedicure",
                description="Pedicure completa com esmaltação",
                price=50.00,
                duration_minutes=60,
                category_id=cat_manicure.id,
                company_id=company.id,
                commission_rate=35
            ),
            Service(
                name="Design de Sobrancelhas",
                description="Design e modelagem de sobrancelhas",
                price=30.00,
                duration_minutes=30,
                category_id=cat_estetica.id,
                company_id=company.id,
                commission_rate=30
            ),
            Service(
                name="Limpeza de Pele",
                description="Limpeza de pele profunda",
                price=120.00,
                duration_minutes=90,
                category_id=cat_estetica.id,
                company_id=company.id,
                commission_rate=30
            ),
        ]
        
        for service in services:
            db.add(service)
        
        db.commit()
        
        print(f"✅ {len(services)} services created")
        
        print("\n🎉 Database initialized successfully!")
        print("\n📝 You can now login with:")
        print("   URL: http://localhost:3000/login")
        print("   Admin: admin@belezatotal.com / admin123")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Initializing database...")
    init_db()
