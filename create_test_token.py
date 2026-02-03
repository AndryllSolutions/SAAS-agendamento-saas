#!/usr/bin/env python3

from app.core.database import get_db
from app.models.user import User
from app.core.security import create_access_token

def create_test_token():
    db = next(get_db())
    
    # Buscar um usuário válido
    user = db.query(User).filter(User.email == "andrekaidellisola@gmail.com").first()
    
    if user:
        print(f"User found: {user.full_name} ({user.email})")
        print(f"Company ID: {user.company_id}")
        
        # Criar token
        token = create_access_token(data={"sub": user.email, "user_id": user.id})
        print(f"Token: {token}")
        
        return token
    else:
        print("User not found")
        return None

if __name__ == "__main__":
    create_test_token()
