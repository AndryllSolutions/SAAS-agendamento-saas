"""Initial migration with all models

Revision ID: 001_initial
Revises: 
Create Date: 2025-01-27 22:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = '000_create_users'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create companies table first (if doesn't exist)
    op.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            website VARCHAR(255),
            address VARCHAR(500),
            address_number VARCHAR(20),
            address_complement VARCHAR(100),
            neighborhood VARCHAR(100),
            city VARCHAR(100),
            state VARCHAR(2),
            country VARCHAR(100),
            postal_code VARCHAR(20),
            company_type VARCHAR(20),
            cpf VARCHAR(14),
            cnpj VARCHAR(18),
            trade_name VARCHAR(255),
            municipal_registration VARCHAR(50),
            state_registration VARCHAR(50),
            whatsapp VARCHAR(20),
            business_hours JSONB,
            timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
            currency VARCHAR(3) DEFAULT 'BRL',
            logo_url VARCHAR(500),
            subscription_plan VARCHAR(20) DEFAULT 'BASIC',
            subscription_expires_at TIMESTAMP,
            is_active BOOLEAN DEFAULT true,
            online_booking_enabled BOOLEAN,
            online_booking_url VARCHAR(255),
            online_booking_description TEXT,
            online_booking_gallery JSONB,
            online_booking_social_media JSONB
        );
        CREATE INDEX IF NOT EXISTS ix_companies_slug ON companies(slug);
        CREATE INDEX IF NOT EXISTS ix_companies_name ON companies(name);
        CREATE INDEX IF NOT EXISTS ix_companies_cnpj ON companies(cnpj);
    """)
    
    # Add foreign key from users to companies (if users table exists from previous migration)
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
                -- Add foreign key constraint if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'users_company_id_fkey' 
                    AND table_name = 'users'
                ) THEN
                    ALTER TABLE users 
                    ADD CONSTRAINT users_company_id_fkey 
                    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
                END IF;
            END IF;
        END $$;
    """)
    
    # NOTE: UserRole enum já foi criado na migration 000_create_users com os valores corretos
    # Não é necessário alterar o ENUM aqui, pois os valores já estão alinhados com o model
    # ('SAAS_ADMIN', 'OWNER', 'MANAGER', 'PROFESSIONAL', 'RECEPTIONIST', 'FINANCE', 'CLIENT', 'READ_ONLY', 'STAFF')
    
    # Clients table
    op.create_table('clients',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('nickname', sa.String(length=100), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('cellphone', sa.String(length=20), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('cpf', sa.String(length=14), nullable=True),
        sa.Column('cnpj', sa.String(length=18), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('address_number', sa.String(length=20), nullable=True),
        sa.Column('address_complement', sa.String(length=100), nullable=True),
        sa.Column('neighborhood', sa.String(length=100), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=2), nullable=True),
        sa.Column('zip_code', sa.String(length=10), nullable=True),
        sa.Column('credits', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('marketing_whatsapp', sa.Boolean(), nullable=True),
        sa.Column('marketing_email', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clients_company_id'), 'clients', ['company_id'], unique=False)
    op.create_index(op.f('ix_clients_full_name'), 'clients', ['full_name'], unique=False)
    op.create_index(op.f('ix_clients_email'), 'clients', ['email'], unique=False)
    op.create_index(op.f('ix_clients_phone'), 'clients', ['phone'], unique=False)
    op.create_index(op.f('ix_clients_cellphone'), 'clients', ['cellphone'], unique=False)
    op.create_index(op.f('ix_clients_cpf'), 'clients', ['cpf'], unique=False)
    op.create_index(op.f('ix_clients_is_active'), 'clients', ['is_active'], unique=False)
    
    # Brands table
    op.create_table('brands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_brands_company_id'), 'brands', ['company_id'], unique=False)
    op.create_index(op.f('ix_brands_name'), 'brands', ['name'], unique=False)
    
    # Product Categories table
    op.create_table('product_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_categories_company_id'), 'product_categories', ['company_id'], unique=False)
    op.create_index(op.f('ix_product_categories_name'), 'product_categories', ['name'], unique=False)
    
    # Products table
    op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('stock_current', sa.Integer(), nullable=True),
        sa.Column('stock_minimum', sa.Integer(), nullable=True),
        sa.Column('unit', sa.String(length=20), nullable=True),
        sa.Column('cost_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('sale_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('commission_percentage', sa.Integer(), nullable=True),
        sa.Column('barcode', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['category_id'], ['product_categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_company_id'), 'products', ['company_id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index(op.f('ix_products_barcode'), 'products', ['barcode'], unique=False)
    op.create_index(op.f('ix_products_is_active'), 'products', ['is_active'], unique=False)
    
    # Service Categories table
    op.create_table('service_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_service_categories_company_id'), 'service_categories', ['company_id'], unique=False)
    op.create_index(op.f('ix_service_categories_name'), 'service_categories', ['name'], unique=False)
    
    # Services table
    op.create_table('services',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('requires_professional', sa.Boolean(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('commission_rate', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_services_company_id'), 'services', ['company_id'], unique=False)
    op.create_index(op.f('ix_services_name'), 'services', ['name'], unique=False)
    op.create_index(op.f('ix_services_is_active'), 'services', ['is_active'], unique=False)
    
    # Commands table
    op.create_table('commands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        sa.Column('number', sa.String(length=50), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.Enum('OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED', name='commandstatus'), nullable=False),
        sa.Column('total_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('net_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('payment_summary', sa.String(length=255), nullable=True),
        sa.Column('payment_blocked', sa.Boolean(), nullable=True),
        sa.Column('payment_received', sa.Boolean(), nullable=True),
        sa.Column('has_nfse', sa.Boolean(), nullable=True),
        sa.Column('has_nfe', sa.Boolean(), nullable=True),
        sa.Column('has_nfce', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_commands_company_id'), 'commands', ['company_id'], unique=False)
    op.create_index(op.f('ix_commands_client_id'), 'commands', ['client_id'], unique=False)
    op.create_index(op.f('ix_commands_professional_id'), 'commands', ['professional_id'], unique=False)
    op.create_index(op.f('ix_commands_number'), 'commands', ['number'], unique=False)
    op.create_index(op.f('ix_commands_date'), 'commands', ['date'], unique=False)
    op.create_index(op.f('ix_commands_status'), 'commands', ['status'], unique=False)
    
    # Command Items table
    op.create_table('command_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('command_id', sa.Integer(), nullable=False),
        sa.Column('item_type', sa.Enum('SERVICE', 'PRODUCT', 'PACKAGE', name='commanditemtype'), nullable=False),
        sa.Column('reference_id', sa.Integer(), nullable=False),
        sa.Column('service_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('package_id', sa.Integer(), nullable=True),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('unit_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('commission_percentage', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_command_items_command_id'), 'command_items', ['command_id'], unique=False)
    
    # Predefined Packages table
    op.create_table('predefined_packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('services_included', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('validity_days', sa.Integer(), nullable=False),
        sa.Column('total_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_predefined_packages_company_id'), 'predefined_packages', ['company_id'], unique=False)
    op.create_index(op.f('ix_predefined_packages_name'), 'predefined_packages', ['name'], unique=False)
    
    # Packages table
    op.create_table('packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('predefined_package_id', sa.Integer(), nullable=False),
        sa.Column('sale_date', sa.DateTime(), nullable=False),
        sa.Column('expiry_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'EXPIRED', 'EXHAUSTED', name='packagestatus'), nullable=False),
        sa.Column('sessions_balance', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('paid_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['predefined_package_id'], ['predefined_packages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_packages_company_id'), 'packages', ['company_id'], unique=False)
    op.create_index(op.f('ix_packages_client_id'), 'packages', ['client_id'], unique=False)
    op.create_index(op.f('ix_packages_expiry_date'), 'packages', ['expiry_date'], unique=False)
    op.create_index(op.f('ix_packages_status'), 'packages', ['status'], unique=False)
    
    # Anamnesis Models table
    op.create_table('anamnesis_models',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('fields', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('related_services', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_anamnesis_models_company_id'), 'anamnesis_models', ['company_id'], unique=False)
    op.create_index(op.f('ix_anamnesis_models_name'), 'anamnesis_models', ['name'], unique=False)
    
    # Anamneses table
    op.create_table('anamneses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        sa.Column('model_id', sa.Integer(), nullable=False),
        sa.Column('responses', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('is_signed', sa.Boolean(), nullable=True),
        sa.Column('signature_date', sa.DateTime(), nullable=True),
        sa.Column('signature_image_url', sa.String(length=500), nullable=True),
        sa.Column('signature_name', sa.String(length=255), nullable=True),
        sa.Column('signature_ip', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['model_id'], ['anamnesis_models.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_anamneses_company_id'), 'anamneses', ['company_id'], unique=False)
    op.create_index(op.f('ix_anamneses_client_id'), 'anamneses', ['client_id'], unique=False)
    op.create_index(op.f('ix_anamneses_status'), 'anamneses', ['status'], unique=False)
    
    # Suppliers table
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('cellphone', sa.String(length=20), nullable=True),
        sa.Column('cpf', sa.String(length=14), nullable=True),
        sa.Column('cnpj', sa.String(length=18), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('address_number', sa.String(length=20), nullable=True),
        sa.Column('address_complement', sa.String(length=100), nullable=True),
        sa.Column('neighborhood', sa.String(length=100), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=2), nullable=True),
        sa.Column('zip_code', sa.String(length=10), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_suppliers_company_id'), 'suppliers', ['company_id'], unique=False)
    op.create_index(op.f('ix_suppliers_name'), 'suppliers', ['name'], unique=False)
    op.create_index(op.f('ix_suppliers_cnpj'), 'suppliers', ['cnpj'], unique=False)
    
    # Purchases table
    op.create_table('purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=False),
        sa.Column('number', sa.String(length=50), nullable=False),
        sa.Column('purchase_date', sa.DateTime(), nullable=False),
        sa.Column('total_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('status', sa.Enum('OPEN', 'FINISHED', 'CANCELLED', name='purchasestatus'), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('xml_imported', sa.Boolean(), nullable=True),
        sa.Column('xml_url', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchases_company_id'), 'purchases', ['company_id'], unique=False)
    op.create_index(op.f('ix_purchases_supplier_id'), 'purchases', ['supplier_id'], unique=False)
    op.create_index(op.f('ix_purchases_number'), 'purchases', ['number'], unique=False)
    op.create_index(op.f('ix_purchases_purchase_date'), 'purchases', ['purchase_date'], unique=False)
    op.create_index(op.f('ix_purchases_status'), 'purchases', ['status'], unique=False)
    
    # Purchase Items table
    op.create_table('purchase_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('purchase_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_cost', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('total_cost', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['purchase_id'], ['purchases.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_items_purchase_id'), 'purchase_items', ['purchase_id'], unique=False)
    
    # Financial Accounts table
    op.create_table('financial_accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('admin_only', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_accounts_company_id'), 'financial_accounts', ['company_id'], unique=False)
    op.create_index(op.f('ix_financial_accounts_name'), 'financial_accounts', ['name'], unique=False)
    
    # Payment Forms table
    op.create_table('payment_forms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('integrates_with_gateway', sa.Boolean(), nullable=True),
        sa.Column('gateway_name', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_forms_company_id'), 'payment_forms', ['company_id'], unique=False)
    op.create_index(op.f('ix_payment_forms_name'), 'payment_forms', ['name'], unique=False)
    
    # Financial Categories table
    op.create_table('financial_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_id'], ['financial_categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_categories_company_id'), 'financial_categories', ['company_id'], unique=False)
    op.create_index(op.f('ix_financial_categories_name'), 'financial_categories', ['name'], unique=False)
    
    # Financial Transactions table
    op.create_table('financial_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('origin', sa.String(length=50), nullable=False),
        sa.Column('command_id', sa.Integer(), nullable=True),
        sa.Column('purchase_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['financial_accounts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['category_id'], ['financial_categories.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['purchase_id'], ['purchases.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_financial_transactions_company_id'), 'financial_transactions', ['company_id'], unique=False)
    op.create_index(op.f('ix_financial_transactions_type'), 'financial_transactions', ['type'], unique=False)
    op.create_index(op.f('ix_financial_transactions_date'), 'financial_transactions', ['date'], unique=False)
    op.create_index(op.f('ix_financial_transactions_status'), 'financial_transactions', ['status'], unique=False)
    
    # Cash Registers table
    op.create_table('cash_registers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('opening_date', sa.DateTime(), nullable=False),
        sa.Column('opening_balance', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('closing_date', sa.DateTime(), nullable=True),
        sa.Column('closing_balance', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('payment_summary', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_open', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cash_registers_company_id'), 'cash_registers', ['company_id'], unique=False)
    op.create_index(op.f('ix_cash_registers_opening_date'), 'cash_registers', ['opening_date'], unique=False)
    op.create_index(op.f('ix_cash_registers_is_open'), 'cash_registers', ['is_open'], unique=False)
    
    # Commissions table
    op.create_table('commissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('command_id', sa.Integer(), nullable=False),
        sa.Column('command_item_id', sa.Integer(), nullable=True),
        sa.Column('professional_id', sa.Integer(), nullable=False),
        sa.Column('base_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('commission_percentage', sa.Integer(), nullable=False),
        sa.Column('commission_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PAID', 'CANCELLED', name='commissionstatus'), nullable=False),
        sa.Column('paid_at', sa.DateTime(), nullable=True),
        sa.Column('payment_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['command_item_id'], ['command_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_commissions_company_id'), 'commissions', ['company_id'], unique=False)
    op.create_index(op.f('ix_commissions_command_id'), 'commissions', ['command_id'], unique=False)
    op.create_index(op.f('ix_commissions_professional_id'), 'commissions', ['professional_id'], unique=False)
    op.create_index(op.f('ix_commissions_status'), 'commissions', ['status'], unique=False)
    
    # Goals table
    op.create_table('goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.Enum('REVENUE', 'APPOINTMENTS', 'PRODUCT_SALES', 'SERVICES', 'OTHER', name='goaltype'), nullable=False),
        sa.Column('target_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('period_start', sa.DateTime(), nullable=False),
        sa.Column('period_end', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('current_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('progress_percentage', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_goals_company_id'), 'goals', ['company_id'], unique=False)
    op.create_index(op.f('ix_goals_professional_id'), 'goals', ['professional_id'], unique=False)
    op.create_index(op.f('ix_goals_type'), 'goals', ['type'], unique=False)
    op.create_index(op.f('ix_goals_period_start'), 'goals', ['period_start'], unique=False)
    op.create_index(op.f('ix_goals_period_end'), 'goals', ['period_end'], unique=False)
    op.create_index(op.f('ix_goals_is_active'), 'goals', ['is_active'], unique=False)
    
    # Cashback Rules table
    op.create_table('cashback_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('rule_type', sa.Enum('PERCENTAGE', 'FIXED', name='cashbackruletype'), nullable=False),
        sa.Column('value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('applies_to_products', sa.Boolean(), nullable=True),
        sa.Column('applies_to_services', sa.Boolean(), nullable=True),
        sa.Column('specific_items', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('client_filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('valid_from', sa.DateTime(), nullable=True),
        sa.Column('valid_until', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cashback_rules_company_id'), 'cashback_rules', ['company_id'], unique=False)
    op.create_index(op.f('ix_cashback_rules_name'), 'cashback_rules', ['name'], unique=False)
    
    # Cashback Balances table
    op.create_table('cashback_balances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('balance', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('client_id')
    )
    op.create_index(op.f('ix_cashback_balances_company_id'), 'cashback_balances', ['company_id'], unique=False)
    op.create_index(op.f('ix_cashback_balances_client_id'), 'cashback_balances', ['client_id'], unique=True)
    
    # Cashback Transactions table
    op.create_table('cashback_transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('balance_id', sa.Integer(), nullable=False),
        sa.Column('rule_id', sa.Integer(), nullable=True),
        sa.Column('command_id', sa.Integer(), nullable=True),
        sa.Column('value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('transaction_type', sa.String(length=20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['balance_id'], ['cashback_balances.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rule_id'], ['cashback_rules.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cashback_transactions_company_id'), 'cashback_transactions', ['company_id'], unique=False)
    op.create_index(op.f('ix_cashback_transactions_balance_id'), 'cashback_transactions', ['balance_id'], unique=False)
    
    # Promotions table
    op.create_table('promotions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.Enum('DISCOUNT_PERCENTAGE', 'DISCOUNT_FIXED', 'BUY_ONE_GET_ONE', 'FREE_SERVICE', 'OTHER', name='promotiontype'), nullable=False),
        sa.Column('discount_value', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('applies_to_services', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('applies_to_products', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('applies_to_clients', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('valid_from', sa.DateTime(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('max_uses', sa.Integer(), nullable=True),
        sa.Column('max_uses_per_client', sa.Integer(), nullable=True),
        sa.Column('current_uses', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_promotions_company_id'), 'promotions', ['company_id'], unique=False)
    op.create_index(op.f('ix_promotions_name'), 'promotions', ['name'], unique=False)
    op.create_index(op.f('ix_promotions_valid_from'), 'promotions', ['valid_from'], unique=False)
    op.create_index(op.f('ix_promotions_valid_until'), 'promotions', ['valid_until'], unique=False)
    op.create_index(op.f('ix_promotions_is_active'), 'promotions', ['is_active'], unique=False)
    
    # Subscription Sale Models table
    op.create_table('subscription_sale_models',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('monthly_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('services_included', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('credits_included', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscription_sale_models_company_id'), 'subscription_sale_models', ['company_id'], unique=False)
    op.create_index(op.f('ix_subscription_sale_models_name'), 'subscription_sale_models', ['name'], unique=False)
    
    # Subscription Sales table
    op.create_table('subscription_sales',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('model_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', name='subscriptionsalestatus'), nullable=False),
        sa.Column('current_month_credits_used', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('current_month_services_used', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('last_payment_date', sa.DateTime(), nullable=True),
        sa.Column('next_payment_date', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['model_id'], ['subscription_sale_models.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscription_sales_company_id'), 'subscription_sales', ['company_id'], unique=False)
    op.create_index(op.f('ix_subscription_sales_client_id'), 'subscription_sales', ['client_id'], unique=False)
    op.create_index(op.f('ix_subscription_sales_start_date'), 'subscription_sales', ['start_date'], unique=False)
    op.create_index(op.f('ix_subscription_sales_next_payment_date'), 'subscription_sales', ['next_payment_date'], unique=False)
    op.create_index(op.f('ix_subscription_sales_status'), 'subscription_sales', ['status'], unique=False)
    
    # Document Templates table
    op.create_table('document_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('document_type', sa.String(length=50), nullable=False),
        sa.Column('template_content', sa.Text(), nullable=False),
        sa.Column('variables', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_templates_company_id'), 'document_templates', ['company_id'], unique=False)
    op.create_index(op.f('ix_document_templates_name'), 'document_templates', ['name'], unique=False)
    
    # Generated Documents table
    op.create_table('generated_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('command_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('file_url', sa.String(length=500), nullable=True),
        sa.Column('variables_used', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['document_templates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_generated_documents_company_id'), 'generated_documents', ['company_id'], unique=False)
    
    # Invoices table
    op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('command_id', sa.Integer(), nullable=True),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('invoice_type', sa.Enum('NFSE', 'NFE', 'NFCE', name='invoicetype'), nullable=False),
        sa.Column('number', sa.String(length=50), nullable=True),
        sa.Column('access_key', sa.String(length=50), nullable=True),
        sa.Column('provider', sa.String(length=50), nullable=True),
        sa.Column('provider_invoice_id', sa.String(length=255), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'GENERATED', 'SENT', 'CANCELLED', 'ERROR', name='invoicestatus'), nullable=False),
        sa.Column('total_value', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('issue_date', sa.DateTime(), nullable=True),
        sa.Column('sent_date', sa.DateTime(), nullable=True),
        sa.Column('xml_url', sa.String(length=500), nullable=True),
        sa.Column('pdf_url', sa.String(length=500), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('provider_response', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['command_id'], ['commands.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('access_key')
    )
    op.create_index(op.f('ix_invoices_company_id'), 'invoices', ['company_id'], unique=False)
    op.create_index(op.f('ix_invoices_invoice_type'), 'invoices', ['invoice_type'], unique=False)
    op.create_index(op.f('ix_invoices_number'), 'invoices', ['number'], unique=False)
    op.create_index(op.f('ix_invoices_status'), 'invoices', ['status'], unique=False)
    
    # Fiscal Configurations table
    op.create_table('fiscal_configurations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('nfse_provider', sa.String(length=50), nullable=True),
        sa.Column('nfe_provider', sa.String(length=50), nullable=True),
        sa.Column('nfce_provider', sa.String(length=50), nullable=True),
        sa.Column('provider_api_key', sa.String(length=255), nullable=True),
        sa.Column('provider_api_secret', sa.String(length=255), nullable=True),
        sa.Column('environment', sa.String(length=20), nullable=True),
        sa.Column('auto_generate_nfse', sa.Boolean(), nullable=True),
        sa.Column('auto_generate_nfe', sa.Boolean(), nullable=True),
        sa.Column('auto_generate_nfce', sa.Boolean(), nullable=True),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id')
    )
    op.create_index(op.f('ix_fiscal_configurations_company_id'), 'fiscal_configurations', ['company_id'], unique=True)
    
    # WhatsApp Providers table
    op.create_table('whatsapp_providers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('provider_name', sa.String(length=50), nullable=False),
        sa.Column('api_url', sa.String(length=500), nullable=False),
        sa.Column('api_key', sa.String(length=255), nullable=True),
        sa.Column('api_secret', sa.String(length=255), nullable=True),
        sa.Column('instance_id', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_connected', sa.Boolean(), nullable=True),
        sa.Column('settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id')
    )
    op.create_index(op.f('ix_whatsapp_providers_company_id'), 'whatsapp_providers', ['company_id'], unique=True)
    
    # WhatsApp Templates table
    op.create_table('whatsapp_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('available_variables', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_whatsapp_templates_company_id'), 'whatsapp_templates', ['company_id'], unique=False)
    op.create_index(op.f('ix_whatsapp_templates_name'), 'whatsapp_templates', ['name'], unique=False)
    
    # WhatsApp Campaigns table
    op.create_table('whatsapp_campaigns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('campaign_type', sa.Enum('BIRTHDAY', 'RECONQUER', 'REMINDER', 'CARE', 'RETURN', 'INFORMED', 'WELCOME', 'INVITE_ONLINE', 'CUSTOM', name='campaigntype'), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('auto_send_enabled', sa.Boolean(), nullable=True),
        sa.Column('schedule_config', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('client_filters', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED', name='campaignstatus'), nullable=False),
        sa.Column('total_sent', sa.Integer(), nullable=True),
        sa.Column('total_delivered', sa.Integer(), nullable=True),
        sa.Column('total_read', sa.Integer(), nullable=True),
        sa.Column('total_failed', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['whatsapp_templates.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_whatsapp_campaigns_company_id'), 'whatsapp_campaigns', ['company_id'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaigns_name'), 'whatsapp_campaigns', ['name'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaigns_campaign_type'), 'whatsapp_campaigns', ['campaign_type'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaigns_status'), 'whatsapp_campaigns', ['status'], unique=False)
    
    # WhatsApp Campaign Logs table
    op.create_table('whatsapp_campaign_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(length=20), nullable=False),
        sa.Column('message_content', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'ERROR', name='logstatus'), nullable=False),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('provider_response', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['whatsapp_campaigns.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_whatsapp_campaign_logs_company_id'), 'whatsapp_campaign_logs', ['company_id'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaign_logs_campaign_id'), 'whatsapp_campaign_logs', ['campaign_id'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaign_logs_client_id'), 'whatsapp_campaign_logs', ['client_id'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaign_logs_phone_number'), 'whatsapp_campaign_logs', ['phone_number'], unique=False)
    op.create_index(op.f('ix_whatsapp_campaign_logs_status'), 'whatsapp_campaign_logs', ['status'], unique=False)
    
    # Evaluations table
    op.create_table('evaluations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
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
        # Foreign key to appointments will be added later if table exists
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evaluations_company_id'), 'evaluations', ['company_id'], unique=False)
    op.create_index(op.f('ix_evaluations_client_id'), 'evaluations', ['client_id'], unique=False)
    op.create_index(op.f('ix_evaluations_professional_id'), 'evaluations', ['professional_id'], unique=False)


def downgrade() -> None:
    # Drop all new tables in reverse order
    op.drop_table('evaluations')
    op.drop_table('whatsapp_campaign_logs')
    op.drop_table('whatsapp_campaigns')
    op.drop_table('whatsapp_templates')
    op.drop_table('whatsapp_providers')
    op.drop_table('fiscal_configurations')
    op.drop_table('invoices')
    op.drop_table('generated_documents')
    op.drop_table('document_templates')
    op.drop_table('subscription_sales')
    op.drop_table('subscription_sale_models')
    op.drop_table('promotions')
    op.drop_table('cashback_transactions')
    op.drop_table('cashback_balances')
    op.drop_table('cashback_rules')
    op.drop_table('goals')
    op.drop_table('commissions')
    op.drop_table('cash_registers')
    op.drop_table('financial_transactions')
    op.drop_table('financial_categories')
    op.drop_table('payment_forms')
    op.drop_table('financial_accounts')
    op.drop_table('purchase_items')
    op.drop_table('purchases')
    op.drop_table('suppliers')
    op.drop_table('anamneses')
    op.drop_table('anamnesis_models')
    op.drop_table('packages')
    op.drop_table('predefined_packages')
    op.drop_table('command_items')
    op.drop_table('commands')
    op.drop_table('services')
    op.drop_table('service_categories')
    op.drop_table('products')
    op.drop_table('product_categories')
    op.drop_table('brands')
    op.drop_table('clients')
    
    # Remove columns from companies
    op.drop_column('companies', 'online_booking_social_media')
    op.drop_column('companies', 'online_booking_gallery')
    op.drop_column('companies', 'online_booking_description')
    op.drop_column('companies', 'online_booking_url')
    op.drop_column('companies', 'online_booking_enabled')
    op.drop_column('companies', 'subscription_expires_at')
    op.drop_column('companies', 'whatsapp')
    op.drop_column('companies', 'state_registration')
    op.drop_column('companies', 'municipal_registration')
    op.drop_column('companies', 'trade_name')
    op.drop_column('companies', 'cnpj')
    op.drop_column('companies', 'cpf')
    op.drop_column('companies', 'company_type')
    op.drop_column('companies', 'state')
    op.drop_column('companies', 'neighborhood')
    op.drop_column('companies', 'address_complement')
    op.drop_column('companies', 'address_number')

