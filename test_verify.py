from app.core.security import verify_password

# Testar verificação de senha
password = "AdminTeste2026!"
hashed = "$2b$12$4d001k5P/1EDhKTvSIC8Gez74t.GcBJt7vWqctyGhQ/R8VKTG8GP2"

print(f"Senha: {password}")
print(f"Hash: {hashed}")
print(f"Verificação: {verify_password(password, hashed)}")
