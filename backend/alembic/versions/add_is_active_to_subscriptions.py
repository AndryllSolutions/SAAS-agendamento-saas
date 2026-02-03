"""add_is_active_to_company_subscriptions

Revision ID: add_is_active_subs
Revises: add_price_min_max
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_is_active_subs'
down_revision = 'add_price_min_max'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar coluna is_active à tabela company_subscriptions (se não existir)
    op.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'company_subscriptions' 
                AND column_name = 'is_active'
            ) THEN 
                ALTER TABLE company_subscriptions ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.drop_column('company_subscriptions', 'is_active')
