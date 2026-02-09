from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar todos os usuários ativos da empresa
        result = conn.execute(text("""
            SELECT id, full_name, role, is_active 
            FROM users 
            WHERE company_id = 4 AND is_active = true
        """))
        users = result.fetchall()
        
        print(f"Todos os usuários ativos da empresa (ID 4):")
        for user in users:
            print(f"  - ID: {user[0]}, Nome: {user[1]}, Role: {user[2]}, Ativo: {user[3]}")
            
        print(f"\nTotal de usuários ativos: {len(users)}")
        
except Exception as e:
    print(f"Erro: {e}")
