# AUDITORIA DE SEGURANÇA E LICENCIAMENTO - ATENDO SaaS

## RELATÓRIO EXECUTIVO

**Data Auditoria:** 15/01/2026  
**Sistema:** ATENDO SaaS Multi-tenant  
**Nível de Risco:** **ALTO** ⚠️  
**Status Produção:** **NÃO ESTÁ PRONTO**  

---

## 1️⃣ MAPEAMENTO DO SISTEMA DE PLANOS

### Definição dos Planos
- **Arquivo:** `backend/app/models/plan.py`
- **Planos Oficiais:**
  - ESSENCIAL: R$ 89/mês (2 profissionais, 1 unidade)
  - PRO: R$ 149/mês (5 profissionais, 1 unidade)  
  - PREMIUM: R$ 249/mês (10 profissionais, 2 unidades)
  - SCALE: R$ 399-499/mês (ilimitado)

### Armazenamento do Plano Ativo
- **Arquivo:** `backend/app/models/company.py`
- **Campos:**
  - `subscription_plan` (string): "ESSENCIAL", "PRO", "PREMIUM", "SCALE"
  - `subscription_plan_id` (integer): FK para tabela plans
  - `subscription_expires_at` (datetime): Data expiração

### Sistema de Decisão de Features
- **Arquivo:** `backend/app/core/plans.py`
- **Função:** `check_feature_access(company, feature)`
- **Mapeamento:** `PLAN_FEATURES` dict com features por plano
- **Cache:** **NÃO EXISTE** cache de permissões

---

## 2️⃣ ENDPOINTS CRÍTICOS DE LICENÇA

### ⚠️ ENDPOINTS CRÍTICOS (SEM VALIDAÇÃO FORTE)

#### Upgrade/Downgrade de Plano
- **Endpoint:** `POST /api/v1/plans/subscription/upgrade`
- **Método:** POST
- **Acesso:** `require_company_owner` 
- **Validação:** **FRACA** - Apenas verifica se é upgrade pelo preço
- **Risco:** **CRÍTICO** - Permite upgrade sem pagamento confirmado

#### Alteração via SaaS Admin
- **Endpoint:** `PUT /api/v1/saas-admin/companies/{company_id}`
- **Método:** PUT
- **Acesso:** `require_saas_admin`
- **Validação:** **NULA** - Permite alterar qualquer campo incluindo plano
- **Risco:** **CRÍTICO** - Admin SaaS pode alterar plano arbitrariamente

#### Gerenciamento de Assinatura
- **Endpoint:** `PUT /api/v1/saas-admin/companies/{company_id}/subscription`
- **Método:** PUT
- **Acesso:** `require_saas_admin`
- **Validação:** **MÍNIMA** - Apenas valida nome do plano
- **Risco:** **CRÍTICO** - Ativação direta sem pagamento

---

## 3️⃣ FLUXO DE PAGAMENTO E ATIVAÇÃO

### Gateway Integration
- **Arquivo:** `backend/app/services/payment_service.py`
- **Gateways:** Mercado Pago, Stripe
- **Webhooks:** `POST /api/v1/payments/webhook/{gateway}`

### 🚨 VULNERABILIDADE CRÍTICA
**O plano é alterado DIRETAMENTE via API, não via webhook confirmado:**

```python
# SubscriptionService.upgrade_plan() - LINHA 43
company.subscription_plan = new_plan.slug.upper()
company.subscription_plan_id = new_plan.id
# PLANO ATIVADO IMEDIATAMENTE SEM PAGAMENTO CONFIRMADO
```

### Webhook Verification
- **Stripe:** Implementado com assinatura ✅
- **Mercado Pago:** **NÃO VERIFICA ASSINATURA** ❌
- **Replay Attack:** **SEM PROTEÇÃO** ❌

---

## 4️⃣ VALIDAÇÃO DE FEATURES E LIMITES

