"""merge heads

Revision ID: efd0b3cf10eb
Revises: 023_financial_relationships, fix_cpf_cnpj_length
Create Date: 2025-12-11 20:21:08.071794

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'efd0b3cf10eb'
down_revision = ('023_financial_relationships', 'fix_cpf_cnpj_length')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

