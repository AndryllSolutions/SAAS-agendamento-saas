#!/bin/bash

# Script de Backup Automatizado
# Uso: ./backup.sh [tipo]

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
