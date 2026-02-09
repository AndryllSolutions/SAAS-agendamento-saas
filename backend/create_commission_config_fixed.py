from app.core.database import engine
from sqlalchemy import text
from datetime import datetime

try:
    with engine.connect() as conn:
        # Criar configuração de comissão padrão para a empresa
        conn.execute(text("""
            INSERT INTO commission_configs (
                company_id, 
                date_filter_type, 
                command_type_filter, 
                fees_responsibility, 
                discounts_responsibility, 
                deduct_additional_service_cost, 
                product_discount_origin,
                created_at,
                updated_at
            ) VALUES (
                4, 
                'competence', 
                'finished', 
                'proportional', 
                'proportional', 
                false, 
                'professional_commission',
                :now,
                :now
            )
        """), {"now": datetime.utcnow()})
        conn.commit()
        print("Configuração de comissão criada com sucesso!")
        
except Exception as e:
    print(f"Erro: {e}")
