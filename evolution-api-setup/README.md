# Evolution API v2 - Setup Completo com PostgreSQL + Redis

## 📋 Visão Geral

Setup **completo e reproduzível** do Evolution API v2 com PostgreSQL e Redis usando Docker Compose.

**Foco principal**: Eliminar o erro `"Error: Database provider invalid"`

---

## 🚀 Quick Start

```bash
# 1. Clone ou copie os arquivos
cd evolution-api-setup

# 2. Copie o arquivo de exemplo
cp .env.example .env

# 3. (Opcional) Edite o .env se necessário
nano .env

# 4. Suba os containers
docker compose up -d

# 5. Acompanhe os logs
docker compose logs -f evolution

# 6. Aguarde ~30 segundos até ver:
# "Application is running on: http://[::]:8080"
```

---

## 📁 Estrutura de Arquivos

```
evolution-api-setup/
├── docker-compose.yml    # Orquestração dos containers
├── .env.example          # Template de variáveis (COPIAR para .env)
├── .env                  # Suas variáveis (NÃO commitar!)
└── README.md            # Este arquivo
```

---

## 🔧 Configuração Detalhada

### 1. Variáveis de Ambiente Críticas

**ESTAS 4 VARIÁVEIS SÃO OBRIGATÓRIAS** para evitar "Database provider invalid":

```bash
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://evolution:evolution@postgres:5432/evolution?schema=public
DATABASE_CONNECTION_CLIENT_NAME=evolution_exchange
```

#### ⚠️ ATENÇÃO - Erros Comuns:

| ❌ ERRADO | ✅ CORRETO | Motivo |
|-----------|-----------|--------|
| `DATABASE_PROVIDER=postgres` | `DATABASE_PROVIDER=postgresql` | Deve ser exatamente "postgresql" |
| `DATABASE_PROVIDER=PostgreSQL` | `DATABASE_PROVIDER=postgresql` | Case-sensitive, use minúsculo |
| `DATABASE_ENABLED=True` | `DATABASE_ENABLED=true` | String "true", não boolean |
| `postgresql://...@postgres:5432/evolution` | `postgresql://...@postgres:5432/evolution?schema=public` | Falta `?schema=public` |

### 2. Arquivo .env

**IMPORTANTE**: O arquivo `.env` DEVE estar no **mesmo diretório** do `docker-compose.yml`

```bash
# Estrutura correta:
evolution-api-setup/
├── docker-compose.yml
└── .env              ← AQUI!

# ❌ Estrutura errada:
evolution-api-setup/
├── docker-compose.yml
└── config/
    └── .env          ← NÃO AQUI!
```

### 3. Credenciais do PostgreSQL

As credenciais devem **coincidir** entre as variáveis:

```bash
# No .env:
POSTGRES_USER=evolution
POSTGRES_PASSWORD=evolution
POSTGRES_DB=evolution

# E na CONNECTION_URI:
DATABASE_CONNECTION_URI=postgresql://evolution:evolution@postgres:5432/evolution?schema=public
#                                    ↑        ↑                            ↑
#                                   USER    PASSWORD                       DB
```

---

## 🐳 Comandos Docker

### Iniciar

```bash
# Subir todos os containers
docker compose up -d

# Subir com rebuild (se mudou código)
docker compose up -d --build

# Subir apenas um serviço
docker compose up -d postgres
```

### Logs

```bash
# Logs de todos os serviços
docker compose logs -f

# Logs apenas do Evolution API
docker compose logs -f evolution

# Logs apenas do Postgres
docker compose logs -f postgres

# Últimas 100 linhas
docker compose logs --tail=100 evolution
```

### Status

```bash
# Ver containers rodando
docker compose ps

# Ver saúde dos containers
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Parar/Remover

```bash
# Parar containers (mantém volumes)
docker compose stop

# Parar e remover containers (mantém volumes)
docker compose down

# Remover TUDO incluindo volumes (CUIDADO!)
docker compose down -v
```

### Acessar Container

```bash
# Shell no Evolution API
docker exec -it evolution_api sh

# Shell no Postgres
docker exec -it evolution_postgres psql -U evolution -d evolution

# Shell no Redis
docker exec -it evolution_redis redis-cli
```

---

## 🔍 Troubleshooting - "Database provider invalid"

### Causa #1: DATABASE_PROVIDER com valor inválido

**Sintoma**: Erro logo no boot, container reinicia em loop

**Verificar**:
```bash
docker compose logs evolution | grep -i "database provider"
```

**Solução**:
```bash
# No .env, deve ser EXATAMENTE:
DATABASE_PROVIDER=postgresql

