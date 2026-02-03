# Integração Evolution API - WhatsApp

## 📋 Visão Geral

A integração com Evolution API permite que o sistema envie e receba mensagens do WhatsApp de forma programática, possibilitando:

- ✅ Envio de mensagens de texto, mídia e botões
- ✅ Gerenciamento de instâncias WhatsApp
- ✅ Recebimento de webhooks
- ✅ Gestão de contatos e grupos
- ✅ Automação de campanhas de marketing

## 🏗️ Arquitetura

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│   Backend API    │─────▶│ Evolution API   │
│   (Next.js)     │      │   (FastAPI)      │      │  (WhatsApp)     │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │   WhatsApp      │
                                                    │   Business      │
                                                    └─────────────────┘
```

## 📁 Arquivos Criados

### Backend

1. **`backend/app/services/evolution_api.py`**
   - Serviço de integração com Evolution API
   - Métodos para todas as operações (mensagens, instâncias, webhooks)
   - Tratamento de erros e timeouts

2. **`backend/app/api/v1/endpoints/evolution_whatsapp.py`**
   - Endpoints REST para integração
   - Autenticação via token JWT
   - Schemas Pydantic para validação

3. **`backend/app/core/config.py`** (atualizado)
   - Configurações do Evolution API:
     - `EVOLUTION_API_URL`: URL da API (padrão: http://localhost:8080)
     - `EVOLUTION_API_KEY`: Chave de autenticação
     - `EVOLUTION_INSTANCE_NAME`: Nome da instância padrão

## 🔧 Configuração na VPS

### 1. Evolution API Docker Compose

Arquivo: `/opt/evolution-api/docker-compose.yml`

```yaml
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - '127.0.0.1:8080:8080'
    environment:
      - SERVER_PORT=8080
      - SERVER_URL=http://localhost:8080
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7
      - LANGUAGE=pt-BR
      - DATABASE_ENABLED=false
      - REDIS_ENABLED=false
      - STORE_MESSAGES=true
      - STORE_MESSAGE_UP=true
      - STORE_CONTACTS=true
      - STORE_CHATS=true
    volumes:
      - ./instances:/evolution/instances
      - ./store:/evolution/store
    networks:
      - evolution_network

networks:
  evolution_network:
    driver: bridge
```

### 2. Iniciar Evolution API

```bash
cd /opt/evolution-api
docker-compose up -d
docker logs evolution-api -f
```

### 3. Configurar Variáveis de Ambiente

Adicionar ao `.env.production` do backend:

```bash
# Evolution API Integration
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7
EVOLUTION_INSTANCE_NAME=atendo_whatsapp
```

### 4. Conectar Redes Docker (se necessário)

```bash
# Conectar Evolution API à rede do sistema principal
docker network connect atendo_agendamento_network evolution-api
```

## 🚀 Endpoints Disponíveis

### Instâncias

- **POST** `/api/v1/evolution-api/instance/create`
  - Cria nova instância WhatsApp
  - Body: `{"instance_name": "nome", "qrcode": true}`

- **GET** `/api/v1/evolution-api/instance/{instance_name}/status`
  - Verifica status da conexão

- **GET** `/api/v1/evolution-api/instance/{instance_name}/qrcode`
  - Obtém QR Code para conectar

- **DELETE** `/api/v1/evolution-api/instance/{instance_name}`
  - Remove instância

### Mensagens

- **POST** `/api/v1/evolution-api/message/{instance_name}/text`
  - Envia mensagem de texto
  - Body: `{"number": "5511999999999", "text": "Olá!"}`

- **POST** `/api/v1/evolution-api/message/{instance_name}/media`
  - Envia imagem/vídeo/documento
  - Body: `{"number": "5511999999999", "media_url": "https://...", "caption": "Legenda"}`

- **POST** `/api/v1/evolution-api/message/{instance_name}/buttons`
  - Envia mensagem com botões interativos

- **POST** `/api/v1/evolution-api/message/{instance_name}/list`
  - Envia mensagem com lista de opções

### Contatos e Conversas

- **GET** `/api/v1/evolution-api/chat/{instance_name}/contacts`
  - Lista todos os contatos

- **GET** `/api/v1/evolution-api/chat/{instance_name}/chats`
  - Lista todas as conversas

- **GET** `/api/v1/evolution-api/chat/{instance_name}/messages/{number}`
  - Obtém mensagens de uma conversa

### Grupos

- **POST** `/api/v1/evolution-api/group/{instance_name}/create`
  - Cria novo grupo
  - Body: `{"subject": "Nome do Grupo", "participants": ["5511999999999"]}`

- **GET** `/api/v1/evolution-api/group/{instance_name}/list`
  - Lista todos os grupos

### Webhooks

- **POST** `/api/v1/evolution-api/webhook/{instance_name}/set`
  - Configura webhook para receber eventos
  - Body: `{"webhook_url": "https://atendo.website/api/v1/evolution/webhook"}`

- **GET** `/api/v1/evolution-api/webhook/{instance_name}`
  - Obtém configuração do webhook

## 💻 Exemplos de Uso

### Python (Backend)

```python
from app.services.evolution_api import evolution_api_service

