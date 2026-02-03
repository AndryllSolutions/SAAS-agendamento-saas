# 📋 DOCUMENTAÇÃO COMPLETA - VARIÁVEIS DE AMBIENTE (.env)

**Sistema:** SAAS Agendamento  
**Ambiente:** Produção VPS (72.62.138.239)  
**Data:** 12 de Janeiro de 2026  
**Status:** ✅ Configurado e Funcionando

---

## 🔐 VALORES ATUAIS EM PRODUÇÃO

### ⚠️ IMPORTANTE - MANTENHA ESTE ARQUIVO SEGURO
Este arquivo contém informações sensíveis. **NÃO COMMITAR NO GIT!**

---

## 📦 1. BANCO DE DADOS POSTGRESQL

### Variáveis:
```bash
POSTGRES_USER=agendamento_app
POSTGRES_PASSWORD=Ag3nd2026P0stgr3sS3cur3K3y
POSTGRES_DB=agendamento
DATABASE_URL=postgresql+psycopg2://agendamento_app:Ag3nd2026P0stgr3sS3cur3K3y@db:5432/agendamento
```

### Descrição:
- **POSTGRES_USER**: Nome do usuário do banco de dados
- **POSTGRES_PASSWORD**: Senha forte do PostgreSQL (gerada em 10/01/2026)
- **POSTGRES_DB**: Nome do banco de dados
- **DATABASE_URL**: URL completa de conexão (usado pelo backend)

### Formato DATABASE_URL:
```
postgresql+psycopg2://[usuario]:[senha]@[host]:[porta]/[database]
```

### Como Gerar Nova Senha:
```bash
openssl rand -base64 24
```

---

## 🔑 2. SEGURANÇA E AUTENTICAÇÃO

### Variáveis:
```bash
SECRET_KEY=m+8hSqFYaV02BcF4khodxmUEIIWSvHctKAKt6J1Anws=
SETTINGS_ENCRYPTION_KEY=3DUFabminEVt94POyEoDGJKR05C1C3SIWwffKIOJdXo=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Descrição:
- **SECRET_KEY**: Chave secreta para assinatura de tokens JWT (32 bytes base64)
- **SETTINGS_ENCRYPTION_KEY**: Chave para criptografia de dados sensíveis (32 bytes base64)
- **ALGORITHM**: Algoritmo de assinatura JWT (HS256 = HMAC-SHA256)
- **ACCESS_TOKEN_EXPIRE_MINUTES**: Tempo de expiração do token de acesso (30 minutos)
- **REFRESH_TOKEN_EXPIRE_DAYS**: Tempo de expiração do refresh token (7 dias)

### Como Gerar Novas Chaves:
```bash
# No Linux/VPS:
openssl rand -base64 32

# No Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### ⚠️ ATENÇÃO:
- Trocar estas chaves invalida todos os tokens JWT existentes
- Usuários precisarão fazer login novamente
- **NUNCA** use chaves de exemplo em produção

---

## 🌐 3. URLs E CORS

### Variáveis:
```bash
PUBLIC_URL=http://72.62.138.239
API_URL=http://72.62.138.239
FRONTEND_URL=http://72.62.138.239
CORS_ORIGIN=http://72.62.138.239,http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://72.62.138.239
```

### Descrição:
- **PUBLIC_URL**: URL pública do sistema
- **API_URL**: URL da API backend
- **FRONTEND_URL**: URL do frontend
- **CORS_ORIGIN**: Origens permitidas para requisições CORS (separadas por vírgula)
- **NEXT_PUBLIC_API_URL**: URL da API usada pelo Next.js (visível no cliente)

### Para Produção com Domínio:
```bash
PUBLIC_URL=https://seudominio.com
API_URL=https://seudominio.com
FRONTEND_URL=https://seudominio.com
CORS_ORIGIN=https://seudominio.com,https://www.seudominio.com
NEXT_PUBLIC_API_URL=https://seudominio.com
```

