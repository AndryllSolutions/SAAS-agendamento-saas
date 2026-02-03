# 🚀 GUIA RÁPIDO - WHATSAPP INTEGRADO

## ✅ STATUS ATUAL

**WhatsApp funcionando e pronto para uso!**

- ✅ Evolution API v2.1.0 rodando
- ✅ Instância `Atendo-chat-bot` conectada
- ✅ Mensagens sendo enviadas com sucesso
- ✅ Backend multi-tenant configurado

---

## 📱 COMO USAR

### **1. Enviar Notificação de Agendamento**

No seu código do backend:

```python
from app.services.whatsapp_appointment_notifications import WhatsAppAppointmentNotificationService

# Criar serviço
whatsapp_service = WhatsAppAppointmentNotificationService()

# Enviar confirmação de agendamento
await whatsapp_service.send_appointment_confirmation_request(
    db=db,
    appointment=appointment  # Objeto do agendamento
)
```

### **2. Enviar Lembrete**

```python
# Lembrete 24h antes
await whatsapp_service.send_appointment_reminder(
    db=db,
    appointment=appointment,
    hours_before=24
)
```

### **3. Enviar Mensagem Customizada**

```python
from app.services.evolution_api import EvolutionAPIService

evolution = EvolutionAPIService()

# Enviar mensagem
await evolution.send_text_message(
    instance_name="Atendo-chat-bot",
    phone_number="5511999999999",  # Com DDI+DDD
    message="Sua mensagem aqui"
)
```

---

## 🔗 ENDPOINTS REST DISPONÍVEIS

### **Gerenciar Instâncias**

```bash
# Listar instâncias
GET /api/v1/evolution/instances
Headers: Authorization: Bearer {token}

# Criar instância (para nova empresa)
POST /api/v1/evolution/instances
{
  "company_id": 1,
  "instance_name": "company_1_whatsapp"
}

# Status da instância
GET /api/v1/evolution/instances/{instance_name}/status
```

### **Enviar Mensagens**

```bash
# Enviar mensagem de texto
POST /api/v1/evolution/messages/text
{
  "instance_name": "Atendo-chat-bot",
  "phone_number": "5511999999999",
  "message": "Olá!"
}

# Enviar mensagem com mídia
POST /api/v1/evolution/messages/media
{
  "instance_name": "Atendo-chat-bot",
  "phone_number": "5511999999999",
  "media_url": "https://...",
  "caption": "Legenda"
}
```

### **Notificações de Agendamento**

```bash
# Enviar confirmação
POST /api/v1/appointments/{appointment_id}/whatsapp/confirmation

# Enviar lembrete
POST /api/v1/appointments/{appointment_id}/whatsapp/reminder

# Enviar cancelamento
POST /api/v1/appointments/{appointment_id}/whatsapp/cancellation
```

---

## 🎯 CASOS DE USO

### **Caso 1: Novo Agendamento**

```python
# Quando cliente agenda
appointment = create_appointment(...)

# Enviar confirmação automática
await whatsapp_service.send_appointment_confirmation_request(
    db=db,
    appointment=appointment
)
```

### **Caso 2: Lembrete Automático**

Configure um job Celery:

```python
@celery_app.task
def send_appointment_reminders():
    """Envia lembretes 24h antes"""
    tomorrow = datetime.now() + timedelta(days=1)
    appointments = get_appointments_for_date(tomorrow)
    
    for appointment in appointments:
        whatsapp_service.send_appointment_reminder(
            db=db,
            appointment=appointment,
            hours_before=24
        )
```

### **Caso 3: Multi-Tenant**

Cada empresa tem sua própria instância:

```python
# Empresa 1
instance_name = f"company_{company_id}_whatsapp"

# Criar instância para nova empresa
await evolution.create_instance(
    instance_name=instance_name,
    company_id=company_id
)

# Usar instância específica
await evolution.send_text_message(
    instance_name=instance_name,
    phone_number=client_phone,
    message=message
)
```

---

## 🔧 CONFIGURAÇÃO

### **Variáveis de Ambiente (.env.production)**

```bash
EVOLUTION_API_URL=http://72.62.138.239:8080
EVOLUTION_API_KEY=B6D711FCDE4D4FD5936544120E713976
EVOLUTION_INSTANCE_NAME=Atendo-chat-bot
```

### **Reiniciar Backend (após mudanças)**

```bash
ssh root@72.62.138.239
cd /opt/saas/atendo
docker compose restart backend
```

---

## 📊 MONITORAMENTO

### **Verificar Status da API**

```bash
curl http://72.62.138.239:8080
```

### **Ver Logs do Evolution API**

```bash
cd /opt/evolution-api-v2
docker compose logs evolution --tail 50
```

### **Ver Logs do Backend**

```bash
cd /opt/saas/atendo
docker compose logs backend --tail 50
```

---

## 🔐 WEBHOOK (Opcional)

Para receber respostas dos clientes:

```bash
POST http://72.62.138.239:8080/webhook/set/Atendo-chat-bot
{
  "url": "https://atendo.website/api/v1/whatsapp-webhook",
  "events": ["messages.upsert", "messages.update"],
  "webhook_by_events": false
}
```

O webhook será processado em:
- `app/api/v1/endpoints/whatsapp_webhook_handler.py`

---

## 📱 MANAGER WEB

Acesse a interface visual:

```
http://72.62.138.239:8080/manager
```

**API Key:** `B6D711FCDE4D4FD5936544120E713976`

---

## 🚨 TROUBLESHOOTING

### **Mensagem não enviada**

1. Verificar se instância está conectada:
```bash
curl http://72.62.138.239:8080/instance/connectionState/Atendo-chat-bot \
  -H "apikey: B6D711FCDE4D4FD5936544120E713976"
```

2. Verificar logs:
```bash
docker compose logs evolution --tail 100
```

### **QR Code não aparece**

O bug foi resolvido com `LOG_LEVEL=info`. Se voltar:

```bash
cd /opt/evolution-api-v2
# Verificar .env
cat .env | grep LOG_LEVEL
# Deve mostrar: LOG_LEVEL=info

# Se estiver errado, corrigir:
sed -i 's/LOG_LEVEL=.*/LOG_LEVEL=info/' .env
docker compose restart evolution
```

### **Instância desconectada**

Reconectar pelo Manager:
1. Acesse http://72.62.138.239:8080/manager
2. Clique na instância
3. Clique em "Connect"
4. Escaneie novo QR Code

---

## 📚 DOCUMENTAÇÃO COMPLETA

- `EVOLUTION_API_INTEGRATION.md` - Integração completa
- `WHATSAPP_APPOINTMENT_SYSTEM.md` - Sistema de notificações
- `WHATSAPP_MULTITENANT_ISOLATION.md` - Isolamento multi-tenant
- `STATUS_FINAL.md` - Status e troubleshooting

---

## 🎉 PRONTO PARA USAR!

O sistema está 100% funcional e pronto para enviar notificações de agendamento via WhatsApp!

**Teste rápido:**

```python
# No shell do Django/FastAPI
from app.services.evolution_api import EvolutionAPIService

evolution = EvolutionAPIService()
result = await evolution.send_text_message(
    instance_name="Atendo-chat-bot",
    phone_number="5511999999999",  # Seu número
    message="🎉 Sistema Atendo funcionando!"
)
print(result)
```

---

**Data:** 27/01/2026  
**Status:** ✅ Operacional  
**Versão Evolution API:** v2.1.0
