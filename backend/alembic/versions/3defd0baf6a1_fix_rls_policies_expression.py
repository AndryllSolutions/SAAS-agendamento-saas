"""fix rls policies expression

Revision ID: 3defd0baf6a1
Revises: 7ca951d1bccc
Create Date: 2026-01-02 14:14:45.571044

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3defd0baf6a1'
down_revision = '7ca951d1bccc'
branch_labels = None
depends_on = None


# Mesma lista de tabelas multi-tenant usada em implement_rls_policies
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
    """Normalize RLS policies expression for all tenant tables.

    Usa uma expressao segura baseada em COALESCE/NULLIF para evitar erros de cast
    quando a variavel de sessao "app.current_company_id" estiver vazia, garantindo
    que, se o tenant nao estiver definido, nenhuma linha seja retornada/afetada.
    """

    for table in TENANT_TABLES:
        # Garantir que RLS esteja habilitado e forçado
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
        op.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY;")

        # Recriar a policy com a expressao segura
        op.execute(
            f"""
            DROP POLICY IF EXISTS {table}_tenant_isolation ON {table};
            CREATE POLICY {table}_tenant_isolation ON {table}
                USING (
                    company_id = COALESCE(
                        NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER,
                        -1
                    )
                )
                WITH CHECK (
                    company_id = COALESCE(
                        NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER,
                        -1
                    )
                );
            """
        )


def downgrade() -> None:
    """Restore original simpler RLS expression for all tenant tables.

    Volta para a expressao baseada apenas em NULLIF/current_setting usada na
    migration original, sem o COALESCE. Esta funcao existe apenas para permitir
    rollback tecnico da migration; a versao "upgrade" e a recomendada em producao.
    """

    for table in TENANT_TABLES:
        op.execute(
            f"""
            DROP POLICY IF EXISTS {table}_tenant_isolation ON {table};
            CREATE POLICY {table}_tenant_isolation ON {table}
                USING (
                    company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER
                )
                WITH CHECK (
                    company_id = NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER
                );
            """
        )


