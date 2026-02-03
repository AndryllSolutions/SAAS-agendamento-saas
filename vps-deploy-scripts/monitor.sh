#!/bin/bash

# Script de Monitoramento Básico
# Uso: ./monitor.sh

set -e

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

# Verificar containers Docker
docker ps --format "table {{.Names}}\t{{.Status}}" >> "$LOG_FILE"
