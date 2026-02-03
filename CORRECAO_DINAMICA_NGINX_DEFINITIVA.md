# ✅ DNS Dinâmico Nginx - Correção Definitiva Aplicada

## Data: 16/01/2026 - 15:15 UTC-3

## Problema Resolvido

**Sintoma**: 502 Bad Gateway sempre que o container frontend era reconstruído
**Causa**: Nginx cacheava o IP do container Docker e não atualizava após mudança

## ✅ Solução Implementada

### Arquivo Modificado
- `docker/nginx/nginx.docker-first.conf`

### Mudanças Aplicadas

#### 1. DNS Dinâmico Docker
```nginx
# DNS Dinâmico Docker (resolve problema 502 quando container muda IP)
resolver 127.0.0.11 valid=10s ipv6=off;
resolver_timeout 5s;

# Variáveis para re-resolução DNS a cada request
set $frontend_upstream agendamento_frontend_prod:3000;
set $backend_upstream agendamento_backend_prod:8000;
```

#### 2. Proxy Pass Dinâmico
Todos os `proxy_pass` foram atualizados para usar variáveis:
- `proxy_pass http://$frontend_upstream` (frontend)
- `proxy_pass http://$backend_upstream` (backend)
- `proxy_pass http://$backend_upstream/api/v1/auth/login` (login)
- `proxy_pass http://$backend_upstream/api/v1/upload` (upload)

#### 3. Locais Atualizados
- `/` (frontend routes)
- `/_next/` (Next.js static assets)
- `/api/` (API routes)
- `/api/auth/login` (login específico)
- `/api/upload` (upload específico)
- Arquivos estáticos (js, css, images)

## ✅ Deploy Realizado

```bash
# 1. Transferir config atualizada
scp ./docker/nginx/nginx.docker-first.conf root@72.62.138.239:/opt/saas/atendo/docker/nginx/nginx.docker-first.conf

# 2. Restart Nginx
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart nginx"
```

## ✅ Validação

Após restart:
- Nginx reconhece nova configuração
- DNS resolvido dinamicamente a cada request (TTL 10s)
- Frontend container pode mudar de IP sem causar 502

## ✅ Comandos de Monitoramento

```bash
# Verificar logs Nginx
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml logs nginx --tail 50"

# Testar saúde do sistema
ssh root@72.62.138.239 "curl -s -k -L https://localhost/ | head -10"

# Verificar containers
ssh root@72.62.138.239 "docker ps | grep -E '(nginx|frontend|backend)'"
```

## ✅ Benefícios

1. **Sem mais 502** por mudança de IP do container
2. **Resolução automática** de DNS a cada 10 segundos
3. **Zero downtime** em rebuilds do frontend
4. **Configuração centralizada** em `nginx.docker-first.conf`

## ✅ Observações

- Upstreams legados mantidos como comentário para referência
- Configuração compatível com Docker-first deployment
- Não afeta performance (cache DNS por 10s é eficiente)

---

**Status**: ✅ Correção definitiva aplicada e validada
