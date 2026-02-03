"""create_leads_table

Revision ID: b1c2d3e4f5a6
Revises: a3f4c9d2e1b0
Create Date: 2026-01-15 21:45:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5a6'
down_revision = 'a3f4c9d2e1b0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'leads',
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('created_by_user_id', sa.Integer(), nullable=True),
        sa.Column('converted_client_id', sa.Integer(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('whatsapp', sa.String(length=20), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=True),
        sa.Column('stage', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('wa_chat_title', sa.String(length=255), nullable=True),
        sa.Column('wa_last_message', sa.Text(), nullable=True),
        sa.Column('wa_url', sa.String(length=500), nullable=True),
        sa.Column('raw_payload', sa.JSON(), nullable=True),
        sa.Column('is_converted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['converted_client_id'], ['clients.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_index(op.f('ix_leads_id'), 'leads', ['id'], unique=False)
    op.create_index(op.f('ix_leads_company_id'), 'leads', ['company_id'], unique=False)
    op.create_index(op.f('ix_leads_full_name'), 'leads', ['full_name'], unique=False)
    op.create_index(op.f('ix_leads_email'), 'leads', ['email'], unique=False)
    op.create_index(op.f('ix_leads_phone'), 'leads', ['phone'], unique=False)
    op.create_index(op.f('ix_leads_whatsapp'), 'leads', ['whatsapp'], unique=False)
    op.create_index(op.f('ix_leads_status'), 'leads', ['status'], unique=False)
    op.create_index(op.f('ix_leads_stage'), 'leads', ['stage'], unique=False)
    op.create_index(op.f('ix_leads_is_converted'), 'leads', ['is_converted'], unique=False)

    # Enable RLS and create tenant isolation policy
    op.execute('ALTER TABLE leads ENABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE leads FORCE ROW LEVEL SECURITY;')

    op.execute(
        """
        DROP POLICY IF EXISTS leads_tenant_isolation ON leads;
        CREATE POLICY leads_tenant_isolation ON leads
            USING (
                company_id = COALESCE(
                    NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER,
                    -1
                )
            )
            WITH CHECK (
                company_id = COALESCE(
                    NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER,
                    -1
                )
            );
        """
    )


def downgrade() -> None:
    op.execute('DROP POLICY IF EXISTS leads_tenant_isolation ON leads;')
    op.execute('ALTER TABLE leads DISABLE ROW LEVEL SECURITY;')

    op.drop_index(op.f('ix_leads_is_converted'), table_name='leads')
    op.drop_index(op.f('ix_leads_stage'), table_name='leads')
    op.drop_index(op.f('ix_leads_status'), table_name='leads')
    op.drop_index(op.f('ix_leads_whatsapp'), table_name='leads')
    op.drop_index(op.f('ix_leads_phone'), table_name='leads')
    op.drop_index(op.f('ix_leads_email'), table_name='leads')
    op.drop_index(op.f('ix_leads_full_name'), table_name='leads')
    op.drop_index(op.f('ix_leads_company_id'), table_name='leads')
    op.drop_index(op.f('ix_leads_id'), table_name='leads')

    op.drop_table('leads')
