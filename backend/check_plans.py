from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM plans"))
        plans = result.fetchall()
        print(f"Planos encontrados: {len(plans)}")
        for plan in plans:
            print(f"  - {plan[1]} ({plan[2]}) - R$ {plan[3]}")
            
        if len(plans) == 0:
            print("Criando plano padrão FREE...")
            conn.execute(text("""
                INSERT INTO plans (name, slug, description, price_monthly, max_professionals, max_units, max_clients, max_appointments_per_month, features, display_order, is_active)
                VALUES ('FREE', 'free', 'Plano gratuito com funcionalidades básicas', 0.00, 2, 1, 10, 50, '["clients", "services", "appointments", "dashboard_basic"]', 0, true)
            """))
            conn.commit()
            print("Plano FREE criado com sucesso!")
            
except Exception as e:
    print(f"Erro: {e}")
