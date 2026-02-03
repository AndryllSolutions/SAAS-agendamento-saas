"""Add performance indexes

Revision ID: 002_add_performance_indexes
Revises: 001_initial_migration_with_all_models
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_performance_indexes'
down_revision = '001_initial'  # References the initial migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Indexes for clients table
    op.create_index('idx_clients_company_id', 'clients', ['company_id'])
    op.create_index('idx_clients_email', 'clients', ['email'])
    op.create_index('idx_clients_phone', 'clients', ['phone'])
    op.create_index('idx_clients_cpf', 'clients', ['cpf'])
    op.create_index('idx_clients_is_active', 'clients', ['is_active'])
    op.create_index('idx_clients_company_active', 'clients', ['company_id', 'is_active'])
    
    # Indexes for appointments table
    op.create_index('idx_appointments_company_id', 'appointments', ['company_id'])
    op.create_index('idx_appointments_client_id', 'appointments', ['client_id'])
    op.create_index('idx_appointments_professional_id', 'appointments', ['professional_id'])
    op.create_index('idx_appointments_status', 'appointments', ['status'])
    op.create_index('idx_appointments_start_time', 'appointments', ['start_time'])
    op.create_index('idx_appointments_company_status', 'appointments', ['company_id', 'status'])
    op.create_index('idx_appointments_company_start', 'appointments', ['company_id', 'start_time'])
    
    # Indexes for commands table
    op.create_index('idx_commands_company_id', 'commands', ['company_id'])
    op.create_index('idx_commands_client_id', 'commands', ['client_id'])
    op.create_index('idx_commands_status', 'commands', ['status'])
    op.create_index('idx_commands_date', 'commands', ['date'])
    op.create_index('idx_commands_company_date', 'commands', ['company_id', 'date'])
    
    # Indexes for products table
    op.create_index('idx_products_company_id', 'products', ['company_id'])
    op.create_index('idx_products_brand_id', 'products', ['brand_id'])
    op.create_index('idx_products_category_id', 'products', ['category_id'])
    op.create_index('idx_products_is_active', 'products', ['is_active'])
    op.create_index('idx_products_company_active', 'products', ['company_id', 'is_active'])
    
    # Indexes for services table
    op.create_index('idx_services_company_id', 'services', ['company_id'])
    op.create_index('idx_services_is_active', 'services', ['is_active'])
    op.create_index('idx_services_company_active', 'services', ['company_id', 'is_active'])
    
    # Indexes for users table
    op.create_index('idx_users_company_id', 'users', ['company_id'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    op.create_index('idx_users_company_role', 'users', ['company_id', 'role'])
    
    # Indexes for payments table
    op.create_index('idx_payments_company_id', 'payments', ['company_id'])
    op.create_index('idx_payments_appointment_id', 'payments', ['appointment_id'])
    op.create_index('idx_payments_status', 'payments', ['status'])
    op.create_index('idx_payments_created_at', 'payments', ['created_at'])
    op.create_index('idx_payments_company_status', 'payments', ['company_id', 'status'])
    
    # Indexes for financial_transactions table
    op.create_index('idx_financial_transactions_company_id', 'financial_transactions', ['company_id'])
    op.create_index('idx_financial_transactions_type', 'financial_transactions', ['type'])
    op.create_index('idx_financial_transactions_date', 'financial_transactions', ['date'])
    op.create_index('idx_financial_transactions_company_date', 'financial_transactions', ['company_id', 'date'])


def downgrade() -> None:
    # Drop indexes in reverse order
    op.drop_index('idx_financial_transactions_company_date')
    op.drop_index('idx_financial_transactions_date')
    op.drop_index('idx_financial_transactions_type')
    op.drop_index('idx_financial_transactions_company_id')
    
    op.drop_index('idx_payments_company_status')
    op.drop_index('idx_payments_created_at')
    op.drop_index('idx_payments_status')
    op.drop_index('idx_payments_appointment_id')
    op.drop_index('idx_payments_company_id')
    
    op.drop_index('idx_users_company_role')
    op.drop_index('idx_users_is_active')
    op.drop_index('idx_users_role')
    op.drop_index('idx_users_email')
    op.drop_index('idx_users_company_id')
    
    op.drop_index('idx_services_company_active')
    op.drop_index('idx_services_is_active')
    op.drop_index('idx_services_company_id')
    
    op.drop_index('idx_products_company_active')
    op.drop_index('idx_products_is_active')
    op.drop_index('idx_products_category_id')
    op.drop_index('idx_products_brand_id')
    op.drop_index('idx_products_company_id')
    
    op.drop_index('idx_commands_company_date')
    op.drop_index('idx_commands_date')
    op.drop_index('idx_commands_status')
    op.drop_index('idx_commands_client_id')
    op.drop_index('idx_commands_company_id')
    
    op.drop_index('idx_appointments_company_start')
    op.drop_index('idx_appointments_company_status')
    op.drop_index('idx_appointments_start_time')
    op.drop_index('idx_appointments_status')
    op.drop_index('idx_appointments_professional_id')
    op.drop_index('idx_appointments_client_id')
    op.drop_index('idx_appointments_company_id')
    
    op.drop_index('idx_clients_company_active')
    op.drop_index('idx_clients_is_active')
    op.drop_index('idx_clients_cpf')
    op.drop_index('idx_clients_phone')
    op.drop_index('idx_clients_email')
    op.drop_index('idx_clients_company_id')

