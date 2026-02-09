from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT enumname FROM pg_enum WHERE enumname = 'company_role'"))
        enum_exists = result.rowcount > 0
        print(f"Enum company_role existe: {enum_exists}")
        
        if not enum_exists:
            print("Criando enum company_role...")
            conn.execute(text("""
                CREATE TYPE company_role AS ENUM (
                    'COMPANY_OWNER',
                    'COMPANY_MANAGER', 
                    'COMPANY_PROFESSIONAL',
                    'COMPANY_RECEPTIONIST',
                    'COMPANY_STAFF'
                )
            """))
            conn.commit()
            print("Enum company_role criado com sucesso!")
        else:
            print("Enum company_role já existe")
            
except Exception as e:
    print(f"Erro: {e}")
