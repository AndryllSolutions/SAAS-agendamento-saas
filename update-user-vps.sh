#!/bin/bash

# Script para acessar VPS e editar usuário
ssh root@72.62.138.239 << 'EOF'
# Entrar no container PostgreSQL
docker exec -it agendamento_db_prod psql -U postgres -d atendo_saas << 'SQL'

# Verificar usuário atual
SELECT id, email, role, company_id FROM users WHERE email = 'andrekaidellisola@gmail.com';

# Criar nova empresa se não existir
INSERT INTO companies (name, slug, subscription_plan, is_active, created_at)
SELECT 
    'Empresa Teste', 
    'empresa-teste', 
    'essencial', 
    true, 
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM companies WHERE slug = 'empresa-teste'
);

# Obter ID da empresa
SELECT id FROM companies WHERE slug = 'empresa-teste' \gset

# Atualizar usuário para COMPANY_OWNER e vincular à empresa
UPDATE users 
SET 
    role = 'COMPANY_OWNER',
    company_id = :id
WHERE email = 'andrekaidellisola@gmail.com';

# Verificar atualização
SELECT id, email, role, company_id FROM users WHERE email = 'andrekaidellisola@gmail.com';

SQL
EOF
