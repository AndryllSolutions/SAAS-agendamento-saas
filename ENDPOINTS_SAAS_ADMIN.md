# 📚 Documentação Completa - Endpoints SaaS Admin

## 🔐 Autenticação

**IMPORTANTE**: Todos os endpoints requerem token JWT com `saas_role = 'SAAS_OWNER'` ou `'SAAS_STAFF'`.

### ⚠️ Problema Atual
O Super Admin foi criado e atualizado no banco com `saas_role = 'SAAS_OWNER'`, mas o token JWT atual não contém essa informação.

### ✅ Solução
**Faça LOGOUT e LOGIN novamente** para obter um novo token com `saas_role` incluído.

Credenciais:
- Email: `admin@Expectropatrono.com.br`
- Senha: `PlwXUaKVDOucmggr5l7aGeC19Lz`

---

## 🏢 GERENCIAMENTO DE EMPRESAS

### 1. **Listar Todas as Empresas**
```
GET /api/v1/saas-admin/companies
```

**Query Parameters:**
- `skip` (int, default: 0): Paginação - itens para pular
- `limit` (int, default: 100, max: 1000): Quantidade de itens por página
- `search` (string, opcional): Buscar por nome, email ou slug
- `is_active` (boolean, opcional): Filtrar por status ativo/inativo

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Clínica Saúde Teste",
    "email": "contato@clinicasaudeteste.com.br",
    "slug": "clinica-saude-teste",
    "is_active": true,
    "created_at": "2026-01-20T10:00:00",
    "logo_url": null,
    "phone": "11999999999",
    "address": "Rua Exemplo, 123"
  }
]
```

---

### 2. **Detalhes de uma Empresa**
```
GET /api/v1/saas-admin/companies/{company_id}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Clínica Saúde Teste",
  "email": "contato@clinicasaudeteste.com.br",
  "slug": "clinica-saude-teste",
  "is_active": true,
  "subscription": {
    "plan_type": "PRO",
    "trial_end_date": "2026-02-20T00:00:00",
    "is_active": true
  },
  "stats": {
    "active_users": 5,
    "total_users": 7
  }
}
```

---

### 3. **Atualizar Empresa**
```
PUT /api/v1/saas-admin/companies/{company_id}
```

**Body:**
```json
{
  "name": "Novo Nome da Empresa",
  "email": "novo@email.com",
  "phone": "11999999999",
  "is_active": true,
  "logo_url": "https://...",
  "address": "Rua Nova, 456",
  "city": "São Paulo",
  "state": "SP"
}
```

**Campos permitidos:**
- `name`, `email`, `phone`, `cellphone`
- `cpf`, `cnpj`
- `address`, `address_number`, `address_complement`
- `neighborhood`, `city`, `state`, `zip_code`
- `is_active`, `logo_url`

---

### 4. **Ativar/Desativar Empresa**
```
POST /api/v1/saas-admin/companies/{company_id}/toggle-status?is_active=true
```

**Query Parameters:**
- `is_active` (boolean, obrigatório): `true` para ativar, `false` para desativar

**Efeitos ao desativar:**
- Usuários não podem fazer login
- API bloqueada
- Empresa aparece como suspensa no painel admin

---

### 5. **Deletar Empresa** (Soft Delete)
```
DELETE /api/v1/saas-admin/companies/{company_id}
```

**Permissão:** Apenas `SAAS_OWNER`

**Nota:** Soft delete - marca como inativa, não remove do banco

---

## 💳 GERENCIAMENTO DE ASSINATURAS

### 6. **Ver Assinatura da Empresa**
```
GET /api/v1/saas-admin/companies/{company_id}/subscription
```

**Resposta:**
```json
{
  "id": 1,
  "company_id": 1,
  "plan_type": "PRO",
  "is_active": true,
  "trial_end_date": "2026-02-20T00:00:00",
  "created_at": "2026-01-20T10:00:00"
}
```

---

### 7. **Atualizar/Criar Assinatura**
```
PUT /api/v1/saas-admin/companies/{company_id}/subscription
```

**Query Parameters:**
- `plan_type` (string, obrigatório): `FREE`, `BASIC`, `PRO`, `PREMIUM`
- `trial_days` (int, opcional): Dias de trial (ex: 30)
- `is_active` (boolean, default: true): Status da assinatura

**Exemplo:**
```
PUT /api/v1/saas-admin/companies/1/subscription?plan_type=PRO&trial_days=30&is_active=true
```

---

## 👥 GERENCIAMENTO DE USUÁRIOS

### 8. **Listar Todos os Usuários**
```
GET /api/v1/saas-admin/users
```

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100, max: 1000)
- `company_id` (int, opcional): Filtrar por empresa
- `saas_role` (string, opcional): Filtrar por role SaaS (`SAAS_OWNER`, `SAAS_STAFF`)

**Resposta:**
```json
[
  {
    "id": 5,
    "email": "admin@Expectropatrono.com.br",
    "full_name": "Super Admin SaaS",
    "role": "SAAS_ADMIN",
    "saas_role": "SAAS_OWNER",
    "company_id": null,
    "is_active": true,
    "created_at": "2026-01-24T21:25:00"
  }
]
```

---

### 9. **Promover Usuário a SaaS Admin**
```
POST /api/v1/saas-admin/users/{user_id}/promote-saas?saas_role=SAAS_STAFF
```

**Permissão:** Apenas `SAAS_OWNER`

**Query Parameters:**
- `saas_role` (string, obrigatório): `SAAS_OWNER` ou `SAAS_STAFF`

---

## 🔄 IMPERSONAÇÃO (Entrar como Empresa)

### 10. **Impersonar Empresa**
```
POST /api/v1/saas-admin/impersonate/{company_id}
```

**Descrição:** Gera um novo token JWT com contexto da empresa, permitindo que o Super Admin "entre como" a empresa.

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "company": {
    "id": 1,
    "name": "Clínica Saúde Teste",
    "slug": "clinica-saude-teste"
  },
  "scope": "company",
  "message": "Token de impersonação gerado. Use este token para acessar o app da empresa."
}
```

