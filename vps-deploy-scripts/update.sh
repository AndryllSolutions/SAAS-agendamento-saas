#!/bin/bash

# Script de Atualização do Sistema
# Uso: ./update.sh

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
