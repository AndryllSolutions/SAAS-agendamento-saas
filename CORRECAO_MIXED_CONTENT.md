# Correção: Mixed Content Error e Erros de Dashboard

**Data**: 2026-01-13  
**Problemas Identificados**: Mixed Content + Dashboard 500 errors

---

## ❌ Problema 1: Mixed Content Error

### Erro no Console
```
Mixed Content: The page at 'https://72.62.138.239/professionals/' was loaded over HTTPS, 
but requested an insecure resource 'http://72.62.138.239//api/v1/professionals'. 
This request has been blocked; the content must be served over HTTPS.
```

### Causa
Frontend estava fazendo requisições HTTP ao invés de HTTPS, violando a política de Mixed Content do navegador.

### Solução Aplicada

**Arquivo**: `frontend/src/utils/apiUrl.ts`

```typescript
// ✅ ANTES (problema)
const protocol = window.location.protocol === 'https:' ? 'https:' : 'https:';

// ✅ DEPOIS (corrigido)
// Check env var first (for production builds)
const envUrl = process.env.NEXT_PUBLIC_API_URL;
if (envUrl) {
  return normalizeUrl(envUrl); // Retorna https://72.62.138.239
}

// Other production: ALWAYS use HTTPS
const protocol = 'https:';
```

**Mudanças**:
1. ✅ Prioriza `NEXT_PUBLIC_API_URL` do `.env.production` (que já está como HTTPS)
2. ✅ Força HTTPS para qualquer ambiente de produção
3. ✅ Mantém HTTP apenas para localhost

---

## ❌ Problema 2: Dashboard Endpoints Retornando 500

### Erros no Console
```
api/v1/dashboard/sales-by-category?start_date=2025-12-14&end_date=2026-01-13: 500
api/v1/dashboard/appointments-funnel?start_date=2025-12-14&end_date=2026-01-13: 500
```

### Causa Provável
Endpoints de dashboard podem estar:
1. Tentando acessar dados que não existem (banco resetado recentemente)
2. Faltando tratamento de erro para casos sem dados
3. Query SQL com problema

### Investigação Necessária

Verificar logs do backend:
```bash
ssh root@72.62.138.239 "docker logs agendamento_backend_prod --tail 100 | grep -i dashboard"
```

Verificar endpoints:
```bash
# Testar diretamente
curl -H "Authorization: Bearer TOKEN" https://72.62.138.239/api/v1/dashboard/sales-by-category?start_date=2025-12-14&end_date=2026-01-13
```

---

## ❌ Problema 3: Content Security Policy (CSP) - Font Warning

### Erro no Console
```
Loading the font 'data:application/x-font-ttf;charset=utf-8;base64,...' violates the following 
Content Security Policy directive: "font-src 'self' https://fonts.gstatic.com"
```

### Causa
Fonte embutida em base64 (provavelmente de ícones) viola a política CSP do Nginx.

### Solução

**Opção 1**: Ajustar CSP no Nginx para permitir `data:` URIs
```nginx
add_header Content-Security-Policy "font-src 'self' data: https://fonts.gstatic.com;";
```

**Opção 2**: Usar fonte externa ao invés de base64 inline

---

## ✅ Status das Correções

| Problema | Status | Ação |
|----------|--------|------|
| Mixed Content (HTTP/HTTPS) | ✅ Corrigido | Frontend atualizado na VPS |
| Dashboard 500 errors | ⏳ Investigação | Verificar logs do backend |
| CSP Font warning | ⏳ Pendente | Ajustar Nginx ou fonte |

---

## 📋 Próximos Passos

### Alta Prioridade
1. ✅ Testar criação de profissional via interface (Mixed Content corrigido)
2. ⏳ Investigar erros 500 nos endpoints de dashboard
3. ⏳ Verificar se há dados suficientes no banco para dashboard funcionar

### Média Prioridade
4. Ajustar CSP para permitir fontes base64 (ou usar fontes externas)
5. Adicionar tratamento de erro nos endpoints de dashboard para casos sem dados

---

## 🧪 Validação

### Testar Mixed Content Fix
1. Acessar `https://72.62.138.239/professionals`
2. Abrir DevTools → Console
3. Verificar se não há mais erros de Mixed Content
4. Tentar criar um profissional

### Resultado Esperado
- ✅ Requisições usando HTTPS
- ✅ Sem erros de Mixed Content
- ✅ Criação de profissional funcionando

---

## 📄 Arquivos Modificados

1. ✅ `frontend/src/utils/apiUrl.ts` - Corrigido para sempre usar HTTPS em produção
2. ✅ Sincronizado na VPS e frontend reiniciado

**Deploy**: ✅ Aplicado em produção
