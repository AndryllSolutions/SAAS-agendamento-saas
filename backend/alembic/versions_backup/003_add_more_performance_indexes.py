"""Add more performance indexes

Revision ID: 003_add_more_performance_indexes
Revises: 002_add_performance_indexes
Create Date: 2024-01-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_more_performance_indexes'
down_revision = '002_add_performance_indexes'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Indexes for packages table
    op.create_index('idx_packages_company_id', 'packages', ['company_id'])
    op.create_index('idx_packages_client_id', 'packages', ['client_id'])
    op.create_index('idx_packages_status', 'packages', ['status'])
    op.create_index('idx_packages_company_status', 'packages', ['company_id', 'status'])
    
    # Indexes for predefined_packages table
    op.create_index('idx_predefined_packages_company_id', 'predefined_packages', ['company_id'])
    op.create_index('idx_predefined_packages_is_active', 'predefined_packages', ['is_active'])
    
    # Indexes for command_items table
    op.create_index('idx_command_items_command_id', 'command_items', ['command_id'])
    op.create_index('idx_command_items_professional_id', 'command_items', ['professional_id'])
    op.create_index('idx_command_items_service_id', 'command_items', ['service_id'])
    op.create_index('idx_command_items_product_id', 'command_items', ['product_id'])
    
    # Indexes for commissions table
    op.create_index('idx_commissions_company_id', 'commissions', ['company_id'])
    op.create_index('idx_commissions_professional_id', 'commissions', ['professional_id'])
    op.create_index('idx_commissions_status', 'commissions', ['status'])
    op.create_index('idx_commissions_company_professional', 'commissions', ['company_id', 'professional_id'])
    op.create_index('idx_commissions_company_status', 'commissions', ['company_id', 'status'])
    
    # Indexes for goals table
    op.create_index('idx_goals_company_id', 'goals', ['company_id'])
    op.create_index('idx_goals_professional_id', 'goals', ['professional_id'])
    op.create_index('idx_goals_period_start', 'goals', ['period_start'])
    op.create_index('idx_goals_period_end', 'goals', ['period_end'])
    op.create_index('idx_goals_company_period_start', 'goals', ['company_id', 'period_start'])
    
    # Indexes for purchases table
    op.create_index('idx_purchases_company_id', 'purchases', ['company_id'])
    op.create_index('idx_purchases_supplier_id', 'purchases', ['supplier_id'])
    op.create_index('idx_purchases_status', 'purchases', ['status'])
    op.create_index('idx_purchases_purchase_date', 'purchases', ['purchase_date'])
    op.create_index('idx_purchases_company_date', 'purchases', ['company_id', 'purchase_date'])
    
    # Indexes for suppliers table
    op.create_index('idx_suppliers_company_id', 'suppliers', ['company_id'])
    op.create_index('idx_suppliers_name', 'suppliers', ['name'])
    
    # Indexes for anamneses table
    op.create_index('idx_anamneses_company_id', 'anamneses', ['company_id'])
    op.create_index('idx_anamneses_client_id', 'anamneses', ['client_id'])
    op.create_index('idx_anamneses_professional_id', 'anamneses', ['professional_id'])
    op.create_index('idx_anamneses_model_id', 'anamneses', ['model_id'])
    
    # Indexes for evaluations table
    op.create_index('idx_evaluations_company_id', 'evaluations', ['company_id'])
    op.create_index('idx_evaluations_client_id', 'evaluations', ['client_id'])
    op.create_index('idx_evaluations_professional_id', 'evaluations', ['professional_id'])
    op.create_index('idx_evaluations_rating', 'evaluations', ['rating'])
    
    # Indexes for cashback tables
    op.create_index('idx_cashback_rules_company_id', 'cashback_rules', ['company_id'])
    op.create_index('idx_cashback_rules_is_active', 'cashback_rules', ['is_active'])
    op.create_index('idx_cashback_balances_company_id', 'cashback_balances', ['company_id'])
    op.create_index('idx_cashback_balances_client_id', 'cashback_balances', ['client_id'])
    op.create_index('idx_cashback_transactions_balance_id', 'cashback_transactions', ['balance_id'])
    op.create_index('idx_cashback_transactions_type', 'cashback_transactions', ['transaction_type'])
    
    # Indexes for promotions table
    op.create_index('idx_promotions_company_id', 'promotions', ['company_id'])
    op.create_index('idx_promotions_is_active', 'promotions', ['is_active'])
    op.create_index('idx_promotions_valid_from', 'promotions', ['valid_from'])
    op.create_index('idx_promotions_valid_until', 'promotions', ['valid_until'])
    
    # Indexes for invoices table
    op.create_index('idx_invoices_company_id', 'invoices', ['company_id'])
    op.create_index('idx_invoices_client_id', 'invoices', ['client_id'])
    op.create_index('idx_invoices_command_id', 'invoices', ['command_id'])
    op.create_index('idx_invoices_status', 'invoices', ['status'])
    op.create_index('idx_invoices_type', 'invoices', ['invoice_type'])
    
    # Indexes for subscription_sales table
    op.create_index('idx_subscription_sales_company_id', 'subscription_sales', ['company_id'])
    op.create_index('idx_subscription_sales_client_id', 'subscription_sales', ['client_id'])
    op.create_index('idx_subscription_sales_model_id', 'subscription_sales', ['model_id'])
    op.create_index('idx_subscription_sales_status', 'subscription_sales', ['status'])
    
    # Indexes for whatsapp_campaigns table
    op.create_index('idx_whatsapp_campaigns_company_id', 'whatsapp_campaigns', ['company_id'])
    op.create_index('idx_whatsapp_campaigns_status', 'whatsapp_campaigns', ['status'])
    op.create_index('idx_whatsapp_campaigns_created_at', 'whatsapp_campaigns', ['created_at'])
    
    # Composite indexes for common query patterns
    op.create_index('idx_appointments_professional_start', 'appointments', ['professional_id', 'start_time'])
    op.create_index('idx_commands_client_date', 'commands', ['client_id', 'date'])
    op.create_index('idx_financial_transactions_company_type_date', 'financial_transactions', ['company_id', 'type', 'date'])


def downgrade() -> None:
    # Drop composite indexes
    op.drop_index('idx_financial_transactions_company_type_date')
    op.drop_index('idx_commands_client_date')
    op.drop_index('idx_appointments_professional_start')
    
    # Drop whatsapp indexes
    op.drop_index('idx_whatsapp_campaigns_created_at')
    op.drop_index('idx_whatsapp_campaigns_status')
    op.drop_index('idx_whatsapp_campaigns_company_id')
    
    # Drop subscription_sales indexes
    op.drop_index('idx_subscription_sales_status')
    op.drop_index('idx_subscription_sales_model_id')
    op.drop_index('idx_subscription_sales_client_id')
    op.drop_index('idx_subscription_sales_company_id')
    
    # Drop invoices indexes
    op.drop_index('idx_invoices_type')
    op.drop_index('idx_invoices_status')
    op.drop_index('idx_invoices_command_id')
    op.drop_index('idx_invoices_client_id')
    op.drop_index('idx_invoices_company_id')
    
    # Drop promotions indexes
    op.drop_index('idx_promotions_valid_until')
    op.drop_index('idx_promotions_valid_from')
    op.drop_index('idx_promotions_is_active')
    op.drop_index('idx_promotions_company_id')
    
    # Drop cashback indexes
    op.drop_index('idx_cashback_transactions_type')
    op.drop_index('idx_cashback_transactions_balance_id')
    op.drop_index('idx_cashback_balances_client_id')
    op.drop_index('idx_cashback_balances_company_id')
    op.drop_index('idx_cashback_rules_is_active')
    op.drop_index('idx_cashback_rules_company_id')
    
    # Drop evaluations indexes
    op.drop_index('idx_evaluations_rating')
    op.drop_index('idx_evaluations_professional_id')
    op.drop_index('idx_evaluations_client_id')
    op.drop_index('idx_evaluations_company_id')
    
    # Drop anamneses indexes
    op.drop_index('idx_anamneses_model_id')
    op.drop_index('idx_anamneses_professional_id')
    op.drop_index('idx_anamneses_client_id')
    op.drop_index('idx_anamneses_company_id')
    
    # Drop suppliers indexes
    op.drop_index('idx_suppliers_name')
    op.drop_index('idx_suppliers_company_id')
    
    # Drop purchases indexes
    op.drop_index('idx_purchases_company_date')
    op.drop_index('idx_purchases_purchase_date')
    op.drop_index('idx_purchases_status')
    op.drop_index('idx_purchases_supplier_id')
    op.drop_index('idx_purchases_company_id')
    
    # Drop goals indexes
    op.drop_index('idx_goals_company_period_start')
    op.drop_index('idx_goals_period_end')
    op.drop_index('idx_goals_period_start')
    op.drop_index('idx_goals_professional_id')
    op.drop_index('idx_goals_company_id')
    
    # Drop commissions indexes
    op.drop_index('idx_commissions_company_status')
    op.drop_index('idx_commissions_company_professional')
    op.drop_index('idx_commissions_status')
    op.drop_index('idx_commissions_professional_id')
    op.drop_index('idx_commissions_company_id')
    
    # Drop command_items indexes
    op.drop_index('idx_command_items_product_id')
    op.drop_index('idx_command_items_service_id')
    op.drop_index('idx_command_items_professional_id')
    op.drop_index('idx_command_items_command_id')
    
    # Drop predefined_packages indexes
    op.drop_index('idx_predefined_packages_is_active')
    op.drop_index('idx_predefined_packages_company_id')
    
    # Drop packages indexes
    op.drop_index('idx_packages_company_status')
    op.drop_index('idx_packages_status')
    op.drop_index('idx_packages_client_id')
    op.drop_index('idx_packages_company_id')

