"""
Add company_subscriptions and company_users tables and extend companies

Revision ID: 019_add_company_subscription_and_company_user
Revises: 018_add_client_and_payment_to_financial_transactions
Create Date: 2025-12-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '019_add_company_subscription_and_company_user'
down_revision = '018_add_client_and_payment_to_financial_transactions'
branch_labels = None
depends_on = None


def upgrade() -> None:
  # Extend companies with business_type, team_size if not present
  with op.batch_alter_table("companies") as batch_op:
    batch_op.add_column(sa.Column("business_type", sa.String(length=50), nullable=True))
    batch_op.add_column(sa.Column("team_size", sa.String(length=20), nullable=True))

  # company_subscriptions table
  op.create_table(
    "company_subscriptions",
    sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
    sa.Column("plan_type", sa.String(length=50), nullable=False, server_default="FREE"),
    sa.Column("trial_end_date", sa.DateTime(), nullable=True),
    sa.Column("coupon_code", sa.String(length=100), nullable=True),
    sa.Column("referral_code", sa.String(length=100), nullable=True),
  )
  op.create_index("ix_company_subscriptions_company_id", "company_subscriptions", ["company_id"], unique=False)
  op.create_index("ix_company_subscriptions_plan_type", "company_subscriptions", ["plan_type"], unique=False)

  # company_users table
  op.create_table(
    "company_users",
    sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
    sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
    sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    sa.Column("role", sa.String(length=50), nullable=False, server_default="OWNER"),
  )
  op.create_index("ix_company_users_company_id", "company_users", ["company_id"], unique=False)
  op.create_index("ix_company_users_user_id", "company_users", ["user_id"], unique=False)


def downgrade() -> None:
  op.drop_index("ix_company_users_user_id", table_name="company_users")
  op.drop_index("ix_company_users_company_id", table_name="company_users")
  op.drop_table("company_users")

  op.drop_index("ix_company_subscriptions_plan_type", table_name="company_subscriptions")
  op.drop_index("ix_company_subscriptions_company_id", table_name="company_subscriptions")
  op.drop_table("company_subscriptions")

  with op.batch_alter_table("companies") as batch_op:
    batch_op.drop_column("team_size")
    batch_op.drop_column("business_type")


