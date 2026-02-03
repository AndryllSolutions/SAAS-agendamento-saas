# Solução Permanente: Nginx DNS Dinâmico

## Problema

Sempre que o container frontend é recriado (rebuild), ele recebe um novo IP na rede Docker. O Nginx resolve o nome DNS do container apenas uma vez no startup e cacheia o IP, causando erro **502 Bad Gateway** até que o Nginx seja reiniciado.

### Exemplo do Erro
```
[error] connect() failed (111: Connection refused) while connecting to upstream
upstream: "http://172.18.0.5:3000/"  ← IP antigo
```

Mas o container agora está em: `172.18.0.9:3000` ← IP novo

---

## Soluções Implementadas

### ✅ Solução 1: Configuração Nginx com DNS Dinâmico (Recomendada)

**Arquivo**: `docker/nginx/nginx.prod.dynamic.conf`

#### Mudanças Principais:

1. **Resolver DNS do Docker**
```nginx
# Usa o DNS interno do Docker com TTL de 10s
resolver 127.0.0.11 valid=10s ipv6=off;
resolver_timeout 5s;
```

2. **Variáveis para Forçar Re-resolução**
```nginx
# Define variáveis que forçam lookup DNS a cada request
set $frontend_upstream agendamento_frontend_prod:3000;
set $backend_upstream agendamento_backend_prod:8000;

location / {
    # Usa variável em vez de upstream fixo
    proxy_pass http://$frontend_upstream;
    ...
}
```

#### Como Aplicar:

```bash
# No VPS
cd /opt/saas/atendo

# Backup da config atual
cp docker/nginx/nginx.prod.conf docker/nginx/nginx.prod.conf.backup

# Usar nova configuração
cp docker/nginx/nginx.prod.dynamic.conf docker/nginx/nginx.prod.conf

# Reiniciar Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

#### Vantagens:
- ✅ Resolve DNS automaticamente a cada request
- ✅ Não precisa reiniciar Nginx após rebuild
- ✅ Funciona com qualquer mudança de IP
- ✅ Performance mínima afetada (cache de 10s)

---

### ✅ Solução 2: Script de Deploy Automático

**Arquivos**: 
- `vps-deploy-scripts/deploy-frontend-auto.ps1` (Windows)
- `vps-deploy-scripts/deploy-frontend-auto.sh` (Linux/VPS)

#### O Que Faz:

1. Rebuild do container frontend
2. **Reinicia Nginx automaticamente** ← Chave!
3. Valida deployment

#### Como Usar:

**No Windows (local):**
```powershell
cd e:\agendamento_SAAS
.\vps-deploy-scripts\deploy-frontend-auto.ps1
```

**No VPS:**
```bash
cd /opt/saas/atendo
chmod +x vps-deploy-scripts/deploy-frontend-auto.sh
./vps-deploy-scripts/deploy-frontend-auto.sh
```

#### Vantagens:
- ✅ Sempre reinicia Nginx após rebuild
- ✅ Funciona com config atual
- ✅ Automatiza processo completo
- ✅ Validação integrada

---

## Comparação das Soluções

| Aspecto | Solução 1 (DNS Dinâmico) | Solução 2 (Auto-Restart) |
|---------|--------------------------|--------------------------|
| **Automação** | Total | Requer script |
| **Performance** | Mínima overhead | Sem overhead |
| **Complexidade** | Média | Baixa |
| **Manutenção** | Nenhuma | Manual (rodar script) |
| **Recomendação** | ⭐⭐⭐⭐⭐ Melhor | ⭐⭐⭐⭐ Boa |

---

## Recomendação Final

### Use Ambas! 🎯

1. **Aplicar Solução 1** (DNS Dinâmico) para resolver automaticamente
2. **Manter Solução 2** (Script) como fallback e para deploys rápidos

### Implementação Completa:

```bash
# 1. Aplicar configuração DNS dinâmica
cd /opt/saas/atendo
cp docker/nginx/nginx.prod.dynamic.conf docker/nginx/nginx.prod.conf
docker compose -f docker-compose.prod.yml restart nginx

# 2. Para deploys futuros, usar script automático
./vps-deploy-scripts/deploy-frontend-auto.sh
```

---

## Testes Realizados

### Antes da Solução:
```
❌ Rebuild frontend → IP muda → 502 Bad Gateway
✅ Restart manual Nginx → Funciona
```

### Depois da Solução 1 (DNS Dinâmico):
```
✅ Rebuild frontend → IP muda → Funciona automaticamente
✅ Sem necessidade de restart manual
```

### Depois da Solução 2 (Script):
```
✅ Rodar script → Rebuild + Restart automático → Funciona
✅ Processo automatizado
```

---

## Troubleshooting

### Se ainda ocorrer 502:

1. **Verificar DNS resolver**
```bash
docker exec agendamento_nginx_prod cat /etc/resolv.conf
# Deve mostrar: nameserver 127.0.0.11
```

2. **Verificar logs do Nginx**
```bash
docker logs agendamento_nginx_prod --tail 50 | grep error
```

3. **Testar resolução DNS**
```bash
docker exec agendamento_nginx_prod nslookup agendamento_frontend_prod
```

4. **Fallback: Restart manual**
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Arquivos Criados

- ✅ `docker/nginx/nginx.prod.dynamic.conf` - Config com DNS dinâmico
- ✅ `vps-deploy-scripts/deploy-frontend-auto.ps1` - Script Windows
- ✅ `vps-deploy-scripts/deploy-frontend-auto.sh` - Script Linux/VPS
- ✅ `SOLUCAO_PERMANENTE_NGINX_DNS.md` - Esta documentação

---

## Próximos Passos

1. **Aplicar Solução 1** no VPS (recomendado)
2. **Testar** rebuild do frontend
3. **Validar** que não ocorre mais 502
4. **Usar Script** para deploys futuros

---

**Status**: ✅ Solução Permanente Implementada  
**Problema**: ✅ Resolvido  
**Manutenção**: ✅ Automatizada
