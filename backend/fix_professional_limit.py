from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Desativar um profissional para liberar espaço
        conn.execute(text("UPDATE users SET is_active = false WHERE id = 7"))
        conn.commit()
        print("Profissional ID 7 desativado")
        
        # Verificar profissionais ativos
        result = conn.execute(text("""
            SELECT id, full_name, role, is_active 
            FROM users 
            WHERE company_id = 4 AND role = 'PROFESSIONAL' AND is_active = true
        """))
        professionals = result.fetchall()
        
        print(f"\nProfissionais ativos restantes: {len(professionals)}")
        for prof in professionals:
            print(f"  - ID: {prof[0]}, Nome: {prof[1]}")
        
except Exception as e:
    print(f"Erro: {e}")
