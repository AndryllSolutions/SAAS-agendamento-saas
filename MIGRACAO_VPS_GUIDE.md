# Migração SAAS para VPS - Guia Completo

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Requisitos de VPS](#requisitos-de-vps)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Configurações de Ambiente](#configurações-de-ambiente)
5. [Scripts de Deploy](#scripts-de-deploy)
6. [Processo de Migração](#processo-de-migração)
7. [Backup e Restore](#backup-e-restore)
8. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## 🏗️ Visão Geral da Arquitetura

### Stack Tecnológico
- **Backend**: Python 3.12.8 + FastAPI + SQLAlchemy + Alembic
- **Frontend**: Next.js 20 + TypeScript + TailwindCSS
- **Banco de Dados**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Queue**: RabbitMQ 3
- **Task Queue**: Celery
- **Proxy**: Nginx
- **Containerização**: Docker + Docker Compose

### Serviços Docker
```
├── db (PostgreSQL 15)
├── redis (Redis 7)
├── rabbitmq (RabbitMQ 3)
├── backend (FastAPI + Celery)
├── celery_worker (Celery Worker)
├── celery_beat (Celery Scheduler)
├── frontend (Next.js)
└── nginx (Reverse Proxy)
```

### Portas Utilizadas
- **80**: HTTP (Nginx)
- **443**: HTTPS (Nginx)
- **3001**: Frontend (desenvolvimento)
- **8001**: Backend API (desenvolvimento)
- **5433**: PostgreSQL (localhost apenas)
- **6379**: Redis (localhost apenas)
- **5672**: RabbitMQ (localhost apenas)
- **15672**: RabbitMQ Management (localhost apenas)

---

## 💻 Requisitos de VPS

### Configuração Mínima Recomendada
- **CPU**: 2 vCPUs
- **RAM**: 4 GB RAM
- **Storage**: 50 GB SSD
- **Banda**: 1 TB/mês
- **SO**: Ubuntu 22.04 LTS ou Debian 12

### Configuração Produção (Recomendado)
- **CPU**: 4 vCPUs
- **RAM**: 8 GB RAM
- **Storage**: 100 GB SSD
- **Banda**: 2 TB/mês
- **SO**: Ubuntu 22.04 LTS

### Software Necessário
```bash
# Docker & Docker Compose
- Docker CE 24.0+
- Docker Compose 2.0+

# Utilitários
- Git
- Nginx (para SSL termination)
- Certbot (para certificados SSL)
- UFW (firewall)
- htop, curl, wget
```

---

## 📁 Estrutura de Diretórios na VPS

```
/opt/agendamento-saas/
├── app/                          # Código da aplicação
│   ├── backend/
│   ├── frontend/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   ├── .env.production
│   └── scripts/
│       ├── deploy.sh
│       ├── backup.sh
│       ├── restore.sh
│       ├── update.sh
│       └── health-check.sh
├── data/                         # Dados persistentes
│   ├── postgres/
│   ├── redis/
│   ├── rabbitmq/
│   └── uploads/
├── logs/                         # Logs da aplicação
│   ├── nginx/
│   ├── backend/
│   ├── celery/
│   └── system/
├── backups/                      # Backups automatizados
│   ├── database/
│   ├── files/
│   └── config/
├── ssl/                          # Certificados SSL
│   ├── certbot/
│   └── certificates/
└── monitoring/                   # Monitoramento
    ├── prometheus/
    ├── grafana/
    └── alerts/
```

---

## ⚙️ Configurações de Ambiente

### Variáveis de Ambiente Produção

#### .env.production
```bash
# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
POSTGRES_USER=agendamento_prod
POSTGRES_PASSWORD=SENHA_FORTE_AQUI_MUDAR
POSTGRES_DB=agendamento_prod
DATABASE_URL=postgresql+psycopg2://agendamento_prod:SENHA_FORTE_AQUI_MUDAR@db:5432/agendamento_prod

# ===========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ===========================================
SECRET_KEY=CHAVE_SECRETA_MUITO_FORTE_GERAR_NOVA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
SETTINGS_ENCRYPTION_KEY=CHAVE_ENCRYPT_32_CHARS_EXATA

# ===========================================
# CONFIGURAÇÕES DE URL (PRODUÇÃO)
# ===========================================
PUBLIC_URL=https://seu-dominio.com
API_URL=https://api.seu-dominio.com
FRONTEND_URL=https://seu-dominio.com
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com

# ===========================================
# CONFIGURAÇÕES DE CACHE E FILAS
# ===========================================
REDIS_URL=redis://:REDIS_PASSWORD_FORTE@redis:6379/0
REDIS_PASSWORD=REDIS_PASSWORD_FORTE
RABBITMQ_URL=amqp://admin:RABBITMQ_PASSWORD_FORTE@rabbitmq:5672/
CELERY_BROKER_URL=amqp://admin:RABBITMQ_PASSWORD_FORTE@rabbitmq:5672/
CELERY_RESULT_BACKEND=redis://:REDIS_PASSWORD_FORTE@redis:6379/0

# ===========================================
# CONFIGURAÇÕES DE PRODUÇÃO
# ===========================================
CORS_ALLOW_ALL=false
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# ===========================================
# CONFIGURAÇÕES DE EMAIL (Opcional)
# ===========================================
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASSWORD=SENHA_EMAIL
SMTP_TLS=true

# ===========================================
# CONFIGURAÇÕES DE MONITORAMENTO
# ===========================================
SENTRY_DSN=SEU_SENTRY_DSN_AQUI
PROMETHEUS_ENABLED=true
```

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: agendamento_db_prod
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - /opt/agendamento-saas/data/postgres:/var/lib/postgresql/data
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: agendamento_redis_prod
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 1gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
      --appendonly yes
      --appendfsync everysec
    volumes:
      - /opt/agendamento-saas/data/redis:/data
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ Message Broker
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: agendamento_rabbitmq_prod
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
      RABBITMQ_DEFAULT_VHOST: /
    volumes:
      - /opt/agendamento-saas/data/rabbitmq:/var/lib/rabbitmq
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agendamento_backend_prod
    command: sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info --timeout-keep-alive 75"
    volumes:
      - ./backend:/app
      - /opt/agendamento-saas/logs/backend:/app/logs
      - /opt/agendamento-saas/data/uploads:/app/uploads
    env_file:
      - .env.production
    environment:
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Celery Worker
  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agendamento_celery_worker_prod
    command: sh -c "sleep 10 && celery -A app.tasks.celery_app worker --loglevel=info --concurrency=4"
    volumes:
      - ./backend:/app
      - /opt/agendamento-saas/logs/celery:/app/logs
      - /opt/agendamento-saas/data/uploads:/app/uploads
    env_file:
      - .env.production
    environment:
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
    depends_on:
      backend:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "celery -A app.tasks.celery_app inspect ping -d celery@$$HOSTNAME"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Celery Beat (Scheduler)
  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agendamento_celery_beat_prod
    command: sh -c "sleep 10 && celery -A app.tasks.celery_app beat --loglevel=info"
    volumes:
      - ./backend:/app
      - /opt/agendamento-saas/logs/celery:/app/logs
    env_file:
      - .env.production
    environment:
      - PYTHONUNBUFFERED=1
      - PYTHONDONTWRITEBYTECODE=1
    depends_on:
      backend:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - agendamento_network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: agendamento_frontend_prod
    volumes:
      - /opt/agendamento-saas/logs/frontend:/app/logs
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    networks:
      - agendamento_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: agendamento_nginx_prod
    volumes:
      - ./docker/nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - /opt/agendamento-saas/ssl/certificates:/etc/nginx/ssl
      - /opt/agendamento-saas/logs/nginx:/var/log/nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - frontend
    networks:
      - agendamento_network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  rabbitmq_data:
    driver: local

networks:
  agendamento_network:
    driver: bridge
```

---

## 🚀 Scripts de Deploy

### scripts/deploy.sh
```bash
#!/bin/bash

# Script de Deploy Automatizado para VPS
# Uso: ./scripts/deploy.sh [branch]

set -e  # Para em caso de erro

# Configurações
BRANCH=${1:-main}
APP_DIR="/opt/agendamento-saas"
BACKUP_DIR="/opt/agendamento-saas/backups"
LOG_FILE="/opt/agendamento-saas/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script precisa ser executado como root"
    exit 1
fi

# Iniciar deploy
log "Iniciando deploy do branch $BRANCH"

# 1. Backup do estado atual
log "Fazendo backup do estado atual..."
./scripts/backup.sh before-deploy

# 2. Parar serviços
log "Parando serviços..."
cd "$APP_DIR"
docker-compose -f docker-compose.prod.yml down

# 3. Atualizar código
log "Atualizando código..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 4. Build de imagens
log "Construindo imagens Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 5. Iniciar serviços
log "Iniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

# 6. Aguardar serviços
log "Aguardando serviços ficarem saudáveis..."
sleep 30

# 7. Verificar saúde dos serviços
log "Verificando saúde dos serviços..."
./scripts/health-check.sh

# 8. Limpar imagens antigas
log "Limpando imagens Docker antigas..."
docker image prune -f

# 9. Backup pós-deploy
log "Fazendo backup pós-deploy..."
./scripts/backup.sh after-deploy

log "Deploy concluído com sucesso!"
log "Logs salvos em: $LOG_FILE"
```

### scripts/health-check.sh
```bash
#!/bin/bash

# Script de Verificação de Saúde dos Serviços
# Uso: ./scripts/health-check.sh

set -e

APP_DIR="/opt/agendamento-saas"
MAX_RETRIES=10
RETRY_DELAY=10

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

cd "$APP_DIR"

# Verificar se todos os containers estão rodando
log "Verificando status dos containers..."

containers=("agendamento_db_prod" "agendamento_redis_prod" "agendamento_rabbitmq_prod" "agendamento_backend_prod" "agendamento_celery_worker_prod" "agendamento_celery_beat_prod" "agendamento_frontend_prod" "agendamento_nginx_prod")

for container in "${containers[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$container"; then
        log "✅ Container $container está rodando"
    else
        error "❌ Container $container não está rodando"
        exit 1
    fi
done

# Verificar saúde dos serviços
log "Verificando saúde dos serviços..."

# Backend API
for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s http://localhost:8000/health > /dev/null; then
        log "✅ Backend API está saudável"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            error "❌ Backend API não está respondendo após $MAX_RETRIES tentativas"
            exit 1
        fi
        warning "⏳ Backend API não está respondendo (tentativa $i/$MAX_RETRIES)"
        sleep $RETRY_DELAY
    fi
done

# Frontend
for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s http://localhost:3000 > /dev/null; then
        log "✅ Frontend está saudável"
        break
    else
        if [ $i -eq $MAX_RETRIES ]; then
            error "❌ Frontend não está respondendo após $MAX_RETRIES tentativas"
            exit 1
        fi
        warning "⏳ Frontend não está respondendo (tentativa $i/$MAX_RETRIES)"
        sleep $RETRY_DELAY
    fi
done

# Verificar conexão com banco de dados
log "Verificando conexão com banco de dados..."
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U agendamento_prod -d agendamento_prod > /dev/null; then
    log "✅ Banco de dados está conectado"
else
    error "❌ Banco de dados não está conectado"
    exit 1
fi

# Verificar Redis
log "Verificando Redis..."
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping > /dev/null; then
    log "✅ Redis está conectado"
else
    error "❌ Redis não está conectado"
    exit 1
fi

# Verificar RabbitMQ
log "Verificando RabbitMQ..."
if docker-compose -f docker-compose.prod.yml exec -T rabbitmq rabbitmq-diagnostics ping > /dev/null; then
    log "✅ RabbitMQ está conectado"
else
    error "❌ RabbitMQ não está conectado"
    exit 1
fi

# Verificar Celery
log "Verificando Celery Worker..."
if docker-compose -f docker-compose.prod.yml exec -T backend celery -A app.tasks.celery_app inspect ping > /dev/null; then
    log "✅ Celery Worker está respondendo"
else
    warning "⚠️ Celery Worker não está respondendo (pode ser normal no início)"
fi

log "🎉 Todos os serviços estão saudáveis!"
```

---

## 📋 Processo de Migração

### Fase 1: Preparação do VPS

1. **Provisionar VPS**
   ```bash
   # Atualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar dependências
   sudo apt install -y git curl wget htop ufw nginx certbot python3-certbot-nginx
   ```

2. **Instalar Docker**
   ```bash
   # Remover versões antigas
   sudo apt remove docker docker-engine docker.io containerd runc
   
   # Instalar Docker CE
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Adicionar usuário ao grupo docker
   sudo usermod -aG docker $USER
   
   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Configurar Firewall**
   ```bash
   # Configurar UFW
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

### Fase 2: Configuração do Ambiente

1. **Criar estrutura de diretórios**
   ```bash
   sudo mkdir -p /opt/agendamento-saas/{app,data,logs,backups,ssl,monitoring}
   sudo mkdir -p /opt/agendamento-saas/data/{postgres,redis,rabbitmq,uploads}
   sudo mkdir -p /opt/agendamento-saas/logs/{nginx,backend,celery,system}
   sudo mkdir -p /opt/agendamento-saas/backups/{database,files,config}
   ```

2. **Clonar repositório**
   ```bash
   cd /opt/agendamento-saas/app
   sudo git clone https://github.com/seu-usuario/agendamento-saas.git .
   sudo chmod +x scripts/*.sh
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   # Copiar e editar .env.production
   sudo cp .env.example .env.production
   sudo nano .env.production
   ```

### Fase 3: Migração de Dados

1. **Exportar dados do ambiente local**
   ```bash
   # No ambiente local
   docker-compose exec db pg_dump -U agendamento_app agendamento > backup.sql
   
   # Backup de arquivos
   docker cp agendamento_backend:/app/uploads ./uploads-backup
   ```

2. **Importar dados para VPS**
   ```bash
   # Na VPS
   docker-compose -f docker-compose.prod.yml up -d db
   sleep 30
   docker-compose -f docker-compose.prod.yml exec -T db psql -U agendamento_prod -d agendamento_prod < backup.sql
   
   # Restaurar arquivos
   sudo cp -r uploads-backup/* /opt/agendamento-saas/data/uploads/
   ```

### Fase 4: Configuração SSL

1. **Gerar certificados SSL**
   ```bash
   # Configurar Nginx temporário
   sudo nginx -t && sudo systemctl reload nginx
   
   # Gerar certificados
   sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
   ```

2. **Configurar renovação automática**
   ```bash
   # Adicionar cron job
   echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
   ```

### Fase 5: Deploy Inicial

```bash
cd /opt/agendamento-saas/app
sudo ./scripts/deploy.sh main
```

---

## 💾 Backup e Restore

### scripts/backup.sh
```bash
#!/bin/bash

# Script de Backup Automatizado
# Uso: ./scripts/backup.sh [tipo]

set -e

TIPO=${1:-daily}
APP_DIR="/opt/agendamento-saas"
BACKUP_DIR="/opt/agendamento-saas/backups"
DATE=$(date +%Y%m%d-%H%M%S)

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

case $TIPO in
    "daily")
        log "Iniciando backup diário..."
        
        # Backup do banco de dados
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > "$BACKUP_DIR/database/db-$DATE.sql"
        
        # Backup de arquivos
        tar -czf "$BACKUP_DIR/files/uploads-$DATE.tar.gz" /opt/agendamento-saas/data/uploads/
        
        # Backup de configurações
        tar -czf "$BACKUP_DIR/config/config-$DATE.tar.gz" /opt/agendamento-saas/app/.env.production /opt/agendamento-saas/app/docker-compose.prod.yml
        
        # Limpar backups antigos (manter 7 dias)
        find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
        find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
        ;;
        
    "weekly")
        log "Iniciando backup semanal..."
        
        # Backup completo
        tar -czf "$BACKUP_DIR/full/full-$DATE.tar.gz" /opt/agendamento-saas/
        
        # Limpar backups semanais antigos (manter 4 semanas)
        find "$BACKUP_DIR/full" -name "*.tar.gz" -mtime +28 -delete
        ;;
        
    "before-deploy"|"after-deploy")
        log "Backup de deploy $TIPO..."
        
        # Backup rápido do banco
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > "$BACKUP_DIR/database/deploy-$TIPO-$DATE.sql"
        ;;
esac

log "Backup concluído: $TIPO ($DATE)"
```

### scripts/restore.sh
```bash
#!/bin/bash

# Script de Restore
# Uso: ./scripts/restore.sh <backup-file>

set -e

BACKUP_FILE=$1
APP_DIR="/opt/agendamento-saas"

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <backup-file>"
    exit 1
fi

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

warning() {
    echo "⚠️  $1"
}

# Confirmar restore
warning "ATENÇÃO: Isso irá sobrescrever os dados atuais!"
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# Parar serviços
log "Parando serviços..."
cd "$APP_DIR"
docker-compose -f docker-compose.prod.yml down

# Identificar tipo de backup
if [[ $BACKUP_FILE == *.sql ]]; then
    # Restore do banco de dados
    log "Restaurando banco de dados..."
    docker-compose -f docker-compose.prod.yml up -d db
    sleep 30
    docker-compose -f docker-compose.prod.yml exec -T db psql -U agendamento_prod -d agendamento_prod < "$BACKUP_FILE"
    
elif [[ $BACKUP_FILE == *uploads*.tar.gz ]]; then
    # Restore de arquivos
    log "Restaurando arquivos..."
    tar -xzf "$BACKUP_FILE" -C /opt/agendamento-saas/data/
    
elif [[ $BACKUP_FILE == *config*.tar.gz ]]; then
    # Restore de configurações
    log "Restaurando configurações..."
    tar -xzf "$BACKUP_FILE" -C /opt/agendamento-saas/app/
    
elif [[ $BACKUP_FILE == *full*.tar.gz ]]; then
    # Restore completo
    log "Restaurando backup completo..."
    cd /
    tar -xzf "$BACKUP_FILE"
    
else
    echo "Tipo de backup não reconhecido"
    exit 1
fi

# Reiniciar serviços
log "Reiniciando serviços..."
docker-compose -f docker-compose.prod.yml up -d

log "Restore concluído!"
```

---

## 📊 Monitoramento e Manutenção

### scripts/update.sh
```bash
#!/bin/bash

# Script de Atualização do Sistema
# Uso: ./scripts/update.sh

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Atualizar sistema operacional
log "Atualizando sistema operacional..."
sudo apt update && sudo apt upgrade -y

# Atualizar Docker
log "Verificando atualizações do Docker..."
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Limpar Docker
log "Limpando Docker..."
docker system prune -a -f

# Reiniciar serviços se necessário
log "Verificando se reinicialização é necessária..."
if [ -f /var/run/reboot-required ]; then
    log "Reinicialização necessária. Agendando para 2:00 AM..."
    echo "0 2 * * * /sbin/reboot" | sudo crontab -
else
    log "Nenhuma reinicialização necessária."
fi

log "Atualização concluída!"
```

### Configurar Monitoramento Básico

```bash
# Criar script de monitoramento
cat > /opt/agendamento-saas/scripts/monitor.sh << 'EOF'
#!/bin/bash

# Monitoramento básico dos serviços
APP_DIR="/opt/agendamento-saas"
LOG_FILE="/opt/agendamento-saas/logs/monitor-$(date +%Y%m%d).log"

check_service() {
    local service=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null; then
        echo "[$(date)] ✅ $service está online" >> "$LOG_FILE"
    else
        echo "[$(date)] ❌ $service está offline" >> "$LOG_FILE"
        # Enviar alerta (configurar email/webhook)
    fi
}

# Verificar serviços
check_service "Frontend" "http://localhost:3000"
check_service "Backend" "http://localhost:8000/health"

# Verificar espaço em disco
df -h | grep -E "/$|/opt" >> "$LOG_FILE"

# Verificar uso de memória
free -h >> "$LOG_FILE"
EOF

chmod +x /opt/agendamento-saas/scripts/monitor.sh

# Adicionar ao cron (verificar a cada 5 minutos)
echo "*/5 * * * * /opt/agendamento-saas/scripts/monitor.sh" | sudo crontab -
```

---

## 🔧 Manutenção Programada

### Cron Jobs Recomendados

```bash
# Editar crontab
sudo crontab -e

# Adicionar as seguintes linhas:
# Backup diário às 2:00 AM
0 2 * * * /opt/agendamento-saas/scripts/backup.sh daily

# Backup semanal aos domingos às 3:00 AM
0 3 * * 0 /opt/agendamento-saas/scripts/backup.sh weekly

# Monitoramento a cada 5 minutos
*/5 * * * * /opt/agendamento-saas/scripts/monitor.sh

# Limpeza de logs semanal aos sábados às 4:00 AM
0 4 * * 6 find /opt/agendamento-saas/logs -name "*.log" -mtime +30 -delete

# Renovação SSL diária às 5:00 AM
0 5 * * * /usr/bin/certbot renew --quiet

# Atualização do sistema mensal (dia 1 às 6:00 AM)
0 6 1 * * /opt/agendamento-saas/scripts/update.sh
```

---

## 📝 Checklists

### Checklist de Deploy
- [ ] VPS provisionado e configurado
- [ ] Docker e Docker Compose instalados
- [ ] Firewall configurado
- [ ] Domínio apontado para VPS
- [ ] SSL configurado
- [ ] Código clonado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Arquivos restaurados
- [ ] Serviços iniciados
- [ ] Health checks passando
- [ ] Backup inicial criado
- [ ] Monitoramento configurado
- [ ] Cron jobs configurados

### Checklist de Manutenção Mensal
- [ ] Verificar logs de erros
- [ ] Verificar uso de recursos
- [ ] Testar backups
- [ ] Atualizar dependências
- [ ] Verificar segurança
- [ ] Limpar arquivos antigos
- [ ] Revisar performance
- [ ] Documentar mudanças

---

## 🚨 Troubleshooting Comum

### Problemas Frequentes

1. **Containers não iniciam**
   ```bash
   # Verificar logs
   docker-compose logs [serviço]
   
   # Verificar status
   docker-compose ps
   ```

2. **Conexão com banco de dados falha**
   ```bash
   # Verificar se o banco está saudável
   docker-compose exec db pg_isready
   
   # Verificar variáveis de ambiente
   docker-compose exec backend env | grep POSTGRES
   ```

3. **SSL não funciona**
   ```bash
   # Verificar status do certificado
   sudo certbot certificates
   
   # Testar configuração Nginx
   sudo nginx -t
   
   # Recarregar Nginx
   sudo systemctl reload nginx
   ```

4. **Alto uso de memória**
   ```bash
   # Verificar uso dos containers
   docker stats
   
   # Reiniciar serviços se necessário
   docker-compose restart
   ```

---

## 📞 Suporte e Contato

### Recursos Úteis
- [Documentação Docker](https://docs.docker.com/)
- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Documentação Certbot](https://certbot.eff.org/)

### Comandos Úteis
```bash
# Verificar logs em tempo real
docker-compose logs -f [serviço]

# Entrar em container
docker-compose exec [serviço] bash

# Reiniciar serviço específico
docker-compose restart [serviço]

# Verificar uso de recursos
docker stats

# Limpar sistema Docker
docker system prune -a
```

---

## 📈 Próximos Passos

1. **Monitoramento Avançado**: Implementar Prometheus + Grafana
2. **CI/CD**: Configurar GitHub Actions para deploy automático
3. **Backup Cloud**: Configurar backups para S3/Google Drive
4. **Load Balancer**: Configurar múltiplas instâncias
5. **CDN**: Implementar CDN para assets estáticos
6. **Automação**: Scripts avançados de manutenção

---

*Este documento deve ser atualizado sempre que houver mudanças na arquitetura ou processo de deploy.*
