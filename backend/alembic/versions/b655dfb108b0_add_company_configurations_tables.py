"""Add company configurations tables

Revision ID: b655dfb108b0
Revises: 81d261141473
Create Date: 2025-12-31 23:05:19.276092

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'b655dfb108b0'
down_revision = '81d261141473'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar enums
    op.execute("CREATE TYPE companytype AS ENUM ('pessoa_fisica', 'pessoa_juridica')")
    op.execute("CREATE TYPE language AS ENUM ('pt_BR', 'es', 'en')")
    op.execute("CREATE TYPE currency AS ENUM ('BRL', 'USD', 'EUR', 'ARS', 'CLP')")
    op.execute("CREATE TYPE country AS ENUM ('BR', 'AR', 'CL', 'US')")
    
    # Tabela: company_details
    op.create_table('company_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('company_type', postgresql.ENUM('pessoa_fisica', 'pessoa_juridica', name='companytype', create_type=False), nullable=False),
        sa.Column('document_number', sa.String(length=20), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=True),
        sa.Column('municipal_registration', sa.String(length=50), nullable=True),
        sa.Column('state_registration', sa.String(length=50), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('whatsapp', sa.String(length=20), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('address_number', sa.String(length=20), nullable=True),
        sa.Column('address_complement', sa.String(length=100), nullable=True),
        sa.Column('neighborhood', sa.String(length=100), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=2), nullable=True),
        sa.Column('country', sa.String(length=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_company_details_id', 'company_details', ['id'], unique=False)
    op.create_index('ix_company_details_company_id', 'company_details', ['company_id'], unique=True)
    
    # Tabela: company_financial_settings
    op.create_table('company_financial_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('allow_retroactive_entries', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('allow_invoice_edit_after_conference', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('edit_only_value_after_conference', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('allow_operations_with_closed_cash', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('require_category_on_transaction', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('require_payment_form_on_transaction', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_company_financial_settings_id', 'company_financial_settings', ['id'], unique=False)
    op.create_index('ix_company_financial_settings_company_id', 'company_financial_settings', ['company_id'], unique=True)
    
    # Tabela: company_notification_settings
    op.create_table('company_notification_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('notify_new_appointment', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_appointment_cancellation', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_appointment_deletion', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_new_review', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_sms_response', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('notify_client_return', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_goal_achievement', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_client_waiting', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notification_sound_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notification_duration_seconds', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_company_notification_settings_id', 'company_notification_settings', ['id'], unique=False)
    op.create_index('ix_company_notification_settings_company_id', 'company_notification_settings', ['company_id'], unique=True)
    
    # Tabela: company_theme_settings
    op.create_table('company_theme_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('interface_language', postgresql.ENUM('pt_BR', 'es', 'en', name='language', create_type=False), nullable=False),
        sa.Column('sidebar_color', sa.String(length=7), nullable=False, server_default='#6366f1'),
        sa.Column('theme_mode', sa.String(length=20), nullable=False, server_default='light'),
        sa.Column('custom_logo_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_company_theme_settings_id', 'company_theme_settings', ['id'], unique=False)
    op.create_index('ix_company_theme_settings_company_id', 'company_theme_settings', ['company_id'], unique=True)
    
    # Tabela: company_admin_settings
    op.create_table('company_admin_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('default_message_language', postgresql.ENUM('pt_BR', 'es', 'en', name='language', create_type=False), nullable=False),
        sa.Column('currency', postgresql.ENUM('BRL', 'USD', 'EUR', 'ARS', 'CLP', name='currency', create_type=False), nullable=False),
        sa.Column('country', postgresql.ENUM('BR', 'AR', 'CL', 'US', name='country', create_type=False), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=False, server_default='America/Sao_Paulo'),
        sa.Column('date_format', sa.String(length=20), nullable=False, server_default='DD/MM/YYYY'),
        sa.Column('time_format', sa.String(length=20), nullable=False, server_default='HH:mm'),
        sa.Column('additional_settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_company_admin_settings_id', 'company_admin_settings', ['id'], unique=False)
    op.create_index('ix_company_admin_settings_company_id', 'company_admin_settings', ['company_id'], unique=True)


def downgrade() -> None:
    # Dropar tabelas
    op.drop_index('ix_company_admin_settings_company_id', table_name='company_admin_settings')
    op.drop_index('ix_company_admin_settings_id', table_name='company_admin_settings')
    op.drop_table('company_admin_settings')
    
    op.drop_index('ix_company_theme_settings_company_id', table_name='company_theme_settings')
    op.drop_index('ix_company_theme_settings_id', table_name='company_theme_settings')
    op.drop_table('company_theme_settings')
    
    op.drop_index('ix_company_notification_settings_company_id', table_name='company_notification_settings')
    op.drop_index('ix_company_notification_settings_id', table_name='company_notification_settings')
    op.drop_table('company_notification_settings')
    
    op.drop_index('ix_company_financial_settings_company_id', table_name='company_financial_settings')
    op.drop_index('ix_company_financial_settings_id', table_name='company_financial_settings')
    op.drop_table('company_financial_settings')
    
    op.drop_index('ix_company_details_company_id', table_name='company_details')
    op.drop_index('ix_company_details_id', table_name='company_details')
    op.drop_table('company_details')
    
    # Dropar enums
    op.execute('DROP TYPE country')
    op.execute('DROP TYPE currency')
    op.execute('DROP TYPE language')
    op.execute('DROP TYPE companytype')

