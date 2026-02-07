"""Add image_url to leads table
Revision ID: f2e3d4c5b6a7
Revises: e8f3c2a1b4d7
Create Date: 2026-02-06 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f2e3d4c5b6a7'
down_revision = 'e8f3c2a1b4d7'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('leads', sa.Column('image_url', sa.String(500), nullable=True))

def downgrade() -> None:
    op.drop_column('leads', 'image_url')
