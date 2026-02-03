"""add api_keys table

Revision ID: 025_add_api_keys
Revises: 024_fix_commission_config
Create Date: 2025-12-13 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '025_add_api_keys'
down_revision = '024_fix_commission_config'
branch_labels = None
depends_on = None


def upgrade():
    # Create api_keys table
    op.create_table(
        'api_keys',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('key_prefix', sa.String(length=10), nullable=False),
        sa.Column('key_hash', sa.String(length=255), nullable=False),
        sa.Column('scopes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('ip_whitelist', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_api_keys_company_id', 'api_keys', ['company_id'])
    op.create_index('ix_api_keys_user_id', 'api_keys', ['user_id'])
    op.create_index('ix_api_keys_key_prefix', 'api_keys', ['key_prefix'])
    op.create_index('ix_api_keys_key_hash', 'api_keys', ['key_hash'])
    op.create_unique_constraint('uq_api_keys_key_hash', 'api_keys', ['key_hash'])


def downgrade():
    op.drop_constraint('uq_api_keys_key_hash', 'api_keys', type_='unique')
    op.drop_index('ix_api_keys_key_hash', table_name='api_keys')
    op.drop_index('ix_api_keys_key_prefix', table_name='api_keys')
    op.drop_index('ix_api_keys_user_id', table_name='api_keys')
    op.drop_index('ix_api_keys_company_id', table_name='api_keys')
    op.drop_table('api_keys')

