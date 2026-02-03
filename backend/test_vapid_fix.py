"""
Script de teste para verificar se a correção funcionou
"""
import sys

try:
    print("=" * 70)
    print("TESTANDO CORRECAO DO VAPID...")
    print("=" * 70)
    print()
    
    # Testar import
    print("1. Testando import...")
    from app.services.push_service import VAPIDKeyManager
    print("   ✓ Import OK")
    print()
    
    # Testar geração de chaves
    print("2. Gerando chaves VAPID...")
    keys = VAPIDKeyManager.generate_vapid_keys()
    print("   ✓ Chaves geradas com sucesso!")
    print()
    
    # Mostrar preview das chaves
    print("3. Preview das chaves:")
    print(f"   Public Key:  {keys['public_key'][:50]}...")
    print(f"   Private Key: {keys['private_key'][:60]}...")
    print()
    
    # Verificar formato
    print("4. Verificando formato...")
    assert isinstance(keys['public_key'], str), "Public key deve ser string"
    assert isinstance(keys['private_key'], str), "Private key deve ser string"
    assert len(keys['public_key']) > 80, "Public key muito curta"
    assert 'BEGIN PRIVATE KEY' in keys['private_key'], "Private key formato inválido"
    print("   ✓ Formato OK")
    print()
    
    print("=" * 70)
    print("✅ SUCESSO! A correção funcionou perfeitamente!")
    print("=" * 70)
    print()
    print("Agora você pode executar:")
    print("  python gerar_chaves_vapid.py")
    print()
    
    sys.exit(0)
    
except Exception as e:
    print()
    print("=" * 70)
    print("❌ ERRO!")
    print("=" * 70)
    print(f"Erro: {str(e)}")
    print()
    import traceback
    traceback.print_exc()
    sys.exit(1)
