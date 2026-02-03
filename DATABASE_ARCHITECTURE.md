# Database Architecture - Agendamento SaaS Multi-Tenant

## Overview
Banco de dados multi-tenant PostgreSQL com isolamento por empresa (row-level security), suporte a planos, add-ons, agendamentos e relações complexas entre clientes, serviços e profissionais.

## Stack Tecnológico

### Banco Principal
- **PostgreSQL 15**: Banco relacional principal
- **SQLAlchemy 2.0**: ORM Python com suporte a async
- **Alembic**: Sistema de migrations versionadas
- **Connection Pooling**: Otimização de conexões

### Cache e Sessões
- **Redis 7**: Cache de consultas frequentes
- **Session Store**: Armazenamento de sessões JWT
- **Rate Limiting**: Controle por IP/usuário

## Estrutura de Database

### Schema Principal: `agendamento`

#### 1. Core Tables (Sistema)

##### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### user_roles
```sql
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'owner', 'manager', 'professional', 'staff'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);
```

#### 2. Multi-Tenant (Empresas)

##### companies
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL identifier
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100), -- 'salao_beauty', 'clinica', 'spa'
    document VARCHAR(20), -- CNPJ/CPF
    phone VARCHAR(20),
    email VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    currency VARCHAR(3) DEFAULT 'BRL',
    logo_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'BR',
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### company_subscriptions
```sql
CREATE TABLE company_subscriptions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    plan_slug VARCHAR(50) NOT NULL REFERENCES plans(slug),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'trial', 'cancelled', 'expired'
    trial_end_date TIMESTAMP,
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
    price DECIMAL(10,2),
    next_billing_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### company_addons
```sql
CREATE TABLE company_addons (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    addon_id INTEGER REFERENCES add_ons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'trial', 'cancelled'
    trial_end_date TIMESTAMP,
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    price DECIMAL(10,2),
    next_billing_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, addon_id)
);
```

#### 3. Catálogo de Serviços

##### services
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    commission_percentage DECIMAL(5,2), -- % para profissional
    color VARCHAR(7), -- #HEX
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    requires_deposit BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    online_booking_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### service_categories
```sql
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Gestão de Clientes

##### clients
```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20), -- 'male', 'female', 'other'
    notes TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    preferred_contact VARCHAR(20) DEFAULT 'phone', -- 'phone', 'email', 'whatsapp'
    is_active BOOLEAN DEFAULT true,
    is_vip BOOLEAN DEFAULT false,
    source VARCHAR(50), -- 'instagram', 'indication', 'website'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### client_history
```sql
CREATE TABLE client_history (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    professional_id INTEGER REFERENCES users(id),
    command_id INTEGER REFERENCES commands(id),
    date TIMESTAMP NOT NULL,
    notes TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    satisfaction_rating INTEGER, -- 1-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Produtos e Estoque

##### products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100),
    barcode VARCHAR(50),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    current_stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 5,
    unit VARCHAR(20) DEFAULT 'un', -- 'un', 'ml', 'g'
    is_active BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### product_brands
```sql
CREATE TABLE product_brands (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Pedidos e Comandas

##### commands
```sql
CREATE TABLE commands (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    professional_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    total_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50), -- 'cash', 'card', 'pix', 'ticket'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'cancelled'
    notes TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### command_items
```sql
CREATE TABLE command_items (
    id SERIAL PRIMARY KEY,
    command_id INTEGER REFERENCES commands(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'service', 'product'
    item_id INTEGER NOT NULL, -- service_id ou product_id
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Pacotes de Serviços

##### packages
```sql
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    total_sessions INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    validity_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT true,
    can_be_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### package_services
```sql
CREATE TABLE package_services (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### client_packages
```sql
CREATE TABLE client_packages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES packages(id),
    total_sessions INTEGER NOT NULL,
    used_sessions INTEGER DEFAULT 0,
    remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'completed'
    payment_status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. Agendamentos

##### schedules
```sql
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    professional_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    notes TEXT,
    price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### schedule_availability
```sql
CREATE TABLE schedule_availability (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0-6 (Domingo-Sábado)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professional_id, day_of_week, start_time, end_time)
);
```

#### 9. Notificações

##### notifications
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'appointment', 'reminder', 'promotion', 'birthday'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL, -- 'email', 'whatsapp', 'sms', 'push'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB, -- Dados adicionais
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. Planos e Features

##### plans
```sql
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    price_min DECIMAL(10,2), -- Para planos variáveis (Scale)
    price_max DECIMAL(10,2),
    features JSONB NOT NULL, -- Lista de features
    limits JSONB NOT NULL, -- Limites quantitativos
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### add_ons
```sql
CREATE TABLE add_ons (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    addon_type VARCHAR(20) DEFAULT 'feature', -- 'feature', 'service', 'limit_override'
    config JSONB, -- Configurações específicas
    unlocks_features JSONB, -- Features que desbloqueia
    override_limits JSONB, -- Limites que sobrescreve
    icon VARCHAR(50), -- Ícone (lucide-react)
    color VARCHAR(7), -- Cor #HEX
    category VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    included_in_plans JSONB, -- Planos que já incluem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. Auditoria e Logs

##### audit_logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login'
    resource_type VARCHAR(50) NOT NULL, -- 'client', 'service', 'schedule'
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### global_settings
```sql
CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Se pode ser exposta na API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices de Performance

