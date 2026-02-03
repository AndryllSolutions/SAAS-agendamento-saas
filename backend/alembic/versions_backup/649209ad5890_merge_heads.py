"""merge_heads

Revision ID: 649209ad5890
Revises: 009_add_missing_financial_account_fields, 6ead18e3f2bd
Create Date: 2025-12-05 17:46:16.543345

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '649209ad5890'
down_revision = ('009_add_missing_financial_account_fields', '6ead18e3f2bd')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

