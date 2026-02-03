"""Add multi-tenant composite indexes

Revision ID: 007_add_multi_tenant_composite_indexes
Revises: 006_add_client_crm_id
Create Date: 2025-12-03 02:00:00.000000

Esta migration adiciona indices compostos essenciais para melhorar performance
de queries em ambiente multi-tenant.

Indices compostos criados:
- users(company_id, email) - buscar user por email dentro da empresa
- users(company_id, role) - listar users por role dentro da empresa  
- clients(company_id, email) - buscar client por email dentro da empresa
- clients(company_id, phone) - buscar client por telefone dentro da empresa
- appointments(company_id, client_id) - appointments por cliente
- appointments(company_id, start_time) - appointments por data (ja existe)
- commands(company_id, date) - comandas por data (ja existe)

Nota: Alguns indices ja existem da migration 002. Esta migration adiciona os faltantes.

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007_add_multi_tenant_composite_indexes'
down_revision = '006_add_client_crm_id'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Adiciona indices compostos para otimizar queries multi-tenant.
    
    Estrategia:
    - Indices compostos (company_id, campo) sao mais eficientes que separados
    - PostgreSQL pode usar composite index para queries que filtram por company_id
    - Ordem das colunas importa: company_id primeiro (mais seletivo)
    """
    
    # ====== USERS ======
    # Index: (company_id, email) - buscar user por email dentro da empresa
    # Uso: WHERE company_id = X AND email = 'abc@example.com'
    op.create_index(
        'idx_users_company_email',
        'users',
        ['company_id', 'email'],
        unique=False
    )
    
    # Nota: idx_users_company_role ja existe da migration 002
    
    
    # ====== CLIENTS ======
    # Index: (company_id, email) - buscar client por email dentro da empresa
    # Uso: WHERE company_id = X AND email = 'abc@example.com'
    op.create_index(
        'idx_clients_company_email',
        'clients',
        ['company_id', 'email'],
        unique=False
    )
    
    # Index: (company_id, phone) - buscar client por telefone dentro da empresa
    # Uso: WHERE company_id = X AND phone = '11987654321'
    op.create_index(
        'idx_clients_company_phone',
        'clients',
        ['company_id', 'phone'],
        unique=False
    )
    
    # Index: (company_id, cellphone) - buscar client por celular dentro da empresa
    # Uso: WHERE company_id = X AND cellphone = '11987654321'
    op.create_index(
        'idx_clients_company_cellphone',
        'clients',
        ['company_id', 'cellphone'],
        unique=False
    )
    
    # Index: (company_id, cpf) - buscar client por CPF dentro da empresa
    # Uso: WHERE company_id = X AND cpf = '12345678900'
    op.create_index(
        'idx_clients_company_cpf',
        'clients',
        ['company_id', 'cpf'],
        unique=False
    )
    
    
    # ====== APPOINTMENTS ======
    # Index: (company_id, client_id) - appointments por cliente
    # Uso: WHERE company_id = X AND client_id = Y
    op.create_index(
        'idx_appointments_company_client',
        'appointments',
        ['company_id', 'client_id'],
        unique=False
    )
    
    # Index: (company_id, professional_id, start_time) - agenda do profissional
    # Uso: WHERE company_id = X AND professional_id = Y ORDER BY start_time
    op.create_index(
        'idx_appointments_company_professional_start',
        'appointments',
        ['company_id', 'professional_id', 'start_time'],
        unique=False
    )
    
    # Nota: idx_appointments_company_start ja existe da migration 002
    # Nota: idx_appointments_company_status ja existe da migration 002
    # Nota: idx_appointments_company_client_crm ja foi criado na migration 006
    
    
    # ====== COMMANDS ======
    # Index: (company_id, client_id) - comandas por cliente
    # Uso: WHERE company_id = X AND client_id = Y
    op.create_index(
        'idx_commands_company_client',
        'commands',
        ['company_id', 'client_id'],
        unique=False
    )
    
    # Index: (company_id, status, date) - comandas por status e data
    # Uso: WHERE company_id = X AND status = 'open' ORDER BY date DESC
    op.create_index(
        'idx_commands_company_status_date',
        'commands',
        ['company_id', 'status', 'date'],
        unique=False
    )
    
    # Nota: idx_commands_company_date ja existe da migration 002
    
    
    # ====== SERVICES ======
    # Index: (company_id, is_active) - servicos ativos
    # Uso: WHERE company_id = X AND is_active = true
    # Nota: idx_services_company_active ja existe da migration 002
    
    
    # ====== PRODUCTS ======
    # Index: (company_id, is_active) - produtos ativos
    # Uso: WHERE company_id = X AND is_active = true
    # Nota: idx_products_company_active ja existe da migration 002
    
    
    # ====== REVIEWS ======
    # Index: (company_id, professional_id) - avaliacoes por profissional
    # Uso: WHERE company_id = X AND professional_id = Y
    op.create_index(
        'idx_reviews_company_professional',
        'reviews',
        ['company_id', 'professional_id'],
        unique=False
    )
    
    
    # ====== FINANCIAL_TRANSACTIONS ======
    # Index: (company_id, type, date) - transacoes por tipo e data
    # Uso: WHERE company_id = X AND type = 'INCOME' AND date BETWEEN ... AND ...
    op.create_index(
        'idx_financial_transactions_company_type_date',
        'financial_transactions',
        ['company_id', 'type', 'date'],
        unique=False
    )
    
    # Nota: idx_financial_transactions_company_date ja existe da migration 002


def downgrade() -> None:
    """
    Remove indices compostos.
    """
    # Remover em ordem reversa
    
    op.drop_index('idx_financial_transactions_company_type_date', table_name='financial_transactions')
    op.drop_index('idx_reviews_company_professional', table_name='reviews')
    op.drop_index('idx_commands_company_status_date', table_name='commands')
    op.drop_index('idx_commands_company_client', table_name='commands')
    op.drop_index('idx_appointments_company_professional_start', table_name='appointments')
    op.drop_index('idx_appointments_company_client', table_name='appointments')
    op.drop_index('idx_clients_company_cpf', table_name='clients')
    op.drop_index('idx_clients_company_cellphone', table_name='clients')
    op.drop_index('idx_clients_company_phone', table_name='clients')
    op.drop_index('idx_clients_company_email', table_name='clients')
    op.drop_index('idx_users_company_email', table_name='users')
