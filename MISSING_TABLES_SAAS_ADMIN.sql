-- ========================================================================
-- TABELAS FALTANTES PARA MÓDULO SAAS ADMIN
-- ========================================================================
-- Gerado em: 2025-12-11
-- Descrição: DDL das tabelas necessárias para completar o módulo SaaS Admin
-- Prioridade: ALTA
-- ========================================================================

-- ========================================================================
-- 1. PLANS (Planos SaaS)
-- ========================================================================
-- Descrição: Define os planos disponíveis (Basic, Pro, Premium, etc.)
-- Multi-tenant: NÃO (tabela global)
-- Prioridade: 🔴 ALTA

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Basic Info
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price_monthly NUMERIC(10,2) NOT NULL,
    price_yearly NUMERIC(10,2) NOT NULL,
    discount_yearly_percentage INTEGER DEFAULT 0,  -- Desconto anual %
    
    -- Limits
    max_users INTEGER NOT NULL DEFAULT 1,
    max_appointments_month INTEGER NOT NULL DEFAULT 100,
    max_clients INTEGER NOT NULL DEFAULT 100,
    max_professionals INTEGER NOT NULL DEFAULT 1,
    max_services INTEGER NOT NULL DEFAULT 10,
    max_products INTEGER NOT NULL DEFAULT 50,
    
    -- Storage
    max_storage_mb INTEGER NOT NULL DEFAULT 100,  -- MB de storage
    
    -- Features (JSON)
    features JSONB DEFAULT '{}',
    -- Exemplo: {
    --   "whatsapp": true,
    --   "push_notifications": true,
    --   "fiscal_integration": false,
    --   "multi_company": false,
    --   "api_access": false,
    --   "custom_domain": false
    -- }
    
    -- Display
    highlight_label VARCHAR(50),  -- "Mais Popular", "Recomendado"
    display_order INTEGER DEFAULT 0,
    color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,  -- Visível no site?
    
    -- Trial
    trial_days INTEGER DEFAULT 14
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_display_order ON plans(display_order);

COMMENT ON TABLE plans IS 'Planos SaaS disponíveis (Basic, Pro, Premium)';

-- ========================================================================
-- 2. PLAN_FEATURE_LIMITS (Limites de Features por Plano)
-- ========================================================================
-- Descrição: Define limites específicos de features por plano
-- Multi-tenant: NÃO (tabela global)
-- Prioridade: 🔴 ALTA

CREATE TABLE IF NOT EXISTS plan_feature_limits (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    
    -- Feature
    feature_key VARCHAR(100) NOT NULL,  -- whatsapp_messages, storage_mb, etc.
    feature_name VARCHAR(255) NOT NULL,
    
    -- Limit
    limit_type VARCHAR(50) NOT NULL,  -- count, boolean, quota, unlimited
    limit_value INTEGER,  -- NULL = unlimited
    
    -- Display
    description TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    CONSTRAINT uq_plan_feature_limits_plan_feature UNIQUE (plan_id, feature_key)
);

CREATE INDEX idx_plan_feature_limits_plan_id ON plan_feature_limits(plan_id);
CREATE INDEX idx_plan_feature_limits_feature_key ON plan_feature_limits(feature_key);

COMMENT ON TABLE plan_feature_limits IS 'Limites de features por plano';

-- ========================================================================
-- 3. BILLING_INVOICES (Faturas SaaS)
-- ========================================================================
-- Descrição: Faturas mensais/anuais das empresas
-- Multi-tenant: SIM (company_id)
-- Prioridade: 🔴 ALTA

