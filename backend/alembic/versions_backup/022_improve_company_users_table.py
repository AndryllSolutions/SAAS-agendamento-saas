"""
Improve company_users table structure

Revision ID: 022_improve_company_users_table
Revises: 021_add_commission_config_and_financial_fields
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

This migration:
1. Creates company_role enum type
2. Converts role column from String to enum
3. Adds audit fields (invited_by_id, invited_at, joined_at, last_active_at)
4. Adds status field (is_active)
5. Adds notes field
6. Adds unique constraint on (user_id, company_id)
7. Adds indexes for better performance
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '022_improve_company_users_table'
down_revision = '021_add_commission_config_and_financial_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # 1. Create company_role enum type
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE company_role AS ENUM (
                'COMPANY_OWNER',
                'COMPANY_MANAGER',
                'COMPANY_OPERATOR',
                'COMPANY_PROFESSIONAL',
                'COMPANY_RECEPTIONIST',
                'COMPANY_FINANCE',
                'COMPANY_CLIENT',
                'COMPANY_READ_ONLY'
            );
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # 2. Check current table structure
    company_users_columns = {col['name']: col for col in inspector.get_columns('company_users')}
    company_users_indexes = [idx['name'] for idx in inspector.get_indexes('company_users')]
    company_users_constraints = [c['name'] for c in inspector.get_unique_constraints('company_users')]
    
    # 3. Add new columns if they don't exist
    with op.batch_alter_table("company_users", schema=None) as batch_op:
        # Add status field
        if 'is_active' not in company_users_columns:
            batch_op.add_column(sa.Column("is_active", sa.String(length=20), nullable=False, server_default='active'))
        
        # Add audit fields
        if 'invited_by_id' not in company_users_columns:
            batch_op.add_column(sa.Column("invited_by_id", sa.Integer(), nullable=True))
            # Add foreign key constraint
            batch_op.create_foreign_key(
                "fk_company_users_invited_by",
                "users",
                ["invited_by_id"],
                ["id"],
                ondelete="SET NULL"
            )
        
        if 'invited_at' not in company_users_columns:
            batch_op.add_column(sa.Column("invited_at", sa.DateTime(), nullable=True))
        
        if 'joined_at' not in company_users_columns:
            batch_op.add_column(sa.Column("joined_at", sa.DateTime(), nullable=True))
        
        if 'last_active_at' not in company_users_columns:
            batch_op.add_column(sa.Column("last_active_at", sa.DateTime(), nullable=True))
        
        # Add notes field
        if 'notes' not in company_users_columns:
            batch_op.add_column(sa.Column("notes", sa.String(length=500), nullable=True))
    
    # 4. Migrate existing role values to match enum values
    # Map old role values to new enum values
    role_mapping = {
        'OWNER': 'COMPANY_OWNER',
        'MANAGER': 'COMPANY_MANAGER',
        'PROFESSIONAL': 'COMPANY_PROFESSIONAL',
        'RECEPTIONIST': 'COMPANY_RECEPTIONIST',
        'FINANCE': 'COMPANY_FINANCE',
        'CLIENT': 'COMPANY_CLIENT',
        'READ_ONLY': 'COMPANY_READ_ONLY',
        'OPERATOR': 'COMPANY_OPERATOR',
    }
    
    # Update role values to match enum
    for old_role, new_role in role_mapping.items():
        op.execute(f"""
            UPDATE company_users 
            SET role = '{new_role}' 
            WHERE role = '{old_role}'
        """)
    
    # Set default for any unmapped roles
    op.execute("""
        UPDATE company_users 
        SET role = 'COMPANY_OWNER' 
        WHERE role NOT IN (
            'COMPANY_OWNER', 'COMPANY_MANAGER', 'COMPANY_OPERATOR',
            'COMPANY_PROFESSIONAL', 'COMPANY_RECEPTIONIST', 'COMPANY_FINANCE',
            'COMPANY_CLIENT', 'COMPANY_READ_ONLY'
        )
    """)
    
    # 5. Convert role column to enum type
    # First, create a temporary column with enum type
    op.execute("""
        ALTER TABLE company_users 
        ADD COLUMN role_new company_role;
    """)
    
    # Copy data to new column
    op.execute("""
        UPDATE company_users 
        SET role_new = role::company_role;
    """)
    
    # Drop old column and rename new one
    op.execute("""
        ALTER TABLE company_users 
        DROP COLUMN role;
    """)
    
    op.execute("""
        ALTER TABLE company_users 
        RENAME COLUMN role_new TO role;
    """)
    
    # Set NOT NULL and default
    op.execute("""
        ALTER TABLE company_users 
        ALTER COLUMN role SET NOT NULL,
        ALTER COLUMN role SET DEFAULT 'COMPANY_OWNER'::company_role;
    """)
    
    # 6. Add unique constraint on (user_id, company_id) if it doesn't exist
    if 'uq_company_users_user_company' not in company_users_constraints:
        # First, remove any duplicate entries (keep the most recent one)
        op.execute("""
            DELETE FROM company_users cu1
            WHERE EXISTS (
                SELECT 1 FROM company_users cu2
                WHERE cu2.user_id = cu1.user_id
                AND cu2.company_id = cu1.company_id
                AND cu2.id > cu1.id
            );
        """)
        
        # Now add the unique constraint
        op.create_unique_constraint(
            'uq_company_users_user_company',
            'company_users',
            ['user_id', 'company_id']
        )
    
    # 7. Add indexes for better performance
    with op.batch_alter_table("company_users", schema=None) as batch_op:
        if 'ix_company_users_role' not in company_users_indexes:
            batch_op.create_index("ix_company_users_role", ["role"], unique=False)
        
        if 'ix_company_users_is_active' not in company_users_indexes:
            batch_op.create_index("ix_company_users_is_active", ["is_active"], unique=False)
        
        if 'ix_company_users_invited_by_id' not in company_users_indexes:
            batch_op.create_index("ix_company_users_invited_by_id", ["invited_by_id"], unique=False)
    
    # 8. Set joined_at for existing active memberships
    op.execute("""
        UPDATE company_users 
        SET joined_at = created_at 
        WHERE joined_at IS NULL AND is_active = 'active'
    """)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    company_users_indexes = [idx['name'] for idx in inspector.get_indexes('company_users')]
    
    # 1. Convert role back to String
    op.execute("""
        ALTER TABLE company_users 
        ADD COLUMN role_old VARCHAR(50);
    """)
    
    op.execute("""
        UPDATE company_users 
        SET role_old = role::text;
    """)
    
    op.execute("""
        ALTER TABLE company_users 
        DROP COLUMN role;
    """)
    
    op.execute("""
        ALTER TABLE company_users 
        RENAME COLUMN role_old TO role;
    """)
    
    op.execute("""
        ALTER TABLE company_users 
        ALTER COLUMN role SET NOT NULL,
        ALTER COLUMN role SET DEFAULT 'OWNER';
    """)
    
    # 2. Remove indexes
    with op.batch_alter_table("company_users", schema=None) as batch_op:
        if 'ix_company_users_invited_by_id' in company_users_indexes:
            batch_op.drop_index("ix_company_users_invited_by_id")
        if 'ix_company_users_is_active' in company_users_indexes:
            batch_op.drop_index("ix_company_users_is_active")
        if 'ix_company_users_role' in company_users_indexes:
            batch_op.drop_index("ix_company_users_role")
    
    # 3. Remove unique constraint
    try:
        op.drop_constraint('uq_company_users_user_company', 'company_users', type_='unique')
    except Exception:
        pass
    
    # 4. Remove foreign key constraint for invited_by_id
    try:
        op.drop_constraint('fk_company_users_invited_by', 'company_users', type_='foreignkey')
    except Exception:
        pass
    
    # 5. Remove new columns
    with op.batch_alter_table("company_users", schema=None) as batch_op:
        batch_op.drop_column("notes")
        batch_op.drop_column("last_active_at")
        batch_op.drop_column("joined_at")
        batch_op.drop_column("invited_at")
        batch_op.drop_column("invited_by_id")
        batch_op.drop_column("is_active")
    
    # 6. Drop enum type (only if no other tables use it)
    op.execute("""
        DO $$ BEGIN
            DROP TYPE IF EXISTS company_role;
        EXCEPTION
            WHEN undefined_object THEN null;
        END $$;
    """)

