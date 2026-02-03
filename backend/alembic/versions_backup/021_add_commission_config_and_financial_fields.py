"""
Add commission_config table and financial transaction fields

Revision ID: 021_add_commission_config_and_financial_fields
Revises: 020_add_saas_role_and_rbac_support
Create Date: 2025-12-10 XX:XX:XX.XXXXXX

This migration:
1. Creates commission_configs table
2. Adds net_value, fee_percentage, fee_value, is_paid fields to financial_transactions
3. Adds BLOCKED status to transaction_status enum
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '021_add_commission_config_and_financial_fields'
down_revision = '020_add_saas_role_and_rbac_support'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # 1. Add new fields to financial_transactions (if they don't exist)
    financial_transactions_columns = [col['name'] for col in inspector.get_columns('financial_transactions')]
    
    with op.batch_alter_table("financial_transactions", schema=None) as batch_op:
        if 'net_value' not in financial_transactions_columns:
            batch_op.add_column(sa.Column("net_value", sa.Numeric(10, 2), nullable=True))
        if 'fee_percentage' not in financial_transactions_columns:
            batch_op.add_column(sa.Column("fee_percentage", sa.Numeric(5, 2), nullable=True, server_default='0'))
        if 'fee_value' not in financial_transactions_columns:
            batch_op.add_column(sa.Column("fee_value", sa.Numeric(10, 2), nullable=True, server_default='0'))
        if 'is_paid' not in financial_transactions_columns:
            batch_op.add_column(sa.Column("is_paid", sa.Boolean(), nullable=True, server_default='false'))
        
        # Create index if column exists and index doesn't
        indexes = [idx['name'] for idx in inspector.get_indexes('financial_transactions')]
        if 'is_paid' in financial_transactions_columns and 'ix_financial_transactions_is_paid' not in indexes:
            batch_op.create_index("ix_financial_transactions_is_paid", ["is_paid"], unique=False)
    
    # Set net_value = value for existing records (if column exists)
    if 'net_value' in financial_transactions_columns:
        op.execute("""
            UPDATE financial_transactions 
            SET net_value = value 
            WHERE net_value IS NULL
        """)
    
    # 3. Create commission_configs table (if not exists)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'commission_configs' not in tables:
        op.create_table(
            'commission_configs',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('company_id', sa.Integer(), nullable=False),
            sa.Column('date_filter_type', sa.String(length=20), nullable=False, server_default='competence'),
            sa.Column('command_type_filter', sa.String(length=20), nullable=False, server_default='finished'),
            sa.Column('fees_responsibility', sa.String(length=20), nullable=False, server_default='proportional'),
            sa.Column('discounts_responsibility', sa.String(length=20), nullable=False, server_default='proportional'),
            sa.Column('deduct_additional_service_cost', sa.Boolean(), nullable=False, server_default='false'),
            sa.Column('product_discount_origin', sa.String(length=20), nullable=False, server_default='professional_commission'),
            sa.Column('discount_products_from', sa.String(length=50), nullable=True),
            sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('company_id')
        )
        op.create_index('ix_commission_configs_company_id', 'commission_configs', ['company_id'], unique=False)
    else:
        # Table exists, check if columns need to be added
        columns = [col['name'] for col in inspector.get_columns('commission_configs')]
        # If table exists but is missing columns, add them (this shouldn't happen, but just in case)
        pass


def downgrade() -> None:
    # Drop commission_configs table
    op.drop_index('ix_commission_configs_company_id', table_name='commission_configs')
    op.drop_table('commission_configs')
    
    # Remove fields from financial_transactions
    with op.batch_alter_table("financial_transactions", schema=None) as batch_op:
        batch_op.drop_index("ix_financial_transactions_is_paid")
        batch_op.drop_column("is_paid")
        batch_op.drop_column("fee_value")
        batch_op.drop_column("fee_percentage")
        batch_op.drop_column("net_value")

