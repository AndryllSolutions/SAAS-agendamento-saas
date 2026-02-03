from app.models.user import User
from app.core.database import get_db

db = get_db()
user = db.query(User).filter(User.email == "admin.teste.vps@exemplo.com").first()

print(f"User: {user.email if user else None}")
print(f"Hash: {user.password_hash[:30] if user else None}...")
print(f"Active: {user.is_active if user else None}")
print(f"Company: {user.company_id if user else None}")

if user:
    from app.core.security import verify_password
    print(f"Verify: {verify_password('AdminTeste2026!', user.password_hash)}")

db.close()
