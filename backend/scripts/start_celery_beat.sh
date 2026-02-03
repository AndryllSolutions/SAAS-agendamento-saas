#!/bin/bash

# Script para iniciar Celery Beat (tarefas periódicas)
# Uso: ./start_celery_beat.sh

echo "⏰ Iniciando Celery Beat (tarefas periódicas)"

# Criar diretório de logs se não existir
mkdir -p logs

# Iniciar Celery Beat
celery -A app.tasks.celery_app beat \
    --loglevel=info \
    --logfile=logs/celery_beat.log \
    --pidfile=logs/celery_beat.pid

