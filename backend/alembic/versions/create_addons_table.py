"""create_addons_table

Revision ID: create_addons_table
Revises: d6f40aece08f
Create Date: 2025-12-29 21:42:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'create_addons_table'
down_revision = 'd6f40aece08f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar tabela add_ons
    op.create_table(
        'add_ons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        
        sa.Column('price_monthly', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='BRL'),
        
        sa.Column('addon_type', sa.String(50), nullable=False),
        sa.Column('config', sa.JSON(), nullable=False, server_default='{}'),
        
        sa.Column('unlocks_features', sa.JSON(), nullable=True),
        sa.Column('override_limits', sa.JSON(), nullable=True),
        
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('color', sa.String(7), nullable=False, server_default='#3B82F6'),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_visible', sa.Boolean(), nullable=False, server_default='true'),
        
        sa.Column('included_in_plans', sa.JSON(), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    
    # Índices
    op.create_index('ix_add_ons_name', 'add_ons', ['name'])
    op.create_index('ix_add_ons_slug', 'add_ons', ['slug'])
    op.create_index('ix_add_ons_is_active', 'add_ons', ['is_active'])
    op.create_index('ix_add_ons_category', 'add_ons', ['category'])
    
    # Criar tabela company_add_ons
    op.create_table(
        'company_add_ons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('addon_id', sa.Integer(), nullable=False),
        
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('activated_at', sa.DateTime(), nullable=True),
        sa.Column('deactivated_at', sa.DateTime(), nullable=True),
        
        sa.Column('next_billing_date', sa.DateTime(), nullable=True),
        sa.Column('auto_renew', sa.Boolean(), nullable=False, server_default='true'),
        
        sa.Column('source', sa.String(50), nullable=True),
        sa.Column('trial_end_date', sa.DateTime(), nullable=True),
        sa.Column('is_trial', sa.Boolean(), nullable=False, server_default='false'),
        
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id', 'addon_id', name='uq_company_addon'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['addon_id'], ['add_ons.id'], ondelete='CASCADE')
    )
    
    # Índices company_add_ons
    op.create_index('ix_company_add_ons_company_id', 'company_add_ons', ['company_id'])
    op.create_index('ix_company_add_ons_addon_id', 'company_add_ons', ['addon_id'])
    op.create_index('ix_company_add_ons_is_active', 'company_add_ons', ['is_active'])
    
    # Popular tabela add_ons com dados oficiais
    op.execute("""
        INSERT INTO add_ons (name, slug, description, price_monthly, addon_type, unlocks_features, included_in_plans, display_order, category)
        VALUES
        (
            'Precificação Inteligente',
            'pricing_intelligence',
            'Cálculo automático de margem, preço mínimo e ideal por serviço',
            49.00,
            'feature',
            '["pricing_intelligence", "cost_calculation", "margin_analysis"]'::json,
            '["premium", "scale"]'::json,
            1,
            'analytics'
        ),
        (
            'Relatórios Avançados',
            'advanced_reports',
            'Ticket médio, recorrência, cancelamentos, ranking detalhado',
            39.00,
            'feature',
            '["advanced_reports", "ticket_average", "retention_analysis", "cancellation_analysis"]'::json,
            '["premium", "scale"]'::json,
            2,
            'analytics'
        ),
        (
            'Metas & Bonificação',
            'goals_bonification',
            'Metas por profissional, ranking, bonificação automática',
            39.00,
            'feature',
            '["goals_advanced", "professional_ranking", "automatic_bonification"]'::json,
            '["premium", "scale"]'::json,
            3,
            'management'
        ),
        (
            'Marketing & Reativação (WhatsApp)',
            'marketing_whatsapp',
            'Mensagens automáticas, aniversário, lembretes, recuperação de inativos',
            59.00,
            'feature',
            '["whatsapp_marketing", "automatic_messages", "birthday_campaigns", "inactive_recovery"]'::json,
            '["scale"]'::json,
            4,
            'marketing'
        ),
        (
            'Unidade Extra',
            'extra_unit',
            'Gestão de unidade adicional',
            69.00,
            'limit_override',
            '["multi_unit"]'::json,
            '[]'::json,
            5,
            'operations'
        ),
        (
            'Assinatura Digital',
            'digital_signature',
            'Assinatura de contratos e termos via WhatsApp',
            19.00,
            'service',
            '["digital_signature", "contract_management"]'::json,
            '[]'::json,
            6,
            'operations'
        ),
        (
            'Anamnese Inteligente',
            'anamnesis_intelligent',
            'Criação de formulários personalizados, histórico por cliente',
            29.00,
            'feature',
            '["anamnesis_advanced", "custom_forms", "client_history"]'::json,
            '[]'::json,
            7,
            'healthcare'
        ),
        (
            'Cashback & Fidelização',
            'cashback_loyalty',
            'Cashback por atendimento, controle de saldo',
            29.00,
            'feature',
            '["cashback", "loyalty_program", "balance_control"]'::json,
            '[]'::json,
            8,
            'marketing'
        ),
        (
            'Fiscal Pro',
            'fiscal_pro',
            'Emissão de NF-e, NFC-e, NFS-e',
            69.00,
            'service',
            '["nfe_emission", "nfce_emission", "nfse_emission", "tax_compliance"]'::json,
            '[]'::json,
            9,
            'fiscal'
        );
    """)


def downgrade() -> None:
    # Remover índices
    op.drop_index('ix_company_add_ons_is_active', 'company_add_ons')
    op.drop_index('ix_company_add_ons_addon_id', 'company_add_ons')
    op.drop_index('ix_company_add_ons_company_id', 'company_add_ons')
    
    op.drop_index('ix_add_ons_category', 'add_ons')
    op.drop_index('ix_add_ons_is_active', 'add_ons')
    op.drop_index('ix_add_ons_slug', 'add_ons')
    op.drop_index('ix_add_ons_name', 'add_ons')
    
    # Remover tabelas
    op.drop_table('company_add_ons')
    op.drop_table('add_ons')
