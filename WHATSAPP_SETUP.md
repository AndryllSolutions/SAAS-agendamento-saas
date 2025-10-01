# 📱 Configuração do WhatsApp - Evolution API (Gratuita)

## 🎯 O Que Vamos Fazer

Configurar envio de mensagens WhatsApp **GRATUITO** usando Evolution API open-source.

---

## 📋 Pré-requisitos

1. **Docker Desktop** instalado
   - Download: https://www.docker.com/products/docker-desktop/
   - Instale e inicie o Docker Desktop

2. **Python** com ambiente virtual ativo

---

## 🚀 PASSO A PASSO

### 1️⃣ Subir a Evolution API

Abra o terminal e execute:

```bash
cd d:\agendamento_SAAS
docker-compose -f docker-compose.whatsapp.yml up -d
```

**Aguarde ~30 segundos** para os containers iniciarem.

### 2️⃣ Verificar se está rodando

```bash
docker ps
```

Você deve ver:
```
CONTAINER ID   IMAGE                            STATUS
xxxxx          atendai/evolution-api:latest     Up
xxxxx          postgres:15-alpine               Up
```

### 3️⃣ Executar Script de Configuração

```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
python scripts/setup_whatsapp.py
```

### 4️⃣ Escanear QR Code

O script vai:
1. ✅ Criar instância do WhatsApp
2. ✅ Gerar QR Code
3. ✅ Salvar como `whatsapp_qrcode.png`
4. ⏳ Aguardar você escanear

**IMPORTANTE:**
- Abra o arquivo `whatsapp_qrcode.png`
- Abra WhatsApp no celular
- Vá em **Mais opções (⋮)** > **Aparelhos conectados**
- Toque em **Conectar um aparelho**
- Escaneie o QR Code

### 5️⃣ Testar Envio

Após conectar, o script vai pedir um número para teste.

Digite seu número (ex: `11999999999`) e receberá uma mensagem de teste!

---

## ⚙️ Configurar no .env

Adicione estas linhas no arquivo `.env`:

```env
# WhatsApp - Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=minha-chave-secreta-123
EVOLUTION_INSTANCE_NAME=agendamento-saas
```

---

## 🧪 Testar Manualmente

### Via cURL:

```bash
curl -X POST http://localhost:8080/message/sendText/agendamento-saas \
  -H "apikey: minha-chave-secreta-123" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste de mensagem! 🎉"
  }'
```

### Via Python:

```python
import requests

url = "http://localhost:8080/message/sendText/agendamento-saas"
headers = {
    "apikey": "minha-chave-secreta-123",
    "Content-Type": "application/json"
}
data = {
    "number": "5511999999999",
    "text": "✨ Teste de mensagem! 🎉"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

## 📊 Verificar Status da Conexão

### Via Browser:
```
http://localhost:8080/instance/connectionState/agendamento-saas
```

### Via cURL:
```bash
curl -X GET http://localhost:8080/instance/connectionState/agendamento-saas \
  -H "apikey: minha-chave-secreta-123"
```

**Resposta esperada:**
```json
{
  "state": "open",
  "instance": {
    "instanceName": "agendamento-saas",
    "owner": "5511999999999",
    "profileName": "Seu Nome"
  }
}
```

---

## 🎯 Como Funciona no Sistema

### 1. Cliente faz agendamento em `/book`

### 2. Backend cria agendamento

### 3. Backend envia WhatsApp automaticamente:

```python
# app/services/notification_service.py
NotificationService.send_whatsapp(
    to_phone="11999999999",
    message="✨ AGENDAMENTO CONFIRMADO! ✨\n\n..."
)
```

### 4. Cliente recebe mensagem formatada:

```
✨ AGENDAMENTO CONFIRMADO! ✨

Olá João Silva! 👋

Seu agendamento foi confirmado! 🎉

━━━━━━━━━━━━━━━━━━━━
📋 DETALHES DO AGENDAMENTO
━━━━━━━━━━━━━━━━━━━━

💼 Serviço: Corte de Cabelo
👤 Profissional: Maria Silva
📅 Data: 15/10/2025
⏰ Horário: 14:00
💰 Valor: R$ 50,00

━━━━━━━━━━━━━━━━━━━━

Estamos ansiosos para te atender! 💜
```

---

## 🔧 Comandos Úteis

### Parar Evolution API:
```bash
docker-compose -f docker-compose.whatsapp.yml down
```

### Reiniciar:
```bash
docker-compose -f docker-compose.whatsapp.yml restart
```

### Ver logs:
```bash
docker-compose -f docker-compose.whatsapp.yml logs -f evolution-api
```

### Remover tudo (cuidado!):
```bash
docker-compose -f docker-compose.whatsapp.yml down -v
```

---

## ❓ Troubleshooting

### QR Code não aparece?
- Aguarde 30 segundos e tente novamente
- Verifique se Docker está rodando: `docker ps`

### Mensagem não chega?
- Verifique conexão: `http://localhost:8080/instance/connectionState/agendamento-saas`
- Veja logs: `docker logs evolution-api`
- Formato do número: deve ser `5511999999999` (código país + DDD + número)

### WhatsApp desconectou?
- Execute novamente: `python scripts/setup_whatsapp.py`
- Escaneie o QR Code novamente

---

## 🎊 PRONTO!

Agora seu sistema envia WhatsApp **GRÁTIS** e **AUTOMATICAMENTE**!

### Próximos Passos:

1. ✅ Execute: `docker-compose -f docker-compose.whatsapp.yml up -d`
2. ✅ Execute: `python scripts/setup_whatsapp.py`
3. ✅ Escaneie o QR Code
4. ✅ Adicione configurações no `.env`
5. ✅ Reinicie o backend
6. ✅ Teste fazendo um agendamento em `/book`

**Cliente vai receber WhatsApp lindo automaticamente!** 📱✨
