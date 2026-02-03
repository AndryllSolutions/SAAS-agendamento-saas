# Error Handling Global - HTTP 402 (Feature Bloqueada)
## Sistema Automático de Detecção e Modal de Upgrade

**Data:** 02/01/2025  
**Status:** ✅ Implementado e Ativo

---

## 🎯 Visão Geral

Sistema automático que detecta quando uma feature é bloqueada pelo plano (HTTP 402) e exibe modal de upgrade automaticamente, sem necessidade de código adicional nas páginas.

### Como Funciona

```
1. Usuário tenta acessar feature premium
2. Backend retorna HTTP 402 (Payment Required)
3. Interceptor da API captura o erro
4. Dispara evento global 'plan-limit-reached'
5. GlobalFeatureBlockedHandler escuta o evento
6. Modal de upgrade é exibido automaticamente
```

---

## 🔧 Implementação

### 1. Interceptor de API (Automático)

**Arquivo:** `src/services/api.ts` (linhas 156-191)

```typescript
// Captura HTTP 402 automaticamente
if (error.response?.status === 402) {
  const errorData = error.response.data as { 
    detail?: string; 
    message?: string;
    feature?: string;
    required_plan?: string;
  }
  
  // Disparar evento global
  window.dispatchEvent(new CustomEvent('plan-limit-reached', {
    detail: {
      message: errorData?.detail || 'Limite do plano atingido',
      feature: errorData?.feature,
      requiredPlan: errorData?.required_plan,
      url: error.config?.url
    }
  }))
}
```

**Resultado:** Qualquer chamada de API que retorne 402 dispara o evento automaticamente.

---

### 2. Handler Global (Automático)

**Arquivo:** `src/components/features/GlobalFeatureBlockedHandler.tsx`

```typescript
export function GlobalFeatureBlockedHandler() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [blockedFeature, setBlockedFeature] = useState('')
  const [requiredPlan, setRequiredPlan] = useState(null)
  
  useEffect(() => {
    const handlePlanLimit = (event: CustomEvent) => {
      // Extrair dados do evento
      const { message, feature, requiredPlan } = event.detail
      
      // Abrir modal
      setBlockedFeature(feature)
      setRequiredPlan(requiredPlan)
      setIsModalOpen(true)
      
      // Analytics (opcional)
      gtag('event', 'feature_blocked', { feature, requiredPlan })
    }
    
    window.addEventListener('plan-limit-reached', handlePlanLimit)
    return () => window.removeEventListener('plan-limit-reached', handlePlanLimit)
  }, [])
  
  return <UpgradeModal ... />
}
```

**Resultado:** Modal é exibido automaticamente quando evento é disparado.

---

### 3. Integração no Layout (Já Ativo)

**Arquivo:** `src/app/layout.tsx`

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <ThemeProvider>
            {children}
            <Toaster />
            <GlobalFeatureBlockedHandler /> {/* ← Adicionado aqui */}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
```

**Resultado:** Handler ativo em toda a aplicação.

---

## 📊 Fluxo Completo

### Cenário 1: Endpoint Protegido com @require_feature

**Backend:**
```python
@router.get("/financial/reports/advanced")
@require_feature("advanced_reports")
async def get_advanced_reports(...):
    # Se usuário não tem 'advanced_reports', retorna HTTP 402
    return reports
```

**Frontend (automático):**
```typescript
// Código da página - SEM necessidade de try/catch especial
const fetchReports = async () => {
  const response = await api.get('/financial/reports/advanced')
  // Se retornar 402, modal abre automaticamente
  setReports(response.data)
}
```

**Resultado:** Modal de upgrade abre automaticamente se retornar 402.

---

### Cenário 2: Endpoint com Limite de Recursos

**Backend:**
```python
@router.post("/professionals")
@check_plan_limit("professionals")
async def create_professional(...):
    # Se limite atingido, retorna HTTP 402
    return professional
```

**Frontend (automático):**
```typescript
const handleCreate = async (data) => {
  try {
    await api.post('/professionals', data)
    // Se limite atingido, modal abre automaticamente
  } catch (error) {
    // Erro já foi tratado pelo interceptor
    // Modal já foi exibido
    console.log('Erro capturado:', error.message)
  }
}
```

**Resultado:** Modal com mensagem de limite atingido.

---

## 🎨 Customização

### Dados Enviados pelo Backend (Recomendado)

Para melhor UX, backend deve retornar:

```python
raise HTTPException(
    status_code=402,
    detail={
        "message": "Esta funcionalidade requer o plano PRO",
        "feature": "advanced_reports",
        "required_plan": "PRO"
    }
)
```

**Vantagens:**
- Modal mostra nome correto da feature
- Modal mostra plano necessário
- Analytics mais precisos

---

### Evento Customizado

Você pode disparar o evento manualmente se necessário:

```typescript
// Em qualquer lugar do código
window.dispatchEvent(new CustomEvent('plan-limit-reached', {
  detail: {
    message: 'Recurso premium não disponível',
    feature: 'pricing_intelligence',
    requiredPlan: 'PREMIUM',
    url: '/current-page'
  }
}))
```

---

## 📈 Analytics

O handler envia eventos automaticamente para Google Analytics:

```typescript
gtag('event', 'feature_blocked', {
  feature: 'advanced_reports',
  required_plan: 'PRO',
  url: '/financial/reports/advanced'
})
```

**Métricas disponíveis:**
- Qual feature foi mais bloqueada
- Qual plano é mais solicitado
- Em qual página ocorreu o bloqueio

---

## 🧪 Testando

### 1. Simular HTTP 402 no Backend

```python
# Em qualquer endpoint, temporariamente
@router.get("/test-402")
async def test_feature_block():
    raise HTTPException(
        status_code=402,
        detail={
            "message": "Teste de feature bloqueada",
            "feature": "test_feature",
            "required_plan": "PRO"
        }
    )
