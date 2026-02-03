# 🚀 Sistema de Agendamento Dinâmico

## **Resumo das Melhorias**

O sistema de agendamento foi **completamente refatorado** para eliminar configurações hardcoded e implementar um sistema dinâmico e personalizável por empresa.

### **Principais Problemas Resolvidos**

✅ **Configurações Hardcoded Eliminadas:**
- Horários de funcionamento fixos (8h-18h)
- Lembretes fixos (24h e 2h)
- Mensagens de notificação padronizadas
- Duração padrão de agendamentos (60min)
- Políticas de cancelamento inflexíveis

✅ **Sistema Dinâmico Implementado:**
- Configurações personalizáveis por empresa
- Templates de mensagens customizáveis
- Horários de funcionamento flexíveis
- Políticas de cancelamento configuráveis
- Múltiplos horários de lembrete

---

## **Novos Componentes Criados**

### **1. Modelo `SchedulingSettings`**
📍 `app/models/company_scheduling_settings.py`

**Configurações Principais:**
- **Horários de Funcionamento**: Configurável por dia da semana
- **Lembretes**: Múltiplos horários (ex: [24, 12, 2] horas antes)
- **Templates de Mensagens**: Email, SMS, Push personalizáveis
- **Políticas de Cancelamento**: Prazo e permissões configuráveis
- **Lista de Espera**: Habilitação e tamanho máximo
- **Buffers de Tempo**: Intervalos antes/depois dos agendamentos

### **2. Serviço `SchedulingSettingsService`**
📍 `app/services/scheduling_settings_service.py`

**Funcionalidades:**
```python
# Obter/criar configurações
settings = service.get_or_create_settings(company_id)

# Verificar disponibilidade de horário
is_available = service.is_time_available(company_id, datetime_obj)

# Obter mensagem formatada
message = service.get_notification_message(company_id, "reminder_24h", "push", variables)

# Verificar política de cancelamento
can_cancel = service.can_cancel_appointment(company_id, appointment_datetime)
```

### **3. Migration Automática**
📍 `alembic/versions/add_company_scheduling_settings.py`

- Cria tabela `company_scheduling_settings`
- Insere configurações padrão para empresas existentes
- Mantém compatibilidade com sistema atual

---

## **Sistema de Templates Dinâmicos**

### **Tipos de Notificação Suportados**
- `appointment_confirmation` - Confirmação de agendamento
- `appointment_reminder_24h` - Lembrete 24 horas antes
- `appointment_reminder_2h` - Lembrete 2 horas antes
- `appointment_cancellation` - Cancelamento de agendamento
- `appointment_completed` - Conclusão do atendimento

### **Canais de Notificação**
- **Email**: Subject + Body
- **SMS**: Texto simples
- **Push**: Title + Body

### **Variáveis Disponíveis**
```python
{
    "client_name": "Nome do Cliente",
    "client_email": "email@exemplo.com",
    "client_phone": "+5511999999999",
    "professional_name": "Nome do Profissional",
    "service_name": "Corte de Cabelo",
    "service_duration": "30 min",
    "appointment_date": "26/01/2024",
    "appointment_time": "14:30",
    "appointment_datetime": "26/01/2024 às 14:30",
    "company_name": "Salão Exemplo",
    "company_phone": "+5511888888888",
    "company_address": "Rua Exemplo, 123"
}
```

### **Exemplo de Template**
```json
{
    "appointment_reminder_24h": {
        "email": {
            "subject": "Lembrete: {service_name} Amanhã - {company_name}",
            "body": "Olá {client_name}! Lembramos que você tem {service_name} amanhã ({appointment_date}) às {appointment_time} com {professional_name}."
        },
        "push": {
            "title": "📅 Lembrete: Agendamento Amanhã",
            "body": "{service_name} amanhã às {appointment_time}"
        }
    }
}
```

---

## **Funcionalidades Avançadas**

