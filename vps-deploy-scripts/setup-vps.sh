#!/bin/bash

# Script de Configuração Inicial do VPS
# Uso: ./setup-vps.sh [dominio] [email]

set -e

DOMAIN=${1:-seu-dominio.com}
EMAIL=${2:-admin@seu-dominio.com}

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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script precisa ser executado como root"
    exit 1
fi

log "Iniciando configuração do VPS para $DOMAIN"

# 1. Atualizar sistema
log "Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências
log "Instalando dependências..."
apt install -y git curl wget htop ufw nginx certbot python3-certbot-nginx unzip

# 3. Instalar Docker
log "Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

# 4. Instalar Docker Compose
log "Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Configurar firewall
log "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# 6. Criar estrutura de diretórios
log "Criando estrutura de diretórios..."
mkdir -p /opt/agendamento-saas/{app,data,logs,backups,ssl,monitoring}
mkdir -p /opt/agendamento-saas/data/{postgres,redis,rabbitmq,uploads}
mkdir -p /opt/agendamento-saas/logs/{nginx,backend,celery,system}
mkdir -p /opt/agendamento-saas/backups/{database,files,config,full}

# 7. Clonar repositório (ajustar URL)
log "Clonando repositório..."
cd /opt/agendamento-saas/app
git clone https://github.com/seu-usuario/agendamento-saas.git .

# 8. Copiar scripts de deploy
log "Configurando scripts de deploy..."
cp -r vps-deploy-scripts/*.sh /opt/agendamento-saas/app/scripts/
chmod +x /opt/agendamento-saas/app/scripts/*.sh

# 9. Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."
cp .env.example .env.production
warning "⚠️  EDITE O ARQUIVO .env.production COM SUAS CONFIGURAÇÕES!"

# 10. Configurar Nginx básico
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/agendamento << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 11. Gerar certificado SSL
log "Gerando certificado SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# 12. Configurar cron jobs
log "Configurando tarefas agendadas..."
cat > /etc/cron.d/agendamento-saas << EOF
# Backup diário às 2:00 AM
0 2 * * * root /opt/agendamento-saas/app/scripts/backup.sh daily

# Backup semanal aos domingos às 3:00 AM
0 3 * * 0 root /opt/agendamento-saas/app/scripts/backup.sh weekly

# Monitoramento a cada 5 minutos
*/5 * * * * root /opt/agendamento-saas/app/scripts/monitor.sh

# Limpeza de logs semanal aos sábados às 4:00 AM
0 4 * * 6 root find /opt/agendamento-saas/logs -name "*.log" -mtime +30 -delete

# Renovação SSL diária às 5:00 AM
0 5 * * * root /usr/bin/certbot renew --quiet

# Atualização do sistema mensal (dia 1 às 6:00 AM)
0 6 1 * * root /opt/agendamento-saas/app/scripts/update.sh
EOF

# 13. Configurar logrotate
log "Configurando rotação de logs..."
cat > /etc/logrotate.d/agendamento-saas << EOF
/opt/agendamento-saas/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# 14. Finalizar
log "Configuração inicial concluída!"
warning "⚠️  PRÓXIMOS PASSOS:"
warning "1. Edite /opt/agendamento-saas/app/.env.production"
warning "2. Migre os dados do banco de dados"
warning "3. Execute: cd /opt/agendamento-saas/app && ./scripts/deploy.sh main"
warning "4. Verifique os logs: docker-compose logs -f"

log "VPS configurado com sucesso para $DOMAIN"