```

### 2. Testar Frontend

```typescript
// Em qualquer componente
const testModal = () => {
  api.get('/test-402').catch(err => {
    console.log('Modal deve abrir automaticamente')
  })
}
```

### 3. Verificar Console

Deve aparecer:
```
💳 Feature bloqueada (HTTP 402): {
  message: "Teste de feature bloqueada",
  feature: "test_feature",
  requiredPlan: "PRO",
  url: "/test-402"
}

🚫 Feature bloqueada detectada: { message: "...", url: "..." }
```

---

## ✅ Vantagens

**1. Zero Configuração**
- Desenvolvedores não precisam adicionar código
- Funciona automaticamente em toda aplicação

**2. Consistente**
- Mesmo modal em todas as páginas
- Mensagens padronizadas
- UX uniforme

**3. Informativo**
- Mostra qual feature está bloqueada
- Mostra qual plano é necessário
- Link direto para página de planos

**4. Rastreável**
- Analytics automático
- Console logs para debug
- Dados estruturados

**5. Flexível**
- Backend controla mensagens
- Frontend pode customizar modal
- Eventos podem ser disparados manualmente

---

## 🔒 Segurança

**Importante:** O modal é apenas UX. A segurança real está no backend:

```python
# Backend SEMPRE valida (não confia no frontend)
@require_feature("advanced_reports")  # ← Validação real
async def get_reports():
    # Código só executa se tiver permissão
    pass
```

**Frontend:**
- Modal melhora UX
- Evita chamadas desnecessárias
- Guia usuário para upgrade

**Backend:**
- Validação obrigatória
- Retorna 402 se não autorizado
- Não processa requisições inválidas

---

## 📝 Checklist de Implementação

- [x] Interceptor de API captura HTTP 402
- [x] Evento global 'plan-limit-reached' disparado
- [x] GlobalFeatureBlockedHandler criado
- [x] Handler adicionado ao layout root
- [x] Modal de upgrade exibido automaticamente
- [x] Analytics integrado
- [x] Documentação completa

---

## 🚀 Como Usar em Novos Endpoints

### No Backend (Python)

```python
# Opção 1: Proteger feature específica
@router.get("/invoices")
@require_feature("invoices")
async def list_invoices(...):
    return invoices

# Opção 2: Validar limite
@router.post("/units")
@check_plan_limit("units")
async def create_unit(...):
    return unit
```

### No Frontend (TypeScript)

```typescript
// ✅ FAZER: Chamar endpoint normalmente
const loadInvoices = async () => {
  const response = await api.get('/invoices')
  // Modal abre automaticamente se 402
  setInvoices(response.data)
}

// ❌ NÃO FAZER: Tratar 402 manualmente
const loadInvoices = async () => {
  try {
    const response = await api.get('/invoices')
    setInvoices(response.data)
  } catch (error) {
    if (error.response?.status === 402) {
      // NÃO NECESSÁRIO - Modal já abre automaticamente
    }
  }
}
```

---

## 🎯 Resultado Final

**Experiência do Usuário:**

1. Usuário clica em "Relatórios Avançados"
2. Loading aparece
3. Backend retorna 402
4. Modal bonito abre automaticamente:
   - "Relatórios Avançados está disponível no plano PRO"
   - Lista de benefícios do plano PRO
   - Botão "Ver Planos e Preços"
5. Usuário clica e vai para página de planos
6. Upgrade feito
7. Funcionalidade liberada

**Zero código adicional necessário!** 🎉

---

## 📞 Referências

**Componentes:**
- `src/services/api.ts` (linhas 156-191) - Interceptor
- `src/components/features/GlobalFeatureBlockedHandler.tsx` - Handler
- `src/components/features/UpgradeModal.tsx` - Modal
- `src/app/layout.tsx` (linha 38) - Integração

**Documentação:**
- `frontend/FEATURE_WRAPPER_GUIDE.md` - FeatureWrapper
- `backend/ANALISE_PLANOS_ADDONS_FEATURES.md` - Backend features

**Status:** ✅ Pronto para produção
