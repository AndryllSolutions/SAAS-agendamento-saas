"""add_icons_to_addons

Revision ID: add_icons_to_addons
Revises: add_is_active_to_subscriptions
Create Date: 2025-12-31 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_icons_to_addons'
down_revision = 'add_is_active_subs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Atualizar add-ons com ícones (lucide-react)
    op.execute("""
        UPDATE add_ons SET icon = 'TrendingUp', color = '#10B981' WHERE slug = 'pricing_intelligence';
        UPDATE add_ons SET icon = 'BarChart3', color = '#6366F1' WHERE slug = 'advanced_reports';
        UPDATE add_ons SET icon = 'Target', color = '#F59E0B' WHERE slug = 'goals_bonification';
        UPDATE add_ons SET icon = 'MessageSquare', color = '#22C55E' WHERE slug = 'marketing_whatsapp';
        UPDATE add_ons SET icon = 'Building2', color = '#8B5CF6' WHERE slug = 'extra_unit';
        UPDATE add_ons SET icon = 'FileSignature', color = '#3B82F6' WHERE slug = 'digital_signature';
        UPDATE add_ons SET icon = 'ClipboardList', color = '#EC4899' WHERE slug = 'anamnesis_intelligent';
        UPDATE add_ons SET icon = 'Gift', color = '#F97316' WHERE slug = 'cashback_loyalty';
        UPDATE add_ons SET icon = 'Receipt', color = '#14B8A6' WHERE slug = 'fiscal_pro';
    """)


def downgrade() -> None:
    # Resetar ícones para valor padrão
    op.execute("""
        UPDATE add_ons SET icon = NULL, color = '#3B82F6';
    """)
