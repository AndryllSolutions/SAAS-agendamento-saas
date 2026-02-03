# FeatureWrapper Component - Guia Completo
## Sistema de Controle de Acesso Baseado em Planos

**Data:** 02/01/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e Pronto para Uso

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Componentes Criados](#componentes-criados)
3. [Como Usar](#como-usar)
4. [Exemplos Práticos](#exemplos-práticos)
5. [API Reference](#api-reference)
6. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

O **FeatureWrapper** é um sistema completo de componentes React para controlar acesso a funcionalidades baseado no plano de assinatura do usuário.

### Benefícios

✅ **Validação Automática** - Verifica acesso via API backend  
✅ **UX Profissional** - Modal ou card de upgrade bonitos  
✅ **Flexível** - 4 modos diferentes (modal, card, hide, custom)  
✅ **Type-Safe** - 100% TypeScript  
✅ **Zero Config** - Funciona out-of-the-box  
✅ **Hooks Avançados** - Para proteção de rotas inteiras  

---

## 📦 Componentes Criados

### 1. **FeatureWrapper** (Principal)
**Localização:** `src/components/features/FeatureWrapper.tsx`

Componente wrapper que valida se usuário tem acesso a uma feature.

```typescript
<FeatureWrapper feature="financial_complete">
  <FinancialReports />
</FeatureWrapper>
```

### 2. **UpgradeModal**
**Localização:** `src/components/features/UpgradeModal.tsx`

Modal bonito mostrando que feature está bloqueada e plano necessário.

### 3. **FeatureBlockedCard**
**Localização:** `src/components/features/FeatureBlockedCard.tsx`

Card inline mostrando feature bloqueada (alternativa ao modal).

### 4. **LoadingFeature**
**Localização:** `src/components/features/LoadingFeature.tsx`

Loading state durante verificação de acesso.

### 5. **useFeatureGuard** (Hook)
**Localização:** `src/hooks/useFeatureGuard.ts`

Hook para proteger páginas/rotas inteiras com redirecionamento.

---

## 🚀 Como Usar

### Instalação

Componentes já criados em:
```
src/
├── components/
│   └── features/
│       ├── FeatureWrapper.tsx        ✅
│       ├── UpgradeModal.tsx          ✅
│       ├── LoadingFeature.tsx        ✅
│       ├── FeatureBlockedCard.tsx    ✅
│       └── index.ts                  ✅
├── hooks/
│   └── useFeatureGuard.ts            ✅
└── examples/
    └── FeatureWrapperExamples.tsx    ✅ (não importar)
```

### Import

```typescript
// Componentes
import { FeatureWrapper } from '@/components/features'

// Hooks
import { useFeatureGuard, withFeatureGuard } from '@/hooks/useFeatureGuard'
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Proteger Seção com Modal (Padrão)

```typescript
function FinancialReportsPage() {
  return (
    <div>
      <h1>Relatórios Financeiros</h1>
      
      {/* Se não tiver acesso, mostra modal de upgrade */}
      <FeatureWrapper feature="financial_complete">
        <FinancialReportsContent />
      </FeatureWrapper>
    </div>
  )
}
```

**Resultado:**
- ✅ Tem acesso → Renderiza `FinancialReportsContent`
- ❌ Sem acesso → Mostra modal com botão "Ver Planos"

---

### Exemplo 2: Card Inline (Não Modal)

```typescript
function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <AppointmentsCard />
      
      {/* Mostra card inline ao invés de modal */}
      <FeatureWrapper feature="cashback" blockMode="card">
        <CashbackCard />
      </FeatureWrapper>
    </div>
  )
}
```

**Resultado:**
- ✅ Tem acesso → Renderiza `CashbackCard`
- ❌ Sem acesso → Mostra card com "Recurso Premium" e botão

---

### Exemplo 3: Esconder Completamente

```typescript
function NavigationMenu() {
  return (
    <nav>
      <MenuItem href="/dashboard">Dashboard</MenuItem>
      
      {/* Esconde menu se não tiver acesso */}
      <FeatureWrapper feature="crm_advanced" blockMode="hide">
        <MenuItem href="/crm">CRM Avançado</MenuItem>
      </FeatureWrapper>
    </nav>
  )
}
```

**Resultado:**
- ✅ Tem acesso → Mostra item do menu
- ❌ Sem acesso → Não renderiza nada (menu oculto)

---

### Exemplo 4: Fallback Customizado

```typescript
function PricingSection() {
  return (
    <FeatureWrapper 
      feature="pricing_intelligence"
      blockMode="custom"
      fallback={
        <div className="text-center p-8">
          <h3>IA de Precificação</h3>
          <p>Descubra o preço ideal com inteligência artificial</p>
          <Button>Testar Grátis por 7 dias</Button>
        </div>
      }
    >
      <PricingIntelligenceContent />
    </FeatureWrapper>
  )
}
```

---

### Exemplo 5: Proteger Página Inteira

```typescript
function CRMAdvancedPage() {
  const { hasAccess, loading } = useFeatureGuard('crm_advanced', '/plans')
  
  if (loading) return <Loading />
  if (!hasAccess) return null // Já foi redirecionado para /plans
  
  return (
    <div>
      <h1>CRM Avançado</h1>
      {/* Conteúdo da página */}
    </div>
  )
}
```

---

### Exemplo 6: HOC para Componente

```typescript
// Componente original
function AutomatedCampaignsContent() {
  return <div>Campanhas Automáticas</div>
}

// Exportar versão protegida
export const AutomatedCampaignsPage = withFeatureGuard(
  AutomatedCampaignsContent,
  'automatic_campaigns'
)
```

---

### Exemplo 7: Título e Descrição Customizados

```typescript
<FeatureWrapper 
  feature="online_booking"
  title="Agendamento Online 24/7"
  description="Deixe seus clientes agendarem sem ligar!"
>
  <OnlineBookingConfig />
</FeatureWrapper>
```

---

### Exemplo 8: Loading Compacto

```typescript
<FeatureWrapper 
  feature="whatsapp_marketing" 
  blockMode="hide"
  compactLoading={true}
>
  <WhatsAppButton />
</FeatureWrapper>
```

---

## 📚 API Reference

### FeatureWrapper Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `feature` | `string` | **obrigatório** | Nome da feature (ex: `financial_complete`) |
| `children` | `ReactNode` | **obrigatório** | Conteúdo a renderizar se tiver acesso |
| `blockMode` | `'modal' \| 'card' \| 'hide' \| 'custom'` | `'modal'` | Como bloquear quando sem acesso |
| `fallback` | `ReactNode` | - | Componente customizado quando bloqueado |
| `loadingComponent` | `ReactNode` | - | Loading customizado |
| `title` | `string` | - | Título customizado do modal/card |
| `description` | `string` | - | Descrição customizada |
| `compactLoading` | `boolean` | `false` | Loading menor |

### useFeatureGuard Hook

```typescript
const { hasAccess, requiredPlan, loading } = useFeatureGuard(
  'feature_name',    // Feature necessária
  '/plans',          // URL para redirecionar (opcional)
  (requiredPlan) => {  // Callback ao bloquear (opcional)
    console.log(`Bloqueado! Plano necessário: ${requiredPlan}`)
  }
)
```

### withFeatureGuard HOC

```typescript
const ProtectedComponent = withFeatureGuard(
  MyComponent,      // Componente a proteger
  'feature_name',   // Feature necessária
  '/plans'          // URL de redirecionamento (opcional)
)
```

---

## 🎨 Features Disponíveis

### Plano ESSENCIAL
```typescript
'clients'
'services'
'products'
'appointments'
'commands'
'financial_basic'
'reports_basic'
```

### Plano PRO
```typescript
'financial_complete'
'reports_complete'
'packages'
'commissions'
'goals'
'anamneses'
'purchases'
'evaluations'
'whatsapp_marketing'
```

### Plano PREMIUM
```typescript
'cashback'
'promotions'
'subscription_sales'
'document_generator'
'invoices'
'online_booking'
'pricing_intelligence'
'advanced_reports'
'professional_ranking'
'client_funnel'
```

### Plano SCALE
```typescript
'crm_advanced'
'automatic_campaigns'
'multi_unit_reports'
'priority_support'
'programa_crescer'
```

---

## ✅ Melhores Práticas

### 1. Use `blockMode` apropriado

```typescript
// ✅ BOM: Modal para páginas inteiras
<FeatureWrapper feature="invoices">
  <InvoicesPage />
</FeatureWrapper>

// ✅ BOM: Card para seções em dashboard
<FeatureWrapper feature="cashback" blockMode="card">
  <CashbackCard />
</FeatureWrapper>

// ✅ BOM: Hide para itens de menu
<FeatureWrapper feature="crm_advanced" blockMode="hide">
  <MenuItem />
</FeatureWrapper>
```

### 2. Proteja no nível correto

```typescript
// ❌ MAU: Proteger cada componente filho
<div>
  <FeatureWrapper feature="reports"><Chart1 /></FeatureWrapper>
  <FeatureWrapper feature="reports"><Chart2 /></FeatureWrapper>
  <FeatureWrapper feature="reports"><Chart3 /></FeatureWrapper>
</div>

// ✅ BOM: Proteger container pai
<FeatureWrapper feature="reports">
  <div>
    <Chart1 />
    <Chart2 />
    <Chart3 />
  </div>
</FeatureWrapper>
```

### 3. Use hooks para rotas

```typescript
// ✅ BOM: Hook para proteção de página
function ProtectedPage() {
  const { hasAccess, loading } = useFeatureGuard('feature')
  if (loading) return <Loading />
  if (!hasAccess) return null
  return <PageContent />
}
```

### 4. Combine modos inteligentemente

```typescript
function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Sempre visível */}
      <BasicCard />
      
      {/* Card inline se bloqueado */}
      <FeatureWrapper feature="goals" blockMode="card">
        <GoalsCard />
      </FeatureWrapper>
      
      {/* Esconde se bloqueado */}
      <FeatureWrapper feature="crm_advanced" blockMode="hide">
        <CRMCard />
      </FeatureWrapper>
    </div>
  )
}
```

### 5. Adicione analytics

```typescript
const { hasAccess } = useFeatureGuard(
  'advanced_reports',
  '/plans',
  (requiredPlan) => {
    // Track feature bloqueada
    analytics.track('feature_blocked', {
      feature: 'advanced_reports',
      requiredPlan
    })
  }
)
```

---

## 🔒 Segurança

O FeatureWrapper **valida no backend**:

1. **Frontend chama:** `GET /api/v1/plans/subscription/check-feature/{feature}`
2. **Backend valida:** Plano + Add-ons da empresa
3. **Retorna:** `{ has_access: true/false, required_plan: 'PRO' }`

**Importante:** Mesmo com frontend bloqueando, backend SEMPRE valida nas rotas protegidas com `@require_feature` decorator.

---

## 🚀 Próximos Passos

1. **Integrar em páginas existentes**
   ```typescript
   // Em: src/app/financeiro/page.tsx
   <FeatureWrapper feature="financial_complete">
     <FinanceiroContent />
   </FeatureWrapper>
   ```

2. **Proteger rotas no router**
   ```typescript
   // Em: src/app/crm/page.tsx
   export default withFeatureGuard(CRMPage, 'crm_advanced')
   ```

3. **Adicionar no menu**
   ```typescript
   <FeatureWrapper feature="invoices" blockMode="hide">
     <MenuLink href="/invoices">Notas Fiscais</MenuLink>
   </FeatureWrapper>
   ```

---

## 📞 Suporte

**Documentação Completa:** `frontend/FEATURE_WRAPPER_GUIDE.md`  
**Exemplos:** `frontend/src/examples/FeatureWrapperExamples.tsx`  
**Hooks Backend:** Consultar `ANALISE_PLANOS_ADDONS_FEATURES.md`

---

**Status:** ✅ Pronto para uso em produção  
**Última atualização:** 02/01/2025