# NÃO use:
# DATABASE_PROVIDER=postgres     ❌
# DATABASE_PROVIDER=PostgreSQL   ❌
# DATABASE_PROVIDER=pgsql        ❌
```

### Causa #2: DATABASE_ENABLED ausente ou inválido

**Sintoma**: Evolution API ignora banco e tenta usar memória

**Verificar**:
```bash
grep DATABASE_ENABLED .env
```

**Solução**:
```bash
# Deve ser string "true" (não boolean)
DATABASE_ENABLED=true

# NÃO use:
# DATABASE_ENABLED=True    ❌
# DATABASE_ENABLED=1       ❌
# DATABASE_ENABLED=yes     ❌
```

### Causa #3: Arquivo .env não está sendo lido

**Sintoma**: Variáveis não aparecem dentro do container

**Verificar**:
```bash
# Ver variáveis dentro do container
docker exec evolution_api env | grep DATABASE

# Deve mostrar:
# DATABASE_ENABLED=true
# DATABASE_PROVIDER=postgresql
# DATABASE_CONNECTION_URI=postgresql://...
```

**Solução**:
```bash
# 1. Confirmar que .env está no diretório correto
ls -la .env

# 2. Confirmar que docker-compose.yml tem:
#    env_file:
#      - .env

# 3. Recriar container
docker compose down
docker compose up -d
```

### Causa #4: CONNECTION_URI malformada

**Sintoma**: Erro de conexão com Postgres

**Verificar**:
```bash
grep DATABASE_CONNECTION_URI .env
```

**Solução**:
```bash
# Formato correto (INCLUIR ?schema=public):
DATABASE_CONNECTION_URI=postgresql://USER:PASS@HOST:PORT/DB?schema=public

# Exemplo:
DATABASE_CONNECTION_URI=postgresql://evolution:evolution@postgres:5432/evolution?schema=public

# NÃO esquecer:
# - ?schema=public no final
# - Credenciais corretas
# - Host correto (postgres, não localhost)
```

### Causa #5: Postgres não está pronto

**Sintoma**: Evolution API inicia antes do Postgres estar pronto

**Verificar**:
```bash
docker compose ps
# Postgres deve estar "healthy"
```

**Solução**:
```bash
# O docker-compose.yml JÁ tem depends_on com healthcheck
# Se ainda assim falhar, aguarde mais tempo:

# Parar tudo
docker compose down

# Subir Postgres primeiro
docker compose up -d postgres

# Aguardar ficar healthy (15-30 segundos)
docker compose ps

# Subir Evolution API
docker compose up -d evolution
```

---

## ✅ Validação de Sucesso

### 1. Verificar que Evolution API iniciou

```bash
docker compose logs evolution | tail -20

# Deve mostrar:
# ✓ Application is running on: http://[::]:8080
# ✓ Prisma Client initialized
```

### 2. Verificar conexão com Postgres

```bash
# Entrar no container do Postgres
docker exec -it evolution_postgres psql -U evolution -d evolution

# Dentro do psql, listar tabelas:
\dt

# Deve mostrar tabelas do Prisma:
# _prisma_migrations
# Instance
# Message
# Contact
# etc.

# Sair:
\q
```

### 3. Verificar conexão com Redis

```bash
# Testar Redis
docker exec -it evolution_redis redis-cli ping

# Deve retornar:
# PONG
```

### 4. Testar API

```bash
# Health check
curl http://localhost:8080

# Deve retornar HTML ou JSON (não erro 500)

# Listar instâncias (com API key)
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: B6D711FCDE4D4FD5936544120E713976"

# Deve retornar: []
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Terminal 1: Logs do Evolution
docker compose logs -f evolution

# Terminal 2: Logs do Postgres
docker compose logs -f postgres

# Terminal 3: Status dos containers
watch -n 2 'docker compose ps'
```

### Verificar Uso de Recursos

```bash
# CPU e Memória
docker stats

# Espaço em disco dos volumes
docker system df -v
```

---

## 🔐 Segurança (Produção)

### 1. Mudar Senhas

```bash
# No .env, SEMPRE mude em produção:

# Senha do Postgres
POSTGRES_PASSWORD=SuaSenhaForteAqui123!@#

# API Key do Evolution
AUTHENTICATION_API_KEY=SuaChaveSecretaAqui456$%^

