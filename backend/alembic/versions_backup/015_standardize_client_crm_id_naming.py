"""Standardize client_crm_id naming across tables

Revision ID: 015_standardize_client_crm_id_naming
Revises: 014_fix_reviews_client_id_nullable
Create Date: 2025-12-05 17:30:00.000000

Esta migration padroniza a nomenclatura client_crm_id em todas as tabelas
que referenciam a tabela clients, eliminando a ambiguidade do client_id.

Tabelas afetadas (já referenciam clients.id):
- anamneses
- cashback_balances  
- commands
- generated_documents
- invoices
- packages
- subscription_sales
- whatsapp_campaign_logs

Tabela mantida (referencia users.id):
- waitlist (mantém client_id pois é legítima referência a users)

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '015_standardize_client_crm_id_naming'
down_revision = '014_fix_reviews_client_id_nullable'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Renomeia client_id para client_crm_id nas tabelas que referenciam clients.
    PostgreSQL ALTER TABLE RENAME COLUMN atualiza automaticamente as FK constraints.
    """
    
    # Usar raw SQL para evitar problemas de transação do Alembic
    op.execute("ALTER TABLE anamneses RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE cashback_balances RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE commands RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE generated_documents RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE invoices RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE packages RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE subscription_sales RENAME COLUMN client_id TO client_crm_id")
    op.execute("ALTER TABLE whatsapp_campaign_logs RENAME COLUMN client_id TO client_crm_id")


def downgrade() -> None:
    """
    Reverte a renomeação das colunas.
    """
    
    # Lista de tabelas para reverter
    tables_to_revert = [
        'anamneses',
        'cashback_balances',
        'commands',
        'generated_documents',
        'invoices',
        'packages',
        'subscription_sales',
        'whatsapp_campaign_logs'
    ]
    
    # Remover índices compostos atualizados
    try:
        op.drop_index('idx_commands_company_client_crm_date', table_name='commands')
        op.drop_index('idx_invoices_company_client_crm', table_name='invoices')
        op.drop_index('idx_packages_company_client_crm', table_name='packages')
    except Exception:
        pass
    
    # Restaurar índices compostos originais
    try:
        op.create_index('idx_commands_company_client_date', 'commands', ['company_id', 'client_id', 'date'])
        op.create_index('idx_invoices_company_client', 'invoices', ['company_id', 'client_id'])
        op.create_index('idx_packages_company_client', 'packages', ['company_id', 'client_id'])
    except Exception:
        pass
    
    # Reverter nomes das colunas
    for table_name in tables_to_revert:
        # Remover índice se existir
        try:
            op.drop_index(f'ix_{table_name}_client_crm_id', table_name=table_name)
        except Exception:
            pass
        
        # Renomear coluna de volta
        op.alter_column(
            table_name,
            'client_crm_id',
            new_column_name='client_id'
        )
        
        # Restaurar índice original
        try:
            op.create_index(f'ix_{table_name}_client_id', table_name, ['client_id'])
        except Exception:
            pass
