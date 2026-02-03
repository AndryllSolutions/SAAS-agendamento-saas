-- Corrigir role do usuário Andre para COMPANY_OWNER
UPDATE users 
SET role = 'COMPANY_OWNER' 
WHERE email = 'andrekaidellisola@gmail.com';

-- Verificar atualização
SELECT email, role, is_active, is_verified 
FROM users 
WHERE email ILIKE '%andrekaidellisola%';