### Índices Primários
```sql
-- Multi-tenancy
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- Relacionamentos
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);
CREATE INDEX idx_clients_company ON clients(company_id);
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_schedules_company ON schedules(company_id);

-- Buscas
CREATE INDEX idx_clients_name ON clients(name, company_id);
CREATE INDEX idx_clients_email ON clients(email, company_id);
CREATE INDEX idx_services_name ON services(name, company_id);
CREATE INDEX idx_schedules_date ON schedules(date, company_id);
CREATE INDEX idx_schedules_status ON schedules(status, company_id);

-- Performance
CREATE INDEX idx_commands_status ON commands(status, company_id);
CREATE INDEX idx_notifications_status ON notifications(status, company_id);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at) WHERE status = 'pending';
```

### Índices Compostos
```sql
-- Agendamentos
CREATE INDEX idx_schedules_professional_date 
ON schedules(professional_id, date, status) 
WHERE status IN ('scheduled', 'confirmed');

-- Client History
CREATE INDEX idx_client_history_client_date 
ON client_history(client_id, date DESC);

-- Commands
CREATE INDEX idx_commands_client_status 
ON commands(client_id, status) 
WHERE status IN ('open', 'in_progress');
```

## Constraints e Relações

### Foreign Keys
```sql
-- Evitar dados órfãos
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE clients 
ADD CONSTRAINT fk_clients_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE schedules 
ADD CONSTRAINT fk_schedules_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
```

### Check Constraints
```sql
-- Validações de negócio
ALTER TABLE schedules 
ADD CONSTRAINT chk_schedule_time 
CHECK (end_time > start_time);

ALTER TABLE command_items 
ADD CONSTRAINT chk_command_item_quantity 
CHECK (quantity > 0);

ALTER TABLE client_packages 
ADD CONSTRAINT chk_remaining_sessions 
CHECK (remaining_sessions >= 0);
```

### Unique Constraints
```sql
-- Evitar duplicatas
ALTER TABLE companies 
ADD CONSTRAINT uk_companies_slug 
UNIQUE (slug);

ALTER TABLE users 
ADD CONSTRAINT uk_users_email 
UNIQUE (email);

ALTER TABLE user_roles 
ADD CONSTRAINT uk_user_roles_company_user 
UNIQUE (user_id, company_id);
```

## Multi-Tenancy

### Row Level Security (RLS)
```sql
-- Habilitar RLS nas tabelas tenant-aware
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Política de acesso por empresa
CREATE POLICY tenant_isolation ON clients
FOR ALL TO authenticated_users
USING (company_id = current_setting('app.current_company_id')::INTEGER);
```

### Middleware de Tenant
```python
# app/core/tenant.py
def set_tenant_context(company_id: int):
    """Define o tenant atual no contexto da DB"""
    with db_engine.connect() as conn:
        conn.execute(
            text("SET app.current_company_id = :company_id"),
            {"company_id": company_id}
        )
```

## Migrations (Alembic)

### Estrutura
```
alembic/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_plans_table.py
│   ├── 003_create_addons_table.py
│   ├── 004_add_price_min_max_to_plans.py
│   ├── 005_add_is_active_to_subscriptions.py
│   └── 006_add_icons_to_addons.py
├── env.py
├── script.py.mako
└── alembic.ini
```

