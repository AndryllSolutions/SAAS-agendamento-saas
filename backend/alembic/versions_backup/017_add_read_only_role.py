"""Add read only role to user roles enum

Revision ID: 017_add_read_only_role
Revises: 016_add_notification_system
Create Date: 2025-12-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '017_add_read_only_role'
down_revision = '016_add_notification_system'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add READ_ONLY to user_role enum if not exists."""
    # Check if READ_ONLY already exists in the enum
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'READ_ONLY' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'userrole')
            ) THEN
                ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'READ_ONLY';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    """Cannot remove enum values in PostgreSQL."""
    pass
