#!/bin/bash

# Script de Verificação de Saúde dos Serviços
# Uso: ./health-check.sh

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
