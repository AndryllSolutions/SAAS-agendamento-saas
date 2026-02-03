# Isolamento Multi-Tenant - WhatsApp SaaS

## 🏢 Arquitetura Multi-Tenant

### Conceito Fundamental

**Cada empresa no SaaS tem:**
- ✅ Sua própria instância WhatsApp isolada
- ✅ Seus próprios dados de agendamentos
- ✅ Seus próprios clientes e profissionais
- ✅ Webhooks isolados por empresa
- ✅ Configurações independentes

### Estrutura de Instâncias

```
┌─────────────────────────────────────────────────┐
│           EVOLUTION API (Único Servidor)         │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Empresa 1 (ID: 1)                        │  │
│  │ Instância: company_1_whatsapp            │  │
│  │ QR Code próprio                          │  │
│  │ Número WhatsApp próprio                  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Empresa 2 (ID: 2)                        │  │
│  │ Instância: company_2_whatsapp            │  │
│  │ QR Code próprio                          │  │
│  │ Número WhatsApp próprio                  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Empresa 3 (ID: 3)                        │  │
│  │ Instância: company_3_whatsapp            │  │
│  │ QR Code próprio                          │  │
│  │ Número WhatsApp próprio                  │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🔒 Implementação do Isolamento

### 1. Nome da Instância por Empresa

```python
def _get_instance_name(self, company_id: int) -> str:
    """
    Cada empresa tem sua própria instância WhatsApp
    Formato: company_{company_id}_whatsapp
    """
    return f"company_{company_id}_whatsapp"

# Exemplos:
# Empresa 1 → company_1_whatsapp
# Empresa 2 → company_2_whatsapp
# Empresa 3 → company_3_whatsapp
```

### 2. Validação de Dados por Empresa

**SEMPRE validar `company_id` em todas as queries:**

```python
# ❌ ERRADO - Sem validação de empresa
client = db.query(Client).filter(Client.id == client_id).first()

# ✅ CORRETO - Com validação de empresa
client = db.query(Client).filter(
    Client.id == client_id,
    Client.company_id == appointment.company_id  # ISOLAMENTO
).first()
```

### 3. Filtros em Todos os Endpoints

```python
@router.post("/send-confirmation/{appointment_id}")
async def send_appointment_confirmation(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # ISOLAMENTO: Buscar apenas agendamentos da empresa do usuário
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.company_id == current_user.company_id  # CRÍTICO!
    ).first()
    
    if not appointment:
        raise HTTPException(404, "Agendamento não encontrado")
```

### 4. Webhook Handler com Isolamento

```python
async def handle_button_response(button_id: str, from_number: str, db: Session):
    """Processa resposta de botão com validação de empresa"""
    
    # Extrair ID do agendamento
    appointment_id = int(button_id.split('_')[1])
    
    # Buscar agendamento
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    
    if not appointment:
        return {"status": "not_found"}
    
    # ISOLAMENTO: Validar que o cliente pertence à mesma empresa
    client = db.query(Client).filter(
        Client.phone.contains(from_number),
        Client.company_id == appointment.company_id  # VALIDAÇÃO
    ).first()
    
    if not client:
        logger.warning(f"Cliente de outra empresa tentou acessar agendamento")
        return {"status": "unauthorized"}
    
    # Processar ação...
```

## 🚀 Fluxo de Configuração por Empresa

### Passo 1: Criar Instância WhatsApp

```python
# Quando uma empresa se cadastra ou ativa WhatsApp
from app.services.evolution_api import evolution_api_service

async def setup_company_whatsapp(company_id: int):
    """Configura WhatsApp para uma empresa"""
    
    instance_name = f"company_{company_id}_whatsapp"
    
    # 1. Criar instância
    result = await evolution_api_service.create_instance(
        instance_name=instance_name,
        qrcode=True
    )
    
    # 2. Obter QR Code para empresa escanear
    qrcode = await evolution_api_service.get_qrcode(instance_name)
    
    # 3. Configurar webhook específico da empresa
    webhook_url = f"https://atendo.website/api/v1/whatsapp-webhook/webhook"
    await evolution_api_service.set_webhook(
        instance_name=instance_name,
        webhook_url=webhook_url,
        webhook_by_events=True,
        events=['messages.upsert', 'messages.update']
    )
    
    return {
        "instance_name": instance_name,
        "qrcode": qrcode,
        "status": "ready_to_scan"
    }
```

### Passo 2: Empresa Escaneia QR Code

```
1. Admin da empresa acessa painel
2. Clica em "Conectar WhatsApp"
3. Sistema gera QR Code da instância da empresa
4. Admin escaneia com WhatsApp Business
5. Instância conecta
6. Sistema salva status: "connected"
```

### Passo 3: Enviar Mensagens

```python
# Sistema SEMPRE usa a instância da empresa
instance_name = f"company_{appointment.company_id}_whatsapp"

