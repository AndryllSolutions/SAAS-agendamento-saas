import bcrypt

# Gerar hash para a senha "AdminTeste2026!"
password = "AdminTeste2026!"
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
print(f"Senha: {password}")
print(f"Hash: {hashed.decode()}")
