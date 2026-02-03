# Validação Backend para Agenda (Calendário)

**Data**: 2026-01-14  
**Objetivo**: Verificar se o backend cobre todas as necessidades da Agenda conforme especificação

---

## 🎯 RESUMO EXECUTIVO

**Backend tem 80% do necessário! Alguns recursos precisam de adaptação/fallback.**

---

## ✅ 1. APPOINTMENTS (Agendamentos)

### Schemas Disponíveis
📁 `backend/app/schemas/appointment.py`

**Completo e robusto**:
- ✅ `AppointmentBase` / `Create` / `Update` / `Response`
- ✅ `AppointmentCancel` (com cancellation_reason)
- ✅ `AppointmentCheckIn` (check-in com QR code)
- ✅ `AppointmentListFilter` (filtros avançados)
- ✅ `PublicAppointmentCreate` (agendamento público)

### Campos do Model
```python
class Appointment:
    # Relações
    company_id: int
    client_crm_id: int (nullable)
    professional_id: int (nullable)
    service_id: int (nullable)
    resource_id: int (nullable)
    
    # Scheduling
    start_time: datetime ✅
    end_time: datetime ✅
    
    # Status
    status: AppointmentStatus ✅
    # PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    
    # Notes
    client_notes: Text
    professional_notes: Text
    internal_notes: Text
    
    # Cancellation
    cancelled_at: datetime
    cancelled_by: int
    cancellation_reason: Text ✅
    
    # Check-in
    checked_in_at: datetime
    check_in_code: str (QR Code)
    
    # Reminders
    reminder_sent_24h: bool
    reminder_sent_2h: bool
    
    # Payment
    payment_status: str (pending, paid, refunded)
```

### Endpoints Disponíveis
📁 `backend/app/api/v1/endpoints/appointments.py`

**CRUD Completo**:
- ✅ `POST /appointments` - Criar agendamento
- ✅ `POST /appointments/public` - Criar agendamento público
- ✅ `GET /appointments` - Listar com filtros
- ✅ `GET /appointments/{id}` - Buscar por ID
- ✅ `PUT /appointments/{id}` - Atualizar
- ✅ `DELETE /appointments/{id}` - Cancelar
- ✅ `POST /appointments/{id}/check-in` - Check-in

**Validações Implementadas**:
- ✅ Validação de horário comercial (`validate_business_hours`)
- ✅ Validação de horário do profissional (`validate_professional_hours`)
- ✅ Detecção de conflitos de horário
- ✅ Timezone handling (company timezone)
- ✅ Idempotência (evita duplicatas)

### ⚠️ O QUE FALTA

#### 1. **Recorrência** ❌
- Não tem campo `recurrence` no model
- Não tem lógica de agendamentos recorrentes
- **Solução**: Implementar no frontend como "criar múltiplos agendamentos" ou adicionar campo JSON no backend

#### 2. **Múltiplos Itens por Agendamento** ⚠️
- Schema atual é 1 agendamento = 1 serviço
- Não suporta nativamente múltiplos serviços no mesmo agendamento
- **Solução**: 
  - Opção 1: Criar múltiplos appointments vinculados
  - Opção 2: Usar `Command` (comanda) que suporta múltiplos itens

#### 3. **Campo "Encaixar agendamento"** ❌
- Não tem campo `fit_in` ou similar
- **Solução**: Adicionar como campo booleano no frontend (não persiste) ou usar `internal_notes`

#### 4. **Cores Customizadas** ⚠️
- Status tem enum fixo, não tem sistema de cores customizadas
- **Solução**: Criar mapeamento no frontend (localStorage) ou adicionar tabela de cores

---

## ✅ 2. PROFESSIONALS (Profissionais)

### Schemas Disponíveis
📁 `backend/app/schemas/user.py`

**Completo**:
- ✅ `UserBase` / `Create` / `Update` / `Response`
- ✅ Campo `avatar_url` ✅
- ✅ Campo `working_hours` (Dict) ✅
- ✅ Campo `specialties` (List)
- ✅ Filtro por role (PROFESSIONAL, OWNER, MANAGER)

