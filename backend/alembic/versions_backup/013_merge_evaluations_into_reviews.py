"""Merge evaluations into reviews table

Revision ID: 013_merge_evaluations_into_reviews
Revises: 012_migrate_professionals_to_users
Create Date: 2025-12-05 16:50:00.000000

Esta migration elimina a duplicação entre reviews e evaluations:
1. Adiciona campo 'origin' à tabela reviews
2. Adiciona campos de resposta da evaluations
3. Remove tabela evaluations vazia
4. Mantém compatibilidade com API endpoints

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '013_merge_evaluations_into_reviews'
down_revision = '012_migrate_professionals_to_users'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Mescla evaluations na tabela reviews e remove tabela duplicada.
    """
    
    # ====== 1. ADICIONAR CAMPOS DA EVALUATIONS À REVIEWS ======
    
    # Origin da avaliação (link, app, post_service, other)
    op.add_column('reviews', sa.Column('origin', sa.String(length=50), nullable=True, default='post_service'))
    
    # Campos de resposta (da evaluations)
    op.add_column('reviews', sa.Column('is_answered', sa.Boolean(), nullable=True, default=False))
    op.add_column('reviews', sa.Column('answer_date', sa.DateTime(), nullable=True))
    op.add_column('reviews', sa.Column('answer_text', sa.Text(), nullable=True))
    
    # ====== 2. MIGRAR DADOS (SE HOUVESSE) ======
    
    # Como ambas as tabelas estão vazias, não há dados para migrar
    # Se houvesse dados, faríamos:
    # INSERT INTO reviews (company_id, appointment_id, client_id, professional_id, rating, comment, origin, is_answered, answer_date, answer_text, is_visible, is_approved, created_at, updated_at)
    # SELECT company_id, appointment_id, client_id, professional_id, rating, comment, origin, is_answered, answer_date, answer_text, true, true, created_at, updated_at FROM evaluations
    
    # ====== 3. REMOVER TABELA EVALUATIONS (VAZIA) ======
    
    op.drop_table('evaluations')
    
    # ====== 4. ATUALIZAR VALORES DEFAULT ======
    
    # Setar default para origin como 'post_service' para reviews existentes
    op.execute("UPDATE reviews SET origin = 'post_service' WHERE origin IS NULL")
    op.execute("ALTER TABLE reviews ALTER COLUMN origin SET DEFAULT 'post_service'")
    
    # ====== 5. ADICIONAR ÍNDICES PARA PERFORMANCE ======
    
    # Índice para buscar por origin
    op.create_index(
        'idx_reviews_origin',
        'reviews',
        ['origin'],
        unique=False
    )
    
    # Índice composto: company_id + origin
    op.create_index(
        'idx_reviews_company_origin',
        'reviews',
        ['company_id', 'origin'],
        unique=False
    )


def downgrade() -> None:
    """
    Reverte a migração (recria tabela evaluations).
    """
    
    # Remover índices adicionados
    op.drop_index('idx_reviews_company_origin', table_name='reviews')
    op.drop_index('idx_reviews_origin', table_name='reviews')
    
    # Recriar tabela evaluations
    op.create_table('evaluations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('origin', sa.String(length=50), nullable=False),
        sa.Column('is_answered', sa.Boolean(), nullable=True),
        sa.Column('answer_date', sa.DateTime(), nullable=True),
        sa.Column('answer_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Criar índices
    op.create_index('ix_evaluations_id', 'evaluations', ['id'], unique=False)
    op.create_index('ix_evaluations_company_id', 'evaluations', ['company_id'], unique=False)
    op.create_index('ix_evaluations_client_id', 'evaluations', ['client_id'], unique=False)
    op.create_index('ix_evaluations_professional_id', 'evaluations', ['professional_id'], unique=False)
    op.create_index('ix_evaluations_appointment_id', 'evaluations', ['appointment_id'], unique=False)
    
    # Remover campos adicionados da reviews
    op.drop_column('reviews', 'answer_text')
    op.drop_column('reviews', 'answer_date')
    op.drop_column('reviews', 'is_answered')
    op.drop_column('reviews', 'origin')
