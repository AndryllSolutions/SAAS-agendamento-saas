# Automação de Agendamentos via Evolution API

## ✅ O que já existe no sistema

### Backend - Confirmação de Agendamentos
- ✅ `AppointmentNotificationService.send_booking_confirmation()` - Email
- ✅ Endpoint `POST /appointments/{id}/reschedule` - Reagendamento
- ✅ Sistema completo de notificações
- ✅ Templates profissionais de email
- ❌ WhatsApp não implementado (TODO na linha 155)

### Frontend - Estrutura
- ✅ Formulários de agendamento
- ✅ Sistema de notificações
- ✅ Preferências de usuário (`notification_preferences`)

## 🚀 Implementação WhatsApp para Agendamentos

### 1. Confirmação de Agendamento

**Fluxo Atual (Email):**
```
Agendamento → Email de confirmação → OK
```

**Novo Fluxo (WhatsApp):**
```
Agendamento → WhatsApp com botões interativos → Cliente confirma/reagenda → Sistema atualiza
```

### 2. Templates Interativos WhatsApp

**Mensagem de Confirmação:**
```python
def send_whatsapp_confirmation(appointment_id: int, client_phone: str):
    """Enviar confirmação com botões interativos"""
    
    message_data = {
        "number": client_phone,
        "text": "🗓️ *Agendamento Confirmado!*\n\n"
               f"📋 Serviço: {appointment.service_name}\n"
               f"👤 Profissional: {appointment.professional_name}\n"
               f"📅 Data: {appointment.start_time.strftime('%d/%m/%Y')}\n"
               f"⏰ Horário: {appointment.start_time.strftime('%H:%M')}\n\n"
               "Por favor, confirme sua presença:",
        "buttons": [
            {
                "buttonId": f"confirm_{appointment_id}",
                "buttonText": {"displayText": "✅ Confirmar Presença"}
            },
            {
                "buttonId": f"reschedule_{appointment_id}",
                "buttonText": {"displayText": "🔄 Reagendar"}
            },
            {
                "buttonId": f"cancel_{appointment_id}",
                "buttonText": {"displayText": "❌ Cancelar"}
            }
        ]
    }
    
    # Enviar via Evolution API
    response = requests.post(
        f"{EVOLUTION_API_URL}/message/sendButtons/{EVOLUTION_INSTANCE}",
        json=message_data,
        headers={"apikey": EVOLUTION_API_KEY}
    )
```

### 3. Sistema de Reagendamento

**Opções de Reagendamento:**
```python
def send_reschedule_options(appointment_id: int, client_phone: str):
    """Enviar opções de reagendamento"""
    
    # Buscar horários disponíveis
    available_slots = get_available_slots(
        professional_id=appointment.professional_id,
        service_id=appointment.service_id,
        date_range=7  # Próximos 7 dias
    )
    
    # Criar lista de botões com horários
    buttons = []
    for slot in available_slots[:5]:  # Limitar a 5 opções
        buttons.append({
            "buttonId": f"reschedule_{appointment_id}_{slot.isoformat()}",
            "buttonText": {"displayText": slot.strftime('%d/%m %H:%M')}
        })
    
    message_data = {
        "number": client_phone,
        "text": "🔄 *Opções de Reagendamento*\n\n"
               f"Seu agendamento atual: {appointment.start_time.strftime('%d/%m %H:%M')}\n\n"
               "Selecione um novo horário:",
        "buttons": buttons
    }
```

### 4. Webhook para Processar Respostas

**Endpoint para receber interações:**
```python
@router.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    """Processar interações do WhatsApp"""
    
    data = await request.json()
    
    # Verificar se é uma resposta de botão
    if data.get("event") == "button":
        button_id = data.get("buttonId")
        phone_number = data.get("from")
        
        # Parse do button_id: "confirm_123" ou "reschedule_123_2024-01-20T14:00:00"
        parts = button_id.split("_")
        action = parts[0]
        appointment_id = int(parts[1])
        
        if action == "confirm":
            await handle_confirmation(appointment_id, phone_number, db)
        elif action == "reschedule":
            new_time = datetime.fromisoformat(parts[2])
            await handle_reschedule(appointment_id, new_time, phone_number, db)
        elif action == "cancel":
            await handle_cancellation(appointment_id, phone_number, db)
```

### 5. Implementação Completa