CREATE TABLE IF NOT EXISTS billing_invoices (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    
    -- Invoice Info
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Values
    subtotal NUMERIC(10,2) NOT NULL,
    discount_value NUMERIC(10,2) DEFAULT 0,
    tax_value NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- draft, issued, sent, paid, overdue, cancelled, refunded
    
    -- Payment
    payment_method VARCHAR(50),  -- credit_card, boleto, pix
    payment_gateway VARCHAR(50),  -- stripe, mercadopago
    gateway_invoice_id VARCHAR(255),
    paid_at TIMESTAMP,
    
    -- Files
    pdf_url VARCHAR(500),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_billing_invoices_company_id ON billing_invoices(company_id);
CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_invoices_due_date ON billing_invoices(due_date);
CREATE INDEX idx_billing_invoices_invoice_number ON billing_invoices(invoice_number);
CREATE INDEX idx_billing_invoices_company_period ON billing_invoices(company_id, period_start, period_end);

COMMENT ON TABLE billing_invoices IS 'Faturas SaaS mensais/anuais';

-- ========================================================================
-- 4. USAGE_TRACKING (Rastreamento de Uso)
-- ========================================================================
-- Descrição: Rastreia uso de features para billing e limites
-- Multi-tenant: SIM (company_id)
-- Prioridade: 🔴 ALTA

CREATE TABLE IF NOT EXISTS usage_tracking (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Feature
    feature_key VARCHAR(100) NOT NULL,  -- appointments, whatsapp_messages, storage_mb
    
    -- Usage
    usage_count INTEGER NOT NULL DEFAULT 0,
    usage_limit INTEGER,  -- Limite do plano (NULL = unlimited)
    
    -- Period (mensal)
    period_month DATE NOT NULL,  -- Primeiro dia do mês
    
    -- Reset
    reset_at TIMESTAMP,  -- Quando foi resetado
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_usage_tracking_company_id ON usage_tracking(company_id);
CREATE INDEX idx_usage_tracking_company_month ON usage_tracking(company_id, period_month);
CREATE INDEX idx_usage_tracking_feature_key ON usage_tracking(feature_key);
CREATE UNIQUE INDEX uq_usage_tracking_company_feature_month ON usage_tracking(company_id, feature_key, period_month);

COMMENT ON TABLE usage_tracking IS 'Rastreamento de uso de features';

-- ========================================================================
-- 5. SUBSCRIPTION_HISTORY (Histórico de Mudanças)
-- ========================================================================
-- Descrição: Histórico de upgrades/downgrades de plano
-- Multi-tenant: SIM (company_id)
-- Prioridade: 🟡 MÉDIA

CREATE TABLE IF NOT EXISTS subscription_history (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Change Info
    old_plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
    new_plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
    old_plan_name VARCHAR(100),  -- Snapshot do nome
    new_plan_name VARCHAR(100),  -- Snapshot do nome
    
    -- Reason
    change_type VARCHAR(50) NOT NULL,
    -- upgrade, downgrade, trial_start, trial_end, renewal, cancellation
    reason TEXT,
    
    -- Who
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- When
    effective_date DATE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_subscription_history_company_id ON subscription_history(company_id);
CREATE INDEX idx_subscription_history_effective_date ON subscription_history(effective_date);
CREATE INDEX idx_subscription_history_change_type ON subscription_history(change_type);

COMMENT ON TABLE subscription_history IS 'Histórico de mudanças de plano';

-- ========================================================================
-- 6. AUDIT_LOGS (Logs de Auditoria)
-- ========================================================================
-- Descrição: Log completo de ações administrativas
-- Multi-tenant: SIM (company_id NULLABLE para ações globais)
-- Prioridade: 🟡 MÉDIA

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Who
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),  -- Snapshot
    user_name VARCHAR(255),  -- Snapshot
    
    -- Where
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,  -- NULL para ações globais
    
    -- What
    action VARCHAR(100) NOT NULL,
    -- create, update, delete, login, logout, plan_change, etc.
    
    entity_type VARCHAR(100),  -- User, Company, Plan, Invoice, etc.
    entity_id INTEGER,
    entity_name VARCHAR(255),  -- Snapshot
    
    -- Details
    changes JSONB,  -- {"old": {...}, "new": {...}}
    description TEXT,
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_company_action ON audit_logs(company_id, action, created_at);

COMMENT ON TABLE audit_logs IS 'Logs de auditoria de ações administrativas';

-- ========================================================================
-- 7. FEATURE_FLAGS (Feature Toggles)
-- ========================================================================
-- Descrição: Controle de features por empresa (beta, A/B testing)
-- Multi-tenant: SIM (company_id)
-- Prioridade: 🟡 MÉDIA

CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Feature
    feature_key VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Scope
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    -- NULL = feature global (aplicável a todas empresas)
    
    -- State
    is_enabled BOOLEAN DEFAULT FALSE,
    
    -- Config
    config JSONB DEFAULT '{}',
    -- Configurações específicas da feature
    
    -- Metadata
    rollout_percentage INTEGER DEFAULT 100,  -- % de usuários que veem a feature
    environment VARCHAR(50) DEFAULT 'production',  -- production, staging, development
    
    -- Audit
    enabled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    enabled_at TIMESTAMP,
    disabled_at TIMESTAMP,
    
    CONSTRAINT uq_feature_flags_company_feature UNIQUE (company_id, feature_key)
);

CREATE INDEX idx_feature_flags_feature_key ON feature_flags(feature_key);
CREATE INDEX idx_feature_flags_company_id ON feature_flags(company_id);
CREATE INDEX idx_feature_flags_is_enabled ON feature_flags(is_enabled);

COMMENT ON TABLE feature_flags IS 'Feature toggles por empresa';

-- ========================================================================
-- 8. SUPPORT_TICKETS (Sistema de Suporte)
-- ========================================================================
-- Descrição: Tickets de suporte das empresas
-- Multi-tenant: SIM (company_id)
-- Prioridade: 🟢 BAIXA

CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relations
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Ticket Info
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Classification
    category VARCHAR(100),  -- technical, billing, feature_request, bug
    priority VARCHAR(50) DEFAULT 'medium',  -- low, medium, high, urgent
    
    -- Status
    status VARCHAR(50) DEFAULT 'open',
    -- open, in_progress, waiting_customer, waiting_internal, resolved, closed
    
    -- Resolution
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolution TEXT,
    
    -- Satisfaction
    satisfaction_rating INTEGER,  -- 1-5
    satisfaction_comment TEXT,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_support_tickets_company_id ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

COMMENT ON TABLE support_tickets IS 'Sistema de suporte';

-- ========================================================================
-- 9. SUPPORT_TICKET_MESSAGES (Mensagens dos Tickets)
-- ========================================================================

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,  -- Nota interna?
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    CONSTRAINT fk_support_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE INDEX idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_ticket_messages_created_at ON support_ticket_messages(created_at);

COMMENT ON TABLE support_ticket_messages IS 'Mensagens dos tickets de suporte';

-- ========================================================================
-- 10. COMPANY_ONBOARDING_STEPS (Progresso Onboarding)
-- ========================================================================
-- Descrição: Tracking do progresso de onboarding das empresas
-- Multi-tenant: SIM (company_id UNIQUE - 1:1)
-- Prioridade: 🟢 BAIXA

CREATE TABLE IF NOT EXISTS company_onboarding_steps (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Steps (boolean flags)
    completed_profile BOOLEAN DEFAULT FALSE,
    completed_team BOOLEAN DEFAULT FALSE,
    completed_services BOOLEAN DEFAULT FALSE,
    completed_schedule BOOLEAN DEFAULT FALSE,
    completed_first_appointment BOOLEAN DEFAULT FALSE,
    completed_payment_setup BOOLEAN DEFAULT FALSE,
    completed_notifications BOOLEAN DEFAULT FALSE,
    
    -- Completion
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    
    -- Progress
    completion_percentage INTEGER DEFAULT 0,  -- 0-100
    
    -- Current step
    current_step VARCHAR(100),
    
    -- Metadata
    steps_data JSONB DEFAULT '{}'
);

CREATE INDEX idx_company_onboarding_steps_company_id ON company_onboarding_steps(company_id);
CREATE INDEX idx_company_onboarding_steps_is_completed ON company_onboarding_steps(is_completed);

COMMENT ON TABLE company_onboarding_steps IS 'Progresso de onboarding das empresas';

-- ========================================================================
-- TRIGGERS PARA updated_at
-- ========================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas com updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_feature_limits_updated_at BEFORE UPDATE ON plan_feature_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_invoices_updated_at BEFORE UPDATE ON billing_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_onboarding_steps_updated_at BEFORE UPDATE ON company_onboarding_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================================================

-- Planos básicos
INSERT INTO plans (name, slug, price_monthly, price_yearly, max_users, max_appointments_month, max_clients, features, display_order, highlight_label) VALUES
('Básico', 'basic', 49.90, 479.00, 2, 100, 100, '{"whatsapp": false, "push_notifications": true, "fiscal_integration": false}', 1, NULL),
('Profissional', 'pro', 99.90, 959.00, 5, 500, 500, '{"whatsapp": true, "push_notifications": true, "fiscal_integration": true}', 2, 'Mais Popular'),
('Premium', 'premium', 199.90, 1919.00, 20, 2000, 2000, '{"whatsapp": true, "push_notifications": true, "fiscal_integration": true, "multi_company": true, "api_access": true}', 3, 'Recomendado');

-- ========================================================================
-- FIM DO SCRIPT
-- ========================================================================

-- Para aplicar este script:
-- psql -U postgres -d agendamento_saas -f MISSING_TABLES_SAAS_ADMIN.sql

-- Ou via Alembic:
-- Criar nova migration: alembic revision -m "add_saas_admin_tables"
-- Copiar este DDL para a migration
-- Aplicar: alembic upgrade head

