"""
Script para configurar WhatsApp com Evolution API
"""
import requests
import json
import base64

# Configurações
EVOLUTION_API_URL = "http://localhost:8080"
API_KEY = "minha-chave-secreta-123"
INSTANCE_NAME = "agendamento-saas"

def create_instance():
    """Cria uma instância do WhatsApp"""
    print("🚀 Criando instância do WhatsApp...")
    
    url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "instanceName": INSTANCE_NAME,
        "qrcode": True,
        "integration": "WHATSAPP-BAILEYS"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Instância criada com sucesso!")
            print(f"📱 Nome: {INSTANCE_NAME}")
            return True
        else:
            print(f"❌ Erro ao criar instância: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def get_qrcode():
    """Obtém o QR Code para conectar o WhatsApp"""
    print("\n📱 Obtendo QR Code...")
    
    url = f"{EVOLUTION_API_URL}/instance/connect/{INSTANCE_NAME}"
    headers = {
        "apikey": API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            
            if 'base64' in result:
                print("\n✅ QR Code obtido!")
                print("\n" + "="*50)
                print("📱 ESCANEIE ESTE QR CODE COM SEU WHATSAPP:")
                print("="*50)
                print("\n1. Abra o WhatsApp no seu celular")
                print("2. Toque em Mais opções (⋮) > Aparelhos conectados")
                print("3. Toque em Conectar um aparelho")
                print("4. Escaneie o QR Code abaixo:\n")
                
                # Salvar QR Code como imagem
                qr_base64 = result['base64']
                
                # Remover prefixo data:image/png;base64,
                if ',' in qr_base64:
                    qr_base64 = qr_base64.split(',')[1]
                
                qr_bytes = base64.b64decode(qr_base64)
                
                # Salvar como arquivo
                with open('whatsapp_qrcode.png', 'wb') as f:
                    f.write(qr_bytes)
                
                print("💾 QR Code salvo em: whatsapp_qrcode.png")
                print("\n🌐 Ou acesse no navegador:")
                print(f"http://localhost:8080/instance/connect/{INSTANCE_NAME}")
                print("\nAbra o arquivo 'whatsapp_qrcode.png' e escaneie!")
                print("\n" + "="*50)
                
                return True
            else:
                print("⚠️ QR Code não disponível. Tentando novamente...")
                return False
        else:
            print(f"❌ Erro ao obter QR Code: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def check_connection():
    """Verifica se o WhatsApp está conectado"""
    print("\n🔍 Verificando conexão...")
    
    url = f"{EVOLUTION_API_URL}/instance/connectionState/{INSTANCE_NAME}"
    headers = {
        "apikey": API_KEY
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            state = result.get('state', 'unknown')
            
            if state == 'open':
                print("✅ WhatsApp conectado com sucesso!")
                print(f"📱 Número: {result.get('instance', {}).get('owner', 'N/A')}")
                return True
            else:
                print(f"⚠️ Status: {state}")
                return False
        else:
            print(f"❌ Erro ao verificar conexão: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def send_test_message(phone_number):
    """Envia mensagem de teste"""
    print(f"\n📤 Enviando mensagem de teste para {phone_number}...")
    
    url = f"{EVOLUTION_API_URL}/message/sendText/{INSTANCE_NAME}"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Formatar número (remover caracteres especiais)
    clean_phone = ''.join(filter(str.isdigit, phone_number))
    
    # Adicionar código do país se não tiver
    if not clean_phone.startswith('55'):
        clean_phone = '55' + clean_phone
    
    data = {
        "number": clean_phone,
        "text": "✨ *Teste de Conexão* ✨\n\nSeu WhatsApp está conectado com sucesso ao Sistema de Agendamento! 🎉\n\nAgora você receberá confirmações de agendamento automaticamente. 💜"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 201:
            print("✅ Mensagem enviada com sucesso!")
            return True
        else:
            print(f"❌ Erro ao enviar mensagem: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def main():
    print("="*60)
    print("🚀 CONFIGURAÇÃO DO WHATSAPP - EVOLUTION API")
    print("="*60)
    
    # Passo 1: Criar instância
    if not create_instance():
        print("\n❌ Falha ao criar instância. Verifique se a Evolution API está rodando.")
        print("Execute: docker-compose -f docker-compose.whatsapp.yml up -d")
        return
    
    # Passo 2: Obter QR Code
    import time
    time.sleep(2)  # Aguardar instância inicializar
    
    if not get_qrcode():
        print("\n❌ Falha ao obter QR Code.")
        return
    
    # Passo 3: Aguardar conexão
    print("\n⏳ Aguardando você escanear o QR Code...")
    print("(Pressione Ctrl+C para cancelar)\n")
    
    connected = False
    attempts = 0
    max_attempts = 30  # 30 tentativas = ~1 minuto
    
    while not connected and attempts < max_attempts:
        time.sleep(2)
        connected = check_connection()
        attempts += 1
        
        if not connected:
            print(f"⏳ Tentativa {attempts}/{max_attempts}... Escaneie o QR Code!")
    
    if connected:
        print("\n" + "="*60)
        print("🎉 WHATSAPP CONECTADO COM SUCESSO!")
        print("="*60)
        
        # Testar envio
        test_phone = input("\n📱 Digite um número para teste (ex: 11999999999): ")
        if test_phone:
            send_test_message(test_phone)
        
        print("\n✅ Configuração concluída!")
        print(f"\n📝 Adicione ao .env:")
        print(f"EVOLUTION_API_URL={EVOLUTION_API_URL}")
        print(f"EVOLUTION_API_KEY={API_KEY}")
        print(f"EVOLUTION_INSTANCE_NAME={INSTANCE_NAME}")
    else:
        print("\n⏰ Tempo esgotado. Execute o script novamente e escaneie o QR Code mais rápido.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Configuração cancelada pelo usuário.")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
