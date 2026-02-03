"""Add client_crm_id to appointments, reviews, waitlist

Revision ID: 006_add_client_crm_id
Revises: 005_add_client_user_link
Create Date: 2025-12-03 01:00:00.000000

Esta migration adiciona o campo client_crm_id (vinculo com clients CRM) nas tabelas:
- appointments
- reviews
- waitlist

Objetivo: Preparar para migracao futura onde appointments usarao clients em vez de users.

Estrategia de transicao:
1. AGORA: Adicionar client_crm_id (nullable) em paralelo ao client_id (users)
2. FUTURO: Popular client_crm_id com dados migrados
3. FUTURO: Trocar endpoints para usar client_crm_id
4. FUTURO: Deprecar client_id (users) totalmente

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_add_client_crm_id'
down_revision = '005_add_client_user_link'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Adiciona campo client_crm_id em appointments, reviews e waitlist.
    
    Campos adicionados:
    - appointments.client_crm_id -> clients.id (SET NULL)
    - reviews.client_crm_id -> clients.id (SET NULL)
    - waitlist.client_crm_id -> clients.id (SET NULL)
    
    Todos nullable para manter backward compatibility.
    """
    
    # ====== APPOINTMENTS ======
    # Adicionar coluna
    op.add_column('appointments', sa.Column('client_crm_id', sa.Integer(), nullable=True))
    
    # Criar FK
    op.create_foreign_key(
        'fk_appointments_client_crm',
        'appointments',
        'clients',
        ['client_crm_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Criar indice
    op.create_index('ix_appointments_client_crm_id', 'appointments', ['client_crm_id'])
    
    # Criar indice composto (multi-tenant)
    op.create_index('idx_appointments_company_client_crm', 'appointments', ['company_id', 'client_crm_id'])
    
    
    # ====== REVIEWS ======
    # Adicionar coluna
    op.add_column('reviews', sa.Column('client_crm_id', sa.Integer(), nullable=True))
    
    # Criar FK
    op.create_foreign_key(
        'fk_reviews_client_crm',
        'reviews',
        'clients',
        ['client_crm_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Criar indice
    op.create_index('ix_reviews_client_crm_id', 'reviews', ['client_crm_id'])
    
    
    # ====== WAITLIST ======
    # Adicionar coluna
    op.add_column('waitlist', sa.Column('client_crm_id', sa.Integer(), nullable=True))
    
    # Criar FK
    op.create_foreign_key(
        'fk_waitlist_client_crm',
        'waitlist',
        'clients',
        ['client_crm_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Criar indice
    op.create_index('ix_waitlist_client_crm_id', 'waitlist', ['client_crm_id'])


def downgrade() -> None:
    """
    Remove client_crm_id de appointments, reviews e waitlist.
    """
    
    # ====== WAITLIST ======
    op.drop_index('ix_waitlist_client_crm_id', table_name='waitlist')
    op.drop_constraint('fk_waitlist_client_crm', 'waitlist', type_='foreignkey')
    op.drop_column('waitlist', 'client_crm_id')
    
    # ====== REVIEWS ======
    op.drop_index('ix_reviews_client_crm_id', table_name='reviews')
    op.drop_constraint('fk_reviews_client_crm', 'reviews', type_='foreignkey')
    op.drop_column('reviews', 'client_crm_id')
    
    # ====== APPOINTMENTS ======
    op.drop_index('idx_appointments_company_client_crm', table_name='appointments')
    op.drop_index('ix_appointments_client_crm_id', table_name='appointments')
    op.drop_constraint('fk_appointments_client_crm', 'appointments', type_='foreignkey')
    op.drop_column('appointments', 'client_crm_id')