**Atualizar AppointmentNotificationService:**
```python
class AppointmentNotificationService:
    
    @staticmethod
    def send_booking_confirmation_multicanal(
        db: Session,
        appointment: Appointment,
        client: Client,
        company: Company
    ):
        """Enviar confirmação via múltiplos canais"""
        
        # 1. Email (sempre)
        if client.email:
            send_booking_confirmation_email(...)
        
        # 2. WhatsApp (se configurado e cliente preferir)
        if client.phone and client.notification_preferences?.get("whatsapp"):
            send_whatsapp_confirmation(
                appointment.id,
                client.phone,
                appointment
            )
        
        # 3. SMS (fallback se WhatsApp falhar)
        elif client.phone and client.notification_preferences?.get("sms"):
            send_sms_confirmation(...)
```

### 6. Templates de Mensagem

**Template de Confirmação:**
```python
CONFIRMATION_TEMPLATE = """
🗓️ *Agendamento Confirmado!*

📋 Serviço: {service_name}
👤 Profissional: {professional_name}
📅 Data: {date}
⏰ Horário: {time}
📍 Endereço: {address}

Por favor, confirme sua presença:

✅ Confirmar Presença
🔄 Reagendar
❌ Cancelar

Para reagendar, responda "REAGENDAR" e receberá as opções disponíveis.
"""

# Template de Lembrete (24h antes)
REMINDER_TEMPLATE = """
⏰ *Lembrete de Agendamento*

Amanhã às {time} você tem um agendamento:

📋 {service_name}
👤 {professional_name}
📍 {address}

Confirmado? Responda SIM ou CANCELAR para alterar.
"""
```

### 7. Configuração de Webhook

**Configurar Evolution API:**
```bash
# No painel Evolution API
Webhook URL: https://seusistema.com/api/v1/webhooks/whatsapp
Events: 
- message
- button
- reaction
```

### 8. Segurança e Validação

**Validar respostas:**
```python
def validate_webhook_signature(request_body: str, signature: str):
    """Validar se webhook veio da Evolution API"""
    # Implementar validação HMAC se disponível
    pass

def validate_user_permission(phone: str, appointment_id: int, db: Session):
    """Verificar se o usuário dono do telefone pode alterar o agendamento"""
    client = db.query(Client).filter(Client.phone == phone).first()
    if not client:
        raise HTTPException(403, "Cliente não encontrado")
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.client_crm_id == client.id
    ).first()
    
    if not appointment:
        raise HTTPException(403, "Sem permissão para este agendamento")
```

## 📋 Implementação Passo a Passo

### Fase 1: Confirmação Simples
1. ✅ Configurar Evolution API
2. ✅ Criar endpoint de webhook
3. 🔄 Implementar envio de confirmação
4. 🔄 Processar respostas SIM/NÃO

### Fase 2: Reagendamento
1. 🔄 Criar sistema de opções de horário
2. 🔄 Implementar botões interativos
3. 🔄 Processar seleção de novo horário
4. 🔄 Atualizar agendamento no banco

### Fase 3: Automação Avançada
1. 🔄 Lembretes automáticos (24h, 2h antes)
2. 🔄 Confirmação de presença no dia
3. 🔄 Reagendamento inteligente (oferecer horários similares)
4. 🔄 Cancelamento com política de reembolso

## 🎯 Benefícios

### Para Cliente
- ✅ Confirmação instantânea
- ✅ Reagendamento sem precisar ligar
- ✅ Lembretes automáticos
- ✅ Comunicação no canal preferido

### Para Empresa
- ✅ Redução de não comparecimento (~30%)
- ✅ Otimização da agenda
- ✅ Melhor experiência do cliente
- ✅ Menos carga na recepção

### Para Sistema
- ✅ Automação completa
- ✅ Logs de todas interações
- ✅ Integração com sistema existente
- ✅ Escalável

## 🔧 Configuração Necessária

### 1. No .env do SaaS
```bash
EVOLUTION_API_URL=http://72.62.138.239:8080
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=agendamento-saas
```

### 2. No painel Evolution API
- Configurar webhook: `https://seusistema.com/api/v1/webhooks/whatsapp`
- Habilitar eventos: `message`, `button`
- Configurar timeout: 30 segundos

### 3. No nginx (HTTPS)
```nginx
location /api/v1/webhooks/whatsapp {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 🚀 Exemplo de Fluxo Completo

```
1. Cliente agenda no site/app
2. Sistema envia WhatsApp com botões:
   "✅ Confirmar" | "🔄 Reagendar" | "❌ Cancelar"
3. Cliente clica em "🔄 Reagendar"
4. Sistema envia horários disponíveis:
   "20/01 14:00" | "20/01 15:30" | "21/01 09:00"
5. Cliente seleciona novo horário
6. Sistema atualiza agenda e envia confirmação
7. 24h antes: WhatsApp de lembrete
8. 2h antes: WhatsApp de confirmação final
```

**É 100% possível e o sistema já tem 80% da estrutura pronta!**
