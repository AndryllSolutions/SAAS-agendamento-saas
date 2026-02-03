"""Add client-user link (clients.user_id)

Revision ID: 005_add_client_user_link
Revises: 004_add_product_images
Create Date: 2025-12-03 00:00:00.000000

Esta migration adiciona a ponte entre clients (CRM) e users (autenticacao).
Um cliente do CRM pode opcionalmente ter um usuario com login associado.

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_client_user_link'
down_revision = '004_add_product_images'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Adiciona campo user_id em clients para vincular com users.
    
    Regra de negocio:
    - Um client pode ter um user associado (cliente com login)
    - Um user com role CLIENT pode ter um client_crm associado
    - A ligacao e opcional (nullable=True)
    - Se o user for deletado, user_id vira NULL (SET NULL)
    """
    # Adicionar coluna user_id em clients
    op.add_column('clients', sa.Column('user_id', sa.Integer(), nullable=True))
    
    # Criar FK para users
    op.create_foreign_key(
        'fk_clients_user',  # Nome da constraint
        'clients',  # Tabela fonte
        'users',  # Tabela destino
        ['user_id'],  # Coluna fonte
        ['id'],  # Coluna destino
        ondelete='SET NULL'  # Se user for deletado, limpa user_id
    )
    
    # Criar indice simples em user_id
    op.create_index('ix_clients_user_id', 'clients', ['user_id'])
    
    # Criar constraint unique (um user so pode ter um client)
    op.create_unique_constraint('uq_clients_user_id', 'clients', ['user_id'])


def downgrade() -> None:
    """
    Remove o vinculo user_id de clients.
    """
    # Remover constraint unique
    op.drop_constraint('uq_clients_user_id', 'clients', type_='unique')
    
    # Remover indice
    op.drop_index('ix_clients_user_id', table_name='clients')
    
    # Remover FK
    op.drop_constraint('fk_clients_user', 'clients', type_='foreignkey')
    
    # Remover coluna
    op.drop_column('clients', 'user_id')
