"""add_service_extended_fields

Revision ID: a3f4c9d2e1b0
Revises: f9657ff9a0d5
Create Date: 2026-01-15 14:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a3f4c9d2e1b0'
down_revision = 'f9657ff9a0d5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('services', sa.Column('extra_cost', sa.Numeric(10, 2), nullable=True))
    op.add_column('services', sa.Column('lead_time_minutes', sa.Integer(), server_default='0', nullable=True))
    op.add_column('services', sa.Column('is_favorite', sa.Boolean(), server_default=sa.text('false'), nullable=True))


def downgrade() -> None:
    op.drop_column('services', 'is_favorite')
    op.drop_column('services', 'lead_time_minutes')
    op.drop_column('services', 'extra_cost')
