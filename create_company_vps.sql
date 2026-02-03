INSERT INTO companies (slug, name, business_type, email, phone, timezone, currency, is_active, created_at, updated_at) 
VALUES ('studio-spa-natura', 'Studio Spa Natureza', 'spa', 'contato@studionatura.com', '(11) 98888-7777', 'America/Sao_Paulo', 'BRL', true, NOW(), NOW()) 
RETURNING id;
