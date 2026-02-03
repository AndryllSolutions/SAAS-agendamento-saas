# CATÁLOGO DE TODOs - FRONTEND
## Análise Completa para FASE 3: MELHORIAS

**Data:** 06/01/2026  
**Objetivo:** Identificar e resolver todos os TODOs técnicos do frontend

---

## 🎯 TODOs TÉCNICOS IDENTIFICADOS

### CRÍTICOS - Funcionalidades Incompletas

#### 1. **Mudança de Senha** - `app/settings/_page_old.tsx:84`
```typescript
// TODO: Implementar endpoint de mudança de senha quando disponível
// await userService.changePassword({
//   old_password: passwordData.current_password,
//   new_password: passwordData.new_password
```
**STATUS:** Crítico - Funcionalidade de segurança faltando  
**AÇÃO:** Implementar endpoint e conectar frontend

#### 2. **Download de PDF** - `app/documents/page.tsx:84`
```typescript
// TODO: Handle PDF download
toast.success('Download iniciado!')
```
**STATUS:** Médio - UX incompleta  
**AÇÃO:** Implementar download real de PDF

#### 3. **Configurações de Sistema** - `app/admin/system/page.tsx:40,53`
```typescript
// TODO: Implement API call to load existing config
// const response = await api.get('/admin/system-config')

// TODO: Implement API call to save config  
// await api.post('/admin/system-config', config)
```
**STATUS:** Alto - Admin funcionalidade faltando  
**AÇÃO:** Implementar endpoints de configuração

#### 4. **Configurações Admin Duplicadas** - `app/admin/admin/system/page.tsx:40,53`
```typescript
// Mesmos TODOs duplicados da página anterior
```
**STATUS:** Médio - Código duplicado  
**AÇÃO:** Consolidar ou remover duplicação

---

## 🔍 ANÁLISE DE VALIDAÇÃO DE FEATURES

### COMPONENTES SEM FEATUREWRAPPER IDENTIFICADOS

Baseado na análise de arquitetura anterior, os seguintes componentes podem precisar de validação de features:

#### 📊 Relatórios Avançados (Premium)
- `app/reports/by-professional/page.tsx` 
- `app/reports/by-service/page.tsx`
- `app/reports/by-client/page.tsx`
- Precisam de: `FeatureWrapper feature="advanced_reports"`

#### 💰 Financeiro Completo (Pro)
- `app/financial/dashboard/page.tsx` ✅ **JÁ IMPLEMENTADO**
- `app/financial/*/page.tsx` - Outras páginas financeiras
- Precisam de: `FeatureWrapper feature="financial_complete"`

#### 📦 Funcionalidades Premium
- `app/subscription-sales/page.tsx` - `feature="subscription_sales"`
- `app/marketing/online-booking/` - `feature="online_booking"`
- `app/packages/` - `feature="packages"`
- `app/commissions/` - `feature="commissions"`

#### 🏢 SaaS Admin (SaaS Owner/Staff)
- `app/saas-admin/users/page.tsx` ✅ Já tem RBAC  
- `app/saas-admin/companies/[id]/page.tsx` ✅ Já tem RBAC
- Outros módulos SaaS admin

---

## 🧪 ANÁLISE DE TESTES (Prioridade TODOs)

### TESTES FALTANTES IDENTIFICADOS

#### 1. Componentes Sem Testes
```bash
# Buscar por arquivos sem .test.tsx ou .spec.tsx correspondentes
find src/components -name "*.tsx" ! -name "*.test.tsx" ! -name "*.spec.tsx"
find src/app -name "*.tsx" ! -name "*.test.tsx" ! -name "*.spec.tsx"
```

#### 2. Hooks Sem Testes
- `hooks/useFeatureAccess.ts` - Crítico para validação de features
- `hooks/useAuth.ts` - Crítico para segurança
- `hooks/usePlan.ts` - Importante para billing

#### 3. Utilitários Sem Testes
- `utils/validators.ts` - Validações CNPJ/CPF precisam de testes
- `services/api.ts` - Interceptors e error handling
- `utils/formatters.ts` - Formatação de dados

---

## 📋 PLANO DE AÇÃO - FASE 3

### SEMANA 1: TODOs CRÍTICOS (3-4 dias)

#### Dia 1-2: Implementar TODOs de API
- [ ] **Endpoint mudança de senha** 
  - Backend: `/users/change-password`
  - Frontend: conectar `userService.changePassword`
- [ ] **Configurações de sistema**
  - Backend: `/admin/system-config` GET/POST
  - Frontend: conectar admin pages

#### Dia 3: Downloads e UX
- [ ] **PDF Download real**
  - Implementar blob download
  - Progress indicator
  - Error handling

#### Dia 4: Limpeza de código
- [ ] **Remover duplicações**
  - Consolidar `app/admin/admin/system` vs `app/admin/system`
  - Remover `_page_old.tsx` files

### SEMANA 2: VALIDAÇÃO DE FEATURES (4-5 dias)

#### Dia 1-2: Relatórios Premium
- [ ] Aplicar `FeatureWrapper` em todas páginas de relatórios
- [ ] Testar bloqueio/upgrade flow
- [ ] Validar com diferentes planos

#### Dia 3-4: Funcionalidades Premium
- [ ] `subscription-sales` → `subscription_sales` feature
- [ ] `online-booking` → `online_booking` feature  
- [ ] `packages` → `packages` feature
- [ ] `commissions` → `commissions` feature

#### Dia 5: SaaS Admin
- [ ] Auditar todas páginas SaaS admin
- [ ] Garantir RBAC correto
- [ ] Testar escalação de privilégios

### SEMANA 3: TESTES E QUALIDADE (3-4 dias)

#### Dia 1-2: Testes Unitários
- [ ] `useFeatureAccess.test.ts`
- [ ] `validators.test.ts`  
- [ ] `FeatureWrapper.test.tsx`
- [ ] Coverage > 80% para utils críticos

#### Dia 3: Testes de Integração
- [ ] Feature access flow end-to-end
- [ ] Upgrade flow completo
- [ ] RBAC escalation tests

#### Dia 4: Auditoria Final
- [ ] Scan completo por TODOs restantes
- [ ] Verificação de segurança
- [ ] Performance review

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### ✅ FASE 3 COMPLETA QUANDO:

#### Limpeza de TODOs
- [ ] Zero TODOs técnicos no código
- [ ] Funcionalidades implementadas ou documentadas
- [ ] Código duplicado removido

#### Validação de Features
- [ ] Todos componentes premium protegidos
- [ ] FeatureWrapper aplicado consistentemente  
- [ ] Upgrade flow testado e funcionando

#### Testes
- [ ] Coverage > 70% para componentes críticos
- [ ] Feature access 100% testado
- [ ] Security tests implementados

#### Qualidade
- [ ] Zero lint errors
- [ ] Zero TypeScript errors
- [ ] Performance otimizada

---

## 📊 MÉTRICAS DE PROGRESSO

### TODOs Técnicos
- **Total identificados:** 6 TODOs críticos
- **Resolvidos:** 0/6
- **Meta:** 100% resolução

### Validação de Features
- **Componentes auditados:** 0/50+
- **FeatureWrapper aplicado:** 1 (Financial Dashboard)
- **Meta:** 100% cobertura premium features

### Testes
- **Coverage atual:** ~30% (estimado)
- **Meta:** 70%+ componentes críticos
- **Meta:** 100% feature validation

---

**PRÓXIMO PASSO:** Começar implementação dos TODOs críticos de API
