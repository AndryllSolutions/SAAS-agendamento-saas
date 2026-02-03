from app.core.security import verify_password
from app.models.user import User
from app.database import SessionLocal

# Testar autenticação completa
db = SessionLocal()
user = db.query(User).filter(User.email == "admin.teste.vps@exemplo.com").first()

print("=== DEBUG AUTENTICAÇÃO ===")
print(f"Usuário encontrado: {user.email if user else None}")
print(f"ID: {user.id if user else None}")
print(f"Nome: {user.full_name if user else None}")
print(f"Empresa ID: {user.company_id if user else None}")
print(f"Usuário ativo: {user.is_active if user else None}")
print(f"Hash completo: {user.password_hash if user else None}")
print(f"Hash preview: {user.password_hash[:30] if user else None}...")

# Testar verificação
if user:
    print(f"\n=== TESTE DE SENHA ===")
    print(f"Senha: AdminTeste2026!")
    print(f"Verificação: {verify_password('AdminTeste2026!', user.password_hash)}")
else:
    print("Usuário não encontrado!")

db.close()
