-- ================================================================================
-- Script SQL para Consultar Relacionamentos do Banco de Dados
-- Sistema: Agendamento SaaS
-- ================================================================================

-- 1. LISTAR TODAS AS TABELAS
-- ================================================================================
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


-- 2. LISTAR TODAS AS FOREIGN KEYS
-- ================================================================================
SELECT 
    tc.table_name AS tabela,
    kcu.column_name AS coluna,
    ccu.table_name AS tabela_referenciada,
    ccu.column_name AS coluna_referenciada,
    rc.delete_rule AS ao_deletar
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON rc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;


-- 3. CONTAR RELACIONAMENTOS POR TABELA
-- ================================================================================
SELECT 
    tc.table_name AS tabela,
    COUNT(*) AS total_foreign_keys
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY total_foreign_keys DESC;


-- 4. VERIFICAR INCONSISTENCIA: appointments vs commands (client_id)
-- ================================================================================

-- Verifica qual tabela appointments.client_id referencia
SELECT 
    'appointments.client_id' AS campo,
    ccu.table_name AS tabela_referenciada,
    ccu.column_name AS coluna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'appointments'
  AND kcu.column_name = 'client_id'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Verifica qual tabela commands.client_id referencia
SELECT 
    'commands.client_id' AS campo,
    ccu.table_name AS tabela_referenciada,
    ccu.column_name AS coluna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'commands'
  AND kcu.column_name = 'client_id'
  AND tc.constraint_type = 'FOREIGN KEY';


-- 5. VERIFICAR OVERLAP DE CLIENTES (users.CLIENT vs clients)
-- ================================================================================
SELECT 
    'Total users com role CLIENT' AS metrica,
    COUNT(*) AS valor
FROM users
WHERE role = 'CLIENT';

SELECT 
    'Total registros em clients' AS metrica,
    COUNT(*) AS valor
FROM clients;

-- Clientes com email em ambas tabelas
SELECT 
    u.id AS user_id,
    u.email AS user_email,
    u.full_name AS user_name,
    c.id AS client_id,
    c.email AS client_email,
    c.full_name AS client_name
FROM users u
JOIN clients c ON LOWER(u.email) = LOWER(c.email)
WHERE u.role = 'CLIENT'
  AND u.company_id = c.company_id;


-- 6. LISTAR TODOS OS INDICES
-- ================================================================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


-- 7. VERIFICAR TABELAS SEM INDICES (PROBLEMA DE PERFORMANCE)
-- ================================================================================
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamanho
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND i.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND i.indexname IS NULL
GROUP BY t.tablename, t.schemaname
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- 8. ANALISAR USO DE CADA TABELA
-- ================================================================================
SELECT 
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS registros_ativos,
    n_dead_tup AS registros_mortos
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;


-- 9. VERIFICAR CONSTRAINTS DE CADA TABELA
-- ================================================================================
SELECT
    tc.table_name AS tabela,
    tc.constraint_name AS constraint,
    tc.constraint_type AS tipo,
    kcu.column_name AS coluna
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;


-- 10. VERIFICAR COLUNAS DE CADA TABELA
-- ================================================================================
SELECT 
    table_name AS tabela,
    column_name AS coluna,
    data_type AS tipo,
    character_maximum_length AS tamanho,
    is_nullable AS permite_null,
    column_default AS valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- 11. DIAGNOSTICO: Appointments sem client valido
-- ================================================================================
-- Verifica appointments com client_id que nao existe em users
SELECT 
    a.id AS appointment_id,
    a.client_id,
    a.start_time,
    a.status,
    'Client nao existe em users' AS problema
FROM appointments a
LEFT JOIN users u ON a.client_id = u.id
WHERE u.id IS NULL;


-- 12. DIAGNOSTICO: Commands sem client valido
-- ================================================================================
-- Verifica commands com client_id que nao existe em clients
SELECT 
    c.id AS command_id,
    c.client_id,
    c.number,
    c.status,
    'Client nao existe em clients' AS problema
FROM commands c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE cl.id IS NULL;


-- 13. RELATORIO: Clientes com maior historico
-- ================================================================================
SELECT 
    c.id,
    c.full_name,
    c.email,
    COUNT(DISTINCT cmd.id) AS total_comandas,
    COUNT(DISTINCT p.id) AS total_pacotes,
    COUNT(DISTINCT a.id) AS total_anamneses,
    COALESCE(cb.current_balance, 0) AS saldo_cashback
