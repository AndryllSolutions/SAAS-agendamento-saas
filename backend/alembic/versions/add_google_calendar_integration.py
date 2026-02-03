"""add google calendar integration

Revision ID: add_google_calendar
Revises: add_scheduling_settings
Create Date: 2024-01-26 22:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_google_calendar'
down_revision = 'add_scheduling_settings'
branch_labels = None
depends_on = None


def upgrade():
    # Create google_calendar_integrations table
    op.create_table('google_calendar_integrations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        
        # OAuth Tokens
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.DateTime(), nullable=True),
        
        # Calendar Settings
        sa.Column('calendar_id', sa.String(length=255), nullable=True),
        sa.Column('calendar_name', sa.String(length=255), nullable=True),
        
        # Sync Settings
        sa.Column('sync_enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('sync_direction', sa.String(length=20), nullable=False, default='bidirectional'),
        sa.Column('auto_sync', sa.Boolean(), nullable=False, default=True),
        
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
    op.create_index(op.f('ix_google_calendar_integrations_user_id'), 'google_calendar_integrations', ['user_id'], unique=True)
    op.create_index(op.f('ix_google_calendar_integrations_company_id'), 'google_calendar_integrations', ['company_id'], unique=False)
    
    # Create calendar_sync_logs table
    op.create_table('calendar_sync_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('integration_id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        
        # Sync Details
        sa.Column('sync_direction', sa.String(length=20), nullable=False),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        
        # Google Calendar Event Info
        sa.Column('google_event_id', sa.String(length=255), nullable=True),
        sa.Column('google_calendar_id', sa.String(length=255), nullable=True),
        
        # Sync Data
        sa.Column('sync_data', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('synced_at', sa.DateTime(), nullable=False),
        
        # Constraints
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['integration_id'], ['google_calendar_integrations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for sync logs
    op.create_index(op.f('ix_calendar_sync_logs_integration_id'), 'calendar_sync_logs', ['integration_id'], unique=False)
    op.create_index(op.f('ix_calendar_sync_logs_appointment_id'), 'calendar_sync_logs', ['appointment_id'], unique=False)
    op.create_index(op.f('ix_calendar_sync_logs_synced_at'), 'calendar_sync_logs', ['synced_at'], unique=False)
    
    # Insert default sync configuration for existing professional users
    op.execute("""
        INSERT INTO google_calendar_integrations (
            user_id, 
            company_id,
            created_at, 
            updated_at,
            sync_enabled,
            sync_direction,
            auto_sync,
            last_sync_status,
            sync_config,
            is_active
        )
        SELECT 
            u.id as user_id,
            u.company_id,
            NOW() as created_at,
            NOW() as updated_at,
            false as sync_enabled,  -- Disabled by default, user needs to authorize
            'bidirectional' as sync_direction,
            true as auto_sync,
            'pending' as last_sync_status,
            '{
                "sync_past_days": 7,
                "sync_future_days": 30,
                "conflict_resolution": "manual",
                "event_prefix": "[Agendamento]",
                "include_client_info": true,
                "include_notes": true,
                "reminder_minutes": [15, 60],
                "timezone": "America/Sao_Paulo"
            }' as sync_config,
            false as is_active  -- Inactive until OAuth is completed
        FROM users u 
        WHERE u.role IN ('PROFESSIONAL', 'ADMIN', 'OWNER')
        AND u.is_active = true
    """)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_calendar_sync_logs_synced_at'), table_name='calendar_sync_logs')
    op.drop_index(op.f('ix_calendar_sync_logs_appointment_id'), table_name='calendar_sync_logs')
    op.drop_index(op.f('ix_calendar_sync_logs_integration_id'), table_name='calendar_sync_logs')
    op.drop_index(op.f('ix_google_calendar_integrations_company_id'), table_name='google_calendar_integrations')
    op.drop_index(op.f('ix_google_calendar_integrations_user_id'), table_name='google_calendar_integrations')
    
    # Drop tables
    op.drop_table('calendar_sync_logs')
    op.drop_table('google_calendar_integrations')
