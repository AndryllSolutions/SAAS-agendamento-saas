from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Atualizar plano da empresa para 'essencial'
        conn.execute(text("UPDATE companies SET subscription_plan = 'essencial' WHERE id = 3"))
        conn.commit()
        print("Plano da empresa atualizado para 'essencial'")
        
        # Verificar se funcionou
        result = conn.execute(text("SELECT subscription_plan FROM companies WHERE id = 3"))
        company_plan = result.fetchone()
        print(f"Novo plano da empresa: {company_plan[0]}")
        
except Exception as e:
    print(f"Erro: {e}")
