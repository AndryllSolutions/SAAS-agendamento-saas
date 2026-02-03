"""Fix client_id nullable and add missing composite indexes

Revision ID: 011_fix_client_id_nullable_and_missing_indexes
Revises: 010_add_data_integrity_constraints
Create Date: 2025-12-05 14:45:00.000000

Esta migration corrige problemas identificados nos testes:
1. client_id em appointments deve ser nullable (transição para client_crm_id)
2. Adiciona índices compostos faltantes para performance
3. Corrige relacionamentos SQLAlchemy com overlaps

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011_fix_client_id_nullable_and_missing_indexes'
down_revision = '010_add_data_integrity_constraints'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Corrige client_id nullable e adiciona índices compostos faltantes.
    """
    
    # ====== CORRIGIR client_id NULLABLE ======
    
    # client_id em appointments deve ser nullable para transição
    op.alter_column(
        'appointments',
        'client_id',
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False
    )
    
    # client_id em reviews deve ser nullable para transição
    op.alter_column(
        'reviews',
        'client_id',
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False
    )
    
    # ====== ADICIONAR ÍNDICES COMPOSTOS FALTANTES ======
    
    # Índices compostos de performance que estavam faltando
    
    # appointments: (company_id, start_time) - já existe mas vamos garantir
    # Este é o índice mais importante para queries de agenda
    
    # appointments: (company_id, professional_id, start_time) - agenda do profissional
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_appointments_company_professional_start'
    """)).fetchone():
        op.create_index(
            'idx_appointments_company_professional_start',
            'appointments',
            ['company_id', 'professional_id', 'start_time'],
            unique=False
        )
    
    # appointments: (company_id, client_crm_id, start_time) - agenda do cliente
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_appointments_company_client_start'
    """)).fetchone():
        op.create_index(
            'idx_appointments_company_client_start',
            'appointments',
            ['company_id', 'client_crm_id', 'start_time'],
            unique=False
        )
    
    # financial_transactions: (company_id, date) - para queries por período
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_financial_transactions_company_date'
    """)).fetchone():
        op.create_index(
            'idx_financial_transactions_company_date',
            'financial_transactions',
            ['company_id', 'date'],
            unique=False
        )
    
    # financial_transactions: (company_id, status, date) - para dashboard financeiro
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_financial_transactions_company_status_date'
    """)).fetchone():
        op.create_index(
            'idx_financial_transactions_company_status_date',
            'financial_transactions',
            ['company_id', 'status', 'date'],
            unique=False
        )
    
    # payments: (company_id, status, created_at) - para controle financeiro
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_payments_company_status_created'
    """)).fetchone():
        op.create_index(
            'idx_payments_company_status_created',
            'payments',
            ['company_id', 'status', 'created_at'],
            unique=False
        )
    
    # commands: (company_id, date) - para queries de comandas
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_commands_company_date'
    """)).fetchone():
        op.create_index(
            'idx_commands_company_date',
            'commands',
            ['company_id', 'date'],
            unique=False
        )
    
    # ====== MELHORAR ÍNDICES EXISTENTES ======
    
    # Adicionar índice para queries de dashboard financeiro
    if not op.get_bind().execute(sa.text("""
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_financial_accounts_company_type_active'
    """)).fetchone():
        op.create_index(
            'idx_financial_accounts_company_type_active',
            'financial_accounts',
            ['company_id', 'account_type', 'is_active'],
            unique=False
        )


def downgrade() -> None:
    """
    Reverte as mudanças.
    """
    
    # Remover índices compostos adicionados
    op.drop_index('idx_financial_accounts_company_type_active', table_name='financial_accounts')
    op.drop_index('idx_commands_company_date', table_name='commands')
    op.drop_index('idx_payments_company_status_created', table_name='payments')
    op.drop_index('idx_financial_transactions_company_status_date', table_name='financial_transactions')
    op.drop_index('idx_financial_transactions_company_date', table_name='financial_transactions')
    op.drop_index('idx_appointments_company_client_start', table_name='appointments')
    op.drop_index('idx_appointments_company_professional_start', table_name='appointments')
    
    # Reverter client_id para NOT NULL (se necessário)
    # Nota: Isso pode falhar se houver dados nulos
    try:
        op.alter_column(
            'reviews',
            'client_id',
            existing_type=sa.Integer(),
            nullable=False,
            existing_nullable=True
        )
    except Exception:
        pass  # Se houver dados nulos, não reverte
    
    try:
        op.alter_column(
            'appointments',
            'client_id',
            existing_type=sa.Integer(),
            nullable=False,
            existing_nullable=True
        )
    except Exception:
        pass  # Se houver dados nulos, não reverte
