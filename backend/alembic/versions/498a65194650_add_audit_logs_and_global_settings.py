"""add audit logs and global settings

Revision ID: 498a65194650
Revises: 1271bb114659
Create Date: 2025-01-15 10:00:00.000000

Esta migration adiciona:
1. Tabela audit_logs - Para rastreamento de ações críticas
2. Tabela global_settings - Para configurações globais da plataforma (singleton)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '498a65194650'
down_revision = '1271bb114659'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('actor_user_id', sa.Integer(), nullable=True),
        sa.Column('actor_role', sa.String(length=50), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('before', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for audit_logs
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity_type', 'entity_id'])
    op.create_index('idx_audit_logs_actor', 'audit_logs', ['actor_user_id'])
    op.create_index('idx_audit_logs_created', 'audit_logs', ['created_at'])
    op.create_index('idx_audit_logs_action', 'audit_logs', ['action'])
    
    # Create global_settings table (singleton - only one row with id=1)
    op.create_table(
        'global_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('id = 1', name='single_row_constraint')
    )
    
    # Note: The CHECK constraint already ensures only one row (id = 1)
    # No need for a unique index on a constant value
    
    # Insert default global settings (only if not exists)
    # The CHECK constraint ensures only id=1 can exist
    op.execute("""
        INSERT INTO global_settings (id, created_at, updated_at, data, version)
        SELECT 
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            '{
                "platform": {
                    "product_name": "Agendamento SaaS",
                    "public_url": "",
                    "timezone": "America/Sao_Paulo",
                    "currency": "BRL",
                    "default_language": "pt-BR",
                    "maintenance_mode": false,
                    "maintenance_message": "Sistema em manutenção. Volte em breve."
                },
                "trial_billing": {
                    "trial_duration_days": 14,
                    "allow_trial_on_free": false,
                    "block_after_days_overdue": 7,
                    "block_mode": "partial",
                    "auto_downgrade_enabled": true,
                    "billing_message": "Sua assinatura vence em {days} dias."
                },
                "features": {
                    "financial_enabled": true,
                    "commands_enabled": true,
                    "cashback_enabled": true,
                    "invoices_enabled": true,
                    "anamneses_enabled": true,
                    "packages_enabled": true,
                    "reports_enabled": true,
                    "default_plan": "BASIC",
                    "default_modules": ["financial", "commands", "reports"]
                },
                "security": {
                    "password_min_length": 8,
                    "password_require_complexity": true,
                    "mfa_required": false,
                    "session_timeout_minutes": 480,
                    "rate_limit_login": 5,
                    "rate_limit_reset": 3,
                    "ip_whitelist": [],
                    "ip_blacklist": []
                },
                "communication": {
                    "email_templates": {
                        "welcome": {
                            "subject": "Bem-vindo ao {product_name}",
                            "body": "Olá {user_name}, bem-vindo ao {product_name}!"
                        },
                        "reset_password": {
                            "subject": "Redefinir senha",
                            "body": "Clique no link para redefinir sua senha: {reset_link}"
                        },
                        "invoice": {
                            "subject": "Fatura #{invoice_number}",
                            "body": "Sua fatura está disponível: {invoice_link}"
                        }
                    },
                    "sms_templates": {},
                    "whatsapp_templates": {}
                },
                "audit": {
                    "log_retention_days": 90,
                    "audit_retention_days": 365,
                    "export_allowed": true
                }
            }'::jsonb,
            1
        WHERE NOT EXISTS (SELECT 1 FROM global_settings WHERE id = 1);
    """)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_audit_logs_action', table_name='audit_logs')
    op.drop_index('idx_audit_logs_created', table_name='audit_logs')
    op.drop_index('idx_audit_logs_actor', table_name='audit_logs')
    op.drop_index('idx_audit_logs_entity', table_name='audit_logs')
    
    # Drop tables
    op.drop_table('global_settings')
    op.drop_table('audit_logs')

