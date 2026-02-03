# Correção: Modal de Agendamento Não Lista Clientes

**Data**: 2026-01-13  
**Problema**: Modal de agendamento não retorna lista de clientes disponíveis

---

## ❌ Problema Identificado

### Código Anterior (ERRADO)

**Arquivo**: `frontend/src/components/AppointmentForm.tsx` (linha 48)

```typescript
// ❌ ERRADO: Tentava listar clientes via userService com filtro de role
const [servicesRes, professionalsRes, clientsRes] = await Promise.all([
  serviceService.list(),
  userService.getProfessionals(),
  userService.list({ role: 'CLIENT', limit: 500 })  // ❌ Endpoint incorreto
])
```

**Motivo do Erro**:
- Endpoint `/users` com parâmetro `role=CLIENT` **não existe** ou não retorna clientes
- O endpoint correto para listar clientes é `/clients`
- Frontend não importava `clientService`

---

## ✅ Solução Aplicada

### 1. Adicionar Import do clientService

```typescript
// ✅ CORRETO: Importar clientService
import { appointmentService, serviceService, userService, clientService } from '@/services/api'
```

### 2. Usar Endpoint Correto

```typescript
// ✅ CORRETO: Usar clientService.list() para buscar clientes
const [servicesRes, professionalsRes, clientsRes] = await Promise.all([
  serviceService.list(),
  userService.getProfessionals(),
  clientService.list()  // ✅ Endpoint correto: GET /api/v1/clients
])
```

---

## 🧪 Validação

### Teste do Endpoint de Clientes

```bash
# Endpoint: GET /api/v1/clients
# Status: 200 OK
# Resposta: Array com 1 cliente
```

**Resultado**: ✅ Backend retornando clientes corretamente

### Estrutura da Resposta

```json
[
  {
    "id": 1,
    "company_id": 4,
    "full_name": "Cliente Teste",
    "email": "cliente@example.com",
    "phone": "(11) 99999-9999",
    "created_at": "2026-01-13T...",
    "updated_at": "2026-01-13T..."
  }
]
```

---

## 📋 Endpoints Relacionados

| Endpoint | Método | Função | Status |
|----------|--------|--------|--------|
| `/api/v1/clients` | GET | Listar clientes | ✅ Funcionando |
| `/api/v1/services` | GET | Listar serviços | ✅ Funcionando |
| `/api/v1/professionals` | GET | Listar profissionais | ✅ Funcionando |
| `/api/v1/appointments` | POST | Criar agendamento | ✅ Funcionando |

---

## 📝 Arquivos Modificados

1. ✅ `frontend/src/components/AppointmentForm.tsx`
   - Adicionado import de `clientService`
   - Alterada chamada de `userService.list({ role: 'CLIENT' })` para `clientService.list()`

**Deploy**: ✅ Sincronizado na VPS e frontend reiniciado

---

## 🎯 Resultado Esperado

Ao abrir o modal de agendamento:

1. ✅ Lista de serviços carrega corretamente
2. ✅ Lista de profissionais carrega corretamente
3. ✅ **Lista de clientes carrega corretamente** (CORRIGIDO)
4. ✅ Usuário pode selecionar cliente do dropdown
5. ✅ Agendamento pode ser criado com sucesso

---

## 🔍 Diagnóstico Completo

### Backend ✅
- ✅ Endpoint `GET /api/v1/clients` existe e funciona
- ✅ Retorna array de clientes corretamente
- ✅ Autenticação funcionando
- ✅ Filtro por company_id aplicado automaticamente

### Frontend ❌ → ✅
- ❌ **ANTES**: Chamava endpoint errado (`/users?role=CLIENT`)
- ✅ **DEPOIS**: Chama endpoint correto (`/clients`)
- ✅ Import de `clientService` adicionado
- ✅ Código sincronizado na VPS

---

## ✅ Conclusão

**Problema**: Modal de agendamento não listava clientes porque usava endpoint incorreto

**Solução**: Corrigido para usar `clientService.list()` que chama o endpoint correto `/api/v1/clients`

**Status**: ✅ **Corrigido e aplicado em produção**

**Teste via Interface**: Acesse `https://72.62.138.239/appointments` e clique em "Novo Agendamento" para validar que a lista de clientes aparece no dropdown.
