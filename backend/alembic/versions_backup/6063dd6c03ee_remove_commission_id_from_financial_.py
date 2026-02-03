"""remove commission_id from financial_transactions

Revision ID: 6063dd6c03ee
Revises: efd0b3cf10eb
Create Date: 2025-12-12 21:24:05.691237

Descrição:
    Remove a coluna commission_id de financial_transactions.
    
    Motivo: Correção de relacionamento ORM.
    - Antes: ForeignKeys cruzadas causavam erro MANYTOONE em ambos os lados.
    - Depois: A FK fica apenas em Commission.financial_transaction_id (lado Many).
    
    Relacionamento correto:
    - FinancialTransaction (1) → Commission (N)
    - FK está em Commission, não em FinancialTransaction.

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6063dd6c03ee'
down_revision = 'efd0b3cf10eb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Remove commission_id de financial_transactions.
    
    Ordem das operações (crítica para integridade):
    1. Remove o índice da coluna (se existir)
    2. Remove a constraint de FK
    3. Remove a coluna
    """
    # 1. Remove o índice da coluna commission_id (se existir)
    # Usando try/except para ambientes onde o índice pode não existir
    try:
        op.drop_index('ix_financial_transactions_commission_id', table_name='financial_transactions')
    except Exception:
        pass  # Índice pode não existir em alguns ambientes
    
    # 2. Remove a Foreign Key constraint
    op.drop_constraint(
        'fk_financial_transactions_commission_id', 
        'financial_transactions', 
        type_='foreignkey'
    )
    
    # 3. Remove a coluna
    op.drop_column('financial_transactions', 'commission_id')


def downgrade() -> None:
    """
    Restaura commission_id em financial_transactions.
    
    Ordem das operações (inversa do upgrade):
    1. Adiciona a coluna
    2. Recria a FK constraint
    3. Recria o índice
    """
    # 1. Adiciona a coluna de volta
    op.add_column(
        'financial_transactions', 
        sa.Column('commission_id', sa.INTEGER(), nullable=True)
    )
    
    # 2. Recria a Foreign Key constraint
    op.create_foreign_key(
        'fk_financial_transactions_commission_id', 
        'financial_transactions', 
        'commissions', 
        ['commission_id'], 
        ['id'], 
        ondelete='SET NULL'
    )
    
    # 3. Recria o índice para performance
    op.create_index(
        'ix_financial_transactions_commission_id', 
        'financial_transactions', 
        ['commission_id'], 
        unique=False
    )
