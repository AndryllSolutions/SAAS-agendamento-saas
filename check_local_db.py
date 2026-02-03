from app.database import engine
from sqlalchemy import text

def check_local_tables():
    """Verifica tabelas no banco local"""
    try:
        result = engine.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        print(f"Total de tabelas: {len(tables)}")
        print("\nTabelas encontradas:")
        for table in tables:
            print(f"  - {table}")
            
        return tables
    except Exception as e:
        print(f"Erro: {e}")
        return []

if __name__ == "__main__":
    check_local_tables()
