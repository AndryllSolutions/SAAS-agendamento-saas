# Guia Completo: Configuração Evolution API

## O que é Evolution API?

Evolution API é um sistema de gerenciamento de WhatsApp que permite:
- Enviar mensagens via API REST
- Gerenciar múltiplas instâncias
- Integrar com sistemas existentes
- Automação de marketing e atendimento

## Como Obter as Variáveis

### 1. EVOLUTION_API_URL

**Opções de Hospedagem:**

**A) Docker Local (Recomendado para desenvolvimento)**
```bash
# Clonar repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configurar docker-compose.yml
# URL será: http://localhost:8080
EVOLUTION_API_URL=http://localhost:8080
```

**B) Serviços Cloud:**
- **EvolutionAPI.cloud**: https://evolution-api.cloud
- **WppConnect.io**: https://wppconnect.io
- **Instaladores próprios**: VPS dedicada

**C) Exemplo URLs:**
```
Local Docker: http://localhost:8080
VPS DigitalOcean: https://api.yourdomain.com
Nuvem Evolution: https://your-instance.evolution-api.cloud
```

### 2. EVOLUTION_API_KEY

**Como Gerar a API Key:**

**A) Via Interface Web (Evolution API):**
1. Acessar painel: `{EVOLUTION_API_URL}/`
2. Login com credenciais admin
3. Ir para "API Keys" ou "Tokens"
4. Gerar nova chave
5. Copiar a chave gerada

**B) Via API (se já tiver acesso):**
```bash
curl -X POST "{EVOLUTION_API_URL}/instance/generateToken" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "agendamento-saas",
    "number": "5511999999999"
  }'
```

**C) Exemplo de API Key:**
```
EVOLUTION_API_KEY=12345678-1234-1234-1234-123456789abc
```

### 3. EVOLUTION_INSTANCE_NAME

**O que é Instance Name?**
- Nome único da sua instância do WhatsApp
- Conectado a um número de telefone específico
- Pode gerenciar múltiplas instâncias

**Como Criar:**

**A) Via Interface Web:**
1. Login no painel Evolution
2. "Create Instance" ou "Nova Instância"
3. Preencher:
   - Instance Name: `agendamento-saas`
   - Phone Number: `+5511999999999` (seu número)
   - Webhook (opcional)

**B) Via API:**
```bash
curl -X POST "{EVOLUTION_API_URL}/instance/create" \
  -H "apikey: {EVOLUTION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "agendamento-saas",
    "qrcode": true,
    "number": "5511999999999",
    "token": "seu-token-aqui",
    "webhook": "http://seuservidor.com/webhook"
  }'
```

**C) Exemplo:**
```
EVOLUTION_INSTANCE_NAME=agendamento-saas
```

## Passo a Passo Completo

### Passo 1: Instalar Evolution API

**Opção A - Docker (Mais fácil):**
```bash
# Criar pasta para Evolution
mkdir evolution-api
cd evolution-api

# Baixar docker-compose
curl -O https://raw.githubusercontent.com/EvolutionAPI/evolution-api/main/docker-compose.yml

# Editar variáveis no docker-compose.yml
nano docker-compose.yml

# Substituir:
# - SERVER_PORT=8080
# - AUTHENTICATION_TYPE=apikey
# - AUTHENTICATION_API_KEY=sua-chave-secreta

# Iniciar
docker-compose up -d
```

**Opção B - Cloud:**
1. Criar conta em https://evolution-api.cloud
2. Seguir wizard de configuração
3. Obter URL e API Key

### Passo 2: Conectar WhatsApp

1. Após criar instância, escanear QR Code
2. Manter WhatsApp conectado
3. Testar envio via painel

### Passo 3: Configurar no Sistema

**Adicionar ao .env:**
```bash
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key-aqui
EVOLUTION_INSTANCE_NAME=agendamento-saas
```

**Atualizar config.py (se necessário):**
```python
# Em app/core/config.py
EVOLUTION_API_URL: Optional[str] = None
EVOLUTION_API_KEY: Optional[str] = None
EVOLUTION_INSTANCE_NAME: str = "agendamento-saas"
```

### Passo 4: Testar Integração

**Teste via Python:**
```python
import requests

# Configurações
url = "http://localhost:8080/message/sendText/agendamento-saas"
headers = {
    "apikey": "sua-api-key",
    "Content-Type": "application/json"
}

# Mensagem de teste
data = {
    "number": "5511999999999",
    "text": "🧪 Teste de integração Evolution API!"
}

# Enviar
response = requests.post(url, json=data, headers=headers)
print(response.status_code, response.text)
```

## Recursos Úteis

**Documentação Oficial:**
- GitHub: https://github.com/EvolutionAPI/evolution-api
- Docs: https://doc.evolution-api.com
- Discord: https://discord.gg/evolution-api

**Exemplos de URLs Comuns:**
```
Local Docker: http://localhost:8080
Cloud Demo: https://demo.evolution-api.com
SaaS Provider: https://api.provider.com
```

**Segurança:**
- Nunca compartilhar API Keys
- Usar HTTPS em produção
- Configurar rate limiting
- Monitorar logs

## Troubleshooting

**Erro 401 Unauthorized:**
- Verificar API Key
- Checar se instance está ativa

**Erro 404 Not Found:**
- Verificar URL base
- Confirmar instance name

**QR Code não aparece:**
- Reiniciar instância
- Verificar se número já está conectado

**Mensagem não enviada:**
- Verificar formato do número (+55DDDXXXXXXX)
- Confirmar WhatsApp conectado
- Checar logs da Evolution API

## Próximos Passos

1. ✅ Obter variáveis
2. ✅ Configurar .env
3. ✅ Testar integração
4. 🔄 Implementar reset de senha
5. 🔄 Configurar templates
6. 🔄 Monitorar envios
