# 🏢 EVOLUTION API MULTI-TENANT - GUIA DE IMPLEMENTAÇÃO

## 🎯 OBJETIVO

Cada empresa (tenant) terá seu próprio WhatsApp isolado através de uma instância separada do Evolution API.

---

## 📋 ARQUITETURA MULTI-TENANT

```
Empresa A → company_1_whatsapp → Instância Evolution API
Empresa B → company_2_whatsapp → Instância Evolution API  
Empresa C → company_3_whatsapp → Instância Evolution API
```

**Isolamento garantido:**
- ✅ Números diferentes por empresa
- ✅ Mensagens separadas por empresa
- ✅ Webhooks isolados
- ✅ Configurações independentes

---

## 🚀 IMPLEMENTAÇÃO

### **1. Criar Instância por Empresa**

```python
from app.services.evolution_api import EvolutionAPIService

evolution = EvolutionAPIService()

# Criar instância para nova empresa
await evolution.create_instance(
    instance_name=f"company_{company_id}_whatsapp",
    integration="WHATSAPP-BAILEYS"
)

# Conectar e obter QR Code
qr_result = await evolution.connect_instance(
    instance_name=f"company_{company_id}_whatsapp"
)
```

### **2. Gerenciar Instâncias**

```python
# Listar todas as instâncias
instances = await evolution.list_instances()

# Verificar status específico
status = await evolution.get_instance_status(
    instance_name=f"company_{company_id}_whatsapp"
)

# Deletar instância (se empresa cancelar)
await evolution.delete_instance(
    instance_name=f"company_{company_id}_whatsapp"
)
```

### **3. Enviar Mensagens por Empresa**

```python
# Notificação de agendamento
await evolution.send_text_message(
    instance_name=f"company_{company_id}_whatsapp",
    phone_number=client_phone,
    message=f"Olá {client_name}! Seu agendamento em {appointment_date} foi confirmado!"
)
```

---

## 📱 FLUXO DE AGENDAMENTO VIA WHATSAPP

### **Passo 1: Cliente Envia Mensagem**

```
Cliente: "Quero agendar uma consulta"

Sistema: Identifica empresa pela instância
```

### **Passo 2: Sistema Responde**

```python
# Webhook recebe mensagem
@router.post("/whatsapp-webhook")
async def handle_webhook(webhook_data: WebhookData):
    instance_name = webhook_data.instance_name
    company_id = extract_company_id(instance_name)
    
    # Processar mensagem
    if "agendar" in webhook_data.message.text.lower():
        await send_appointment_options(company_id, webhook_data.phone_number)
```

### **Passo 3: Cliente Escolhe Opção**

```
Cliente: "1 - Dermatologia"

Sistema: Mostra horários disponíveis
```

### **Passo 4: Confirmação**

```
Cliente: "14:30 amanhã"

Sistema: Cria agendamento e confirma
```

---

## 🔧 ENDPOINTS MULTI-TENANT

### **Gerenciar Instâncias por Empresa**

```bash
# Criar instância para empresa
POST /api/v1/evolution/instances
{
  "company_id": 123,
  "instance_name": "company_123_whatsapp"
}

# Listar instâncias da empresa
GET /api/v1/evolution/instances?company_id=123

# Status da instância
GET /api/v1/evolution/instances/company_123_whatsapp/status
```

### **Notificações por Empresa**

```bash
# Enviar confirmação de agendamento
POST /api/v1/appointments/{appointment_id}/whatsapp/confirmation

# Enviar lembrete
POST /api/v1/appointments/{appointment_id}/whatsapp/reminder

# Enviar cancelamento
POST /api/v1/appointments/{appointment_id}/whatsapp/cancellation
```

---

## 🎛️ CONFIGURAÇÃO DAS INSTÂNCIAS

### **Variáveis por Empresa**

```python
# No backend
INSTANCE_CONFIG = {
    "company_1": {
        "instance_name": "company_1_whatsapp",
        "webhook_url": "https://atendo.website/api/v1/whatsapp-webhook/company_1",
        "auto_reply": True,
        "business_hours": "08:00-18:00"
    },
    "company_2": {
        "instance_name": "company_2_whatsapp", 
        "webhook_url": "https://atendo.website/api/v1/whatsapp-webhook/company_2",
        "auto_reply": True,
        "business_hours": "09:00-17:00"
    }
}
```

### **Webhooks Isolados**

```python
# Webhook por empresa
@router.post("/whatsapp-webhook/{company_id}")
async def handle_company_webhook(company_id: int, webhook_data: WebhookData):
    instance_name = f"company_{company_id}_whatsapp"
    
    # Processar mensagem específica da empresa
    await process_company_message(company_id, webhook_data)
```

---

## 📊 MONITORAMENTO POR EMPRESA

### **Status Dashboard**

```python
# Verificar todas as instâncias ativas
async def get_all_companies_status():
    companies = await get_all_companies()
    status_list = []
    
    for company in companies:
        instance_name = f"company_{company.id}_whatsapp"
        status = await evolution.get_instance_status(instance_name)
        
        status_list.append({
            "company_id": company.id,
            "company_name": company.name,
            "instance_name": instance_name,
            "status": status.state,
            "phone": status.phone,
            "connected_at": status.connected_at
        })
    
    return status_list
```

