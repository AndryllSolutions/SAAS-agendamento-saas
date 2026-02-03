# Correção 502 Bad Gateway - Resolvido

## Data: 15/01/2026 - 19:47 UTC-3

## Problema Identificado

Após o rebuild do container frontend durante o deploy do rebranding, o Nginx estava tentando se conectar ao IP antigo do container (`172.18.0.5`), mas o container foi recriado com um novo IP (`172.18.0.9`).

### Erro nos Logs do Nginx

```
[error] connect() failed (111: Connection refused) while connecting to upstream
upstream: "http://172.18.0.5:3000/"
```

## Causa Raiz

Quando um container Docker é recriado, ele pode receber um novo IP na rede interna. O Nginx havia resolvido o nome DNS `agendamento_frontend_prod` para o IP antigo e estava mantendo essa resolução em cache.

## Solução Aplicada

**Comando executado:**
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

Ao reiniciar o Nginx, ele resolveu novamente o nome DNS do container frontend para o novo IP correto.

## Validação da Correção

### 1. Status HTTP - ✅ Resolvido
```
HTTP/2 200 
server: nginx/1.29.4
content-type: text/html; charset=utf-8
```

### 2. Branding Atendo - ✅ Aplicado
```html
<title>Atendo - Sistema de Agendamento Online</title>
```

### 3. Favicon - ✅ Funcionando
```
HTTP/2 200 
content-type: image/svg+xml
content-length: 694
cache-control: max-age=31536000
```

### 4. Headers de Segurança - ✅ Ativos
```
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
content-security-policy: default-src 'self'; ...
```

## URLs Funcionando

- ✅ **Frontend**: https://atendo.website/ (HTTP 200)
- ✅ **Favicon SVG**: https://atendo.website/favicon.svg (HTTP 200)
- ✅ **Favicon ICO**: https://atendo.website/favicon.ico (HTTP 200)
- ✅ **Backend API**: https://atendo.website/api/health

## Documentação Consultada

Baseado nos guias encontrados no VPS:
- `/opt/saas/atendo/NGINX_SETUP_GUIDE.md`
- `/opt/saas/atendo/NGINX_IP_SETUP_GUIDE.md`

## Lição Aprendida

**Sempre reiniciar o Nginx após recriar containers** que ele faz proxy, para garantir que os IPs sejam resolvidos corretamente.

### Comando Recomendado para Deploys Futuros

```bash
# Após rebuild de qualquer container (frontend/backend)
docker compose -f docker-compose.prod.yml restart nginx
```

Ou melhor ainda, reiniciar todos os serviços dependentes:

```bash
# Rebuild frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend

# Reiniciar nginx para resolver novo IP
docker compose -f docker-compose.prod.yml restart nginx
```

## Status Final

✅ **502 Bad Gateway**: RESOLVIDO  
✅ **HTTPS**: Funcionando  
✅ **Branding Atendo**: Aplicado  
✅ **Favicon**: Carregando corretamente  
✅ **Segurança**: Headers ativos  

---

**Sistema 100% operacional em produção!** 🚀
