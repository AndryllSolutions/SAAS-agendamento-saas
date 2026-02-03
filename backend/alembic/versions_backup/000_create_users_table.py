"""Create users table

Revision ID: 000_create_users
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '000_create_users'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create UserRole enum
    userrole_enum = postgresql.ENUM(
        'SAAS_ADMIN', 'OWNER', 'MANAGER', 'PROFESSIONAL', 
        'RECEPTIONIST', 'FINANCE', 'CLIENT', 'READ_ONLY', 'STAFF',
        name='userrole',
        create_type=False
    )
    userrole_enum.create(op.get_bind(), checkfirst=True)
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('saas_role', sa.String(length=50), nullable=True),
        sa.Column('role', userrole_enum, nullable=False, server_default='CLIENT'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('date_of_birth', sa.String(length=50), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('specialties', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('working_hours', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('commission_rate', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('oauth_provider', sa.String(length=50), nullable=True),
        sa.Column('oauth_id', sa.String(length=255), nullable=True),
        sa.Column('notification_preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        # NOTE: Foreign key to companies will be added later by migration 001
        # sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_company_id'), 'users', ['company_id'], unique=False)
    op.create_index(op.f('ix_users_saas_role'), 'users', ['saas_role'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_saas_role'), table_name='users')
    op.drop_index(op.f('ix_users_company_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enum
    userrole_enum = postgresql.ENUM(name='userrole')
    userrole_enum.drop(op.get_bind(), checkfirst=True)