### CORS_ALLOW_ALL:
```bash
CORS_ALLOW_ALL=false
```
- **false**: Apenas origens listadas em CORS_ORIGIN são permitidas (RECOMENDADO)
- **true**: Permite qualquer origem (APENAS PARA DESENVOLVIMENTO)

---

## 🗄️ 4. REDIS (CACHE)

### Variáveis:
```bash
REDIS_PASSWORD=R3d1s2026S3cur3K3yAg3nd
REDIS_URL=redis://:R3d1s2026S3cur3K3yAg3nd@redis:6379/0
```

### Descrição:
- **REDIS_PASSWORD**: Senha do Redis
- **REDIS_URL**: URL completa de conexão ao Redis

### Formato REDIS_URL:
```
redis://:[senha]@[host]:[porta]/[database]
```

### Como Gerar Nova Senha:
```bash
openssl rand -base64 16
```

---

## 🐰 5. RABBITMQ (FILAS DE MENSAGENS)

### Variáveis:
```bash
RABBITMQ_PASSWORD=Rabb1tMQ2026S3cur3K3yAg3nd
RABBITMQ_URL=amqp://admin:Rabb1tMQ2026S3cur3K3yAg3nd@rabbitmq:5672/
```

### Descrição:
- **RABBITMQ_PASSWORD**: Senha do RabbitMQ (usuário padrão: admin)
- **RABBITMQ_URL**: URL completa de conexão ao RabbitMQ

### Formato RABBITMQ_URL:
```
amqp://[usuario]:[senha]@[host]:[porta]/[vhost]
```

---

## 🔄 6. CELERY (TAREFAS ASSÍNCRONAS)

### Variáveis:
```bash
CELERY_BROKER_URL=amqp://admin:Rabb1tMQ2026S3cur3K3yAg3nd@rabbitmq:5672/
CELERY_RESULT_BACKEND=redis://:R3d1s2026S3cur3K3yAg3nd@redis:6379/0
CELERY_WORKER_CONCURRENCY=4
```

### Descrição:
- **CELERY_BROKER_URL**: URL do broker de mensagens (RabbitMQ)
- **CELERY_RESULT_BACKEND**: URL do backend de resultados (Redis)
- **CELERY_WORKER_CONCURRENCY**: Número de workers paralelos (ajustar conforme CPU)

### Recomendações de Concurrency:
- **2 CPUs**: 2-4 workers
- **4 CPUs**: 4-8 workers
- **8 CPUs**: 8-16 workers

---

## ⚙️ 7. CONFIGURAÇÕES DE AMBIENTE

### Variáveis:
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

### Descrição:
- **ENVIRONMENT**: Ambiente de execução (development, staging, production)
- **DEBUG**: Modo debug (true/false) - **SEMPRE false em produção**
- **LOG_LEVEL**: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)

### Níveis de Log:
- **DEBUG**: Informações detalhadas para debugging
- **INFO**: Informações gerais de operação (RECOMENDADO para produção)
- **WARNING**: Avisos que não impedem funcionamento
- **ERROR**: Erros que afetam funcionalidade
- **CRITICAL**: Erros críticos que podem parar o sistema

---

## 🚀 8. CONFIGURAÇÕES DE PERFORMANCE

### Variáveis:
```bash
UVICORN_TIMEOUT_KEEP_ALIVE=75
```

### Descrição:
- **UVICORN_TIMEOUT_KEEP_ALIVE**: Timeout de keep-alive do Uvicorn (segundos)

### Recomendações:
- **Desenvolvimento**: 60 segundos
- **Produção**: 75-120 segundos
- **Alta carga**: 30-60 segundos

---

## 📁 9. PATHS CUSTOMIZADOS (VPS)

### Variáveis:
```bash
POSTGRES_DATA_PATH=/opt/saas/atendo/data/postgres
REDIS_DATA_PATH=/opt/saas/atendo/data/redis
RABBITMQ_DATA_PATH=/opt/saas/atendo/data/rabbitmq
UPLOADS_PATH=/opt/saas/atendo/data/uploads
LOGS_PATH=/opt/saas/atendo/logs
```

