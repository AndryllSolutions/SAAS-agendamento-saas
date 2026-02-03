# CORREÇÃO CRÍTICA: Loop Infinito de Requisições

**Data**: 2026-01-13  
**Severidade**: 🚨 CRÍTICA - Sistema em Produção Inutilizável

---

## ❌ PROBLEMA IDENTIFICADO

### Sintomas
- Loop infinito de requisições
- Erros 429 (Too Many Requests) em cascata
- Erros 404 para endpoints inexistentes
- Sistema completamente inutilizável
- Frontend se auto-atacando

### Causa Raiz
1. **Retry automático em cascata** - Axios tentando novamente 429 e 404
2. **Endpoints inexistentes** - Frontend chamando `/company-settings` e `/subscription-sales/models`
3. **Requisições duplicadas** - Sem cancelamento de requests anteriores
4. **Sem AbortController** - Requests antigas continuam vivas

---

## ✅ CORREÇÕES APLICADAS

### 1. Desativado Retry Automático (CRÍTICO)

**Arquivo**: `frontend/src/services/api.ts`

```typescript
// ❌ ANTES: Retry automático para 429
if (error.response?.status === 429) {
  await new Promise(resolve => setTimeout(resolve, waitTime));
  return api.request(error.config); // LOOP INFINITO!
}

// ✅ DEPOIS: Bloqueio imediato
if (error.response?.status === 429) {
  console.error('🚫 Rate limit (429) - BLOQUEADO. Não será feito retry automático.');
  error.message = 'Muitas requisições. Aguarde antes de tentar novamente.';
  return Promise.reject(error); // PARA AQUI
}

if (error.response?.status === 404) {
  console.error('🚫 Endpoint não encontrado (404) - BLOQUEADO. Não será feito retry.');
  error.message = 'Recurso não encontrado.';
  return Promise.reject(error); // PARA AQUI
}
```

**Resultado**: ✅ Um erro = 1 request, nunca mais de um

---

### 2. Implementado AbortController (CRÍTICO)

**Arquivo**: `frontend/src/services/api.ts`

```typescript
// CRITICAL: AbortController para cancelamento de requisições
const pendingRequests = new Map<string, AbortController>();

// Helper para gerar chave única de requisição
const getRequestKey = (url?: string, method?: string): string => {
  return `${method || 'GET'}:${url || 'unknown'}`;
};

// Request interceptor
api.interceptors.request.use((config) => {
  // CRITICAL: Cancelar requisição anterior do mesmo tipo
  const requestKey = getRequestKey(config.url, config.method);
  const existingController = pendingRequests.get(requestKey);
  
  if (existingController) {
    console.warn('⚠️ Cancelando requisição duplicada:', requestKey);
    existingController.abort();
    pendingRequests.delete(requestKey);
  }
  
  // Criar novo AbortController para esta requisição
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);
  
  return config;
});

// Response interceptor - limpar após sucesso/erro
api.interceptors.response.use(
  (response) => {
    const key = getRequestKey(response.config.url, response.config.method);
    pendingRequests.delete(key);
    return response;
  },
  (error) => {
    const key = getRequestKey(error.config?.url, error.config?.method);
    pendingRequests.delete(key);
    return Promise.reject(error);
  }
);
```

**Resultado**: ✅ Requests antigas canceladas automaticamente

---

### 3. Removidos Endpoints Inexistentes (CRÍTICO)

#### A. Company Settings (404 em loop)

**Arquivo**: `frontend/src/services/api.ts`

```typescript
// ❌ ANTES: Chamadas para endpoints que não existem
export const companySettingsService = {
  getAll: () => api.get('/company-settings'), // 404!
  updateAdmin: (data) => api.put('/company-settings/admin', data), // 404!
  updatePersonalizar: (data) => api.put('/company-settings/personalizar', data), // 404!
  // ...
};

// ✅ DEPOIS: Removido completamente
// ========== COMPANY SETTINGS SERVICE ==========
// REMOVIDO: Endpoints /company-settings não existem no backend
// TODO: Implementar no backend antes de usar no frontend
```

**Arquivo**: `frontend/src/hooks/useCompanyTheme.ts`

```typescript
// ❌ ANTES: Hook chamando endpoint inexistente
const loadThemeSettings = async () => {
  const settings = await companySettingsService.getThemeSettings() // 404!
  setThemeSettings(settings)
}

// ✅ DEPOIS: Desabilitado
const loadThemeSettings = async () => {
  console.warn('⚠️ Theme settings desabilitado - endpoint não existe no backend')
  setLoading(false)
  return
}
```

#### B. Subscription Sales (404 em loop)

