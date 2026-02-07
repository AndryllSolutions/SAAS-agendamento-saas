#!/usr/bin/env python3
"""
Script para criar empresa no sistema ATENDO SaaS na VPS
Versão corrigida para o schema atual do banco
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
import bcrypt

def hash_password(password: str) -> str:
    """Hash para senha compatível com bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_empresa():
    # Configuração do banco de dados PostgreSQL na VPS
    DATABASE_URL = "postgresql://agendamento:Ag3nd2026P0stgr3sS3cur3K3y@db:5432/agendamento_db"
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔗 Conectado ao banco de dados PostgreSQL na VPS")
        
        # 1. Verificar se empresa já existe
        cursor.execute("SELECT * FROM companies WHERE slug = %s", ("studio-elegance",))
        empresa_existente = cursor.fetchone()
        
        if empresa_existente:
            print("❌ Empresa Studio Elegance já existe")
            return
        
        # 2. Criar empresa Studio Elegance (adaptado para schema atual)
        cursor.execute("""
            INSERT INTO companies (name, slug, description, email, phone, website, 
                                 address, city, state, country, postal_code, 
                                 business_hours, timezone, currency, primary_color, secondary_color, 
                                 is_active, subscription_plan, features, 
                                 created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            "Studio Elegance",
            "studio-elegance",
            "Studio de beleza e estética premium com serviços de alta qualidade",
            "contato@studioelegance.com.br",
            "(11) 98765-4321",
            "www.studioelegance.com.br",
            "Rua das Flores, 123, Jardins",
            "São Paulo",
            "SP",
            "Brasil",
            "01402-000",
            json.dumps({
                "monday": {"start": "09:00", "end": "19:00", "closed": False},
                "tuesday": {"start": "09:00", "end": "19:00", "closed": False},
                "wednesday": {"start": "09:00", "end": "19:00", "closed": False},
                "thursday": {"start": "09:00", "end": "19:00", "closed": False},
                "friday": {"start": "09:00", "end": "19:00", "closed": False},
                "saturday": {"start": "08:00", "end": "18:00", "closed": False},
                "sunday": {"start": "08:00", "end": "13:00", "closed": False}
            }),
            "America/Sao_Paulo",
            "BRL",
            "#E91E63",
            "#9C27B0",
            True,
            "ESSENCIAL",
            json.dumps(["whatsapp", "online_booking", "financial_complete"]),
            datetime.now(),
            datetime.now()
        ))
        
        empresa = cursor.fetchone()
        print(f"✅ Empresa criada com ID: {empresa['id']}")
        
        # 3. Verificar se usuário admin já existe
        cursor.execute("SELECT * FROM users WHERE email = %s", ("andrekaidellisola@gmail.com",))
        admin_existente = cursor.fetchone()
        
        if admin_existente:
            print("❌ Usuário admin já existe")
            return
        
        # 4. Criar usuário admin
        cursor.execute("""
            INSERT INTO users (company_id, email, password_hash, full_name, phone, 
                             role, is_active, is_verified, bio, specialties, commission_rate, 
                             notification_preferences, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            empresa['id'],
            "andrekaidellisola@gmail.com",
            hash_password("@DEDEra45ra45"),
            "André Kaidellis Sola",
            "(11) 98765-4321",
            "OWNER",
            True,
            True,
            "Proprietário e gestor do Studio Elegance",
            json.dumps(["Gestão", "Atendimento ao Cliente"]),
            0,
            json.dumps({"email": True, "sms": False, "whatsapp": True, "push": True}),
            datetime.now(),
            datetime.now()
        ))
        
        admin = cursor.fetchone()
        print(f"✅ Usuário admin '{admin['email']}' criado com ID: {admin['id']}")
        
        # 5. Criar categorias de serviços
        categorias_data = [
            ("Cabelos", "Serviços de cortes, tratamentos e coloração capilar", "scissors", "#E91E63"),
            ("Unhas", "Manicure, pedicure e esmaltação", "sparkles", "#9C27B0"),
            ("Estética Facial", "Tratamentos faciais e limpeza de pele", "face", "#3F51B5"),
            ("Corpo & Massagem", "Massagens e tratamentos corporais", "spa", "#009688"),
            ("Sobrancelha & Design", "Design de sobrancelhas e alongamento", "eye", "#FF5722")
        ]
        
        categorias_ids = []
        for nome, desc, icon, color in categorias_data:
            cursor.execute("""
                INSERT INTO service_categories (company_id, name, description, icon, color, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (empresa['id'], nome, desc, icon, color, True, datetime.now(), datetime.now()))
            cat = cursor.fetchone()
            categorias_ids.append(cat['id'])
        
        print("✅ 5 categorias de serviços criadas")
        
        # 6. Criar serviços
        servicos_data = [
            # Cabelos
            (categorias_ids[0], "Corte Masculino", "Corte de cabelo masculino com lavagem e finalização", 45.00, 30, 15, 20, "#E91E63"),
            (categorias_ids[0], "Corte Feminino", "Corte de cabelo feminino com lavagem, escova e finalização", 85.00, 60, 15, 25, "#E91E63"),
            (categorias_ids[0], "Coloração Completa", "Coloração completa com produtos premium", 180.00, 120, 30, 30, "#E91E63"),
            (categorias_ids[0], "Progressiva", "Tratamento progressiva com alisamento e brilho", 250.00, 180, 30, 35, "#E91E63"),
            (categorias_ids[0], "Hidratação Capilar", "Hidratação profunda para revitalização dos fios", 90.00, 60, 15, 25, "#E91E63"),
            
            # Unhas
            (categorias_ids[1], "Manicure Tradicional", "Manicure com esmaltação tradicional", 40.00, 45, 10, 30, "#9C27B0"),
            (categorias_ids[1], "Pedicure Tradicional", "Pedicure com esmaltação tradicional", 50.00, 60, 10, 30, "#9C27B0"),
            (categorias_ids[1], "Esmaltação em Gel", "Esmaltação em gel com durabilidade de 3 semanas", 80.00, 90, 15, 35, "#9C27B0"),
            (categorias_ids[1], "Alongamento de Unhas", "Alongamento com fibra de vidro ou gel", 120.00, 120, 20, 40, "#9C27B0"),
            
            # Estética Facial
            (categorias_ids[2], "Limpeza de Pele", "Limpeza de pele profunda com extração", 120.00, 90, 15, 35, "#3F51B5"),
            (categorias_ids[2], "Hidratação Facial", "Hidratação profunda com máscaras e séruns", 150.00, 75, 15, 40, "#3F51B5"),
            (categorias_ids[2], "Peeling Químico", "Peeling químico para rejuvenescimento", 200.00, 60, 20, 45, "#3F51B5"),
            
            # Corpo & Massagem
            (categorias_ids[3], "Massagem Relaxante", "Massagem relaxante com óleos essenciais", 130.00, 60, 15, 40, "#009688"),
            (categorias_ids[3], "Massagem Modeladora", "Massagem modeladora para redução de medidas", 150.00, 60, 15, 40, "#009688"),
            (categorias_ids[3], "Drenagem Linfática", "Drenagem linfática manual", 180.00, 90, 15, 45, "#009688"),
            
            # Sobrancelha & Design
            (categorias_ids[4], "Design de Sobrancelha", "Design e correção de sobrancelha", 45.00, 30, 10, 30, "#FF5722"),
            (categorias_ids[4], "Henna na Sobrancelha", "Coloração com henna natural", 35.00, 20, 5, 25, "#FF5722"),
            (categorias_ids[4], "Alongamento de Cílios", "Alongamento de cílios fio a fio", 180.00, 120, 20, 50, "#FF5722")
        ]
        
        for cat_id, nome, desc, preco, duracao, lead_time, comissao, cor in servicos_data:
            cursor.execute("""
                INSERT INTO services (company_id, category_id, name, description, price, 
                                    duration_minutes, lead_time_minutes, commission_rate, 
                                    color, is_active, available_online, online_booking_enabled, 
                                    created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (empresa['id'], cat_id, nome, desc, preco, duracao, lead_time, comissao, cor, True, True, True, datetime.now(), datetime.now()))
        
        print(f"✅ {len(servicos_data)} serviços criados")
        
        # 7. Criar profissionais
        profissionais_data = [
            ("maria.santos@studioelegance.com.br", "Maria Santos", "(11) 91234-5678", 
             "Hair Stylist com 10 anos de experiência em cortes e colorações",
             json.dumps(["Corte Masculino", "Corte Feminino", "Coloração", "Progressiva", "Hidratação Capilar"]),
             json.dumps({
                 "monday": {"start": "09:00", "end": "19:00", "closed": False},
                 "tuesday": {"start": "09:00", "end": "19:00", "closed": False},
                 "wednesday": {"start": "09:00", "end": "19:00", "closed": False},
                 "thursday": {"start": "09:00", "end": "19:00", "closed": False},
                 "friday": {"start": "09:00", "end": "19:00", "closed": False},
                 "saturday": {"start": "08:00", "end": "16:00", "closed": False},
                 "sunday": {"closed": True}
             }), 25),
            ("ana.oliveira@studioelegance.com.br", "Ana Oliveira", "(11) 92345-6789",
             "Esteticista especializada em tratamentos faciais e corporais",
             json.dumps(["Limpeza de Pele", "Hidratação Facial", "Peeling Químico", "Massagem Relaxante", "Drenagem Linfática"]),
             json.dumps({
                 "monday": {"start": "10:00", "end": "20:00", "closed": False},
                 "tuesday": {"start": "10:00", "end": "20:00", "closed": False},
                 "wednesday": {"start": "10:00", "end": "20:00", "closed": False},
                 "thursday": {"start": "10:00", "end": "20:00", "closed": False},
                 "friday": {"start": "10:00", "end": "20:00", "closed": False},
                 "saturday": {"start": "08:00", "end": "14:00", "closed": False},
                 "sunday": {"closed": True}
             }), 35),
            ("camila.silva@studioelegance.com.br", "Camila Silva", "(11) 93456-7890",
             "Manicure e especialista em alongamentos",
             json.dumps(["Manicure Tradicional", "Pedicure Tradicional", "Esmaltação em Gel", "Alongamento de Unhas", "Design de Sobrancelha"]),
             json.dumps({
                 "monday": {"start": "09:00", "end": "18:00", "closed": False},
                 "tuesday": {"start": "09:00", "end": "18:00", "closed": False},
                 "wednesday": {"start": "09:00", "end": "18:00", "closed": False},
                 "thursday": {"start": "09:00", "end": "18:00", "closed": False},
                 "friday": {"start": "09:00", "end": "18:00", "closed": False},
                 "saturday": {"start": "08:00", "end": "16:00", "closed": False},
                 "sunday": {"closed": True}
             }), 30)
        ]
        
        for email, nome, phone, bio, specialties, working_hours, comissao in profissionais_data:
            cursor.execute("""
                INSERT INTO users (company_id, email, password_hash, full_name, phone, 
                                 role, is_active, is_verified, bio, specialties, working_hours, 
                                 commission_rate, notification_preferences, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (empresa['id'], email, hash_password("temp123456"), nome, phone, "PROFESSIONAL", 
                  True, True, bio, specialties, working_hours, comissao,
                  json.dumps({"email": True, "whatsapp": True, "push": True}),
                  datetime.now(), datetime.now()))
        
        print(f"✅ {len(profissionais_data)} profissionais criados")
        
        # Commit das alterações
        conn.commit()
        
        print("\n🎉 EMPRESA CRIADA COM SUCESSO NA VPS!")
        print(f"📋 Nome: Studio Elegance")
        print(f"👤 Admin: andrekaidellisola@gmail.com")
        print(f"🔑 Senha: @DEDEra45ra45")
        print(f"🏢 ID da Empresa: {empresa['id']}")
        print(f"💼 Plano: ESSENCIAL")
        print(f"👷 Profissionais: {len(profissionais_data)}")
        print(f"⚙️ Serviços: {len(servicos_data)}")
        print(f"📁 Categorias: {len(categorias_ids)}")
        print(f"🌐 Acesso: http://72.62.138.239")
        print(f"📱 Login: http://72.62.138.239/login")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_empresa()