### Descrição:
- **POSTGRES_DATA_PATH**: Diretório de dados do PostgreSQL
- **REDIS_DATA_PATH**: Diretório de dados do Redis
- **RABBITMQ_DATA_PATH**: Diretório de dados do RabbitMQ
- **UPLOADS_PATH**: Diretório de uploads de arquivos
- **LOGS_PATH**: Diretório de logs da aplicação

### ⚠️ IMPORTANTE:
- Garantir que os diretórios existem antes de iniciar
- Configurar permissões adequadas (chown, chmod)
- Fazer backup regular destes diretórios

---

## 🔌 10. PORT BINDINGS (PRODUÇÃO)

### Variáveis:
```bash
POSTGRES_PORT_BINDING=127.0.0.1:5433:5432
REDIS_PORT_BINDING=127.0.0.1:6379:6379
RABBITMQ_PORT_BINDING=127.0.0.1:5672:5672
RABBITMQ_MANAGEMENT_PORT_BINDING=127.0.0.1:15672:15672
BACKEND_PORT_BINDING=127.0.0.1:8001:8000
FRONTEND_PORT_BINDING=127.0.0.1:3001:3000
```

### Descrição:
Formato: `[host]:[porta_externa]:[porta_interna]`

- **127.0.0.1**: Bind apenas em localhost (mais seguro)
- **0.0.0.0**: Bind em todas as interfaces (menos seguro)

### Portas Externas (VPS):
- **5433**: PostgreSQL (acesso local apenas)
- **6379**: Redis (acesso local apenas)
- **5672**: RabbitMQ (acesso local apenas)
- **15672**: RabbitMQ Management (acesso local apenas)
- **8001**: Backend API (acesso local apenas)
- **3001**: Frontend (acesso local apenas)

### Portas Públicas (Nginx):
- **80**: HTTP (redireciona para HTTPS)
- **443**: HTTPS (acesso público)

---

## 📧 11. CONFIGURAÇÕES DE EMAIL (OPCIONAL)

### Variáveis:
```bash
# SMTP_HOST=smtp.seu-provedor.com
# SMTP_PORT=587
# SMTP_USER=seu-email@dominio.com
# SMTP_PASSWORD=SENHA_EMAIL_AQUI
# SMTP_TLS=true
```

### Descrição:
- **SMTP_HOST**: Servidor SMTP (ex: smtp.gmail.com, smtp.sendgrid.net)
- **SMTP_PORT**: Porta SMTP (587 para TLS, 465 para SSL, 25 para não criptografado)
- **SMTP_USER**: Usuário/email de autenticação
- **SMTP_PASSWORD**: Senha do email
- **SMTP_TLS**: Usar TLS (true/false)

### Provedores Comuns:
- **Gmail**: smtp.gmail.com:587 (requer App Password)
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **AWS SES**: email-smtp.[region].amazonaws.com:587

---

## 📊 12. MONITORAMENTO (OPCIONAL)

### Variáveis:
```bash
# SENTRY_DSN=SEU_SENTRY_DSN_AQUI
# PROMETHEUS_ENABLED=true
```

### Descrição:
- **SENTRY_DSN**: URL do Sentry para tracking de erros
- **PROMETHEUS_ENABLED**: Habilitar métricas Prometheus (true/false)

### Como Obter Sentry DSN:
1. Criar conta em sentry.io
2. Criar novo projeto
3. Copiar DSN do projeto
4. Adicionar ao .env

---

## 🔧 COMO USAR ESTE ARQUIVO

### 1. Desenvolvimento Local:
```bash
# Copiar para .env.local
cp .env.production .env.local

# Ajustar URLs para localhost
NEXT_PUBLIC_API_URL=http://localhost:8000
PUBLIC_URL=http://localhost:3000
# etc...
```

