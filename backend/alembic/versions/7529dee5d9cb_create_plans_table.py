"""create_plans_table

Revision ID: 7529dee5d9cb
Revises: 498a65194650
Create Date: 2025-12-29 11:04:26.055603

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7529dee5d9cb'
down_revision = '6a1f2b3c4d5e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar tabela plans
    op.create_table(
        'plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        
        sa.Column('price_monthly', sa.Numeric(10, 2), nullable=False),
        sa.Column('price_yearly', sa.Numeric(10, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='BRL'),
        
        sa.Column('max_professionals', sa.Integer(), nullable=False),
        sa.Column('max_units', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('max_clients', sa.Integer(), nullable=False, server_default='-1'),
        sa.Column('max_appointments_per_month', sa.Integer(), nullable=False, server_default='-1'),
        
        sa.Column('features', sa.JSON(), nullable=False, server_default='[]'),
        
        sa.Column('highlight_label', sa.String(50), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('color', sa.String(7), nullable=False, server_default='#3B82F6'),
        
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_visible', sa.Boolean(), nullable=False, server_default='true'),
        
        sa.Column('trial_days', sa.Integer(), nullable=False, server_default='14'),
        
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    
    # Índices
    op.create_index('ix_plans_name', 'plans', ['name'])
    op.create_index('ix_plans_slug', 'plans', ['slug'])
    op.create_index('ix_plans_is_active', 'plans', ['is_active'])
    
    # Popular tabela com planos oficiais
    op.execute("""
        INSERT INTO plans (name, slug, description, price_monthly, max_professionals, max_units, features, display_order, highlight_label)
        VALUES
        (
            'Essencial',
            'essencial',
            'Indicado para profissional solo ou negócios iniciantes',
            89.00,
            2,
            1,
            '["clients", "services", "products", "appointments", "commands", "financial_basic", "reports_basic"]'::json,
            1,
            NULL
        ),
        (
            'Pro',
            'pro',
            'Indicado para salões e clínicas estruturadas',
            149.00,
            5,
            1,
            '["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing"]'::json,
            2,
            'Mais Popular'
        ),
        (
            'Premium',
            'premium',
            'Indicado para negócios em crescimento',
            249.00,
            10,
            2,
            '["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing", "cashback", "promotions", "subscription_sales", "document_generator", "invoices", "online_booking", "pricing_intelligence", "advanced_reports", "professional_ranking", "client_funnel"]'::json,
            3,
            'Recomendado'
        ),
        (
            'Scale',
            'scale',
            'Indicado para redes, clínicas premium e negócios escaláveis',
            399.00,
            -1,
            -1,
            '["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing", "cashback", "promotions", "subscription_sales", "document_generator", "invoices", "online_booking", "pricing_intelligence", "advanced_reports", "professional_ranking", "client_funnel", "crm_advanced", "multi_unit_reports", "automatic_campaigns", "priority_support", "programa_crescer"]'::json,
            4,
            'Enterprise'
        );
    """)


def downgrade() -> None:
    op.drop_index('ix_plans_is_active', 'plans')
    op.drop_index('ix_plans_slug', 'plans')
    op.drop_index('ix_plans_name', 'plans')
    op.drop_table('plans')