FROM clients c
LEFT JOIN commands cmd ON c.id = cmd.client_id
LEFT JOIN packages p ON c.id = p.client_id
LEFT JOIN anamneses a ON c.id = a.client_id
LEFT JOIN cashback_balances cb ON c.id = cb.client_id
WHERE c.company_id = 1  -- Ajustar company_id
GROUP BY c.id, c.full_name, c.email, cb.current_balance
ORDER BY total_comandas DESC
LIMIT 20;


-- 14. RELATORIO: Profissionais com mais agendamentos
-- ================================================================================
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(a.id) AS total_agendamentos,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS concluidos,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelados,
    ROUND(
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(a.id), 0) * 100, 
        2
    ) AS taxa_conclusao_pct
FROM users u
JOIN appointments a ON u.id = a.professional_id
WHERE u.role = 'PROFESSIONAL'
  AND u.company_id = 1  -- Ajustar company_id
GROUP BY u.id, u.full_name, u.email
ORDER BY total_agendamentos DESC;


-- 15. RELATORIO: Servicos mais vendidos
-- ================================================================================
SELECT 
    s.id,
    s.name,
    s.price,
    s.duration_minutes,
    COUNT(DISTINCT a.id) AS total_agendamentos,
    COUNT(DISTINCT ci.id) AS total_comandas,
    SUM(s.price) AS receita_estimada
FROM services s
LEFT JOIN appointments a ON s.id = a.service_id
LEFT JOIN command_items ci ON s.id = ci.service_id
WHERE s.company_id = 1  -- Ajustar company_id
  AND s.is_active = true
GROUP BY s.id, s.name, s.price, s.duration_minutes
ORDER BY total_agendamentos DESC
LIMIT 10;


-- 16. VERIFICAR INTEGRIDADE: Registros orfaos
-- ================================================================================

-- Appointments sem service valido
SELECT COUNT(*) AS appointments_sem_service
FROM appointments
WHERE service_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM services WHERE id = appointments.service_id);

-- Commands sem client valido
SELECT COUNT(*) AS commands_sem_client
FROM commands
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE id = commands.client_id);

-- Command_items sem command valido
SELECT COUNT(*) AS items_sem_command
FROM command_items
WHERE NOT EXISTS (SELECT 1 FROM commands WHERE id = command_items.command_id);


-- 17. ANALISE DE CRESCIMENTO
-- ================================================================================
SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    'appointments' AS tabela,
    COUNT(*) AS novos_registros
FROM appointments
WHERE company_id = 1  -- Ajustar company_id
GROUP BY DATE_TRUNC('month', created_at)

UNION ALL

SELECT 
    DATE_TRUNC('month', created_at) AS mes,
    'clients' AS tabela,
    COUNT(*) AS novos_registros
FROM clients
WHERE company_id = 1  -- Ajustar company_id
GROUP BY DATE_TRUNC('month', created_at)

UNION ALL

SELECT 
    DATE_TRUNC('month', date) AS mes,
    'commands' AS tabela,
    COUNT(*) AS novos_registros
FROM commands
WHERE company_id = 1  -- Ajustar company_id
GROUP BY DATE_TRUNC('month', date)

ORDER BY mes DESC, tabela;


-- ================================================================================
-- SCRIPT DE CORRECAO PROPOSTO (NAO EXECUTAR SEM BACKUP!)
-- ================================================================================

-- ATENCAO: Execute apenas apos backup completo do banco!

-- Adicionar campo user_id em clients (vincular com users)
-- ALTER TABLE clients ADD COLUMN user_id INTEGER;
-- ALTER TABLE clients ADD CONSTRAINT fk_clients_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
-- CREATE INDEX ix_clients_user_id ON clients(user_id);

-- Adicionar campo client_crm_id em appointments (vincular com clients)
-- ALTER TABLE appointments ADD COLUMN client_crm_id INTEGER;
-- ALTER TABLE appointments ADD CONSTRAINT fk_appointments_client_crm_id
--     FOREIGN KEY (client_crm_id) REFERENCES clients(id) ON DELETE SET NULL;
-- CREATE INDEX ix_appointments_client_crm_id ON appointments(client_crm_id);

-- Adicionar indices compostos para melhor performance
-- CREATE INDEX idx_appointments_company_client ON appointments(company_id, client_id);
-- CREATE INDEX idx_commands_company_client ON commands(company_id, client_id);


-- ================================================================================
-- FIM DO SCRIPT
-- ================================================================================
