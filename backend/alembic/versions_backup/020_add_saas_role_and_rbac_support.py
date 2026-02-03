"""
Add saas_role to users table and create initial SAAS_OWNER user

Revision ID: 020_add_saas_role_and_rbac_support
Revises: 019_add_company_subscription_and_company_user
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

This migration:
1. Adds saas_role column to users table (nullable)
2. Makes company_id nullable (SaaS admins may not belong to a company)
3. Creates initial SAAS_OWNER user (root@seusaas.com)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
from passlib.context import CryptContext

# Password hasher for creating SAAS_OWNER user
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# revision identifiers, used by Alembic.
revision = '020_add_saas_role_and_rbac_support'
down_revision = '019_add_company_subscription_and_company_user'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Make company_id nullable (SaaS admins may not belong to a company)
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column(
            "company_id",
            existing_type=sa.Integer(),
            nullable=True,
            existing_nullable=False
        )
    
    # 2. Add saas_role column
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("saas_role", sa.String(length=50), nullable=True))
        batch_op.create_index("ix_users_saas_role", ["saas_role"], unique=False)
    
    # 3. Create initial SAAS_OWNER user
    # Check if user already exists
    conn = op.get_bind()
    result = conn.execute(text("SELECT id FROM users WHERE email = 'root@seusaas.com'"))
    existing_user = result.fetchone()
    
    if not existing_user:
        # Hash password for SAAS_OWNER (default password: "ChangeMe123!")
        # IMPORTANT: User should change this password immediately after first login
        password_hash = pwd_context.hash("ChangeMe123!")
        
        # Insert SAAS_OWNER user
        conn.execute(text("""
            INSERT INTO users (
                email, password_hash, full_name, role, saas_role, 
                is_active, is_verified, company_id, created_at, updated_at
            ) VALUES (
                'root@seusaas.com',
                :password_hash,
                'SaaS Owner',
                'SAAS_ADMIN',
                'SAAS_OWNER',
                true,
                true,
                NULL,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
        """), {"password_hash": password_hash})
        
        print("✅ Usuário SAAS_OWNER criado: root@seusaas.com")
        print("⚠️  IMPORTANTE: Altere a senha padrão 'ChangeMe123!' após o primeiro login!")
    else:
        print("ℹ️  Usuário root@seusaas.com já existe, pulando criação")


def downgrade() -> None:
    # Remove saas_role column
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index("ix_users_saas_role")
        batch_op.drop_column("saas_role")
    
    # Make company_id NOT NULL again (this may fail if there are NULL values)
    # First, set NULL company_ids to a default company or delete those users
    conn = op.get_bind()
    conn.execute(text("""
        UPDATE users 
        SET company_id = (SELECT id FROM companies LIMIT 1)
        WHERE company_id IS NULL
    """))
    
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.alter_column(
            "company_id",
            existing_type=sa.Integer(),
            nullable=False,
            existing_nullable=True
        )
    
    # Delete SAAS_OWNER user if exists
    conn.execute(text("DELETE FROM users WHERE email = 'root@seusaas.com'"))

