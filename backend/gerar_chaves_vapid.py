"""
Script para gerar chaves VAPID para Web Push Notifications.

Uso:
    python gerar_chaves_vapid.py

Saida:
    - Chaves VAPID formatadas para o .env
    - Instrucoes de como adicionar no .env
"""
import sys
import os

# Adicionar path do projeto
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app.services.push_service import VAPIDKeyManager
    
    print("=" * 70)
    print(" GERANDO CHAVES VAPID PARA WEB PUSH NOTIFICATIONS")
    print("=" * 70)
    print()
    
    keys = VAPIDKeyManager.generate_vapid_keys()
    
    # Formatar chave privada para .env (substituir quebras de linha por \n)
    private_key_formatted = keys['private_key'].replace('\n', '\\n')
    
    print("CHAVES GERADAS COM SUCESSO!")
    print()
    print("-" * 70)
    print("ADICIONE ESTAS LINHAS NO SEU ARQUIVO .env:")
    print("-" * 70)
    print()
    print(f"VAPID_PUBLIC_KEY={keys['public_key']}")
    print(f"VAPID_PRIVATE_KEY={private_key_formatted}")
    print("VAPID_MAILTO=mailto:admin@seudominio.com")
    print()
    print("-" * 70)
    print()
    print("ATENCAO:")
    print("- A chave privada usa \\n (barra-n) para quebras de linha")
    print("- NAO use quebras de linha reais no arquivo .env")
    print("- Mantenha as chaves em segredo (nao commite no Git!)")
    print()
    print("=" * 70)
    print()
    
    # Salvar em arquivo temporario (opcional)
    with open('VAPID_KEYS_TEMP.txt', 'w') as f:
        f.write(f"VAPID_PUBLIC_KEY={keys['public_key']}\n")
        f.write(f"VAPID_PRIVATE_KEY={private_key_formatted}\n")
        f.write("VAPID_MAILTO=mailto:admin@seudominio.com\n")
    
    print("Chaves tambem foram salvas em: VAPID_KEYS_TEMP.txt")
    print("(Delete este arquivo apos copiar para o .env)")
    print()

except ImportError as e:
    print("ERRO: Nao foi possivel importar VAPIDKeyManager")
    print(f"Detalhes: {str(e)}")
    print()
    print("Certifique-se de:")
    print("1. Estar no diretorio backend/")
    print("2. Ter ativado o ambiente virtual (venv)")
    print("3. Ter instalado as dependencias (pip install -r requirements.txt)")
    sys.exit(1)

except Exception as e:
    print(f"ERRO INESPERADO: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
