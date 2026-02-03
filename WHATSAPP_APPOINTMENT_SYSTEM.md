# Sistema de Gerenciamento de Agendamentos via WhatsApp

## 📋 Visão Geral

Sistema completo para gerenciar agendamentos através do WhatsApp, permitindo que clientes:
- ✅ Recebam notificações de novos agendamentos
- ✅ Confirmem ou cancelem agendamentos com botões
- ✅ Reagendem através de interações
- ✅ Escolham serviços via lista interativa
- ✅ Selecionem horários disponíveis
- ✅ Recebam lembretes automáticos

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AGENDAMENTO                      │
└─────────────────────────────────────────────────────────────┘

1. CRIAÇÃO DO AGENDAMENTO
   Sistema → WhatsApp: "Novo agendamento criado"
   
2. CONFIRMAÇÃO (24h antes)
   Sistema → WhatsApp: Botões [Confirmar] [Reagendar] [Cancelar]
   Cliente → Sistema: Clica em botão
   Sistema → WhatsApp: Confirmação da ação
   
3. LEMBRETE (2h antes)
   Sistema → WhatsApp: "Lembrete: seu agendamento é em 2h"
   
4. REAGENDAMENTO (se solicitado)
   Sistema → WhatsApp: Lista de horários disponíveis
   Cliente → Sistema: Seleciona novo horário
   Sistema → WhatsApp: "Reagendamento confirmado"
```

## 📁 Arquivos Criados

### 1. Serviço de Notificações
**`backend/app/services/whatsapp_appointment_notifications.py`**

Classe principal: `WhatsAppAppointmentNotificationService`

#### Métodos Principais:

```python
# Confirmação com botões
send_appointment_confirmation_request(db, appointment)

# Lembrete de agendamento
send_appointment_reminder(db, appointment, hours_before=24)

# Notificação de criação
send_appointment_created(db, appointment)

# Confirmação de ação
send_appointment_confirmed(db, appointment)
send_appointment_cancelled(db, appointment)

# Seleção interativa
send_service_selection(db, client_phone, available_services)
send_time_slot_selection(client_phone, available_slots, date)
```

### 2. Webhook Handler
**`backend/app/api/v1/endpoints/whatsapp_webhook_handler.py`**

Processa eventos recebidos do Evolution API:

- **Botões clicados**: Confirmar, Reagendar, Cancelar
- **Listas selecionadas**: Serviços, Horários
- **Mensagens de texto**: Comandos simples
- **Status de mensagens**: Entregue, Lido

### 3. Endpoints de Integração
**`backend/app/api/v1/endpoints/appointment_whatsapp.py`**

Endpoints REST para gerenciar notificações:

```
POST /api/v1/appointment-whatsapp/send-confirmation/{id}
POST /api/v1/appointment-whatsapp/send-reminder/{id}
POST /api/v1/appointment-whatsapp/notify-created/{id}
POST /api/v1/appointment-whatsapp/send-service-list
POST /api/v1/appointment-whatsapp/batch-send-reminders
POST /api/v1/appointment-whatsapp/configure-webhook
GET  /api/v1/appointment-whatsapp/webhook-status
```

## 🚀 Como Usar

### 1. Enviar Confirmação de Agendamento

```python
# Backend
from app.services.whatsapp_appointment_notifications import whatsapp_appointment_service

result = await whatsapp_appointment_service.send_appointment_confirmation_request(
    db=db,
    appointment=appointment
)
```

```bash
# API REST
curl -X POST "https://atendo.website/api/v1/appointment-whatsapp/send-confirmation/123" \
  -H "Authorization: Bearer {token}"
```

**Mensagem enviada:**
```
🗓️ Confirmação de Agendamento

Olá João! 👋

Você tem um agendamento marcado:

📅 Data: 28/01/2026
🕐 Horário: 14:00
💇 Serviço: Corte de Cabelo
👤 Profissional: Maria Silva

Por favor, confirme sua presença:

[✅ Confirmar] [📅 Reagendar] [❌ Cancelar]
```

### 2. Processar Resposta do Cliente

Quando o cliente clica em um botão, o webhook recebe:

```json
{
  "event": "messages.upsert",
  "data": {
    "messageType": "buttonsResponseMessage",
    "message": {
      "buttonsResponseMessage": {
        "selectedButtonId": "confirm_123"
      }
    }
  }
}
```

O sistema automaticamente:
1. Atualiza o status do agendamento
2. Envia mensagem de confirmação
3. Registra a ação no banco

### 3. Enviar Lista de Serviços

```python
result = await whatsapp_appointment_service.send_service_selection(
    db=db,
    client_phone="5511999999999",
    available_services=services
)
```

**Mensagem enviada:**
```
💇 Escolha seu Serviço

