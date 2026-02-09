from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar dados da empresa atual
        result = conn.execute(text("""
            SELECT id, name, subscription_plan, subscription_plan_id 
            FROM companies 
            WHERE id = 4
        """))
        company = result.fetchone()
        
        if company:
            print(f"Dados da empresa:")
            print(f"  - ID: {company[0]}")
            print(f"  - Nome: {company[1]}")
            print(f"  - Subscription Plan: {company[2]}")
            print(f"  - Subscription Plan ID: {company[3]}")
            
            # Se não tiver subscription_plan_id, vamos definir
            if not company[3]:
                print("\nAtualizando subscription_plan_id para plano 'essencial'...")
                conn.execute(text("UPDATE companies SET subscription_plan_id = 1 WHERE id = 4"))
                conn.commit()
                print("subscription_plan_id atualizado para 1 (essencial)")
        else:
            print("Empresa não encontrada")
            
except Exception as e:
    print(f"Erro: {e}")
