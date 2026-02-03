"""Create online booking tables

Revision ID: e8f3c2a1b4d7
Revises: d6f40aece08f
Create Date: 2026-01-10 14:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e8f3c2a1b4d7'
down_revision = 'd6f40aece08f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enums
    op.execute("CREATE TYPE bookingflowtype AS ENUM ('service_first', 'professional_first')")
    op.execute("CREATE TYPE themetype AS ENUM ('light', 'dark', 'optional')")
    
    # Create online_booking_configs table
    op.create_table('online_booking_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('public_name', sa.String(length=255), nullable=True),
        sa.Column('public_description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('use_company_address', sa.Boolean(), nullable=True),
        sa.Column('public_address', sa.String(length=500), nullable=True),
        sa.Column('public_address_number', sa.String(length=20), nullable=True),
        sa.Column('public_address_complement', sa.String(length=100), nullable=True),
        sa.Column('public_neighborhood', sa.String(length=100), nullable=True),
        sa.Column('public_city', sa.String(length=100), nullable=True),
        sa.Column('public_state', sa.String(length=2), nullable=True),
        sa.Column('public_postal_code', sa.String(length=20), nullable=True),
        sa.Column('public_whatsapp', sa.String(length=20), nullable=True),
        sa.Column('public_phone', sa.String(length=20), nullable=True),
        sa.Column('public_instagram', sa.String(length=255), nullable=True),
        sa.Column('public_facebook', sa.String(length=255), nullable=True),
        sa.Column('public_website', sa.String(length=255), nullable=True),
        sa.Column('primary_color', sa.String(length=7), nullable=True),
        sa.Column('theme', postgresql.ENUM('light', 'dark', 'optional', name='themetype', create_type=False), nullable=True),
        sa.Column('booking_flow', postgresql.ENUM('service_first', 'professional_first', name='bookingflowtype', create_type=False), nullable=True),
        sa.Column('require_login', sa.Boolean(), nullable=True),
        sa.Column('min_advance_time_minutes', sa.Integer(), nullable=True),
        sa.Column('allow_cancellation', sa.Boolean(), nullable=True),
        sa.Column('cancellation_min_hours', sa.Integer(), nullable=True),
        sa.Column('enable_payment_local', sa.Boolean(), nullable=True),
        sa.Column('enable_payment_card', sa.Boolean(), nullable=True),
        sa.Column('enable_payment_pix', sa.Boolean(), nullable=True),
        sa.Column('enable_deposit_payment', sa.Boolean(), nullable=True),
        sa.Column('deposit_percentage', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_online_booking_configs_id', 'online_booking_configs', ['id'], unique=False)
    op.create_index('ix_online_booking_configs_company_id', 'online_booking_configs', ['company_id'], unique=True)
    
    # Create online_booking_gallery table
    op.create_table('online_booking_gallery',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['config_id'], ['online_booking_configs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_online_booking_gallery_id', 'online_booking_gallery', ['id'], unique=False)
    op.create_index('ix_online_booking_gallery_company_id', 'online_booking_gallery', ['company_id'], unique=False)
    op.create_index('ix_online_booking_gallery_config_id', 'online_booking_gallery', ['config_id'], unique=False)
    
    # Create online_booking_business_hours table
    op.create_table('online_booking_business_hours',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('start_time', sa.String(length=5), nullable=True),
        sa.Column('break_start_time', sa.String(length=5), nullable=True),
        sa.Column('break_end_time', sa.String(length=5), nullable=True),
        sa.Column('end_time', sa.String(length=5), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['config_id'], ['online_booking_configs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_online_booking_business_hours_id', 'online_booking_business_hours', ['id'], unique=False)
    op.create_index('ix_online_booking_business_hours_company_id', 'online_booking_business_hours', ['company_id'], unique=False)
    op.create_index('ix_online_booking_business_hours_config_id', 'online_booking_business_hours', ['config_id'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_index('ix_online_booking_business_hours_config_id', table_name='online_booking_business_hours')
    op.drop_index('ix_online_booking_business_hours_company_id', table_name='online_booking_business_hours')
    op.drop_index('ix_online_booking_business_hours_id', table_name='online_booking_business_hours')
    op.drop_table('online_booking_business_hours')
    
    op.drop_index('ix_online_booking_gallery_config_id', table_name='online_booking_gallery')
    op.drop_index('ix_online_booking_gallery_company_id', table_name='online_booking_gallery')
    op.drop_index('ix_online_booking_gallery_id', table_name='online_booking_gallery')
    op.drop_table('online_booking_gallery')
    
    op.drop_index('ix_online_booking_configs_company_id', table_name='online_booking_configs')
    op.drop_index('ix_online_booking_configs_id', table_name='online_booking_configs')
    op.drop_table('online_booking_configs')
    
    # Drop enums
    op.execute('DROP TYPE bookingflowtype')
    op.execute('DROP TYPE themetype')
