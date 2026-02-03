#!/bin/bash

# Script para iniciar workers do Celery otimizados
# Uso: ./start_celery_workers.sh [environment]
# environment: dev, prod (padrão: dev)

ENVIRONMENT=${1:-dev}

echo "🚀 Iniciando Celery Workers - Ambiente: $ENVIRONMENT"

# Configurações por ambiente
if [ "$ENVIRONMENT" = "prod" ]; then
    CONCURRENCY=8
    LOGLEVEL=info
    PREFETCH=4
else
    CONCURRENCY=4
    LOGLEVEL=debug
    PREFETCH=2
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Função para iniciar worker
start_worker() {
    QUEUE=$1
    WORKER_NAME=$2
    
    echo "📦 Iniciando worker para fila: $QUEUE"
    celery -A app.tasks.celery_app worker \
        --loglevel=$LOGLEVEL \
        --concurrency=$CONCURRENCY \
        --prefetch-multiplier=$PREFETCH \
        --max-tasks-per-child=1000 \
        --queues=$QUEUE \
        --hostname=worker_${WORKER_NAME}@%h \
        --logfile=logs/celery_${WORKER_NAME}.log \
        --pidfile=logs/celery_${WORKER_NAME}.pid \
        --detach
}

# Iniciar workers por fila (recomendado para produção)
if [ "$ENVIRONMENT" = "prod" ]; then
    start_worker "appointments" "appointments"
    start_worker "notifications" "notifications"
    start_worker "payments" "payments"
    
    echo "✅ Workers iniciados em background"
    echo "📊 Para monitorar: celery -A app.tasks.celery_app inspect active"
else
    # Desenvolvimento: worker único processando todas as filas
    echo "📦 Iniciando worker único (desenvolvimento)"
    celery -A app.tasks.celery_app worker \
        --loglevel=$LOGLEVEL \
        --concurrency=$CONCURRENCY \
        --prefetch-multiplier=$PREFETCH \
        --max-tasks-per-child=500
fi

