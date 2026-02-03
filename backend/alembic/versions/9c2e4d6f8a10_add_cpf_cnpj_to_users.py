"""Add cpf_cnpj to users

Revision ID: 9c2e4d6f8a10
Revises: 7bdacd27480e
Create Date: 2026-01-24

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c2e4d6f8a10'
down_revision = 'f9657ff9a0d5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('cpf_cnpj', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'cpf_cnpj')