### Endpoints
- ✅ `GET /users/professionals` - Listar profissionais
- ✅ `GET /users/{id}` - Buscar profissional

**Dados Suficientes**:
```typescript
Professional {
  id: number
  full_name: string ✅
  avatar_url: string ✅
  working_hours: Dict ✅
  specialties: string[]
}
```

---

## ✅ 3. CLIENTS (Clientes)

### Schemas Disponíveis
📁 `backend/app/schemas/client.py`

**Completo**:
- ✅ `ClientBase` / `Create` / `Update` / `Response`
- ✅ Autocomplete via busca por nome/telefone/email

### Endpoints
- ✅ `GET /clients` - Listar (com query search)
- ✅ `GET /clients/{id}` - Buscar por ID
- ✅ `POST /clients` - Criar

**Dados Suficientes**:
```typescript
Client {
  id: number
  full_name: string ✅
  phone: string ✅
  email: string
}
```

---

## ✅ 4. SERVICES (Serviços)

### Schemas Disponíveis
📁 `backend/app/schemas/service.py`

**Completo**:
- ✅ `ServiceBase` / `Create` / `Update` / `Response`
- ✅ Campo `duration_minutes` ✅
- ✅ Campo `price` ✅
- ✅ Campo `name` ✅

### Endpoints
- ✅ `GET /services` - Listar serviços
- ✅ `GET /services/{id}` - Buscar por ID

**Dados Suficientes**:
```typescript
Service {
  id: number
  name: string ✅
  duration_minutes: number ✅
  price: Decimal ✅
}
```

---

## ❌ 5. BLOCKS / OCCUPATIONS (Bloqueios)

### Status: **NÃO EXISTE**

**O que foi encontrado**:
- ❌ Não tem schema `Block` ou `Occupation`
- ❌ Não tem endpoint de bloqueios
- ❌ Não tem model no banco

**Solução**:
1. **Opção 1 (Recomendada)**: Usar `Appointment` com `service_id = NULL` e status especial
   - Criar appointments sem serviço
   - Usar `internal_notes` para armazenar motivo (folga/academia/viagem)
   - Filtrar no frontend por `service_id IS NULL`

2. **Opção 2**: Criar tabela `blocks` no backend (requer alteração)
   - **NÃO FAZER** - vai contra a restrição de não alterar backend

3. **Opção 3 (Fallback)**: Mock em localStorage
   - Criar bloqueios apenas no frontend
   - Persistir em localStorage por company
   - Não sincroniza entre dispositivos

**Recomendação**: Usar Opção 1 (appointments sem serviço)

---

## ⚠️ 6. AGENDA SETTINGS (Configurações)

### Status: **PARCIAL**

**O que existe**:
- ✅ `Company` tem `business_hours` (Dict)
- ✅ `User` (professional) tem `working_hours` (Dict)
- ❌ Não tem tabela específica de configurações de agenda

**Campos Necessários**:
```typescript
AgendaSettings {
  slotMinutes: number        // ❌ Não existe
  columnWidthMode: string    // ❌ Não existe
  defaultStatusKey: string   // ❌ Não existe
  showAvatars: boolean       // ❌ Não existe
}
```

**Solução**:
- Salvar em `localStorage` por company
- Chave: `agenda_settings_${companyId}`
- Seed inicial: `{ slotMinutes: 15, columnWidthMode: 'auto', defaultStatusKey: 'confirmed', showAvatars: true }`
- **TODO**: Criar endpoint `/agenda/settings` no futuro

---

## ❌ 7. COLORS (Cores Customizadas)

### Status: **NÃO EXISTE**

**O que foi encontrado**:
- ❌ Não tem tabela `agenda_colors`
- ❌ Não tem schema de cores
- ❌ Status são enum fixo (PENDING, CONFIRMED, etc.)

