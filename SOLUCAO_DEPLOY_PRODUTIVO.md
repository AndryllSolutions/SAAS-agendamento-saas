# Solução Completa: Deploy Production Atendo SaaS

## 🎯 Objetivo

Documentar passo a passo a solução para deploy do sistema Atendo SaaS em produção, resolvendo erros comuns e garantindo funcionamento completo pelo domínio `atendo.website`.

## 📋 Pré-requisitos
- VPS com Docker e docker-compose instalados
- Domínio `atendo.website` apontando para o IP da VPS
- Certificados SSL configurados (Let's Encrypt)

## 🚀 Passo a Passo da Solução

### 1. Correções no docker-compose.prod.yml

#### Problema: Healthchecks com `curl` não existem nas imagens

**Solução:** Substituir healthchecks que usam `curl`

```yaml
# RabbitMQ - usar rabbitmq-diagnostics
rabbitmq:
  healthcheck:
    test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
    # Remover healthcheck duplicado que usa curl

# Backend - usar Python urllib
backend:
  healthcheck:
    test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()\""]

# Frontend - usar Node.js
frontend:
  healthcheck:
    test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000', r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))\""]
```

#### Problema: Dependências duplicadas

**Solução:** Remover linhas duplicadas em `depends_on`

```yaml
backend:
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
    rabbitmq:
      condition: service_healthy
    # Removido: evolution-api (não necessário)
```

### 2. Remover Evolution API

O Evolution API foi removido para evitar conflitos:

```yaml
# Remover todo o bloco do evolution-api
# Remover evolution-api dos volumes
```

### 3. Configuração Nginx para Domínio Dinâmico

#### Problema: Nomes dos containers com `_prod`

**Solução:** Atualizar nginx.conf para usar nomes corretos

```nginx
# No bloco server do HTTPS
set $frontend_upstream agendamento_frontend_prod:3000;
set $backend_upstream agendamento_backend_prod:8000;
```

### 4. Resolução de Erros de Módulos no Frontend

#### Problema: Arquivos faltando no volume

**Solução:** Copiar arquivos faltantes para a VPS

```bash
# Copiar arquivos que estavam faltando
scp frontend/src/utils/toastHelpers.ts root@VPS:/opt/saas/atendo/frontend/src/utils/
scp frontend/src/components/ui/ImageUpload.tsx root@VPS:/opt/saas/atendo/frontend/src/components/ui/
```

#### Problema: Dependências quebradas
**Solução:** Limpar cache e reinstalar dependências

```bash
# Parar container
docker stop agendamento_frontend_prod
docker rm agendamento_frontend_prod

# Limpar volumes
docker volume rm frontend_node_modules

# Reinstalar dependências
docker run --rm -v ./frontend:/app -w /app node:20-alpine npm install

# Recriar container
docker run -d --name agendamento_frontend_prod \
  --network atendo_agendamento_network \
  -v ./frontend:/app \
  -v frontend_node_modules:/app/node_modules \
  -e NEXT_PUBLIC_API_URL=https://atendo.website/api \
  --restart unless-stopped \
  atendo_frontend
```

### 5. Resolução do Bug `KeyError: 'ContainerConfig'`

Este é um bug conhecido do docker-compose v1.29.2 ao usar `--force-recreate`.

**Solução:** Evitar `--force-recreate` e criar containers manualmente quando necessário

```bash
# Em vez de:
docker-compose up -d --force-recreate

# Usar:
docker rm -f nome_container
docker-compose up -d nome_servico
```

### 6. Comandos para Recuperação do Sistema

```bash
# 1. Parar serviços problemáticos
docker-compose -f docker-compose.prod.yml stop frontend backend

# 2. Remover containers
docker rm -f agendamento_frontend_prod agendamento_backend_prod

# 3. Limpar volumes se necessário
docker volume rm frontend_node_modules

# 4. Recriar imagens
docker build -t atendo_frontend ./frontend
docker build -t atendo_backend ./backend

# 5. Subir serviços manualmente
docker run -d --name agendamento_frontend_prod \
  --network atendo_agendamento_network \
  -v ./frontend:/app \
  -v frontend_node_modules:/app/node_modules \
  -e NEXT_PUBLIC_API_URL=https://atendo.website/api \
  --restart unless-stopped \
  atendo_frontend

docker run -d --name agendamento_backend_prod \
  --network atendo_agendamento_network \
  -v ./backend:/app \
  -e DATABASE_URL=postgresql://agendamento_app:SENHA@agendamento_db_prod:5432/agendamento \
  --restart unless-stopped \
  atendo_backend sh -c 'alembic upgrade heads && uvicorn app.main:app --host 0.0.0.0 --port 8000'
```

### 7. Variáveis de Ambiente Críticas

```bash
# .env.production
POSTGRES_USER=agendamento_app
POSTGRES_DB=agendamento
DATABASE_URL=postgresql://agendamento_app:SENHA@localhost:5432/agendamento
NEXT_PUBLIC_API_URL=https://atendo.website/api
RABBITMQ_PASSWORD=SENHA_RABBITMQ
REDIS_PASSWORD=SENHA_REDIS
```

## 🔍 Verificação do Sistema

```bash
# Verificar status todos containers
docker ps | grep agendamento

# Testar acessos
curl -k https://atendo.website/
curl -k https://atendo.website/health
curl -k https://atendo.website/calendar

# Verificar logs
docker logs agendamento_frontend_prod
docker logs agendamento_backend_prod
docker logs agendamento_nginx_prod
```

## 📝 Lições Aprendidas

1. **Nunca usar `--force-recreate`** com docker-compose v1.29.2
2. **Sempre verificar se imagens contêm curl** antes de usar em healthchecks
3. **Volumes podem sobrescrever node_modules** - usar volume nomeado separado
4. **Evolution API causou conflitos** - melhor manter separado
5. **Domínio dinâmico é essencial** para não precisar alterar IPs manualmente
6. **Arquivos podem faltar no volume** - sempre sincronizar arquivos importantes

## 🚨 Comandos de Emergência

```bash
# Reset completo sem perder dados do banco
docker-compose -f docker-compose.prod.yml down
docker volume rm frontend_node_modules  # Apenas frontend
docker-compose -f docker-compose.prod.yml up -d db redis rabbitmq
# Aguardar serviços ficarem healthy
docker-compose -f docker-compose.prod.yml up -d backend
docker-compose -f docker-compose.prod.yml up -d celery_worker celery_beat
docker-compose -f docker-compose.prod.yml up -d frontend nginx
```

## ✅ Status Final Esperado

Todos os serviços devem estar `Up` ou `Up (healthy)`:
- agendamento_db_prod: Up (healthy)
- agendamento_redis_prod: Up (healthy)  
- agendamento_rabbitmq_prod: Up (healthy)
- agendamento_backend_prod: Up
- agendamento_celery_worker_prod: Up (healthy)
- agendamento_celery_beat_prod: Up
- agendamento_frontend_prod: Up (healthy)
- agendamento_nginx_prod: Up

E os acessos devem retornar 200 OK:
- `https://atendo.website/`
- `https://atendo.website/health`
- `https://atendo.website/calendar`
