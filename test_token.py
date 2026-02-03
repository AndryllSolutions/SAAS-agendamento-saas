from app.core.security import create_access_token

# Criar token para usuário admin (id=4)
token = create_access_token(data={"sub": "4"})
print(token)