### Profissionais
- **Arquivo:** `backend/app/services/limit_validator.py`
- **Função:** `check_professionals_limit()`
- **Validação Backend:** ✅ SIM
- **Validação Frontend:** ❌ NÃO
- **Validação Banco:** ❌ NÃO (sem constraints)

### Unidades  
- **Status:** **INCOMPLETO** - Contagem hardcoded = 1
- **Validação Backend:** ⚠️ PARCIAL
- **Validação Frontend:** ❌ NÃO
- **Validação Banco:** ❌ NÃO

### Features Premium
- **Arquivo:** `backend/app/core/plans.py`
- **Função:** `check_feature_access()`
- **Validação Backend:** ✅ SIM
- **Validação Frontend:** ❌ NÃO
- **Validação Banco:** ❌ NÃO

---

## 5️⃣ AUTENTICAÇÃO, AUTORIZAÇÃO E ESCALADA

### JWT Structure
- **Arquivo:** `backend/app/core/security.py`
- **Claims:** sub, saas_role, company_role, company_id, scope

### Role System
- **SaaS Roles:** SAAS_OWNER, SAAS_STAFF
- **Company Roles:** COMPANY_OWNER, COMPANY_MANAGER, COMPANY_PROFESSIONAL, etc.

### 🚨 VULNERABILIDADES

#### Impersonation
- **Endpoint:** `POST /api/v1/saas-admin/impersonate/{company_id}`
- **Risco:** **ALTO** - Admin SaaS pode se passar por qualquer empresa

#### Escalação de Privilégios
- **Vulnerabilidade:** Usuário comum pode promover a SAAS_ADMIN se obtiver token
- **Proteção:** **INSUFICIENTE** - Apenas validação de role no token

#### Separação de Contexto
- **Implementado:** RBAC com dois layers ✅
- **Risco:** Context injection via token manipulation ⚠️

---

## 6️⃣ PROTEÇÕES CONTRA AUTOMAÇÃO E ABUSO

### Rate Limiting
- **Arquivo:** `backend/app/core/rate_limiting.py`
- **Status:** **IMPLEMENTADO MAS INATIVO**
- **Problema:** Linha 95-96 retorna sempre False (sem limite real)
- **Storage:** Memory (deveria ser Redis)

### Nginx Configuration
- **Arquivo:** `docker/nginx/nginx.conf`
- **Proteções:** **MÍNIMAS** - Apenas proxy básico
- **Faltando:** rate limiting, WAF, IP blocking

### Logs de Tentativas
- **Status:** **INSUFICIENTE** - Apenas logging básico
- **Monitoramento:** **NÃO IMPLEMENTADO**

---

## 7️⃣ BANCO DE DADOS E RLS

### Row Level Security
- **Arquivo:** `backend/alembic/versions/implement_rls_policies.py`
- **Status:** **IMPLEMENTADO** ✅
- **Tabelas:** 64 tabelas multi-tenant com RLS
- **Política:** `company_id = current_setting('app.current_company_id')`

### 🚨 VULNERABILIDADE CRÍTICA
**RLS depende de variável de sessão que pode não estar setada:**

```sql
-- RLS Policy depende disso:
current_setting('app.current_company_id', TRUE)
```

### Tenant Isolation
- **Application Level:** ✅ Implementado
- **Database Level:** ✅ RLS implementado
- **Risco:** Bypass possível se session variable não for setada

---

## 8️⃣ VETORES DE ATAQUE REALISTAS

### 🚨 ATAQUE 1: Upgrade Indevido via API
```bash
# Usuário COMPANY_OWNER faz upgrade direto:
curl -X POST "http://domain/api/api/v1/plans/subscription/upgrade" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_plan_slug": "scale", "immediate": true}'
# RESULTADO: Plano SCALE ativado sem pagamento
```