### 2. Staging/VPS:
```bash
# Copiar para .env.production
cp .env.example .env.production

# Editar com valores reais
nano .env.production

# Copiar para .env (docker-compose usa por padrão)
cp .env.production .env
```

### 3. Produção com Domínio:
```bash
# Atualizar URLs
PUBLIC_URL=https://seudominio.com
API_URL=https://seudominio.com
FRONTEND_URL=https://seudominio.com
CORS_ORIGIN=https://seudominio.com,https://www.seudominio.com
NEXT_PUBLIC_API_URL=https://seudominio.com
```

---

## 🔐 SEGURANÇA - CHECKLIST

### ✅ Antes de Produção:
- [ ] Gerar SECRET_KEY única (openssl rand -base64 32)
- [ ] Gerar SETTINGS_ENCRYPTION_KEY única (openssl rand -base64 32)
- [ ] Usar senhas fortes para PostgreSQL, Redis, RabbitMQ
- [ ] Configurar DEBUG=false
- [ ] Configurar CORS_ALLOW_ALL=false
- [ ] Listar apenas origens confiáveis em CORS_ORIGIN
- [ ] Usar HTTPS em produção (não HTTP)
- [ ] Não commitar .env no Git (.gitignore)
- [ ] Fazer backup do .env em local seguro
- [ ] Restringir port bindings a 127.0.0.1

### ⚠️ NUNCA:
- ❌ Usar chaves de exemplo em produção
- ❌ Commitar .env no Git
- ❌ Compartilhar .env publicamente
- ❌ Usar DEBUG=true em produção
- ❌ Usar CORS_ALLOW_ALL=true em produção
- ❌ Expor portas de serviços internos (PostgreSQL, Redis, etc)

---

## 🔄 ROTAÇÃO DE SENHAS

### Quando Trocar:
- A cada 90 dias (recomendado)
- Após suspeita de comprometimento
- Após saída de membro da equipe com acesso
- Após incidente de segurança

### Como Trocar:

#### 1. PostgreSQL:
```bash
# Gerar nova senha
NEW_PASSWORD=$(openssl rand -base64 24)

# Atualizar no banco
docker compose exec db psql -U agendamento_app -d agendamento
ALTER USER agendamento_app WITH PASSWORD 'NOVA_SENHA';

# Atualizar .env
DATABASE_URL=postgresql+psycopg2://agendamento_app:NOVA_SENHA@db:5432/agendamento

# Reiniciar backend
docker compose restart backend
```

#### 2. SECRET_KEY e SETTINGS_ENCRYPTION_KEY:
```bash
# Gerar novas chaves
openssl rand -base64 32  # SECRET_KEY
openssl rand -base64 32  # SETTINGS_ENCRYPTION_KEY

# Atualizar .env
# Reiniciar backend
docker compose restart backend

# ⚠️ Todos os usuários precisarão fazer login novamente
```

#### 3. Redis:
```bash
# Gerar nova senha
openssl rand -base64 16

# Atualizar .env
REDIS_PASSWORD=NOVA_SENHA
REDIS_URL=redis://:NOVA_SENHA@redis:6379/0

# Reiniciar Redis e serviços dependentes
docker compose restart redis backend celery_worker celery_beat
```

---

## 📝 TEMPLATE COMPLETO

