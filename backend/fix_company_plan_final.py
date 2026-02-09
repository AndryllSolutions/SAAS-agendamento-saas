from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Atualizar subscription_plan para 'essencial'
        conn.execute(text("UPDATE companies SET subscription_plan = 'essencial' WHERE id = 4"))
        conn.commit()
        print("subscription_plan atualizado para 'essencial'")
        
        # Verificar se funcionou
        result = conn.execute(text("SELECT subscription_plan, subscription_plan_id FROM companies WHERE id = 4"))
        company = result.fetchone()
        print(f"Empresa atualizada: Plan={company[0]}, PlanID={company[1]}")
        
except Exception as e:
    print(f"Erro: {e}")
