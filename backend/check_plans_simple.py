from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar estrutura da tabela
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'plans'
            ORDER BY ordinal_position
        """))
        columns = result.fetchall()
        print("Colunas da tabela plans:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
            
        # Verificar dados
        result = conn.execute(text("SELECT id, name, slug, is_active, is_visible, max_professionals FROM plans"))
        plans = result.fetchall()
        print("\nDados dos planos:")
        for plan in plans:
            print(f"  - ID: {plan[0]}, Nome: {plan[1]}, Slug: {plan[2]}, Ativo: {plan[3]}, Visível: {plan[4]}, Max Prof: {plan[5]}")
            
        # Atualizar is_visible se necessário
        conn.execute(text("UPDATE plans SET is_visible = true WHERE is_visible IS NULL"))
        conn.commit()
        print("\nCampo is_visible atualizado para true onde era NULL")
        
except Exception as e:
    print(f"Erro: {e}")
