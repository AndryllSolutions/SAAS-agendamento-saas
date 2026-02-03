-- Corrigir role do usuário Andre para ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'andrekaidellisola@gmail.com';

-- Verificar atualização
SELECT email, role, is_active, is_verified 
FROM users 
WHERE email ILIKE '%andrekaidellisola%';
