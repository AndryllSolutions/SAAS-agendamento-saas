#!/bin/bash

# Script de Deploy Automatizado para VPS
# Uso: ./deploy.sh [branch]

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
./backup.sh before-deploy

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
./health-check.sh

# 8. Limpar imagens antigas
log "Limpando imagens Docker antigas..."
docker image prune -f

# 9. Backup pós-deploy
log "Fazendo backup pós-deploy..."
./backup.sh after-deploy

log "Deploy concluído com sucesso!"
log "Logs salvos em: $LOG_FILE"
