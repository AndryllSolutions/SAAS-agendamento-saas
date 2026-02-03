"""add_price_min_max_to_plans

Revision ID: add_price_min_max
Revises: d6f40aece08f
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_price_min_max'
down_revision = 'create_addons_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar colunas price_min e price_max à tabela plans
    op.add_column('plans', sa.Column('price_min', sa.Numeric(10, 2), nullable=True))
    op.add_column('plans', sa.Column('price_max', sa.Numeric(10, 2), nullable=True))
    
    # Atualizar plano SCALE com preço variável
    op.execute("""
        UPDATE plans 
        SET price_min = 399.00, price_max = 499.00 
        WHERE slug = 'scale';
    """)


def downgrade() -> None:
    op.drop_column('plans', 'price_max')
    op.drop_column('plans', 'price_min')
