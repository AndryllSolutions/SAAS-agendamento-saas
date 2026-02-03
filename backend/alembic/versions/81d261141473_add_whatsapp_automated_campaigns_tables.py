"""Add WhatsApp automated campaigns tables

Revision ID: 81d261141473
Revises: c58a084b3a2d
Create Date: 2025-12-31 22:49:45.472800

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '81d261141473'
down_revision = 'c58a084b3a2d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar enum para tipos de campanhas automáticas (se não existir)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE automatedcampaigntype AS ENUM ('birthday', 'reconquer', 'reminder', 'pre_care', 'post_care', 'return_guarantee', 'status_update', 'welcome', 'invite_online', 'cashback', 'package_expiring', 'billing');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Criar tabela de campanhas automáticas
    op.create_table('whatsapp_automated_campaigns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('campaign_type', postgresql.ENUM('birthday', 'reconquer', 'reminder', 'pre_care', 'post_care', 'return_guarantee', 'status_update', 'welcome', 'invite_online', 'cashback', 'package_expiring', 'billing', name='automatedcampaigntype', create_type=False), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('message_template', sa.Text(), nullable=True),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('send_time_start', sa.String(length=5), nullable=True, server_default='09:00'),
        sa.Column('send_time_end', sa.String(length=5), nullable=True, server_default='18:00'),
        sa.Column('send_weekdays_only', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('total_triggered', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('total_sent', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('total_failed', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_automated_campaigns_id', 'whatsapp_automated_campaigns', ['id'], unique=False)
    op.create_index('ix_whatsapp_automated_campaigns_company_id', 'whatsapp_automated_campaigns', ['company_id'], unique=False)
    op.create_index('ix_whatsapp_automated_campaigns_campaign_type', 'whatsapp_automated_campaigns', ['campaign_type'], unique=False)
    
    # Criar tabela de triggers de campanhas
    op.create_table('whatsapp_campaign_triggers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('automated_campaign_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('event_data', sa.JSON(), nullable=True),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('is_processed', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_sent', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('scheduled_for', sa.String(length=19), nullable=True),
        sa.Column('campaign_log_id', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['automated_campaign_id'], ['whatsapp_automated_campaigns.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['campaign_log_id'], ['whatsapp_campaign_logs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_whatsapp_campaign_triggers_id', 'whatsapp_campaign_triggers', ['id'], unique=False)
    op.create_index('ix_whatsapp_campaign_triggers_company_id', 'whatsapp_campaign_triggers', ['company_id'], unique=False)
    op.create_index('ix_whatsapp_campaign_triggers_automated_campaign_id', 'whatsapp_campaign_triggers', ['automated_campaign_id'], unique=False)
    op.create_index('ix_whatsapp_campaign_triggers_client_id', 'whatsapp_campaign_triggers', ['client_id'], unique=False)
    op.create_index('ix_whatsapp_campaign_triggers_event_type', 'whatsapp_campaign_triggers', ['event_type'], unique=False)
    op.create_index('ix_whatsapp_campaign_triggers_is_processed', 'whatsapp_campaign_triggers', ['is_processed'], unique=False)


def downgrade() -> None:
    # Dropar tabelas de campanhas automáticas
    op.drop_index('ix_whatsapp_campaign_triggers_is_processed', table_name='whatsapp_campaign_triggers')
    op.drop_index('ix_whatsapp_campaign_triggers_event_type', table_name='whatsapp_campaign_triggers')
    op.drop_index('ix_whatsapp_campaign_triggers_client_id', table_name='whatsapp_campaign_triggers')
    op.drop_index('ix_whatsapp_campaign_triggers_automated_campaign_id', table_name='whatsapp_campaign_triggers')
    op.drop_index('ix_whatsapp_campaign_triggers_company_id', table_name='whatsapp_campaign_triggers')
    op.drop_index('ix_whatsapp_campaign_triggers_id', table_name='whatsapp_campaign_triggers')
    op.drop_table('whatsapp_campaign_triggers')
    
    op.drop_index('ix_whatsapp_automated_campaigns_campaign_type', table_name='whatsapp_automated_campaigns')
    op.drop_index('ix_whatsapp_automated_campaigns_company_id', table_name='whatsapp_automated_campaigns')
    op.drop_index('ix_whatsapp_automated_campaigns_id', table_name='whatsapp_automated_campaigns')
    op.drop_table('whatsapp_automated_campaigns')
    
    # Dropar enum
    op.execute('DROP TYPE automatedcampaigntype')