**Como usar:**
1. Chame este endpoint
2. Pegue o `access_token` retornado
3. Use esse token para fazer requisições como se fosse a empresa
4. Redirecione para `/dashboard`

---

## 📊 MÉTRICAS E ANALYTICS

### 11. **Visão Geral de Métricas**
```
GET /api/v1/saas-admin/metrics/overview
```

**Resposta:**
```json
{
  "total_companies": 10,
  "active_companies": 8,
  "new_companies_30d": 3,
  "total_users": 45,
  "active_users": 40,
  "saas_admins": 2,
  "mrr": 1499.10,
  "churn_rate": 5.5,
  "period": {
    "start": "2025-12-24T00:00:00",
    "end": "2026-01-24T00:00:00"
  }
}
```

---

### 12. **Analytics de Receita**
```
GET /api/v1/saas-admin/analytics/revenue?days=30
```

**Query Parameters:**
- `days` (int, default: 30): Período de análise em dias

**Resposta:**
```json
{
  "current_mrr": 1499.10,
  "mrr_by_plan": {
    "FREE": 0.0,
    "BASIC": 249.50,
    "PRO": 999.00,
    "PREMIUM": 199.90
  },
  "subscription_count_by_plan": {
    "FREE": 2,
    "BASIC": 5,
    "PRO": 10,
    "PREMIUM": 1
  },
  "total_active_subscriptions": 18,
  "new_subscriptions": 3,
  "churned_subscriptions": 1,
  "churn_rate": 5.26,
  "period_days": 30
}
```

---

### 13. **Analytics de Crescimento**
```
GET /api/v1/saas-admin/analytics/growth
```

**Resposta:**
```json
{
  "monthly_data": [
    {
      "month": "2025-02",
      "companies": 2,
      "users": 8
    },
    {
      "month": "2025-03",
      "companies": 3,
      "users": 12
    }
  ],
  "company_growth_rate": 50.0,
  "period": "Last 12 months"
}
```

---

## 💰 GERENCIAMENTO DE PLANOS

