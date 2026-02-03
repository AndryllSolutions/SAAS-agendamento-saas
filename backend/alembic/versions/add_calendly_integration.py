"""add calendly integration

Revision ID: add_calendly_integration
Revises: add_google_calendar
Create Date: 2024-01-26 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_calendly_integration'
down_revision = 'add_google_calendar'
branch_labels = None
depends_on = None


def upgrade():
    # Create calendly_integrations table
    op.create_table('calendly_integrations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        
        # OAuth Tokens
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(), nullable=True),
        sa.Column('token_type', sa.String(length=50), nullable=True, default='Bearer'),
        
        # Calendly User Info
        sa.Column('calendly_user_uri', sa.String(length=255), nullable=True),
        sa.Column('calendly_user_name', sa.String(length=255), nullable=True),
        sa.Column('calendly_user_email', sa.String(length=255), nullable=True),
        sa.Column('calendly_organization_uri', sa.String(length=255), nullable=True),
        sa.Column('scheduling_url', sa.String(length=500), nullable=True),
        
        # Sync Settings
        sa.Column('sync_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('sync_direction', sa.String(length=20), nullable=False, default='bidirectional'),
        sa.Column('auto_sync', sa.Boolean(), nullable=False, default=True),
        
        # Webhook Configuration
        sa.Column('webhook_uri', sa.String(length=255), nullable=True),
        sa.Column('webhook_signing_key', sa.String(length=255), nullable=True),
        
        # Sync Status
        sa.Column('last_sync_at', sa.DateTime(), nullable=True),
        sa.Column('last_sync_status', sa.String(length=20), nullable=False, default='pending'),
        sa.Column('last_sync_error', sa.Text(), nullable=True),
        
        # Sync Configuration
        sa.Column('sync_config', sa.JSON(), nullable=True),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        
        # Constraints
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_calendly_integrations_user_id'), 'calendly_integrations', ['user_id'], unique=True)
    op.create_index(op.f('ix_calendly_integrations_company_id'), 'calendly_integrations', ['company_id'], unique=False)
    
    # Create calendly_event_types table
    op.create_table('calendly_event_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('integration_id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=True),
        
        # Calendly Event Type Info
        sa.Column('calendly_event_type_uri', sa.String(length=255), nullable=False, unique=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('scheduling_url', sa.String(length=500), nullable=True),
        sa.Column('color', sa.String(length=20), nullable=True),
        
        # Mapping Settings
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('auto_create_appointment', sa.Boolean(), nullable=False, default=True),
        
        # Constraints
        sa.ForeignKeyConstraint(['integration_id'], ['calendly_integrations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for event types
    op.create_index(op.f('ix_calendly_event_types_integration_id'), 'calendly_event_types', ['integration_id'], unique=False)
    op.create_index(op.f('ix_calendly_event_types_service_id'), 'calendly_event_types', ['service_id'], unique=False)
    
    # Create calendly_sync_logs table
    op.create_table('calendly_sync_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('integration_id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        
        # Sync Details
        sa.Column('sync_direction', sa.String(length=20), nullable=False),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        
        # Calendly Event Info
        sa.Column('calendly_event_uri', sa.String(length=255), nullable=True),
        sa.Column('calendly_invitee_uri', sa.String(length=255), nullable=True),
        
        # Sync Data
        sa.Column('sync_data', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('synced_at', sa.DateTime(), nullable=False),
        
        # Constraints
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['integration_id'], ['calendly_integrations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for sync logs
    op.create_index(op.f('ix_calendly_sync_logs_integration_id'), 'calendly_sync_logs', ['integration_id'], unique=False)
    op.create_index(op.f('ix_calendly_sync_logs_appointment_id'), 'calendly_sync_logs', ['appointment_id'], unique=False)
    op.create_index(op.f('ix_calendly_sync_logs_synced_at'), 'calendly_sync_logs', ['synced_at'], unique=False)
    
    # Create calendly_webhook_events table
    op.create_table('calendly_webhook_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('integration_id', sa.Integer(), nullable=True),
        
        # Webhook Event Info
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('event_uri', sa.String(length=255), nullable=True),
        
        # Payload
        sa.Column('payload', sa.JSON(), nullable=False),
        
        # Processing Status
        sa.Column('processed', sa.Boolean(), nullable=False, default=False),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('processing_error', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('received_at', sa.DateTime(), nullable=False),
        
        # Constraints
        sa.ForeignKeyConstraint(['integration_id'], ['calendly_integrations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for webhook events
    op.create_index(op.f('ix_calendly_webhook_events_integration_id'), 'calendly_webhook_events', ['integration_id'], unique=False)
    op.create_index(op.f('ix_calendly_webhook_events_event_type'), 'calendly_webhook_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_calendly_webhook_events_processed'), 'calendly_webhook_events', ['processed'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_calendly_webhook_events_processed'), table_name='calendly_webhook_events')
    op.drop_index(op.f('ix_calendly_webhook_events_event_type'), table_name='calendly_webhook_events')
    op.drop_index(op.f('ix_calendly_webhook_events_integration_id'), table_name='calendly_webhook_events')
    op.drop_index(op.f('ix_calendly_sync_logs_synced_at'), table_name='calendly_sync_logs')
    op.drop_index(op.f('ix_calendly_sync_logs_appointment_id'), table_name='calendly_sync_logs')
    op.drop_index(op.f('ix_calendly_sync_logs_integration_id'), table_name='calendly_sync_logs')
    op.drop_index(op.f('ix_calendly_event_types_service_id'), table_name='calendly_event_types')
    op.drop_index(op.f('ix_calendly_event_types_integration_id'), table_name='calendly_event_types')
    op.drop_index(op.f('ix_calendly_integrations_company_id'), table_name='calendly_integrations')
    op.drop_index(op.f('ix_calendly_integrations_user_id'), table_name='calendly_integrations')
    
    # Drop tables
    op.drop_table('calendly_webhook_events')
    op.drop_table('calendly_sync_logs')
    op.drop_table('calendly_event_types')
    op.drop_table('calendly_integrations')
