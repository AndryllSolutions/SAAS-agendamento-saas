"""Add missing fields to financial_accounts

Revision ID: 009_add_missing_financial_account_fields
Revises: 008_add_web_push_notifications
Create Date: 2025-12-05 08:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '009_add_missing_financial_account_fields'
down_revision = '008_add_web_push_notifications'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to financial_accounts table
    op.add_column('financial_accounts', sa.Column('account_type', sa.String(length=50), nullable=False, server_default='cash'))
    op.add_column('financial_accounts', sa.Column('balance', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
    op.add_column('financial_accounts', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    
    # Add index for is_active column
    op.create_index(op.f('ix_financial_accounts_is_active'), 'financial_accounts', ['is_active'], unique=False)


def downgrade():
    # Remove index
    op.drop_index(op.f('ix_financial_accounts_is_active'), table_name='financial_accounts')
    
    # Remove columns
    op.drop_column('financial_accounts', 'is_active')
    op.drop_column('financial_accounts', 'balance')
    op.drop_column('financial_accounts', 'account_type')
