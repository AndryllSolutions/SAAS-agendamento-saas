"""
Script para verificar e corrigir senha do admin@belezalatina.com
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()
try:
    admin = db.query(User).filter(User.email == 'admin@belezalatina.com').first()
    if not admin:
        print("❌ Admin não encontrado!")
        sys.exit(1)
    
    print(f"✅ Admin encontrado: {admin.email}")
    print(f"   Role: {admin.role}")
    print(f"   Hash: {admin.password_hash[:50]}...")
    
    # Testar senhas
    passwords = ['admin123', 'admin', 'password', '123456']
    found = False
    
    for pwd in passwords:
        try:
            if verify_password(pwd, admin.password_hash):
                print(f"\n✅ Senha encontrada: '{pwd}'")
                print(f"\n📋 Credenciais válidas:")
                print(f"   Email: admin@belezalatina.com")
                print(f"   Senha: {pwd}")
                found = True
                break
        except Exception as e:
            print(f"   ⚠️  Erro ao testar '{pwd}': {e}")
    
    if not found:
        print("\n⚠️  Nenhuma senha comum funcionou!")
        print("🔄 Resetando para 'admin123'...")
        admin.password_hash = get_password_hash('admin123')
        db.commit()
        
        if verify_password('admin123', admin.password_hash):
            print("✅ Senha resetada!")
            print(f"\n📋 Novas credenciais:")
            print(f"   Email: admin@belezalatina.com")
            print(f"   Senha: admin123")
        else:
            print("❌ Erro ao resetar!")
            
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

