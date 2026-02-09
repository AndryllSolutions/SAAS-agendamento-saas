from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT slug, name FROM plans WHERE is_active = true"))
        plans = result.fetchall()
        print("Planos disponíveis:")
        for plan in plans:
            print(f"  - {plan[0]}: {plan[1]}")
            
        # Verificar qual plano a empresa está tentando usar
        result = conn.execute(text("SELECT subscription_plan FROM companies WHERE id = 3"))
        company_plan = result.fetchone()
        print(f"\nPlano da empresa: {company_plan[0] if company_plan else 'NULL'}")
        
except Exception as e:
    print(f"Erro: {e}")
