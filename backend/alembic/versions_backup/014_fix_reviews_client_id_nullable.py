"""Fix reviews client_id nullable constraint

Revision ID: 014_fix_reviews_client_id_nullable
Revises: 013_merge_evaluations_into_reviews
Create Date: 2025-12-05 17:10:00.000000

Esta migration corrige a constraint do client_id na tabela reviews
para permitir migração completa para client_crm_id e suportar evaluations
que não têm client_id vinculado.

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '014_fix_reviews_client_id_nullable'
down_revision = '013_merge_evaluations_into_reviews'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Corrige constraint do client_id para permitir nulos.
    """
    
    # Tornar client_id nullable para suportar evaluations
    # que usam apenas client_crm_id
    op.alter_column(
        'reviews',
        'client_id',
        existing_type=sa.Integer(),
        nullable=True,
        existing_nullable=False
    )
    
    # Adicionar constraint para garantir que pelo menos um
    # dos campos client_id ou client_crm_id seja preenchido
    op.execute("""
        ALTER TABLE reviews 
        ADD CONSTRAINT chk_reviews_client_reference 
        CHECK (client_id IS NOT NULL OR client_crm_id IS NOT NULL)
    """)


def downgrade() -> None:
    """
    Reverte a constraint.
    """
    
    # Remover constraint de referência
    op.execute("ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_reviews_client_reference")
    
    # Tentar reverter NOT NULL (pode falhar se houver nulos)
    try:
        op.alter_column(
            'reviews',
            'client_id',
            existing_type=sa.Integer(),
            nullable=False,
            existing_nullable=True
        )
    except Exception:
        pass  # Se houver dados nulos, não reverte