# Atualizar CONNECTION_URI com nova senha:
DATABASE_CONNECTION_URI=postgresql://evolution:SuaSenhaForteAqui123!@#@postgres:5432/evolution?schema=public
```

### 2. Não Expor Portas Desnecessárias

```bash
# No docker-compose.yml, remover exposição de portas:

# ❌ Expõe para internet:
ports:
  - "5432:5432"  # Postgres
  - "6379:6379"  # Redis

# ✅ Apenas rede interna:
# (comentar ou remover seção ports)
```

### 3. Usar HTTPS

```bash
# Adicionar reverse proxy (Nginx/Traefik)
# Configurar SSL/TLS
# Atualizar SERVER_URL:
SERVER_URL=https://api.seudominio.com
```

---

## 🔄 Backup e Restore

### Backup do Postgres

```bash
# Backup completo
docker exec evolution_postgres pg_dump -U evolution evolution > backup_$(date +%Y%m%d).sql

# Backup com compressão
docker exec evolution_postgres pg_dump -U evolution evolution | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore do Postgres

```bash
# Parar Evolution API
docker compose stop evolution

# Restore
cat backup_20260127.sql | docker exec -i evolution_postgres psql -U evolution -d evolution

# Reiniciar Evolution API
docker compose start evolution
```

### Backup dos Volumes

```bash
# Backup de instâncias e store
docker run --rm \
  -v evolution-api-setup_evolution_instances:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/instances_backup.tar.gz /data

docker run --rm \
  -v evolution-api-setup_evolution_store:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/store_backup.tar.gz /data
```

---

## 🐛 Debug Avançado

### Ver Variáveis de Ambiente Carregadas

```bash
docker exec evolution_api env | sort | grep -E '(DATABASE|REDIS|SERVER|AUTH)'
```

### Verificar Conexão do Prisma

```bash
# Logs detalhados do Prisma
docker compose logs evolution | grep -i prisma

# Deve mostrar:
# Prisma schema loaded
# Datasource "db": PostgreSQL database
# Database connection successful
```

### Testar Conexão Manual com Postgres

```bash
# De dentro do container Evolution
docker exec -it evolution_api sh

# Instalar psql (se não tiver)
apk add postgresql-client

# Testar conexão
psql postgresql://evolution:evolution@postgres:5432/evolution?schema=public

# Deve conectar sem erros
```

### Logs de Erro Específicos

```bash
# Erros de database
docker compose logs evolution | grep -i "database\|prisma\|postgres"

# Erros de conexão
docker compose logs evolution | grep -i "connection\|connect\|econnrefused"

# Erros de provider
docker compose logs evolution | grep -i "provider\|invalid"
```

---

## 📚 Referências

- **Evolution API**: https://github.com/EvolutionAPI/evolution-api
- **Documentação Oficial**: https://doc.evolution-api.com/
- **Docker Hub**: https://hub.docker.com/r/atendai/evolution-api
- **Prisma**: https://www.prisma.io/docs

---

## ❓ FAQ

### P: Posso usar MySQL em vez de PostgreSQL?

**R**: Sim, mas PostgreSQL é mais estável. Para MySQL:
```bash
DATABASE_PROVIDER=mysql
DATABASE_CONNECTION_URI=mysql://user:pass@mysql:3306/evolution
```

### P: Como adicionar mais instâncias WhatsApp?

**R**: Via API:
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "minha_instancia",
    "qrcode": true
  }'
```

### P: Os dados persistem após reiniciar?

**R**: Sim, se você usar `docker compose down` (sem `-v`). Os volumes são mantidos.

### P: Como atualizar para nova versão?

**R**:
```bash
# 1. Backup primeiro!
docker exec evolution_postgres pg_dump -U evolution evolution > backup.sql

# 2. Mudar versão no docker-compose.yml:
# image: atendai/evolution-api:v2.3.7

# 3. Recriar container
docker compose pull evolution
docker compose up -d evolution
```

---

## 🆘 Suporte

Se ainda tiver problemas:

1. **Verifique os logs**: `docker compose logs -f evolution`
2. **Valide o .env**: `cat .env | grep DATABASE`
3. **Teste Postgres**: `docker exec -it evolution_postgres psql -U evolution -d evolution`
4. **Abra issue**: https://github.com/EvolutionAPI/evolution-api/issues

---

**Versão**: 1.0.0  
**Data**: 27/01/2026  
**Autor**: Setup DevOps para Evolution API v2
