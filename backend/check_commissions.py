from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        # Verificar comissões criadas
        result = conn.execute(text("""
            SELECT c.id, c.base_value, c.commission_percentage, c.commission_value, c.status,
                   u.full_name as professional_name, cmd.number as command_number
            FROM commissions c
            JOIN users u ON c.professional_id = u.id
            JOIN commands cmd ON c.command_id = cmd.id
            WHERE c.company_id = 4
            ORDER BY c.created_at DESC
        """))
        commissions = result.fetchall()
        
        print(f"Comissões encontradas: {len(commissions)}")
        for comm in commissions:
            print(f"  - ID: {comm[0]}")
            print(f"    Profissional: {comm[5]}")
            print(f"    Comanda: {comm[6]}")
            print(f"    Valor Base: R$ {comm[1]}")
            print(f"    Percentual: {comm[2]}%")
            print(f"    Valor Comissão: R$ {comm[3]}")
            print(f"    Status: {comm[4]}")
            print()
            
        # Verificar configuração de comissões da empresa
        result = conn.execute(text("""
            SELECT * FROM commission_configs WHERE company_id = 4
        """))
        config = result.fetchone()
        
        if config:
            print(f"Configuração de comissões da empresa:")
            print(f"  - Tipo de filtro de data: {config[2]}")
            print(f"  - Tipo de filtro de comando: {config[3]}")
            print(f"  - Responsabilidade taxas: {config[4]}")
            print(f"  - Responsabilidade descontos: {config[5]}")
        else:
            print("Nenhuma configuração de comissão encontrada")
            
except Exception as e:
    print(f"Erro: {e}")