```bash
# ===========================================
# VARIÁVEIS DE AMBIENTE - PRODUÇÃO
# ===========================================

# ===========================================
# BANCO DE DADOS
# ===========================================
POSTGRES_USER=agendamento_app
POSTGRES_PASSWORD=Ag3nd2026P0stgr3sS3cur3K3y
POSTGRES_DB=agendamento
DATABASE_URL=postgresql+psycopg2://agendamento_app:Ag3nd2026P0stgr3sS3cur3K3y@db:5432/agendamento

# ===========================================
# SEGURANÇA
# ===========================================
SECRET_KEY=m+8hSqFYaV02BcF4khodxmUEIIWSvHctKAKt6J1Anws=
SETTINGS_ENCRYPTION_KEY=3DUFabminEVt94POyEoDGJKR05C1C3SIWwffKIOJdXo=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ===========================================
# URLs
# ===========================================
PUBLIC_URL=http://72.62.138.239
API_URL=http://72.62.138.239
FRONTEND_URL=http://72.62.138.239
CORS_ORIGIN=http://72.62.138.239,http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://72.62.138.239

# ===========================================
# CACHE E FILAS
# ===========================================
REDIS_PASSWORD=R3d1s2026S3cur3K3yAg3nd
REDIS_URL=redis://:R3d1s2026S3cur3K3yAg3nd@redis:6379/0
RABBITMQ_PASSWORD=Rabb1tMQ2026S3cur3K3yAg3nd
RABBITMQ_URL=amqp://admin:Rabb1tMQ2026S3cur3K3yAg3nd@rabbitmq:5672/
CELERY_BROKER_URL=amqp://admin:Rabb1tMQ2026S3cur3K3yAg3nd@rabbitmq:5672/
CELERY_RESULT_BACKEND=redis://:R3d1s2026S3cur3K3yAg3nd@redis:6379/0

# ===========================================
# CONFIGURAÇÕES
# ===========================================
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
CORS_ALLOW_ALL=false

# ===========================================
# PERFORMANCE
# ===========================================
CELERY_WORKER_CONCURRENCY=4
UVICORN_TIMEOUT_KEEP_ALIVE=75

# ===========================================
# PATHS (VPS)
# ===========================================
POSTGRES_DATA_PATH=/opt/saas/atendo/data/postgres
REDIS_DATA_PATH=/opt/saas/atendo/data/redis
RABBITMQ_DATA_PATH=/opt/saas/atendo/data/rabbitmq
UPLOADS_PATH=/opt/saas/atendo/data/uploads
LOGS_PATH=/opt/saas/atendo/logs

# ===========================================
# PORT BINDINGS
# ===========================================
POSTGRES_PORT_BINDING=127.0.0.1:5433:5432
REDIS_PORT_BINDING=127.0.0.1:6379:6379
RABBITMQ_PORT_BINDING=127.0.0.1:5672:5672
RABBITMQ_MANAGEMENT_PORT_BINDING=127.0.0.1:15672:15672
BACKEND_PORT_BINDING=127.0.0.1:8001:8000
FRONTEND_PORT_BINDING=127.0.0.1:3001:3000

# ===========================================
# EMAIL (OPCIONAL)
# ===========================================
# SMTP_HOST=smtp.seu-provedor.com
# SMTP_PORT=587
# SMTP_USER=seu-email@dominio.com
# SMTP_PASSWORD=SENHA_EMAIL_AQUI
# SMTP_TLS=true

# ===========================================
# MONITORAMENTO (OPCIONAL)
# ===========================================
# SENTRY_DSN=SEU_SENTRY_DSN_AQUI
# PROMETHEUS_ENABLED=true
```

---

## 📞 SUPORTE

### Em Caso de Problemas:

1. **Backend não conecta ao banco:**
   - Verificar DATABASE_URL
   - Verificar senha do PostgreSQL no banco
   - Verificar se container do banco está rodando

2. **Erro de autenticação JWT:**
   - Verificar SECRET_KEY
   - Verificar se token não expirou
   - Limpar cache do navegador

3. **CORS Error:**
   - Verificar CORS_ORIGIN
   - Verificar se URL está correta
   - Verificar CORS_ALLOW_ALL

4. **Redis/Celery não conecta:**
   - Verificar REDIS_PASSWORD
   - Verificar RABBITMQ_PASSWORD
   - Verificar se containers estão rodando

---

**Última Atualização:** 12/01/2026 14:25 BRT  
**Versão:** 1.0  
**Status:** ✅ Produção VPS Operacional