Selecione o serviço desejado na lista abaixo:

[Ver Serviços]
  → Corte de Cabelo - R$ 50,00 - 30 min
  → Manicure - R$ 35,00 - 45 min
  → Pedicure - R$ 40,00 - 60 min
  ...
```

### 4. Configurar Webhook

```bash
curl -X POST "https://atendo.website/api/v1/appointment-whatsapp/configure-webhook" \
  -H "Authorization: Bearer {token}"
```

Isso configura o Evolution API para enviar eventos para:
`https://atendo.website/api/v1/whatsapp-webhook/webhook`

## 🔄 Fluxos Completos

### Fluxo 1: Confirmação de Agendamento

```
1. Sistema cria agendamento
   ↓
2. Sistema envia notificação com botões
   ↓
3. Cliente clica em "Confirmar"
   ↓
4. Webhook recebe evento
   ↓
5. Sistema atualiza status → CONFIRMED
   ↓
6. Sistema envia mensagem de confirmação
```

### Fluxo 2: Reagendamento

```
1. Cliente clica em "Reagendar"
   ↓
2. Sistema envia lista de horários disponíveis
   ↓
3. Cliente seleciona novo horário
   ↓
4. Sistema atualiza agendamento
   ↓
5. Sistema envia confirmação do novo horário
```

### Fluxo 3: Novo Agendamento Interativo

```
1. Cliente envia "quero agendar"
   ↓
2. Sistema envia lista de serviços
   ↓
3. Cliente seleciona serviço
   ↓
4. Sistema envia lista de profissionais
   ↓
5. Cliente seleciona profissional
   ↓
6. Sistema envia datas disponíveis
   ↓
7. Cliente seleciona data
   ↓
8. Sistema envia horários disponíveis
   ↓
9. Cliente seleciona horário
   ↓
10. Sistema cria agendamento
    ↓
11. Sistema envia confirmação
```

## 📊 Tipos de Mensagens

### 1. Mensagem com Botões

```python
{
  "title": "Título",
  "description": "Descrição detalhada",
  "footer": "Rodapé",
  "buttons": [
    {"buttonId": "action_id", "buttonText": {"displayText": "Texto"}}
  ]
}
```

### 2. Mensagem com Lista

```python
{
  "title": "Título",
  "description": "Descrição",
  "buttonText": "Ver Opções",
  "sections": [
    {
      "title": "Categoria",
      "rows": [
        {"title": "Item", "description": "Desc", "rowId": "item_id"}
      ]
    }
  ]
}
```

### 3. Mensagem de Texto

```python
{
  "number": "5511999999999",
  "text": "Mensagem de texto simples"
}
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicionar ao `.env.production`:

```bash
# Evolution API
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7
EVOLUTION_INSTANCE_NAME=atendo_whatsapp

# Webhook URL (pública)
API_URL=https://atendo.website
```

### 2. Inicializar Instância WhatsApp

```bash
# 1. Criar instância
curl -X POST "http://localhost:8080/instance/create" \
  -H "apikey: evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "atendo_whatsapp", "qrcode": true}'

# 2. Obter QR Code
curl "http://localhost:8080/instance/connect/atendo_whatsapp" \
  -H "apikey: evl_9f3c2a7b8e4d1c6a5f0b2e9a7d4c8f61b9a0e3c7"

# 3. Escanear QR Code com WhatsApp

# 4. Configurar webhook via API do sistema
curl -X POST "https://atendo.website/api/v1/appointment-whatsapp/configure-webhook" \
  -H "Authorization: Bearer {token}"
```

### 3. Agendar Lembretes Automáticos

Criar job no Celery para enviar lembretes:

```python
# backend/app/tasks/whatsapp_reminders.py
from celery import shared_task
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.appointment import Appointment
from app.services.whatsapp_appointment_notifications import whatsapp_appointment_service

@shared_task
def send_appointment_reminders():
    """Envia lembretes para agendamentos nas próximas 24h"""
    db = SessionLocal()
    try:
        now = datetime.now()
        tomorrow = now + timedelta(hours=24)
        
        appointments = db.query(Appointment).filter(
            Appointment.start_time >= now,
            Appointment.start_time <= tomorrow,
            Appointment.status.in_(['scheduled', 'confirmed'])
        ).all()
        
        for appointment in appointments:
            whatsapp_appointment_service.send_appointment_reminder(
                db=db,
                appointment=appointment,
                hours_before=24
            )
    finally:
        db.close()
