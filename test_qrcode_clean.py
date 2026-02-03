#!/usr/bin/env python3
"""
Criar instância limpa e obter QR Code
"""
import requests
import json
import base64
import time

EVOLUTION_API_URL = "http://72.62.138.239:8080"
API_KEY = "B6D711FCDE4D4FD5936544120E713976"

def delete_instance(instance_name: str):
    """Deleta instância"""
    url = f"{EVOLUTION_API_URL}/instance/delete/{instance_name}"
    headers = {"apikey": API_KEY}
    response = requests.delete(url, headers=headers)
    print(f"🗑️ Deletando {instance_name}: Status {response.status_code}")
    if response.status_code == 200:
        print(f"✅ Instância deletada com sucesso\n")
    return response.status_code == 200

def create_instance(instance_name: str):
    """Cria instância"""
    url = f"{EVOLUTION_API_URL}/instance/create"
    headers = {"apikey": API_KEY, "Content-Type": "application/json"}
    data = {
        "instanceName": instance_name,
        "integration": "WHATSAPP-BAILEYS"
    }
    
    print(f"🔄 Criando instância: {instance_name}")
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    result = response.json()
    
    if response.status_code == 201:
        print(f"✅ Instância criada!")
        print(f"📱 Instance ID: {result['instance']['instanceId']}")
        print(f"📱 Token: {result['hash']}\n")
    else:
        print(f"❌ Erro: {json.dumps(result, indent=2)}\n")
    
    return result

def connect_and_get_qr(instance_name: str):
    """Conecta instância e obtém QR Code"""
    url = f"{EVOLUTION_API_URL}/instance/connect/{instance_name}"
    headers = {"apikey": API_KEY}
    
    print(f"🔄 Conectando e obtendo QR Code: {instance_name}")
    
    max_attempts = 5
    for attempt in range(1, max_attempts + 1):
        print(f"Tentativa {attempt}/{max_attempts}...")
        response = requests.get(url, headers=headers)
        print(f"Status: {response.status_code}")
        
        try:
            result = response.json()
            
            # Verificar se tem QR Code
            if 'qrcode' in result and 'base64' in result['qrcode']:
                print(f"✅ QR Code obtido!\n")
                return result
            elif 'base64' in result:
                print(f"✅ QR Code obtido!\n")
                return result
            else:
                print(f"Response: {json.dumps(result, indent=2)}")
                
        except Exception as e:
            print(f"Erro ao processar resposta: {e}")
        
        if attempt < max_attempts:
            print(f"⏳ Aguardando 3 segundos...\n")
            time.sleep(3)
    
    print(f"❌ Não foi possível obter QR Code após {max_attempts} tentativas\n")
    return None

def save_qrcode(base64_data: str, filename: str):
    """Salva QR Code como imagem"""
    try:
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        image_data = base64.b64decode(base64_data)
        with open(filename, 'wb') as f:
            f.write(image_data)
        print(f"💾 QR Code salvo: {filename}")
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 EVOLUTION API - CRIAR INSTÂNCIA E OBTER QR CODE")
    print("=" * 70)
    
    instance_name = "company_1_whatsapp"
    
    # Passo 1: Deletar instância existente
    print("\n📋 PASSO 1: Deletar instância existente (se houver)")
    print("-" * 70)
    delete_instance(instance_name)
    time.sleep(2)
    
    # Passo 2: Criar nova instância
    print("\n📋 PASSO 2: Criar nova instância")
    print("-" * 70)
    create_result = create_instance(instance_name)
    
    if create_result.get('instance'):
        # Aguardar processamento
        print("⏳ Aguardando 5 segundos para processamento...")
        time.sleep(5)
        
        # Passo 3: Conectar e obter QR Code
        print("\n📋 PASSO 3: Conectar e obter QR Code")
        print("-" * 70)
        qr_result = connect_and_get_qr(instance_name)
        
        if qr_result:
            # Tentar extrair base64 do QR Code
            base64_data = None
            
            if 'qrcode' in qr_result and 'base64' in qr_result['qrcode']:
                base64_data = qr_result['qrcode']['base64']
            elif 'base64' in qr_result:
                base64_data = qr_result['base64']
            
            if base64_data:
                filename = f"qrcode_{instance_name}.png"
                if save_qrcode(base64_data, filename):
                    print(f"\n🎉 SUCESSO!")
                    print(f"📸 QR Code salvo em: {filename}")
                    print(f"\n📝 PRÓXIMOS PASSOS:")
                    print(f"1. Abra o arquivo: {filename}")
                    print(f"2. Abra WhatsApp Business no celular")
                    print(f"3. Vá em 'Dispositivos Conectados'")
                    print(f"4. Escaneie o QR Code")
    
    print("\n" + "=" * 70)
    print("✅ PROCESSO CONCLUÍDO")
    print("=" * 70)
