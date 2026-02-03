UPDATE users SET password_hash = '$2b$12$4d001k5P/1EDhKTvSIC8Gez74t.GcBJt7vWqctyGhQ/R8VKTG8GP2' WHERE email = 'admin.teste.vps@exemplo.com';
SELECT email, password_hash FROM users WHERE email = 'admin.teste.vps@exemplo.com';
