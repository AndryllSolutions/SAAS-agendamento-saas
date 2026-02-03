"""merge heads

Revision ID: 7ca951d1bccc
Revises: b655dfb108b0, 4a5b6c7d8e9f
Create Date: 2026-01-02 13:14:46.290668

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7ca951d1bccc'
down_revision = ('b655dfb108b0', '4a5b6c7d8e9f')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