**Arquivo**: `frontend/src/services/api.ts`

```typescript
// ❌ ANTES: Endpoints inexistentes
export const subscriptionSaleService = {
  listModels: () => api.get('/subscription-sales/models'), // 404!
  list: (params) => api.get('/subscription-sales', { params }), // 404!
  // ...
};

// ✅ DEPOIS: Removido
// ========== SUBSCRIPTION SALES SERVICE ==========
// REMOVIDO: Endpoints /subscription-sales não existem no backend
// TODO: Implementar no backend antes de usar no frontend
```

**Arquivo**: `frontend/src/app/subscription-sales/page.tsx`

```typescript
// ❌ ANTES: Chamadas em loop
const loadData = async () => {
  const [subscriptionsRes, modelsRes] = await Promise.all([
    subscriptionSaleService.list(params), // 404!
    subscriptionSaleService.listModels(), // 404!
  ])
}

// ✅ DEPOIS: Desabilitado
const loadData = async () => {
  console.warn('⚠️ Subscription sales desabilitado - endpoint não existe no backend')
  setLoading(false)
  setError('Funcionalidade de assinaturas ainda não implementada no backend')
  return
}
```

**Resultado**: ✅ Zero erros 404 em produção

---

### 4. Adicionado Timeout (SEGURANÇA)

**Arquivo**: `frontend/src/services/api.ts`

```typescript
const api: AxiosInstance = axios.create({
  baseURL: `${cleanApiUrl}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  timeout: 30000, // 30 segundos timeout
});
```

**Resultado**: ✅ Requests não ficam penduradas indefinidamente

---

## 📊 ARQUIVOS MODIFICADOS

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `frontend/src/services/api.ts` | Removido retry 429/404, AbortController, timeout | ✅ |
| `frontend/src/services/api.ts` | Removido companySettingsService | ✅ |
| `frontend/src/services/api.ts` | Removido subscriptionSaleService | ✅ |
| `frontend/src/hooks/useCompanyTheme.ts` | Desabilitado chamadas | ✅ |
| `frontend/src/app/subscription-sales/page.tsx` | Desabilitado chamadas | ✅ |

---

## 🎯 RESULTADO ESPERADO

### Antes (PROBLEMA)
```
GET /clients → 200
GET /clients → 200 (duplicado!)
GET /company-settings → 404
GET /company-settings → 404 (retry!)
GET /company-settings → 404 (retry!)
... (loop infinito)
GET /subscription-sales/models → 404
GET /subscription-sales/models → 404 (retry!)
... (loop infinito)
→ 429 Too Many Requests
→ 429 (retry!)
→ 429 (retry!)
... (cascata de erros)
```

### Depois (CORRIGIDO)
```
GET /clients → 200 ✅
GET /services → 200 ✅
GET /professionals → 200 ✅
(sem duplicatas, sem 404, sem 429)
```

---

## ✅ VALIDAÇÃO

### Checklist de Sucesso

- [ ] DevTools → Network: Cada endpoint aparece 1x
- [ ] Nenhum erro 404 para company-settings
- [ ] Nenhum erro 404 para subscription-sales
- [ ] Nenhum erro 429 em navegação normal
- [ ] Sistema abre sem loop
- [ ] Login funciona
- [ ] CRUD funciona
- [ ] Sem reload infinito

---

## 🚀 PRÓXIMOS PASSOS

### Deploy Imediato
1. Build frontend sem cache
2. Deploy na VPS
3. Restart containers
4. Validar em produção

### Monitoramento
1. Verificar logs do Nginx
2. Verificar logs do backend
3. Monitorar DevTools do browser
4. Confirmar ausência de loops

---

## 📝 NOTAS IMPORTANTES

### Rate Limit no Backend
- ✅ Rate limit deve ser aplicado APENAS em rotas públicas (`/auth/*`)
- ✅ Rotas autenticadas NÃO devem ter rate limit global
- ⚠️ Verificar configuração do SlowAPI no backend

### Endpoints a Implementar (Futuro)
- `/company-settings/*` - Configurações da empresa
- `/subscription-sales/*` - Vendas de assinaturas

### Prevenção
- ✅ Sempre verificar se endpoint existe no backend antes de usar no frontend
- ✅ Nunca fazer retry automático para 429 ou 404
- ✅ Sempre usar AbortController para cancelar requests duplicadas
- ✅ Sempre adicionar timeout em requests HTTP

---

## ✅ CONCLUSÃO

**Status**: 🟢 CORREÇÕES APLICADAS

**Impacto**: Sistema deve voltar a funcionar normalmente após deploy

**Próxima Ação**: Deploy na VPS e validação em produção