# Criar instância
instance = await evolution_api_service.create_instance("minha_instancia")

# Enviar mensagem
result = await evolution_api_service.send_text(
    instance_name="minha_instancia",
    number="5511999999999",
    text="Olá! Esta é uma mensagem automática."
)

# Obter QR Code
qrcode = await evolution_api_service.get_qrcode("minha_instancia")
```

### JavaScript (Frontend)

```javascript
// Criar instância
const response = await fetch('/api/v1/evolution-api/instance/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    instance_name: 'minha_instancia',
    qrcode: true
  })
});

const data = await response.json();
console.log('QR Code:', data.qrcode);

// Enviar mensagem
await fetch('/api/v1/evolution-api/message/minha_instancia/text', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '5511999999999',
    text: 'Olá do sistema!'
  })
});
```

## 🔐 Segurança

1. **Autenticação**: Todos os endpoints requerem autenticação JWT
2. **API Key**: Evolution API protegida por chave de API
3. **Rede Interna**: Evolution API não exposta publicamente (127.0.0.1)
4. **HTTPS**: Comunicação externa sempre via HTTPS

## 📊 Monitoramento

### Verificar Status

```bash
# Status do container
docker ps | grep evolution-api

# Logs em tempo real
docker logs evolution-api -f

# Verificar saúde da API
curl http://localhost:8080/health
```

### Métricas

- Mensagens enviadas/recebidas
- Taxa de entrega
- Instâncias ativas
- Erros e falhas

## 🐛 Troubleshooting

### Evolution API não inicia

```bash
# Verificar logs
docker logs evolution-api

# Recriar container
cd /opt/evolution-api
docker-compose down
docker-compose up -d
```

### QR Code não aparece

1. Verificar se a instância foi criada
2. Verificar logs do Evolution API
3. Tentar recriar a instância

### Mensagens não são enviadas

1. Verificar se a instância está conectada
2. Verificar formato do número (com DDI: 5511999999999)
3. Verificar logs do backend e Evolution API

## 🔄 Próximos Passos

1. **Ativar endpoints no backend**
   - Descomentar importação em `api.py`
   - Adicionar ao `__init__.py` dos endpoints

2. **Criar interface no frontend**
   - Página de gerenciamento de instâncias
   - Envio de mensagens
   - Visualização de conversas

3. **Integrar com campanhas existentes**
   - Usar Evolution API para enviar campanhas
   - Webhook para receber respostas
   - Relatórios de entrega

4. **Configurar webhooks**
   - Endpoint para receber eventos
   - Processar mensagens recebidas
   - Atualizar status de entrega

## 📚 Documentação Oficial

- Evolution API: https://doc.evolution-api.com/
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp

## ✅ Status Atual

- ✅ Serviço de integração criado
- ✅ Endpoints REST implementados
- ✅ Configurações adicionadas
- ⏳ Evolution API configurado (precisa ajustes)
- ⏳ Frontend pendente
- ⏳ Testes de integração pendentes

---

**Última atualização**: 27/01/2026
**Versão**: 1.0.0
