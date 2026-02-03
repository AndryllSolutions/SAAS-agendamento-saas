#!/bin/bash

# Script de Restore
# Uso: ./restore.sh <backup-file>

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
