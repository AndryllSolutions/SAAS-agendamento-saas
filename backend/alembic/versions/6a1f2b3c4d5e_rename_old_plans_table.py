"""rename_old_plans_table_to_package_plans

Revision ID: 6a1f2b3c4d5e
Revises: 498a65194650
Create Date: 2025-12-29 11:26:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6a1f2b3c4d5e'
down_revision = '498a65194650'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Renomear tabela antiga 'plans' (de pacotes) para 'package_plans'
    # Isso permite criar a nova tabela 'plans' (SaaS plans) sem conflito
    
    # Verificar se a tabela plans existe antes de renomear
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'plans' in tables:
        # Renomear tabela
        op.rename_table('plans', 'package_plans')
        
        # Atualizar ForeignKey na tabela subscriptions
        op.execute("""
            ALTER TABLE subscriptions 
            DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
        """)
        
        op.execute("""
            ALTER TABLE subscriptions 
            ADD CONSTRAINT subscriptions_plan_id_fkey 
            FOREIGN KEY (plan_id) REFERENCES package_plans(id) ON DELETE CASCADE;
        """)


def downgrade() -> None:
    # Reverter: renomear package_plans de volta para plans
    op.execute("""
        ALTER TABLE subscriptions 
        DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
    """)
    
    op.rename_table('package_plans', 'plans')
    
    op.execute("""
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;
    """)