### Exemplo de Migration
```python
"""create_addons_table

Revision ID: create_addons
Revises: add_price_min_max
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'create_addons'
down_revision = 'add_price_min_max'
branch_labels = None
depends_on = None

def upgrade():
    # Criar tabela add_ons
    op.create_table('add_ons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('slug', sa.String(50), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        # ... outras colunas
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    
    # Inserir add-ons oficiais
    op.execute("""
        INSERT INTO add_ons (slug, name, description, price_monthly, ...) VALUES
        ('pricing_intelligence', 'Precificação Inteligente', 'Cálculo automático...', 49.0, ...),
        ('advanced_reports', 'Relatórios Avançados', 'Ticket médio...', 39.0, ...),
        ...
    """)

def downgrade():
    op.drop_table('add_ons')
```

## Performance e Otimização

### Connection Pool
```python
# app/core/database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### Query Optimization
```python
# Índices para queries comuns
class Client(Base):
    __table_args__ = (
        Index('idx_clients_search', 'name', 'email', 'company_id'),
        Index('idx_clients_active', 'is_active', 'company_id'),
    )
```

### Cache Strategy
```python
# Redis para consultas frequentes
@cache.memoize(timeout=300)  # 5 minutos
def get_company_services(company_id: int):
    return db.query(Service).filter(
        Service.company_id == company_id,
        Service.is_active == True
    ).all()
```

## Backup e Recovery

### PostgreSQL Backup
```bash
# Backup completo
pg_dump -h localhost -U postgres -d agendamento > backup.sql

# Backup apenas dados
pg_dump -h localhost -U postgres -d agendamento --data-only > data.sql

# Restore
psql -h localhost -U postgres -d agendamento < backup.sql
```

### Point-in-Time Recovery
```bash
# Configurar WAL
postgresql.conf:
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

## Monitoramento

### Queries Lentas
```sql
-- Habilitar log de queries lentas
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 segundo
SELECT pg_reload_conf();

-- Ver queries ativas
SELECT query, pid, age(query_start, clock_timestamp()) AS age
FROM pg_stat_activity
WHERE state = 'active' AND query != '<IDLE>';
```

### Estatísticas
```sql
-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Segurança

### Permissões
```sql
-- Usuário da aplicação
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE agendamento TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Usuário de readonly
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE agendamento TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### Encryption
```sql
-- Criptografia de dados sensíveis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Exemplo: criptografar dados do cliente
INSERT INTO clients (name, email, phone_encrypted)
VALUES (
    'John Doe',
    'john@example.com',
    pgp_sym_encrypt('555-1234-5678', 'encryption_key')
);
```

## Escalabilidade

### Partitioning
```sql
-- Particionar schedules por data (se necessário)
CREATE TABLE schedules_2024 PARTITION OF schedules
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE schedules_2025 PARTITION OF schedules
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Sharding (Futuro)
```sql
-- Por região ou volume de clientes
-- Schema por região
CREATE SCHEMA sao_paulo;
CREATE SCHEMA rio_de_janeiro;

-- Mover tabelas para schemas específicos
ALTER TABLE clients SET SCHEMA sao_paulo;
```

## Troubleshooting

### Issues Comuns
1. **Deadlocks**: Transações concorrentes
2. **Connection Leaks**: Pool não liberado
3. **Slow Queries**: Índices faltando
4. **Disk Space**: Logs crescendo

### Diagnóstico
```sql
-- Ver locks
SELECT 
    pid,
    relation,
    mode,
    granted
FROM pg_locks
WHERE NOT granted;

-- Ver conexões
SELECT 
    count(*) as connections,
    state
FROM pg_stat_activity
GROUP BY state;
```

## Próximos Passos

### Otimizações Futuras
1. **Read Replicas**: Para queries de relatórios
2. **TimescaleDB**: Para séries temporais
3. **Full-Text Search**: PostgreSQL + GIN indexes
4. **Graph Database**: Neo4j para relacionamentos complexos

### Analytics
```sql
-- Views para analytics
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    company_id,
    SUM(final_amount) AS revenue
FROM commands
WHERE payment_status = 'paid'
GROUP BY month, company_id;
```