### **Métricas por Empresa**

```python
# Mensagens enviadas por empresa
await analytics.get_messages_count(company_id, period="daily")

# Agendamentos via WhatsApp
await analytics.get_appointments_via_whatsapp(company_id, period="monthly")

# Taxa de engajamento
await analytics.get_engagement_rate(company_id, period="weekly")
```

---

## 🔄 AUTOMAÇÃO POR EMPRESA

### **Configurações Automáticas**

```python
# Quando nova empresa é criada
@router.post("/companies")
async def create_company(company_data: CompanyCreate):
    company = await create_company_in_db(company_data)
    
    # Criar instância WhatsApp automaticamente
    instance_name = f"company_{company.id}_whatsapp"
    await evolution.create_instance(instance_name, "WHATSAPP-BAILEYS")
    
    # Configurar webhook
    webhook_url = f"https://atendo.website/api/v1/whatsapp-webhook/{company.id}"
    await evolution.set_webhook(instance_name, webhook_url)
    
    return company
```

### **Setup Inicial**

```python
# Script para empresas existentes
async def setup_existing_companies():
    companies = await get_all_companies()
    
    for company in companies:
        instance_name = f"company_{company.id}_whatsapp"
        
        # Verificar se instância já existe
        if not await evolution.instance_exists(instance_name):
            await evolution.create_instance(instance_name, "WHATSAPP-BAILEYS")
            print(f"✅ Instância criada para empresa {company.name}")
        else:
            print(f"ℹ️ Instância já existe para empresa {company.name}")
```

---

## 🎯 CASOS DE USO REAIS

### **Caso 1: Clínica Médica**

```
Empresa A (Clínica Saúde+) → company_1_whatsapp
- Paciente marca consulta
- Sistema confirma horário
- Envia lembrete 24h antes
- Permite remarcar via WhatsApp
```

### **Caso 2: Salão de Beleza**

```
Empresa B (Bela Salão) → company_2_whatsapp
- Cliente agenda cabelo
- Confirma com profissional
- Envia lembrete dia do serviço
- Permite cancelamento
```

### **Caso 3: Academia**

```
Empresa C (FitAcademy) → company_3_whatsapp
- Aluno marca aula
- Confirma com personal
- Envia lembrete horário
- Permite reagendar
```

---

## 🔐 SEGURANÇA E ISOLAMENTO

### **Isolamento Garantido**

- ✅ **Dados separados** por company_id
- ✅ **Instâncias independentes**
- ✅ **Webhooks isolados**
- ✅ **Logs separados**
- ✅ **Configurações independentes**

### **Permissões**

```python
# Apenas empresa pode usar sua instância
@router.post("/whatsapp/send/{company_id}")
async def send_message(company_id: int, message: MessageSend, current_user: User):
    # Verificar se usuário pertence à empresa
    if current_user.company_id != company_id:
        raise HTTPException(403, "Acesso não autorizado")
    
    instance_name = f"company_{company_id}_whatsapp"
    return await evolution.send_text_message(instance_name, message.phone, message.text)
```

---

## 📱 INTERFACE DE GERENCIAMENTO

### **Dashboard Admin**

```python
# Gerenciar todas as instâncias
@router.get("/admin/whatsapp/instances")
async def admin_list_all_instances(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(403, "Acesso negado")
    
    return await evolution.list_all_instances()
```

### **Dashboard Empresa**

```python
# Ver apenas instância da empresa
@router.get("/whatsapp/instance")
async def get_company_instance(current_user: User):
    instance_name = f"company_{current_user.company_id}_whatsapp"
    return await evolution.get_instance_status(instance_name)
```

---

## 🚀 DEPLOY INSTRUÇÕES

### **1. Configurar Variáveis**

```bash
# .env.production
EVOLUTION_API_URL=http://72.62.138.239:8080
EVOLUTION_API_KEY=FgTNeWxV1KWAC8T1@a  # Nova chave!
EVOLUTION_INSTANCE_NAME=company_{company_id}_whatsapp
```

### **2. Atualizar Backend**

```bash
ssh root@72.62.138.239
cd /opt/saas/atendo
docker compose restart backend
```

### **3. Setup Inicial**

```python
# Executar script para empresas existentes
python setup_whatsapp_multi_tenant.py
```

---

## 🎉 BENEFÍCIOS

### **Para Empresas**
- ✅ WhatsApp profissional próprio
- ✅ Comunicação direta com clientes
- ✅ Agendamentos automáticos
- ✅ Lembretes inteligentes
- ✅ Relatórios de engajamento

### **Para o SaaS**
- ✅ Nova fonte de receita
- ✅ Diferencial competitivo
- ✅ Retenção de clientes
- ✅ Escalabilidade
- ✅ Multi-tenant robusto

---

## 📚 PRÓXIMOS PASSOS

1. ✅ Configurar chave da API
2. ✅ Implementar endpoints multi-tenant
3. ✅ Criar dashboard de gerenciamento
4. ✅ Setup inicial para empresas existentes
5. ✅ Documentação para clientes
6. ✅ Monitoramento e métricas

---

**O sistema está pronto para oferecer WhatsApp multi-tenant para todas as empresas!** 🚀
