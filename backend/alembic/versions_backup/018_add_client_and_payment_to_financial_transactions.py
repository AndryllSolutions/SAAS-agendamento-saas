"""
Add client and payment method to financial_transactions

Revision ID: 018_add_client_and_payment_to_financial_transactions
Revises: 017_add_read_only_role
Create Date: 2025-12-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "018_add_client_and_payment_to_financial_transactions"
down_revision = "017_add_read_only_role"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add client_id and payment_method to financial_transactions
    op.add_column(
        "financial_transactions",
        sa.Column("client_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "financial_transactions",
        sa.Column("payment_method", sa.String(length=50), nullable=True),
    )

    # FK and index for client_id
    op.create_foreign_key(
        "fk_financial_transactions_client_id_clients",
        "financial_transactions",
        "clients",
        ["client_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_financial_transactions_client_id",
        "financial_transactions",
        ["client_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop index and FK first
    op.drop_index("ix_financial_transactions_client_id", table_name="financial_transactions")
    op.drop_constraint(
        "fk_financial_transactions_client_id_clients",
        "financial_transactions",
        type_="foreignkey",
    )

    # Drop columns
    op.drop_column("financial_transactions", "payment_method")
    op.drop_column("financial_transactions", "client_id")


