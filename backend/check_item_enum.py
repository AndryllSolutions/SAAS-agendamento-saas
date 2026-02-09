from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar valores do enum no banco
        result = conn.execute(text("""
            SELECT unnest(enum_range(NULL::commanditemtype)) AS type_value
        """))
        enum_values = result.fetchall()
        
        print("Valores do enum CommandItemType no banco:")
        for value in enum_values:
            print(f"  - '{value[0]}'")
            
except Exception as e:
    print(f"Erro: {e}")