await evolution_api_service.send_text(
    instance_name=instance_name,  # Instância isolada
    number=client.phone,
    text=message
)
```

## 🛡️ Segurança e Validações

### Checklist de Segurança

- ✅ **Instância separada** por empresa
- ✅ **Validação de `company_id`** em todas as queries
- ✅ **Filtro de empresa** em todos os endpoints
- ✅ **Webhook valida** empresa do cliente
- ✅ **Logs incluem** `company_id` para auditoria
- ✅ **Erro se tentar** acessar dados de outra empresa

### Exemplo de Log com Isolamento

```python
logger.info(
    f"Confirmação enviada - "
    f"Empresa: {appointment.company_id}, "
    f"Agendamento: {appointment.id}, "
    f"Cliente: {client.id}"
)
```

## 📊 Banco de Dados

### Estrutura com company_id

```sql
-- Todas as tabelas têm company_id
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,  -- ISOLAMENTO
    client_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    -- ...
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,  -- ISOLAMENTO
    name VARCHAR(255),
    phone VARCHAR(20),
    -- ...
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Índices para performance
CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_clients_company ON clients(company_id);
```

## 🔄 Webhook Multi-Tenant

### Identificar Empresa pelo Número

```python
async def handle_message_received(data: Dict[str, Any], db: Session):
    """Processa mensagem e identifica empresa"""
    
    from_number = extract_number(data)
    
    # Buscar cliente pelo telefone
    client = db.query(Client).filter(
        Client.phone.contains(from_number)
    ).first()
    
    if not client:
        logger.warning(f"Cliente não encontrado: {from_number}")
        return {"status": "client_not_found"}
    
    # ISOLAMENTO: Usar company_id do cliente
    company_id = client.company_id
    instance_name = f"company_{company_id}_whatsapp"
    
    # Processar apenas dados da empresa do cliente
    appointments = db.query(Appointment).filter(
        Appointment.client_id == client.id,
        Appointment.company_id == company_id  # VALIDAÇÃO
    ).all()
    
    # ...
```

## 📝 Endpoints com Isolamento

### Exemplo Completo

```python
@router.get("/company/whatsapp-status")
async def get_company_whatsapp_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retorna status do WhatsApp da empresa do usuário logado
    ISOLAMENTO: Apenas dados da empresa do usuário
    """
    company_id = current_user.company_id
    instance_name = f"company_{company_id}_whatsapp"
    
    try:
        # Verificar status da instância
        status = await evolution_api_service.get_instance(instance_name)
        
        # Buscar estatísticas da empresa
        total_sent = db.query(Appointment).filter(
            Appointment.company_id == company_id,
            Appointment.whatsapp_sent == True
        ).count()
        
        return {
            "company_id": company_id,
            "instance_name": instance_name,
            "status": status,
            "total_messages_sent": total_sent
        }
        
    except Exception as e:
        return {
            "company_id": company_id,
            "status": "not_configured",
            "error": str(e)
        }
```

## 🎯 Casos de Uso

### Caso 1: Empresa A envia confirmação

```
1. Admin da Empresa A (ID: 1) cria agendamento
2. Sistema usa instância: company_1_whatsapp
3. Envia mensagem do número WhatsApp da Empresa A
4. Cliente recebe e confirma
5. Webhook identifica empresa pelo número do cliente
6. Atualiza apenas agendamento da Empresa A
```

### Caso 2: Tentativa de acesso cruzado (BLOQUEADO)

```
1. Cliente da Empresa A tenta confirmar agendamento da Empresa B
2. Webhook recebe: button_id = "confirm_999"
3. Sistema busca agendamento 999
4. Valida: agendamento.company_id != client.company_id
5. BLOQUEIA ação
6. Log de segurança registrado
```

## 📋 Checklist de Implementação

### Para Cada Nova Funcionalidade WhatsApp:

- [ ] Usar `_get_instance_name(company_id)` para instância
- [ ] Validar `company_id` em todas as queries
- [ ] Filtrar dados por `current_user.company_id`
- [ ] Adicionar logs com `company_id`
- [ ] Testar com múltiplas empresas
- [ ] Verificar que empresa A não acessa dados da empresa B
- [ ] Documentar isolamento no código

## 🚨 Alertas de Segurança

### ⚠️ NUNCA FAZER:

```python
# ❌ PERIGOSO - Sem filtro de empresa
appointments = db.query(Appointment).all()

# ❌ PERIGOSO - Instância global
instance_name = "atendo_whatsapp"

# ❌ PERIGOSO - Sem validação
appointment = db.query(Appointment).filter(
    Appointment.id == appointment_id
).first()
```

### ✅ SEMPRE FAZER:

```python
# ✅ SEGURO - Com filtro de empresa
appointments = db.query(Appointment).filter(
    Appointment.company_id == current_user.company_id
).all()

# ✅ SEGURO - Instância por empresa
instance_name = f"company_{company_id}_whatsapp"

# ✅ SEGURO - Com validação
appointment = db.query(Appointment).filter(
    Appointment.id == appointment_id,
    Appointment.company_id == current_user.company_id
).first()
```

## 📊 Monitoramento Multi-Tenant

### Métricas por Empresa

```python
# Dashboard mostra apenas dados da empresa
@router.get("/dashboard/whatsapp-metrics")
async def get_whatsapp_metrics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    company_id = current_user.company_id
    
    return {
        "company_id": company_id,
        "total_confirmations": db.query(Appointment).filter(
            Appointment.company_id == company_id,
            Appointment.status == 'confirmed'
        ).count(),
        "total_sent": db.query(Appointment).filter(
            Appointment.company_id == company_id,
            Appointment.whatsapp_sent == True
        ).count(),
        # ... outras métricas ISOLADAS
    }
```

## ✅ Resumo

### Princípios Fundamentais:

1. **Uma instância WhatsApp por empresa**
2. **Sempre validar `company_id`**
3. **Nunca misturar dados entre empresas**
4. **Logs incluem identificação da empresa**
5. **Testes com múltiplas empresas**

### Benefícios:

- ✅ **Segurança total** entre empresas
- ✅ **Escalabilidade** - cada empresa independente
- ✅ **Personalização** - cada empresa com seu número
- ✅ **Conformidade** - dados isolados por empresa
- ✅ **Auditoria** - rastreamento por empresa

---

**CRÍTICO**: Este é um sistema **SaaS multi-tenant**. O isolamento entre empresas é **OBRIGATÓRIO** em todas as funcionalidades!

