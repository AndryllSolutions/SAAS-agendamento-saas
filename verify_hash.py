import bcrypt

# Verificar se o hash está correto
password = "AdminTeste2026!"
hashed = "$2b$12$4d001k5P/1EDhKTvSIC8Gez74t.GcBJt7vWqctyGhQ/R8VKTG8GP2"

print(f"Senha: {password}")
print(f"Hash: {hashed}")
print(f"Verificação: {bcrypt.checkpw(password.encode(), hashed.encode())}")
