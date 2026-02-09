from app.core.database import engine
from sqlalchemy import text
from datetime import datetime

try:
    with engine.connect() as conn:
        # Simular criação de comanda diretamente no banco
        print("🔍 Teste direto de criação de comanda com professional_id...")
        
        # 1. Criar comanda
        result = conn.execute(text("""
            INSERT INTO commands (
                company_id, client_crm_id, professional_id, date, status, number,
                total_value, net_value, created_at, updated_at
            ) VALUES (
                4, 12, 10, :now, 'OPEN', 'CMD-TEST-001', 50.00, 50.00, :now, :now
            )
            RETURNING id
        """), {"now": datetime.utcnow()})
        
        command_id = result.fetchone()[0]
        print(f"✅ Comanda criada: ID {command_id}")
        
        # 2. Criar item COM professional_id
        result = conn.execute(text("""
            INSERT INTO command_items (
                command_id, item_type, reference_id, service_id, professional_id,
                quantity, unit_value, total_value, commission_percentage,
                created_at, updated_at
            ) VALUES (
                :command_id, 'service', 3, 3, 10, 1, 50.00, 50.00, 20, :now, :now
            )
            RETURNING id
        """), {"command_id": command_id, "now": datetime.utcnow()})
        
        item_id = result.fetchone()[0]
        print(f"✅ Item criado: ID {item_id} com professional_id=10")
        
        # 3. Verificar se foi salvo corretamente
        result = conn.execute(text("""
            SELECT professional_id, commission_percentage FROM command_items WHERE id = :item_id
        """), {"item_id": item_id})
        
        item_data = result.fetchone()
        print(f"✅ Verificação: professional_id = {item_data[0]}, commission_percentage = {item_data[1]}")
        
        # 4. Finalizar comanda para testar criação de comissão
        conn.execute(text("""
            UPDATE commands SET status = 'FINISHED' WHERE id = :command_id
        """), {"command_id": command_id})
        
        # 5. Verificar se comissão foi criada
        result = conn.execute(text("""
            SELECT id, professional_id, commission_value, status FROM commissions 
            WHERE command_id = :command_id
        """), {"command_id": command_id})
        
        commissions = result.fetchall()
        print(f"✅ Comissões criadas: {len(commissions)}")
        
        for comm in commissions:
            print(f"  - ID: {comm[0]}, Profissional: {comm[1]}, Valor: R$ {comm[2]}, Status: {comm[3]}")
            
        conn.commit()
        print("\n🎉 Teste direto funcionou! O problema está na API!")
        
except Exception as e:
    print(f"❌ Erro: {e}")
