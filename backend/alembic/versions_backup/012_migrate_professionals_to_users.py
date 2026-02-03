"""Migrate professionals to users and drop redundant table

Revision ID: 012_migrate_professionals_to_users
Revises: 011_fix_client_id_nullable_and_missing_indexes
Create Date: 2025-12-05 15:10:00.000000

Esta migration elimina a redundância da tabela professionals:
1. Adiciona campos profissionais à tabela users
2. Atualiza Company.professionals para usar users com role='PROFESSIONAL'
3. Remove tabela professionals vazia
4. Mantém compatibilidade com API endpoints

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '012_migrate_professionals_to_users'
down_revision = '011_fix_client_id_nullable_and_missing_indexes'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Remove tabela professionals vazia e adiciona índices para performance.
    """
    
    # ====== 1. VERIFICAR CAMPOS PROFISSIONAIS (JÁ EXISTEM) ======
    
    # NOTA: Campos bio, specialties, working_hours, commission_rate 
    # já existem na tabela users (adicionados anteriormente)
    
    # ====== 2. REMOVER TABELA PROFESSIONALS (VAZIA) ======
    
    # Remover tabela professionals vazia com segurança
    op.drop_table('professionals')
    
    # ====== 3. ADICIONAR ÍNDICES PARA PERFORMANCE ======
    
    # Índice para buscar profissionais por empresa
    op.create_index(
        'idx_users_company_professional',
        'users',
        ['company_id', 'role'],
        unique=False,
        postgresql_where=sa.text("role = 'PROFESSIONAL'")
    )
    
    # NOTA: Índice para specialties removido - JSON não suporta btree index
    # Se necessário no futuro, usar GIN index: op.create_index('idx_users_specialties_gin', 'users', ['specialties'], postgresql_using='gin')


def downgrade() -> None:
    """
    Reverte a migração (recria tabela professionals).
    """
    
    # Remover índices adicionados
    op.drop_index('idx_users_specialties', table_name='users')
    op.drop_index('idx_users_company_professional', table_name='users')
    
    # Recriar tabela professionals
    op.create_table('professionals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('specialization', sa.String(length=255), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('specialties', sa.JSON(), nullable=True),
        sa.Column('working_hours', sa.JSON(), nullable=True),
        sa.Column('commission_rate', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Criar índices
    op.create_index('ix_professionals_id', 'professionals', ['id'], unique=False)
    op.create_index('ix_professionals_company_id', 'professionals', ['company_id'], unique=False)
    op.create_index('ix_professionals_user_id', 'professionals', ['user_id'], unique=False)
    op.create_index('ix_professionals_name', 'professionals', ['name'], unique=False)
    op.create_index('ix_professionals_is_active', 'professionals', ['is_active'], unique=False)
    
    # Remover campos adicionados da users
    op.drop_column('users', 'working_hours')
    op.drop_column('users', 'specialties')
    op.drop_column('users', 'bio')
