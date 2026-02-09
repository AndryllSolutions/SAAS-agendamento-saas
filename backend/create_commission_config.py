from app.core.database import engine
from sqlalchemy import text

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
                product_discount_origin
            ) VALUES (
                4, 
                'competence', 
                'finished', 
                'proportional', 
                'proportional', 
                false, 
                'professional_commission'
            )
        """))
        conn.commit()
        print("Configuração de comissão criada com sucesso!")
        
        # Verificar se foi criada
        result = conn.execute(text("""
            SELECT * FROM commission_configs WHERE company_id = 4
        """))
        config = result.fetchone()
        
        if config:
            print(f"Configuração verificada: ID {config[0]}")
        
except Exception as e:
    print(f"Erro: {e}")