### 14. **Listar Planos Disponíveis**
```
GET /api/v1/saas-admin/plans
```

**Resposta:**
```json
{
  "plans": [
    {
      "id": "FREE",
      "name": "Plano Free",
      "price": 0.00,
      "billing_period": "monthly",
      "features": [
        "Até 2 profissionais",
        "Agendamento básico",
        "Cadastro de clientes (até 50)"
      ],
      "limits": {
        "max_users": 2,
        "max_appointments_per_month": 100,
        "max_clients": 50
      },
      "stats": {
        "active_subscriptions": 5,
        "mrr": 0.0
      }
    },
    {
      "id": "PRO",
      "name": "Plano Pro",
      "price": 99.90,
      "features": [
        "Até 15 profissionais",
        "Agendamentos ilimitados",
        "Módulo financeiro completo"
      ],
      "stats": {
        "active_subscriptions": 10,
        "mrr": 999.00
      }
    }
  ],
  "total_plans": 4,
  "total_active_subscriptions": 18,
  "total_mrr": 1499.10
}
```

---

### 15. **Detalhes de um Plano**
```
GET /api/v1/saas-admin/plans/{plan_id}
```

**Exemplo:** `GET /api/v1/saas-admin/plans/PRO`

**Resposta:**
```json
{
  "id": "PRO",
  "name": "Plano Pro",
  "price": 99.90,
  "active_subscriptions": 10,
  "mrr": 999.00,
  "companies": [
    {
      "id": 1,
      "name": "Clínica Saúde Teste",
      "slug": "clinica-saude-teste",
      "created_at": "2026-01-20T10:00:00"
    }
  ]
}
```

---

## 🎁 ESTATÍSTICAS DE ADD-ONS

### 16. **Estatísticas de Add-ons**
```
GET /api/v1/saas-admin/addons/stats
```

**Resposta:**
```json
{
  "total_addons": 5,
  "active_subscriptions": 12,
  "monthly_revenue": 299.40,
  "top_addon": "WhatsApp Marketing"
}
```

---

## 🔑 RESUMO DE PERMISSÕES

| Endpoint | SAAS_OWNER | SAAS_STAFF |
|----------|------------|------------|
| Listar empresas | ✅ | ✅ |
| Ver detalhes empresa | ✅ | ✅ |
| Atualizar empresa | ✅ | ✅ |
| Ativar/Desativar empresa | ✅ | ✅ |
| **Deletar empresa** | ✅ | ❌ |
| Gerenciar assinaturas | ✅ | ✅ |
| Listar usuários | ✅ | ✅ |
| **Promover usuário** | ✅ | ❌ |
| Impersonar empresa | ✅ | ✅ |
| Ver métricas | ✅ | ✅ |
| Ver analytics | ✅ | ✅ |

---

## 🚀 COMO USAR

### 1. **Fazer Login**
```bash
POST /api/v1/auth/login/json
Content-Type: application/json

{
  "email": "admin@Expectropatrono.com.br",
  "password": "PlwXUaKVDOucmggr5l7aGeC19Lz"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "token_type": "bearer",
  "user": {
    "id": 5,
    "email": "admin@Expectropatrono.com.br",
    "full_name": "Super Admin SaaS",
    "saas_role": "SAAS_OWNER"
  }
}
```

### 2. **Usar Token nas Requisições**
```bash
GET /api/v1/saas-admin/companies
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ IMPORTANTE

1. **Faça LOGOUT e LOGIN novamente** para obter token com `saas_role`
2. Todos os endpoints retornam erro `403 Forbidden` se o token não tiver `saas_role`
3. O token JWT deve conter:
   ```json
   {
     "sub": "5",
     "saas_role": "SAAS_OWNER",
     "scope": "saas"
   }
   ```

---

## 📝 NOTAS

- **MRR** = Monthly Recurring Revenue (Receita Recorrente Mensal)
- **Churn Rate** = Taxa de cancelamento
- **Impersonação** preserva o `saas_role` original no token
- Soft delete não remove dados do banco, apenas marca como inativo
