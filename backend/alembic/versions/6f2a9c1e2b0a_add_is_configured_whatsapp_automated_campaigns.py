"""Add is_configured to whatsapp_automated_campaigns

Revision ID: 6f2a9c1e2b0a
Revises: 81d261141473
Create Date: 2025-01-16 09:13:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6f2a9c1e2b0a'
down_revision = '81d261141473'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_configured column to whatsapp_automated_campaigns
    op.add_column('whatsapp_automated_campaigns', sa.Column('is_configured', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_configured column
    op.drop_column('whatsapp_automated_campaigns', 'is_configured')
