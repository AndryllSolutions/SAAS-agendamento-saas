-- Exportar estrutura do banco de dados
-- Tabelas principais
\dt

-- Estrutura da tabela users
\d users

-- Estrutura da tabela companies  
\d companies

-- Estrutura da tabela notifications
\d notifications

-- Verificar dados do admin
SELECT id, email, role, company_id, is_active FROM users WHERE email = 'admin@belezalatina.com';

-- Verificar empresa do admin
SELECT c.id, c.name, c.slug, c.subscription_plan FROM companies c JOIN users u ON c.id = u.company_id WHERE u.email = 'admin@belezalatina.com';

