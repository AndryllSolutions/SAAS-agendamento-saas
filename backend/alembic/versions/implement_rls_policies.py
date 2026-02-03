"""Implement Row Level Security policies for all tenant tables

Revision ID: 4a5b6c7d8e9f
Revises: create_online_booking
Create Date: 2026-01-01 20:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a5b6c7d8e9f'
down_revision: Union[str, None] = 'e8f3c2a1b4d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Lista de tabelas multi-tenant que existem no banco
# Apenas tabelas que realmente existem podem ter RLS aplicado
TENANT_TABLES = [
    'clients',
    'services',
    'service_categories',
    'appointments',
    'products',
    'product_categories',
    'commands',
    'packages',
    'anamneses',
    'anamnesis_models',
    'evaluations',
    'reviews',
    'financial_accounts',
    'financial_categories',
    'financial_transactions',
    'cash_registers',
    'payment_forms',
    'purchases',
    'suppliers',
    'goals',
    'promotions',
    'cashback_rules',
    'cashback_balances',
    'cashback_transactions',
    'commission_configs',
    'commissions',
    'user_push_subscriptions',
    'document_templates',
    'generated_documents',
    'invoices',
    'resources',
    'company_settings',
    'company_subscriptions',
    'company_users',
    'api_keys',
    'online_booking_configs',
    'whatsapp_providers',
    'whatsapp_campaigns',
    'whatsapp_campaign_logs',
    'whatsapp_automated_campaigns',
    'subscription_sales',
]


def upgrade() -> None:
    """
    Enable Row Level Security on all tenant tables.
    
    This creates a defense-in-depth approach:
    1. Application-level filtering (existing company_id filters)
    2. Database-level isolation (RLS policies)
    
    The RLS policy uses PostgreSQL's SET LOCAL to read the current company_id
    from the session variable 'app.current_company_id'.
    """
    
    # Create helper function to get current company_id (optional, for debugging)
    op.execute("""
        CREATE OR REPLACE FUNCTION get_current_company_id() 
        RETURNS INTEGER AS $$
        BEGIN
            RETURN NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN NULL;
        END;
        $$ LANGUAGE plpgsql STABLE;
    """)
    
    # Enable RLS and create policies for each tenant table
    for table in TENANT_TABLES:
        # Check if table exists before applying RLS
        conn = op.get_bind()
        result = conn.execute(sa.text(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '{table}'
            );
        """)).scalar()
        
        if result:
            # Enable RLS on the table
            op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
            
            # Force RLS even for table owner (except roles with BYPASSRLS)
            op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY;")
            
            # Create policy for tenant isolation
            # USING clause controls SELECT, UPDATE, DELETE
            # WITH CHECK clause controls INSERT, UPDATE
            op.execute(f"""
                CREATE POLICY {table}_tenant_isolation ON {table}
                    USING (
                        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER
                    )
                    WITH CHECK (
                        company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER
                    );
            """)
            print(f"✅ RLS enabled on table: {table}")
        else:
            print(f"⚠️  Table {table} does not exist, skipping RLS")
    
    print(f"✅ RLS enabled on {len(TENANT_TABLES)} tables")


def downgrade() -> None:
    """
    Disable Row Level Security and remove policies.
    """
    
    # Drop policies and disable RLS for each table
    for table in TENANT_TABLES:
        op.execute(f"DROP POLICY IF EXISTS {table}_tenant_isolation ON {table};")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")
    
    # Drop helper function
    op.execute("DROP FUNCTION IF EXISTS get_current_company_id();")
    
    print(f"⚠️  RLS disabled on {len(TENANT_TABLES)} tables")
