"""Add notification system with templates, triggers and queue

Revision ID: 016_add_notification_system
Revises: 015_standardize_client_crm_id_naming
Create Date: 2025-12-06 10:47:00.000000

Esta migration adiciona sistema completo de notificações:
1. notification_templates - Templates reutilizáveis
2. notification_triggers - Triggers automáticos baseados em eventos
3. notification_queue - Fila de notificações agendadas

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '016_add_notification_system'
down_revision = '015_standardize_client_crm_id_naming'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Cria tabelas para sistema de notificações.
    """
    
    # ====== NOTIFICATION_TEMPLATES ======
    op.create_table(
        'notification_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        
        # Basic Info
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('channel', sa.String(20), nullable=False, server_default='push'),
        
        # Content Templates
        sa.Column('title_template', sa.String(255), nullable=False),
        sa.Column('body_template', sa.Text(), nullable=False),
        sa.Column('url_template', sa.String(500), nullable=True),
        sa.Column('icon_url', sa.String(500), nullable=True),
        
        # Settings
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        
        # Placeholders documentation
        sa.Column('available_placeholders', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
    )
    
    # Indexes for templates
    op.create_index('ix_notification_templates_company_id', 'notification_templates', ['company_id'])
    op.create_index('ix_notification_templates_event_type', 'notification_templates', ['event_type'])
    op.create_index('ix_notification_templates_is_active', 'notification_templates', ['is_active'])
    op.create_index('ix_notification_templates_company_event', 'notification_templates', ['company_id', 'event_type'])
    
    
    # ====== NOTIFICATION_TRIGGERS ======
    op.create_table(
        'notification_triggers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        
        # Trigger Configuration
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('trigger_condition', sa.String(20), nullable=False, server_default='immediate'),
        
        # Timing Configuration
        sa.Column('trigger_offset_minutes', sa.Integer(), nullable=True),
        sa.Column('trigger_time', sa.String(10), nullable=True),
        sa.Column('trigger_day_of_week', sa.Integer(), nullable=True),
        sa.Column('trigger_day_of_month', sa.Integer(), nullable=True),
        
        # Filters
        sa.Column('filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        
        # Target Configuration
        sa.Column('target_roles', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('send_to_client', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('send_to_professional', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('send_to_manager', sa.Boolean(), nullable=False, server_default='false'),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_triggered_at', sa.DateTime(), nullable=True),
        sa.Column('trigger_count', sa.Integer(), nullable=False, server_default='0'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['notification_templates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
    )
    
    # Indexes for triggers
    op.create_index('ix_notification_triggers_company_id', 'notification_triggers', ['company_id'])
    op.create_index('ix_notification_triggers_event_type', 'notification_triggers', ['event_type'])
    op.create_index('ix_notification_triggers_is_active', 'notification_triggers', ['is_active'])
    op.create_index('ix_notification_triggers_company_event', 'notification_triggers', ['company_id', 'event_type'])
    
    
    # ====== NOTIFICATION_QUEUE ======
    op.create_table(
        'notification_queue',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('trigger_id', sa.Integer(), nullable=True),
        sa.Column('template_id', sa.Integer(), nullable=True),
        
        # Notification Content
        sa.Column('channel', sa.String(20), nullable=False, server_default='push'),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('icon', sa.String(500), nullable=True),
        
        # Scheduling
        sa.Column('scheduled_at', sa.DateTime(), nullable=False),
        sa.Column('max_retries', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        
        # Status
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        
        # Metadata
        sa.Column('event_type', sa.String(50), nullable=True),
        sa.Column('reference_id', sa.Integer(), nullable=True),
        sa.Column('reference_type', sa.String(50), nullable=True),
        sa.Column('context_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trigger_id'], ['notification_triggers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['template_id'], ['notification_templates.id'], ondelete='SET NULL'),
    )
    
    # Indexes for queue
    op.create_index('ix_notification_queue_company_id', 'notification_queue', ['company_id'])
    op.create_index('ix_notification_queue_user_id', 'notification_queue', ['user_id'])
    op.create_index('ix_notification_queue_scheduled_at', 'notification_queue', ['scheduled_at'])
    op.create_index('ix_notification_queue_status', 'notification_queue', ['status'])
    op.create_index('ix_notification_queue_pending', 'notification_queue', ['status', 'scheduled_at'], 
                    postgresql_where=sa.text("status = 'pending'"))
    
    print("✅ Notification system tables created successfully!")


def downgrade() -> None:
    """
    Remove tabelas do sistema de notificações.
    """
    # Drop indexes
    op.drop_index('ix_notification_queue_pending', table_name='notification_queue')
    op.drop_index('ix_notification_queue_status', table_name='notification_queue')
    op.drop_index('ix_notification_queue_scheduled_at', table_name='notification_queue')
    op.drop_index('ix_notification_queue_user_id', table_name='notification_queue')
    op.drop_index('ix_notification_queue_company_id', table_name='notification_queue')
    
    op.drop_index('ix_notification_triggers_company_event', table_name='notification_triggers')
    op.drop_index('ix_notification_triggers_is_active', table_name='notification_triggers')
    op.drop_index('ix_notification_triggers_event_type', table_name='notification_triggers')
    op.drop_index('ix_notification_triggers_company_id', table_name='notification_triggers')
    
    op.drop_index('ix_notification_templates_company_event', table_name='notification_templates')
    op.drop_index('ix_notification_templates_is_active', table_name='notification_templates')
    op.drop_index('ix_notification_templates_event_type', table_name='notification_templates')
    op.drop_index('ix_notification_templates_company_id', table_name='notification_templates')
    
    # Drop tables (order matters due to foreign keys)
    op.drop_table('notification_queue')
    op.drop_table('notification_triggers')
    op.drop_table('notification_templates')
    
    print("✅ Notification system tables dropped successfully!")