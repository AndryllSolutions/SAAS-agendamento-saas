"""update_companies_and_subscriptions_for_plans

Revision ID: d6f40aece08f
Revises: 7529dee5d9cb
Create Date: 2025-12-29 11:05:19.734431

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'd6f40aece08f'
down_revision = '7529dee5d9cb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar campos em companies
    op.add_column('companies', sa.Column('subscription_plan_id', sa.Integer(), nullable=True))
    op.add_column('companies', sa.Column('active_addons', postgresql.JSON(astext_type=sa.Text()), server_default='[]'))
    
    # FK para plans
    op.create_foreign_key(
        'fk_companies_subscription_plan_id',
        'companies', 'plans',
        ['subscription_plan_id'], ['id']
    )
    
    # Migrar subscription_plan existente para plan_id
    # BASIC → essencial
    op.execute("""
        UPDATE companies c
        SET subscription_plan_id = (SELECT id FROM plans WHERE slug = 'essencial')
        WHERE c.subscription_plan = 'BASIC' OR c.subscription_plan IS NULL OR c.subscription_plan = '';
    """)
    
    op.execute("""
        UPDATE companies c
        SET subscription_plan_id = (SELECT id FROM plans WHERE slug = 'pro')
        WHERE c.subscription_plan = 'PRO';
    """)
    
    op.execute("""
        UPDATE companies c
        SET subscription_plan_id = (SELECT id FROM plans WHERE slug = 'premium')
        WHERE c.subscription_plan = 'PREMIUM';
    """)
    
    # Atualizar campo subscription_plan para novo padrão
    op.execute("UPDATE companies SET subscription_plan = 'ESSENCIAL' WHERE subscription_plan = 'BASIC' OR subscription_plan IS NULL OR subscription_plan = '';")
    
    # Adicionar campos em company_subscriptions
    op.add_column('company_subscriptions', sa.Column('plan_id', sa.Integer(), nullable=True))
    op.add_column('company_subscriptions', sa.Column('billing_cycle', sa.String(20), server_default='monthly'))
    op.add_column('company_subscriptions', sa.Column('next_billing_date', sa.DateTime(), nullable=True))
    op.add_column('company_subscriptions', sa.Column('auto_renew', sa.Boolean(), server_default='true'))
    
    # FK para plans
    op.create_foreign_key(
        'fk_company_subscriptions_plan_id',
        'company_subscriptions', 'plans',
        ['plan_id'], ['id']
    )
    
    # Migrar plan_type existente para plan_id
    op.execute("""
        UPDATE company_subscriptions cs
        SET plan_id = (
            CASE
                WHEN cs.plan_type = 'BASIC' OR cs.plan_type = 'FREE' OR cs.plan_type IS NULL THEN (SELECT id FROM plans WHERE slug = 'essencial')
                WHEN cs.plan_type = 'PRO' THEN (SELECT id FROM plans WHERE slug = 'pro')
                WHEN cs.plan_type = 'PREMIUM' THEN (SELECT id FROM plans WHERE slug = 'premium')
                ELSE (SELECT id FROM plans WHERE slug = 'essencial')
            END
        );
    """)
    
    # Atualizar plan_type
    op.execute("""
        UPDATE company_subscriptions
        SET plan_type = 'ESSENCIAL'
        WHERE plan_type = 'BASIC' OR plan_type = 'FREE' OR plan_type IS NULL;
    """)


def downgrade() -> None:
    # company_subscriptions
    op.drop_constraint('fk_company_subscriptions_plan_id', 'company_subscriptions', type_='foreignkey')
    op.drop_column('company_subscriptions', 'auto_renew')
    op.drop_column('company_subscriptions', 'next_billing_date')
    op.drop_column('company_subscriptions', 'billing_cycle')
    op.drop_column('company_subscriptions', 'plan_id')
    
    # companies
    op.drop_constraint('fk_companies_subscription_plan_id', 'companies', type_='foreignkey')
    op.drop_column('companies', 'active_addons')
    op.drop_column('companies', 'subscription_plan_id')
    
    # Reverter ESSENCIAL → BASIC
    op.execute("UPDATE companies SET subscription_plan = 'BASIC' WHERE subscription_plan = 'ESSENCIAL';")
    op.execute("UPDATE company_subscriptions SET plan_type = 'BASIC' WHERE plan_type = 'ESSENCIAL';")

