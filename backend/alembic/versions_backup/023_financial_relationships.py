"""Add financial relationships

Revision ID: 023_financial_relationships
Revises: 022_improve_company_users_table
Create Date: 2025-12-11 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '023_financial_relationships'
down_revision = '022_improve_company_users_table'
branch_labels = None
depends_on = None


def upgrade():
    # ### Add new foreign keys to financial_transactions ###
    with op.batch_alter_table('financial_transactions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('commission_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('subscription_sale_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('payment_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('invoice_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('professional_id', sa.Integer(), nullable=True))
        
        batch_op.create_foreign_key(
            'fk_financial_transactions_commission_id',
            'commissions',
            ['commission_id'],
            ['id'],
            ondelete='SET NULL'
        )
        batch_op.create_foreign_key(
            'fk_financial_transactions_subscription_sale_id',
            'subscription_sales',
            ['subscription_sale_id'],
            ['id'],
            ondelete='SET NULL'
        )
        batch_op.create_foreign_key(
            'fk_financial_transactions_payment_id',
            'payments',
            ['payment_id'],
            ['id'],
            ondelete='SET NULL'
        )
        batch_op.create_foreign_key(
            'fk_financial_transactions_invoice_id',
            'invoices',
            ['invoice_id'],
            ['id'],
            ondelete='SET NULL'
        )
        batch_op.create_foreign_key(
            'fk_financial_transactions_professional_id',
            'users',
            ['professional_id'],
            ['id'],
            ondelete='SET NULL'
        )
        
        batch_op.create_index(
            'ix_financial_transactions_commission_id',
            ['commission_id']
        )
        batch_op.create_index(
            'ix_financial_transactions_subscription_sale_id',
            ['subscription_sale_id']
        )
        batch_op.create_index(
            'ix_financial_transactions_payment_id',
            ['payment_id']
        )
        batch_op.create_index(
            'ix_financial_transactions_invoice_id',
            ['invoice_id']
        )
        batch_op.create_index(
            'ix_financial_transactions_professional_id',
            ['professional_id']
        )

    # ### Add financial_transaction_id to commissions ###
    with op.batch_alter_table('commissions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('financial_transaction_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            'fk_commissions_financial_transaction_id',
            'financial_transactions',
            ['financial_transaction_id'],
            ['id'],
            ondelete='SET NULL'
        )
        batch_op.create_index(
            'ix_commissions_financial_transaction_id',
            ['financial_transaction_id']
        )


def downgrade():
    # ### Remove indexes and foreign keys from commissions ###
    with op.batch_alter_table('commissions', schema=None) as batch_op:
        batch_op.drop_index('ix_commissions_financial_transaction_id')
        batch_op.drop_constraint('fk_commissions_financial_transaction_id', type_='foreignkey')
        batch_op.drop_column('financial_transaction_id')

    # ### Remove indexes and foreign keys from financial_transactions ###
    with op.batch_alter_table('financial_transactions', schema=None) as batch_op:
        batch_op.drop_index('ix_financial_transactions_professional_id')
        batch_op.drop_index('ix_financial_transactions_invoice_id')
        batch_op.drop_index('ix_financial_transactions_payment_id')
        batch_op.drop_index('ix_financial_transactions_subscription_sale_id')
        batch_op.drop_index('ix_financial_transactions_commission_id')
        
        batch_op.drop_constraint('fk_financial_transactions_professional_id', type_='foreignkey')
        batch_op.drop_constraint('fk_financial_transactions_invoice_id', type_='foreignkey')
        batch_op.drop_constraint('fk_financial_transactions_payment_id', type_='foreignkey')
        batch_op.drop_constraint('fk_financial_transactions_subscription_sale_id', type_='foreignkey')
        batch_op.drop_constraint('fk_financial_transactions_commission_id', type_='foreignkey')
        
        batch_op.drop_column('professional_id')
        batch_op.drop_column('invoice_id')
        batch_op.drop_column('payment_id')
        batch_op.drop_column('subscription_sale_id')
        batch_op.drop_column('commission_id')

