# 📱 Integração Evolution API - WhatsApp Calendar

## Resumo

Integração completa com **Evolution API** para confirmação, reagendamento e cancelamento de agendamentos via WhatsApp. O cliente recebe mensagens interativas e pode responder diretamente pelo WhatsApp.

---

## Funcionalidades

- **Confirmação de agendamento**: Envia solicitação com botões interativos
- **Lembretes automáticos**: 24h e 2h antes do agendamento
- **Reagendamento**: Lista de horários disponíveis via WhatsApp
- **Cancelamento**: Confirmação de cancelamento com opção de manter
- **Webhooks**: Processa respostas do cliente automaticamente
- **Fallback**: Se botões não funcionarem, usa mensagem de texto

---

## Arquitetura

### Serviço Principal

**`app/services/evolution_api_service.py`**

```python
class EvolutionAPIService:
    # Envio de mensagens
    send_text_message(phone, message)
    send_button_message(phone, title, description, buttons)
    send_list_message(phone, title, description, button_text, sections)
    
    # Agendamentos
    send_appointment_confirmation_request(appointment)
    send_appointment_reminder(appointment, hours_before)
    send_reschedule_options(appointment, available_slots)
    send_cancellation_confirmation(appointment)
    send_appointment_confirmed(appointment)
    send_appointment_rescheduled(appointment, old_datetime)
    
    # Webhook
    process_webhook_message(payload)
```

### Tasks Automáticas

**`app/tasks/whatsapp_calendar_tasks.py`**

- `send_whatsapp_confirmation_requests`: A cada 30 min
- `send_whatsapp_reminders`: A cada 15 min
- `send_appointment_notification`: Disparo manual

---

## Endpoints

```
POST /api/v1/evolution/webhook              # Receber webhooks
POST /api/v1/evolution/webhook/{instance}   # Webhook por instância
GET  /api/v1/evolution/status               # Status da conexão
POST /api/v1/evolution/test-message         # Testar envio
```

---

## Configuração

### Variáveis de Ambiente

```env
# Evolution API
WHATSAPP_API_URL=http://sua-vps:8080
WHATSAPP_API_TOKEN=sua_api_key
WHATSAPP_INSTANCE_NAME=nome_da_instancia
```

### Configurar Webhook na Evolution API

Na sua instância Evolution API, configure o webhook para:

```
URL: https://seu-backend.com/api/v1/evolution/webhook
Eventos: messages.upsert, messages.update, connection.update
```

---

## Fluxo de Confirmação

### 1. Sistema envia solicitação

```
📅 Confirmação de Agendamento

Olá *João*!

Você tem um agendamento marcado:

📋 Serviço: Corte de Cabelo
👤 Profissional: Maria
📆 Data: 27/01/2024
⏰ Horário: 14:00
🏢 Local: Salão Beleza

Por favor, confirme sua presença:

[✅ Confirmar] [📅 Reagendar] [❌ Cancelar]
```

### 2. Cliente responde

- **Botão "Confirmar"**: Agendamento confirmado
- **Botão "Reagendar"**: Recebe lista de horários
- **Botão "Cancelar"**: Recebe confirmação de cancelamento

### 3. Sistema processa via webhook

O webhook recebe a resposta e executa a ação automaticamente.

---

## Fluxo de Reagendamento

### 1. Cliente clica em "Reagendar"

```
📅 Reagendamento

Olá *João*!

Escolha um novo horário para seu agendamento:

[Ver Horários]

📆 27/01/2024
  ⏰ 10:00
  ⏰ 11:00
  ⏰ 15:00

📆 28/01/2024
  ⏰ 09:00
  ⏰ 14:00
```

### 2. Cliente seleciona horário

Sistema atualiza agendamento e envia confirmação.

---

## Fallback para Texto

Se botões interativos não funcionarem:

```
📅 *Confirmação de Agendamento*

Olá *João*!

Você tem um agendamento marcado:
📋 Serviço: Corte de Cabelo
📆 Data: 27/01/2024 às 14:00

Responda:
*1* - ✅ Confirmar presença
*2* - 📅 Reagendar
*3* - ❌ Cancelar

_Responda com o número da opção desejada_
```

---

## Integração com Scheduling Settings

O sistema usa as configurações dinâmicas de agendamento:

```python
# Horários de lembrete configurados por empresa
reminder_hours = scheduling_settings.reminder_hours_before or [24, 2]

# Templates personalizados (se configurados)
templates = scheduling_settings.notification_templates
```

---

## Endpoints Evolution API Utilizados

| Endpoint | Descrição |
|----------|-----------|
| `/message/sendText/{instance}` | Enviar texto simples |
| `/message/sendButtons/{instance}` | Enviar com botões |
| `/message/sendList/{instance}` | Enviar lista de opções |
| `/instance/connectionState/{instance}` | Verificar conexão |

---

## Webhook Events

| Evento | Ação |
|--------|------|
| `messages.upsert` | Processa resposta do cliente |
| `messages.update` | Atualiza status (delivered, read) |
| `connection.update` | Monitora conexão |

---

## Como Configurar na VPS

### 1. Verificar Evolution API

```bash
# Verificar se está rodando
docker ps | grep evolution

# Logs
docker logs evolution-api
```

### 2. Configurar variáveis no backend

```bash
# No .env do backend
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_TOKEN=sua_api_key_aqui
WHATSAPP_INSTANCE_NAME=minha_instancia
```

### 3. Criar instância (se não existir)

```bash
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: sua_api_key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "minha_instancia"}'
```

### 4. Conectar WhatsApp

```bash
# Obter QR Code
curl "http://localhost:8080/instance/qrcode/minha_instancia" \
  -H "apikey: sua_api_key"
```

### 5. Configurar Webhook

```bash
curl -X POST "http://localhost:8080/webhook/set/minha_instancia" \
  -H "apikey: sua_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://seu-backend.com/api/v1/evolution/webhook",
    "events": ["messages.upsert", "connection.update"]
  }'
```

---

## Testar Integração

### Via API

```bash
# Testar envio de mensagem
curl -X POST "http://seu-backend.com/api/v1/evolution/test-message?phone=5511999999999&message=Teste"

# Verificar status
curl "http://seu-backend.com/api/v1/evolution/status"
```

### Via Python

```python
from app.services.evolution_api_service import get_evolution_api_service
from app.core.database import SessionLocal

db = SessionLocal()
service = get_evolution_api_service(db)

# Verificar conexão
status = service.check_connection()
print(status)

# Enviar mensagem teste
result = service.send_text_message("5511999999999", "Teste de integração!")
print(result)
```

---

## Status

✅ **IMPLEMENTADO E OPERACIONAL**

- Serviço Evolution API completo
- Confirmação via WhatsApp
- Reagendamento interativo
- Cancelamento com confirmação
- Webhooks para respostas
- Tasks automáticas configuradas
- Integração com Scheduling Settings
