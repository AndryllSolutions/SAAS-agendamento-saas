from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar estrutura completa dos planos
        result = conn.execute(text("SELECT * FROM plans"))
        plans = result.fetchall()
        
        # Verificar colunas
        columns = [desc[0] for desc in result.cursor.description]
        print(f"Colunas da tabela plans: {columns}")
        
        print("\nDados dos planos:")
        for plan in plans:
            plan_dict = dict(zip(columns, plan))
            print(f"  - ID: {plan_dict.get('id')}")
            print(f"    Nome: {plan_dict.get('name')}")
            print(f"    Slug: {plan_dict.get('slug')}")
            print(f"    Ativo: {plan_dict.get('is_active')}")
            print(f"    Visível: {plan_dict.get('is_visible')}")
            print(f"    Max Profissionais: {plan_dict.get('max_professionals')}")
            print()
            
        # Atualizar is_visible para todos os planos
        conn.execute(text("UPDATE plans SET is_visible = true WHERE is_visible IS NULL"))
        conn.commit()
        print("Campo is_visible atualizado para true")
        
except Exception as e:
    print(f"Erro: {e}")
