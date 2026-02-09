# 🚨 BANCOS DE DADOS - REGRAS CRÍTICAS DE PROTEÇÃO

## 📋 **BANCOS EXISTENTES**

### 🏢 **Banco Principal do SAAS (NUNCA APAGAR)**
- **Nome:** `agendamento`
- **Container:** `agendamento_db_prod`
- **Volume:** `/opt/agendamento-saas/data/postgres`
- **Conteúdo:** Sistema completo de agendamento (84 tabelas)
- **Status:** PROTEGIDO - DADOS DOS CLIENTES

### 🎯 **Banco da Landing Page**
- **Nome:** `landing_page_db`
- **Container:** `agendamento_db_prod`
- **Conteúdo:** Landing page Vite (12 tabelas)
- **Status:** Protegido - Leads e assinaturas

## ⚠️ **REGRAS DE OURO - NUNCA VIOLAR**

### 🚫 **OPERACIONS PROHIBIDAS**
```bash
# NUNCA EXECUTAR ESTES COMANDOS:
docker volume rm postgres_data                    # ❌ APAGARIA BANCO PRINCIPAL
docker system prune -a                           # ❌ APAGARIA VOLUMES
docker-compose down -v                           # ❌ APAGARIA DADOS
docker exec agendamento_db_prod dropdb agendamento # ❌ SUICÍDIO PROFISSIONAL
```

### ✅ **OPERACIONS SEGURAS**
```bash
# ESTES SÃO SEGUROS:
docker-compose up/down                           # ✅ Preserva volumes
docker restart agendamento_db_prod               # ✅ Apenas restart
docker-compose build --no-cache                  # ✅ Apenas rebuild
```

## 🔍 **VERIFICAÇÃO ANTES DE QUALQUER OPERAÇÃO**

### 1. Verificar bancos existentes:
```bash
docker exec agendamento_db_prod psql -U agendamento_app -d postgres -c '\l'
```

### 2. Verificar volumes protegidos:
```bash
docker volume ls | grep postgres
```

### 3. Backup antes de manutenção:
```bash
# Backup banco principal
docker exec agendamento_db_prod pg_dump -U agendamento_app agendamento > /tmp/backup_saas_$(date +%Y%m%d).sql

# Backup landing page
docker exec agendamento_db_prod pg_dump -U agendamento_app landing_page_db > /tmp/backup_landing_$(date +%Y%m%d).sql
```

## 🎯 **CONFIGURAÇÃO DE CONEXÃO**

### Landing Page Environment:
```bash
DATABASE_URL=postgresql://agendamento_app:SUA_SENHA@localhost:5432/landing_page_db
```

### SAAS Environment:
```bash
DATABASE_URL=postgresql://agendamento_app:SUA_SENHA@localhost:5432/agendamento
```

## 📝 **MIGRAÇÕES E DEPLOY**

### Landing Page (Vite):
```bash
# Migrar schema da landing
cd /opt/saas/atendo-landing-new
npm run db:push  # Usa landing_page_db
```

### SAAS (Next.js):
```bash
# Migrar schema do SAAS
cd /opt/agendamento-saas/app/backend
alembic upgrade heads  # Usa agendamento
```

## 🚨 **EM CASO DE EMERGÊNCIA**

### Restaurar banco principal:
```bash
docker exec -i agendamento_db_prod psql -U agendamento_app agendamento < backup_saas_YYYYMMDD.sql
```

### Restaurar landing page:
```bash
docker exec -i agendamento_db_prod psql -U agendamento_app landing_page_db < backup_landing_YYYYMMDD.sql
```

## 📞 **CONTATO EM CASO DE DÚVIDA**

Se não tiver 100% de certeza, **NÃO EXECUTE** o comando. 
O banco de dados do SAAS contém dados reais dos clientes.

---

**LEMBRETE:** Perder dados do cliente é pior que downtime.
