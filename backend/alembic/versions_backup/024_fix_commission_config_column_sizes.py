"""fix commission_config column sizes

Revision ID: 024_fix_commission_config
Revises: 6063dd6c03ee
Create Date: 2025-12-12 22:05:00.000000

Descrição:
    Aumenta o tamanho das colunas String(20) para String(50)
    em commission_configs para acomodar valores como
    'professional_commission' (22 caracteres).

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '024_fix_commission_config'
down_revision = '82ed8047e2be'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Aumenta o tamanho das colunas de configuração de comissão.
    """
    # Alterar tamanho das colunas VARCHAR(20) para VARCHAR(50)
    op.alter_column(
        'commission_configs',
        'date_filter_type',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'command_type_filter',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'fees_responsibility',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'discounts_responsibility',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'product_discount_origin',
        existing_type=sa.VARCHAR(length=20),
        type_=sa.String(length=50),
        existing_nullable=False
    )


def downgrade() -> None:
    """
    Reverte para VARCHAR(20) - ATENÇÃO: pode truncar dados!
    """
    op.alter_column(
        'commission_configs',
        'date_filter_type',
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'command_type_filter',
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'fees_responsibility',
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'discounts_responsibility',
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False
    )
    
    op.alter_column(
        'commission_configs',
        'product_discount_origin',
        existing_type=sa.String(length=50),
        type_=sa.VARCHAR(length=20),
        existing_nullable=False
    )

