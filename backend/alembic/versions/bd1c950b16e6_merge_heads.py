"""merge heads

Revision ID: bd1c950b16e6
Revises: 7bdacd27480e, 9c2e4d6f8a10, add_calendly_integration, f2e3d4c5b6a7
Create Date: 2026-02-07 19:07:44.752341

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bd1c950b16e6'
down_revision = ('7bdacd27480e', '9c2e4d6f8a10', 'add_calendly_integration', 'f2e3d4c5b6a7')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

