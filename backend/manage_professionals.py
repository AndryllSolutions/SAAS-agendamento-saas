from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar profissionais da empresa
        result = conn.execute(text("""
            SELECT id, full_name, role, is_active 
            FROM users 
            WHERE company_id = 4 AND role = 'PROFESSIONAL'
        """))
        professionals = result.fetchall()
        
        print(f"Profissionais da empresa (ID 4):")
        for prof in professionals:
            print(f"  - ID: {prof[0]}, Nome: {prof[1]}, Ativo: {prof[3]}")
            
        # Se tiver mais de 1, desativar alguns
        if len(professionals) > 1:
            print(f"\nDesativando {len(professionals) - 1} profissionais para liberar limite...")
            for i, prof in enumerate(professionals):
                if i < len(professionals) - 1:  # Manter apenas o último
                    conn.execute(text(f"UPDATE users SET is_active = false WHERE id = {prof[0]}"))
            conn.commit()
            print("Profissionais desativados com sucesso!")
        
except Exception as e:
    print(f"Erro: {e}")
