from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar dados da última comanda e seus itens
        result = conn.execute(text("""
            SELECT c.id as command_id, c.number, c.status,
                   ci.id as item_id, ci.professional_id, ci.commission_percentage, ci.total_value
            FROM commands c
            LEFT JOIN command_items ci ON c.id = ci.command_id
            WHERE c.company_id = 4
            ORDER BY c.created_at DESC
            LIMIT 5
        """))
        results = result.fetchall()
        
        print(f"Últimas comandas e itens:")
        for row in results:
            print(f"\nComanda ID: {row[0]}, Número: {row[1]}, Status: {row[2]}")
            if row[3]:  # Se tem item
                print(f"  Item ID: {row[3]}")
                print(f"  Professional ID: {row[4]}")
                print(f"  Commission %: {row[5]}")
                print(f"  Total Value: {row[6]}")
                print(f"  Deve criar comissão: {row[4] is not None and row[5] > 0}")
            else:
                print(f"  Sem itens")
                
except Exception as e:
    print(f"Erro: {e}")
