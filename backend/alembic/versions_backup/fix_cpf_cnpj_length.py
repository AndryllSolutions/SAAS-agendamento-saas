"""Fix CPF and CNPJ length in clients, companies and users

Revision ID: fix_cpf_cnpj_length
Revises: previous_migration
Create Date: 2025-12-11 19:20:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_cpf_cnpj_length'
down_revision = None  # Ajuste para o hash da última migration
branch_labels = None
depends_on = None


def upgrade():
    """
    Aumenta o tamanho dos campos CPF e CNPJ para acomodar diferentes formatações
    
    CPF: 11 dígitos (12345678901) ou formatado (123.456.789-01) = até 14 caracteres
         Aumentando para 20 para segurança
    
    CNPJ: 14 dígitos ou formatado (12.345.678/0001-90) = até 18 caracteres
          Aumentando para 20 para segurança
    """
    
    # Fix in clients table
    with op.batch_alter_table('clients', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(14),
                              type_=sa.String(20),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(18),
                              type_=sa.String(20),
                              existing_nullable=True)
    
    # Fix in companies table
    with op.batch_alter_table('companies', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(14),
                              type_=sa.String(20),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(18),
                              type_=sa.String(20),
                              existing_nullable=True)
    
    # Fix in suppliers table
    with op.batch_alter_table('suppliers', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(14),
                              type_=sa.String(20),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(18),
                              type_=sa.String(20),
                              existing_nullable=True)


def downgrade():
    """Revert changes"""
    
    # Revert clients table
    with op.batch_alter_table('clients', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(20),
                              type_=sa.String(14),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(20),
                              type_=sa.String(18),
                              existing_nullable=True)
    
    # Revert companies table
    with op.batch_alter_table('companies', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(20),
                              type_=sa.String(14),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(20),
                              type_=sa.String(18),
                              existing_nullable=True)
    
    # Revert suppliers table
    with op.batch_alter_table('suppliers', schema=None) as batch_op:
        batch_op.alter_column('cpf',
                              existing_type=sa.String(20),
                              type_=sa.String(14),
                              existing_nullable=True)
        batch_op.alter_column('cnpj',
                              existing_type=sa.String(20),
                              type_=sa.String(18),
                              existing_nullable=True)