### **Horários de Funcionamento Flexíveis**
```json
{
    "monday": {"start": "08:00", "end": "18:00", "enabled": true},
    "tuesday": {"start": "08:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "08:00", "end": "18:00", "enabled": true},
    "thursday": {"start": "08:00", "end": "18:00", "enabled": true},
    "friday": {"start": "08:00", "end": "18:00", "enabled": true},
    "saturday": {"start": "08:00", "end": "14:00", "enabled": true},
    "sunday": {"start": "08:00", "end": "14:00", "enabled": false}
}
```

### **Múltiplos Horários de Lembrete**
- **Antes**: `[24, 2]` (padrão)
- **Personalizado**: `[72, 24, 12, 2, 1]` (3 dias, 1 dia, 12h, 2h, 1h antes)

### **Buffers de Tempo Configuráveis**
```json
{
    "before_appointment": 10,  // 10 min antes
    "after_appointment": 5,    // 5 min depois  
    "lunch_break": {
        "start": "12:00",
        "end": "13:00", 
        "enabled": true
    }
}
```

### **Gestão de Feriados**
```json
[
    "2024-12-25",  // Natal
    "2024-01-01",  // Ano Novo
    "2024-04-21"   // Tiradentes
]
```

---

## **Arquivos Modificados**

### **Modelos**
- ✅ `app/models/company_scheduling_settings.py` (NOVO)
- ✅ `app/models/company.py` (relacionamento adicionado)

### **Serviços** 
- ✅ `app/services/scheduling_settings_service.py` (NOVO)
- ✅ `app/services/push_notification_helpers.py` (refatorado)

### **Tasks**
- ✅ `app/tasks/appointment_tasks.py` (refatorado para usar configurações dinâmicas)

### **Migrations**
- ✅ `alembic/versions/add_company_scheduling_settings.py` (NOVO)

---

## **Benefícios Implementados**

### **Para Empresas**
🎯 **Personalização Total**: Cada empresa pode configurar horários, lembretes e mensagens
🎯 **Flexibilidade**: Horários diferentes por dia da semana, múltiplos lembretes
🎯 **Branding**: Templates de mensagem personalizados com identidade da empresa
🎯 **Controle**: Políticas de cancelamento configuráveis

### **Para Desenvolvedores**
🔧 **Código Limpo**: Eliminação de valores hardcoded
🔧 **Manutenibilidade**: Configurações centralizadas em um modelo
🔧 **Escalabilidade**: Fácil adição de novas configurações
🔧 **Testabilidade**: Configurações isoladas e testáveis

### **Para o Sistema**
⚡ **Performance**: Configurações em cache por empresa
⚡ **Confiabilidade**: Fallbacks para configurações padrão
⚡ **Compatibilidade**: Sistema atual continua funcionando

---

## **Como Usar**

### **1. Executar Migration**
```bash
cd backend
alembic upgrade head
```

### **2. Configurar Empresa (via API/Admin)**
```python
from app.services.scheduling_settings_service import get_scheduling_service

service = get_scheduling_service(db)

# Atualizar horários de funcionamento
service.update_business_hours(company_id, new_business_hours)

# Configurar lembretes
service.update_reminder_settings(company_id, [48, 24, 2], ["email", "push", "sms"])

# Personalizar template
service.update_notification_template(company_id, "appointment_reminder_24h", custom_template)
```

### **3. Validar Horário**
```python
# Verificar se horário está disponível
is_available = service.is_time_available(company_id, target_datetime)

# Obter política de cancelamento
policy = service.get_cancellation_policy(company_id)
```

---

## **Próximos Passos Sugeridos**

1. **Interface Admin**: Criar páginas para configuração das empresas
2. **API Endpoints**: Exposição das configurações via REST API
3. **Validações**: Implementar validações avançadas de horários
4. **Relatórios**: Analytics sobre uso de templates e horários
5. **Importação**: Sistema de importação de configurações em lote

---

## **Estrutura de Dados**

O sistema agora suporta configurações complexas mantendo simplicidade de uso. Cada empresa possui configurações isoladas, garantindo flexibilidade total sem impactar outras empresas no ambiente multi-tenant.

**Status**: ✅ **IMPLEMENTADO E PRONTO PARA USO**