```

Configurar no Celery Beat:

```python
# backend/app/core/celery_config.py
beat_schedule = {
    'send-appointment-reminders': {
        'task': 'app.tasks.whatsapp_reminders.send_appointment_reminders',
        'schedule': crontab(hour=8, minute=0),  # Todo dia às 8h
    }
}
```

## 📱 Exemplos de Interação

### Exemplo 1: Cliente Confirma Agendamento

**Sistema → Cliente:**
```
🗓️ Confirmação de Agendamento

Olá João! 👋
Você tem um agendamento marcado:
📅 Data: 28/01/2026
🕐 Horário: 14:00
💇 Serviço: Corte de Cabelo

[✅ Confirmar] [📅 Reagendar] [❌ Cancelar]
```

**Cliente clica: ✅ Confirmar**

**Sistema → Cliente:**
```
✅ Agendamento Confirmado!

Obrigado por confirmar, João!
Seu agendamento está confirmado:
📅 Data: 28/01/2026
🕐 Horário: 14:00
💇 Serviço: Corte de Cabelo

Aguardamos você! 😊
```

### Exemplo 2: Cliente Cancela

**Cliente clica: ❌ Cancelar**

**Sistema → Cliente:**
```
❌ Agendamento Cancelado

Olá João,
Seu agendamento foi cancelado conforme solicitado.
📅 Data: 28/01/2026
🕐 Horário: 14:00

Esperamos vê-lo em breve!
```

### Exemplo 3: Lembrete Automático

**Sistema → Cliente (2h antes):**
```
🔔 Lembrete de Agendamento

Olá João!
Você tem um agendamento em 2 horas:
📅 Data: 28/01/2026
🕐 Horário: 14:00
💇 Serviço: Corte de Cabelo
👤 Profissional: Maria Silva

Nos vemos em breve! 😊
```

## 🔐 Segurança

1. **Validação de Webhook**: Verificar origem das requisições
2. **Autenticação**: Todos os endpoints requerem JWT
3. **Rate Limiting**: Limitar requisições por IP
4. **Sanitização**: Validar dados recebidos do webhook
5. **Logs**: Registrar todas as interações

## 📊 Monitoramento

### Métricas Importantes:

- Taxa de confirmação de agendamentos
- Tempo médio de resposta dos clientes
- Taxa de cancelamento via WhatsApp
- Mensagens entregues vs lidas
- Erros de envio

### Logs:

```python
logger.info(f"Confirmação enviada para agendamento {appointment.id}")
logger.warning(f"Cliente sem telefone para agendamento {appointment.id}")
logger.error(f"Erro ao enviar confirmação: {e}")
```

## 🐛 Troubleshooting

### Mensagens não são entregues

1. Verificar se a instância está conectada
2. Verificar formato do número (55 + DDD + número)
3. Verificar logs do Evolution API
4. Testar envio manual via API

### Webhook não recebe eventos

1. Verificar URL do webhook está acessível
2. Verificar configuração no Evolution API
3. Testar com ngrok em desenvolvimento
4. Verificar logs do nginx/backend

### Botões não funcionam

1. Verificar se o número suporta botões interativos
2. Verificar formato do buttonId
3. Testar com mensagem de texto simples primeiro

## 🚀 Próximos Passos

1. **Implementar fluxo completo de reagendamento**
   - Selecionar nova data
   - Selecionar novo horário
   - Confirmar reagendamento

2. **Adicionar NLP para comandos**
   - "quero agendar"
   - "cancelar meu agendamento"
   - "mudar horário"

3. **Criar dashboard de métricas**
   - Taxa de confirmação
   - Horários mais cancelados
   - Serviços mais solicitados

4. **Implementar chatbot completo**
   - Agendamento do zero via WhatsApp
   - Consulta de disponibilidade
   - Histórico de agendamentos

5. **Adicionar pagamento via WhatsApp**
   - Link de pagamento PIX
   - Confirmação de pagamento
   - Nota fiscal automática

## ✅ Status Atual

- ✅ Serviço de notificações criado
- ✅ Webhook handler implementado
- ✅ Endpoints REST disponíveis
- ✅ Confirmação com botões
- ✅ Lembretes automáticos
- ✅ Seleção de serviços via lista
- ⏳ Fluxo de reagendamento (parcial)
- ⏳ Integração com Celery (pendente)
- ⏳ Frontend para gerenciar (pendente)
- ⏳ Testes de integração (pendente)

---

**Última atualização**: 27/01/2026
**Versão**: 1.0.0