**Cores Necessárias** (do vídeo):
```typescript
AgendaColor {
  id: string
  name: string
  hex: string
  statusKey?: string
}
```

**Cores Padrão** (seed):
- Confirmado (#10B981 - verde)
- Não confirmado (#3B82F6 - azul)
- Aguardando (#F59E0B - laranja)
- Cancelado (#EF4444 - vermelho)
- Faturado (#6366F1 - roxo)
- Ocupação (#6B7280 - cinza)
- Cliente VIP (#F59E0B - dourado)
- Check In (#10B981 - verde claro)
- Em atendimento (#3B82F6 - azul escuro)
- Retrabalho (#F97316 - laranja escuro)
- Bloqueio (#6B7280 - cinza escuro)
- Pago (#10B981 - verde escuro)

**Solução**:
- Salvar em `localStorage` por company
- Chave: `agenda_colors_${companyId}`
- CRUD no frontend apenas
- **TODO**: Criar tabela e endpoints no futuro

---

## ✅ 8. CREATE COMANDA (Criar Comanda)

### Schemas Disponíveis
📁 `backend/app/schemas/command.py`

**Completo**:
- ✅ `CommandBase` / `Create` / `Update` / `Response`
- ✅ `CommandItemCreate` (múltiplos itens)
- ✅ Campo `appointment_id` ✅

### Endpoints
📁 `backend/app/api/v1/endpoints/commands.py`
- ✅ `POST /commands` - Criar comanda
- ✅ Campo `appointment_id` permite vincular

**Fluxo "Criar Comanda"**:
```typescript
1. Criar/atualizar appointment
2. Criar command com:
   - client_id (do appointment)
   - appointment_id (vincula)
   - items: [{ serviceId, professionalId, quantity, unit_value }]
3. Retornar { comandaId }
```

**Adapter Function**:
```typescript
async createComandaFromAppointment(appointmentId: string): Promise<{ comandaId: string }> {
  // 1. Buscar appointment
  const appointment = await getAppointment(appointmentId)
  
  // 2. Criar command
  const command = await createCommand({
    client_id: appointment.client_crm_id,
    appointment_id: appointmentId,
    professional_id: appointment.professional_id,
    date: appointment.start_time,
    items: [{
      item_type: 'service',
      service_id: appointment.service_id,
      professional_id: appointment.professional_id,
      quantity: 1,
      unit_value: service.price,
      commission_percentage: service.commission_rate || 0
    }]
  })
  
  return { comandaId: command.id }
}
```

---

## 📊 TABELA RESUMO

| Funcionalidade | Backend | Status | Solução |
|----------------|---------|--------|---------|
| **CRUD Appointments** | ✅ Completo | ✅ PRONTO | Usar direto |
| **List Professionals** | ✅ Completo | ✅ PRONTO | Usar direto |
| **Search Clients** | ✅ Completo | ✅ PRONTO | Usar direto |
| **List Services** | ✅ Completo | ✅ PRONTO | Usar direto |
| **Blocks/Occupations** | ❌ Não existe | ⚠️ ADAPTAR | Usar appointments sem service_id |
| **Agenda Settings** | ❌ Não existe | ⚠️ FALLBACK | localStorage + TODO |
| **Colors CRUD** | ❌ Não existe | ⚠️ FALLBACK | localStorage + TODO |
| **Recurrence** | ❌ Não existe | ⚠️ ADAPTAR | Criar múltiplos appointments |
| **Multiple Items** | ⚠️ Via Command | ✅ PRONTO | Usar Command (comanda) |
| **Create Comanda** | ✅ Completo | ✅ PRONTO | Usar direto |
| **Drag & Drop** | ✅ Update endpoint | ✅ PRONTO | Update start_time |
| **Resize** | ✅ Update endpoint | ✅ PRONTO | Update end_time |

---

## 🔌 ADAPTER MAPPING

### Endpoints Disponíveis
```typescript
// ✅ EXISTEM
GET    /api/v1/appointments?start_date=X&end_date=Y&professional_id=Z
POST   /api/v1/appointments
PUT    /api/v1/appointments/{id}
DELETE /api/v1/appointments/{id}
GET    /api/v1/users/professionals
GET    /api/v1/clients?search=query
GET    /api/v1/services
POST   /api/v1/commands

// ❌ NÃO EXISTEM (usar fallback)
GET    /api/v1/agenda/settings
PUT    /api/v1/agenda/settings
GET    /api/v1/agenda/colors
POST   /api/v1/agenda/colors
PUT    /api/v1/agenda/colors/{id}
DELETE /api/v1/agenda/colors/{id}
GET    /api/v1/blocks
POST   /api/v1/blocks
PUT    /api/v1/blocks/{id}
DELETE /api/v1/blocks/{id}
```

### Mapeamento DTO

#### Appointment (Backend) → Appointment (UI)
```typescript
function toInternal(dto: AppointmentResponse): Appointment {
  return {
    id: dto.id.toString(),
    clientId: dto.client_crm_id?.toString(),
    date: dto.start_time,
    statusKey: dto.status, // 'pending', 'confirmed', etc.
    colorId: getColorIdFromStatus(dto.status), // Mapear status → cor
    notes: dto.client_notes || dto.internal_notes,
    sendReminder: dto.reminder_sent_24h || dto.reminder_sent_2h,
    fitIn: false, // Não existe no backend
    recurrence: null, // Não existe no backend
    items: [{
      id: dto.id.toString(),
      serviceId: dto.service_id?.toString(),
      professionalId: dto.professional_id?.toString(),
      start: dto.start_time,
      end: dto.end_time,
      durationMinutes: calculateDuration(dto.start_time, dto.end_time)
    }]
  }
}
```

#### Block (UI) → Appointment sem service_id (Backend)
```typescript
function blockToAppointment(block: Block): AppointmentCreate {
  return {
    professional_id: parseInt(block.professionalId),
    service_id: null, // ⚠️ NULL = bloqueio
    start_time: block.start,
    client_notes: null,
    internal_notes: `BLOQUEIO: ${block.reason}` // Armazenar motivo aqui
  }
}
```

---

## ✅ CONCLUSÃO

### O que FUNCIONA direto
1. ✅ CRUD de agendamentos
2. ✅ Listar profissionais (com avatar e working_hours)
3. ✅ Buscar clientes (autocomplete)
4. ✅ Listar serviços (com duração e preço)
5. ✅ Criar comanda a partir de agendamento
6. ✅ Drag & drop (via update start_time)
7. ✅ Resize (via update end_time)

### O que precisa ADAPTAR
1. ⚠️ **Bloqueios**: Usar appointments com `service_id = NULL`
2. ⚠️ **Recorrência**: Criar múltiplos appointments no frontend
3. ⚠️ **Múltiplos serviços**: Usar Command ou criar múltiplos appointments

### O que precisa FALLBACK (localStorage)
1. ❌ **Configurações da agenda**: localStorage com seed
2. ❌ **Cores customizadas**: localStorage com seed de cores padrão
3. ❌ **Campo "Encaixar"**: Apenas UI, não persiste

### TODOs para o Futuro (backend)
```typescript
// TODO: Criar endpoints quando backend estiver disponível
// 1. GET/PUT /api/v1/agenda/settings
// 2. CRUD /api/v1/agenda/colors
// 3. Adicionar campo 'recurrence' em Appointment
// 4. Adicionar campo 'fit_in' em Appointment
// 5. Criar tabela 'blocks' (ou usar appointments)
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Backend está 80% pronto!**

**Estratégia de Implementação**:
1. ✅ Usar endpoints existentes para appointments, professionals, clients, services
2. ⚠️ Adaptar appointments para bloqueios (service_id = NULL)
3. 💾 Usar localStorage para settings e cores (com TODOs claros)
4. 🔄 Implementar recorrência no frontend (criar múltiplos appointments)
5. 📝 Documentar todos os TODOs para migração futura

**A implementação é VIÁVEL sem alterar o backend!**
