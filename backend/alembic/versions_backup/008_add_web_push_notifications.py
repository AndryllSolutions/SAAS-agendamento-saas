"""Add web push notifications support

Revision ID: 008_add_web_push_notifications
Revises: 007_add_multi_tenant_composite_indexes
Create Date: 2025-12-03 03:00:00.000000

Esta migration adiciona suporte completo para Web Push Notifications nativo.

Tabelas criadas:
1. user_push_subscriptions - Armazena subscricoes de usuarios
2. push_notification_logs - Logs de envios

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '008_add_web_push_notifications'
down_revision = '007_add_multi_tenant_composite_indexes'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Cria tabelas para Web Push Notifications.
    """
    
    # ====== USER_PUSH_SUBSCRIPTIONS ======
    op.create_table(
        'user_push_subscriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        
        # Push API Subscription data
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh', sa.Text(), nullable=False),  # public_key
        sa.Column('auth', sa.Text(), nullable=False),    # auth_secret
        
        # Device info
        sa.Column('browser', sa.String(50), nullable=True),
        sa.Column('device_name', sa.String(100), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('endpoint', name='uq_user_push_subscriptions_endpoint')
    )
    
    # Indices
    op.create_index('ix_user_push_subscriptions_user_id', 'user_push_subscriptions', ['user_id'])
    op.create_index('ix_user_push_subscriptions_company_id', 'user_push_subscriptions', ['company_id'])
    op.create_index('ix_user_push_subscriptions_is_active', 'user_push_subscriptions', ['is_active'])
    op.create_index('idx_user_push_subscriptions_company_user', 'user_push_subscriptions', ['company_id', 'user_id'])
    
    
    # ====== PUSH_NOTIFICATION_LOGS ======
    op.create_table(
        'push_notification_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('subscription_id', sa.Integer(), nullable=True),
        
        # Notification content
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('url', sa.String(500), nullable=True),
        sa.Column('icon', sa.String(500), nullable=True),
        sa.Column('badge', sa.String(500), nullable=True),
        sa.Column('image', sa.String(500), nullable=True),
        sa.Column('tag', sa.String(100), nullable=True),
        
        # Metadata
        sa.Column('notification_type', sa.String(50), nullable=True),  # appointment, reminder, alert, etc
        sa.Column('reference_id', sa.Integer(), nullable=True),  # ID do appointment, command, etc
        sa.Column('reference_type', sa.String(50), nullable=True),  # appointment, command, etc
        
        # Status
        sa.Column('status', sa.String(20), nullable=False),  # sent, failed, expired
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('response_status', sa.Integer(), nullable=True),  # HTTP status code
        sa.Column('response_body', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('sent_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['subscription_id'], ['user_push_subscriptions.id'], ondelete='SET NULL')
    )
    
    # Indices
    op.create_index('ix_push_notification_logs_company_id', 'push_notification_logs', ['company_id'])
    op.create_index('ix_push_notification_logs_user_id', 'push_notification_logs', ['user_id'])
    op.create_index('ix_push_notification_logs_status', 'push_notification_logs', ['status'])
    op.create_index('ix_push_notification_logs_notification_type', 'push_notification_logs', ['notification_type'])
    op.create_index('idx_push_notification_logs_company_created', 'push_notification_logs', ['company_id', 'created_at'])


def downgrade() -> None:
    """
    Remove tabelas de Web Push Notifications.
    """
    # Drop em ordem reversa (respeitando FKs)
    op.drop_index('idx_push_notification_logs_company_created', table_name='push_notification_logs')
    op.drop_index('ix_push_notification_logs_notification_type', table_name='push_notification_logs')
    op.drop_index('ix_push_notification_logs_status', table_name='push_notification_logs')
    op.drop_index('ix_push_notification_logs_user_id', table_name='push_notification_logs')
    op.drop_index('ix_push_notification_logs_company_id', table_name='push_notification_logs')
    op.drop_table('push_notification_logs')
    
    op.drop_index('idx_user_push_subscriptions_company_user', table_name='user_push_subscriptions')
    op.drop_index('ix_user_push_subscriptions_is_active', table_name='user_push_subscriptions')
    op.drop_index('ix_user_push_subscriptions_company_id', table_name='user_push_subscriptions')
    op.drop_index('ix_user_push_subscriptions_user_id', table_name='user_push_subscriptions')
    op.drop_table('user_push_subscriptions')