### 🚨 ATAQUE 2: Manipulação de Limites
```python
# Bypass de validação de profissionais:
# Criar profissionais diretamente no banco ignorando validação
INSERT INTO users (company_id, role, ...) VALUES (999, 'PROFESSIONAL', ...);
# RESULTADO: Limite de profissionais bypassado
```

### 🚨 ATAQUE 3: Feature Premium Bypass
```javascript
// Frontend pode acessar features premium sem validação:
// Se backend não validar, usuário usa features de plano superior
fetch('/api/v1/premium-feature', { headers: { Authorization: token }})
```

### 🚨 ATAQUE 4: SaaS Admin Malicioso
```bash
# Admin SASA altera plano de qualquer empresa:
curl -X PUT "http://domain/api/api/v1/saas-admin/companies/123/subscription" \
  -H "Authorization: Bearer SAAS_ADMIN_TOKEN" \
  -d '{"plan_type": "PREMIUM"}'
```

---

## 9️⃣ PLANO DE CORREÇÃO OBRIGATÓRIO

### 🚨 URGENTE (Antes de Produção)

#### 1. Fix Upgrade sem Pagamento
```python
# REMOVER ativação imediata em SubscriptionService.upgrade_plan()
# MANTER empresa em estado "pending_upgrade" até webhook confirmar
```

#### 2. Implementar Validação Forte
```python
# Adicionar middleware em todos endpoints premium:
@router.post("/premium-feature")
@require_plan_feature("premium_feature")  # Novo decorator
async def premium_feature():
    pass
```

#### 3. Fix Rate Limiting
```python
# Ativar rate limiting real em check_rate_limit_exceeded()
# Configurar Redis storage
```

#### 4. Proteger RLS Session Variable
```python
# Garantir que app.current_company_id seja setada em toda request
# Adicionar middleware para setar variável de sessão PostgreSQL
```

### 🔒 IMPORTANTE (Segurança)

#### 5. Implementar Webhook Seguro
```python
# Adicionar verificação HMAC para todos webhooks
# Implementar idempotency keys
```

#### 6. Audit Logging
```python
# Logar todas as alterações de plano
# Implementar audit trail para SaaS admin actions
```

#### 7. Database Constraints
```sql
-- Adicionar CHECK constraints para limites de plano
ALTER TABLE companies ADD CONSTRAINT check_professionals_limit 
  CHECK (professionals_count <= max_professionals);
```

### 📊 RECOMENDADO (Melhorias)

#### 8. Cache de Permissões
```python
# Implementar Redis cache para check_feature_access()
# TTL de 5 minutos para invalidação automática
```

#### 9. WAF e Proteções Avançadas
```nginx
# Configurar Cloudflare/WAF
# Implementar IP blocking e bot detection
```

---

## 🔟 CONCLUSÃO EXECUTIVA

### Nível de Risco: **ALTO** 🚨

**O sistema NÃO está pronto para produção SaaS por:**

1. **Upgrade de plano sem pagamento** - Vulnerabilidade crítica de negócio
2. **Validação insuficiente** - Frontend pode bypassar limites
3. **Proteções contra abuso inativas** - Rate limiting desabilitado
4. **Superfície de ataque ampla** - Muitos endpoints sem validação forte

### O que impede um hacker de "pegar um plano":

**Atualmente: NADA.** Um usuário COMPANY_OWNER pode:
- Fazer upgrade para SCALE via API direta
- Acessar features premium sem validação frontend
- Bypass limites de profissionais/unidades

### Recomendação Final:

**NÃO lançar em produção até implementar:**
- ✅ Validação de pagamento obrigatória para upgrades
- ✅ Rate limiting ativo e configurado  
- ✅ Database constraints para limites
- ✅ Audit logging completo
- ✅ WAF e proteções contra automação

**Prazo estimado para correções:** 2-3 semanas (desenvolvimento focado)

---

**Assinatura:** Auditor de Segurança SaaS Sênior  
**Contato:** security@atendo.com.br
