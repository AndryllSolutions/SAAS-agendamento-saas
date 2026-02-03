#!/bin/bash

# Script de Migração Organizada do SAAS para VPS
# Uso: ./migrate-to-vps.sh [usuario-vps] [ip-vps] [caminho-chave-ssh]

set -e

# Configurações
VPS_USER=${1:-root}
VPS_IP=${2:-SEU_IP_VPS}
SSH_KEY=${3:-~/.ssh/id_rsa}
LOCAL_PATH="/mnt/e/agendamento_SAAS"
VPS_BASE_PATH="/opt"
REMOTE_PROJECT_NAME="agendamento-saas"
VPS_PATH="$VPS_BASE_PATH/$REMOTE_PROJECT_NAME"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar parâmetros
if [ "$VPS_IP" = "SEU_IP_VPS" ]; then
    error "Por favor, informe o IP da VPS: $0 $VPS_USER SEU_IP_VPS [chave-ssh]"
    exit 1
fi

# Verificar se o caminho local existe
if [ ! -d "$LOCAL_PATH" ]; then
    error "Caminho local não encontrado: $LOCAL_PATH"
    exit 1
fi

# Verificar se a chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
    error "Chave SSH não encontrada: $SSH_KEY"
    exit 1
fi

log "Iniciando migração organizada do SAAS para VPS"
info "Origem: $LOCAL_PATH"
info "Destino: $VPS_USER@$VPS_IP:$VPS_PATH"

# 1. Testar conexão SSH
log "Testando conexão SSH com a VPS..."
ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "echo 'Conexão SSH estabelecida com sucesso'" || {
    error "Não foi possível conectar à VPS. Verifique IP, usuário e chave SSH."
    exit 1
}

# 2. Criar estrutura de diretórios na VPS
log "Criando estrutura de diretórios na VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Criar estrutura principal
mkdir -p $VPS_PATH/{app,config,data,logs,backups,ssl,monitoring,scripts,temp}

# Criar subdiretórios organizados
mkdir -p $VPS_PATH/app/{backend,frontend,docker,docs}
mkdir -p $VPS_PATH/config/{nginx,ssl,env}
mkdir -p $VPS_PATH/data/{postgres,redis,rabbitmq,uploads,static}
mkdir -p $VPS_PATH/logs/{nginx,backend,frontend,celery,system,deploy}
mkdir -p $VPS_PATH/backups/{database,files,config,full}
mkdir -p $VPS_PATH/ssl/{certbot,certificates}
mkdir -p $VPS_PATH/monitoring/{prometheus,grafana,alerts}
mkdir -p $VPS_PATH/scripts/{deploy,backup,maintenance,monitoring}
mkdir -p $VPS_PATH/temp/{builds,cache,uploads}

# Definir permissões
chmod 755 $VPS_PATH
chmod 700 $VPS_PATH/config
chmod 700 $VPS_PATH/ssl
chmod 755 $VPS_PATH/logs
chmod 755 $VPS_PATH/backups

echo "Estrutura de diretórios criada com sucesso"
EOF

# 3. Migrar código fonte (apenas arquivos essenciais)
log "Migrando código fonte do backend..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.venv' \
    --exclude='node_modules' \
    --exclude='.pytest_cache' \
    --exclude='coverage' \
    --exclude='.coverage' \
    --exclude='logs/*' \
    --exclude='data/*' \
    "$LOCAL_PATH/backend/" "$VPS_USER@$VPS_IP:$VPS_PATH/app/backend/"

log "Migrando código fonte do frontend..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='build' \
    --exclude='dist' \
    --exclude='.env.local' \
    --exclude='logs/*' \
    "$LOCAL_PATH/frontend/" "$VPS_USER@$VPS_IP:$VPS_PATH/app/frontend/"

# 4. Migrar configurações Docker
log "Migrando configurações Docker..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/docker/" "$VPS_USER@$VPS_IP:$VPS_PATH/app/docker/"

# 5. Migrar arquivos de configuração principais
log "Migrando arquivos de configuração..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Copiar arquivos de configuração principais
cp $VPS_PATH/app/docker-compose.yml $VPS_PATH/config/
cp $VPS_PATH/app/.env.example $VPS_PATH/config/env/

# Migrar scripts de deploy
cp -r $VPS_PATH/app/vps-deploy-scripts/* $VPS_PATH/scripts/deploy/

echo "Arquivos de configuração migrados"
EOF

# 6. Migrar documentação importante
log "Migrando documentação..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --include='*.md' \
    --exclude='*' \
    "$LOCAL_PATH/" "$VPS_USER@$VPS_IP:$VPS_PATH/docs/"

# 7. Criar arquivos de ambiente na VPS
log "Configurando arquivos de ambiente..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Criar .env.production a partir do exemplo
cp $VPS_PATH/config/env/.env.example $VPS_PATH/app/.env.production

# Criar .env para docker-compose
cat > $VPS_PATH/app/.env << 'ENVEOF'
# Ambiente de Produção VPS
COMPOSE_PROJECT_NAME=agendamento_saas
COMPOSE_FILE=docker-compose.yml
ENVIRONMENT=production

# Paths customizados para VPS
POSTGRES_DATA_PATH=/opt/agendamento-saas/data/postgres
REDIS_DATA_PATH=/opt/agendamento-saas/data/redis
RABBITMQ_DATA_PATH=/opt/agendamento-saas/data/rabbitmq
UPLOADS_PATH=/opt/agendamento-saas/data/uploads
LOGS_PATH=/opt/agendamento-saas/logs

# Port bindings (produção)
POSTGRES_PORT_BINDING=127.0.0.1:5433:5432
REDIS_PORT_BINDING=127.0.0.1:6379:6379
RABBITMQ_PORT_BINDING=127.0.0.1:5672:5672
RABBITMQ_MANAGEMENT_PORT_BINDING=127.0.0.1:15672:15672
BACKEND_PORT_BINDING=127.0.0.1:8001:8000
FRONTEND_PORT_BINDING=127.0.0.1:3001:3000
ENVEOF

echo "Arquivos de ambiente configurados"
EOF

# 8. Configurar permissões na VPS
log "Configurando permissões..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Dono dos diretórios
chown -R root:root $VPS_PATH

# Permissões específicas
chmod 755 $VPS_PATH/app
chmod 755 $VPS_PATH/app/backend
chmod 755 $VPS_PATH/app/frontend
chmod 755 $VPS_PATH/app/docker
chmod 755 $VPS_PATH/docs

# Scripts executáveis
chmod +x $VPS_PATH/scripts/deploy/*.sh
chmod +x $VPS_PATH/app/scripts/*.sh 2>/dev/null || true

# Logs e backups
chmod 755 $VPS_PATH/logs
chmod 755 $VPS_PATH/backups

echo "Permissões configuradas"
EOF

# 9. Criar estrutura de links simbólicos para facilitar acesso
log "Criando links simbólicos..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Links simbólicos para facilitar acesso
ln -sf $VPS_PATH/app /opt/agendamento-saas/current
ln -sf $VPS_PATH/logs /opt/agendamento-saas/logs
ln -sf $VPS_PATH/data /opt/agendamento-saas/data
ln -sf $VPS_PATH/config /opt/agendamento-saas/config
ln -sf $VPS_PATH/scripts /opt/agendamento-saas/scripts

echo "Links simbólicos criados"
EOF

# 10. Gerar arquivo de informação da migração
log "Gerando arquivo de informação da migração..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
cat > $VPS_PATH/MIGRATION_INFO.txt << 'MIGEOF'
========================================
INFORMAÇÕES DA MIGRAÇÃO
========================================
Data: $(date)
Origem: $LOCAL_PATH
Destino: $VPS_PATH
Usuario: $VPS_USER

ESTRUTURA DE DIRETÓRIOS:
========================================
$VPS_PATH/
├── app/                    # Código fonte
│   ├── backend/           # Backend FastAPI
│   ├── frontend/          # Frontend Next.js
│   ├── docker/            # Configurações Docker
│   └── scripts/           # Scripts de deploy
├── config/                # Configurações
│   ├── nginx/            # Config Nginx
│   ├── ssl/              # Certificados SSL
│   └── env/              # Variáveis ambiente
├── data/                  # Dados persistentes
│   ├── postgres/         # Dados PostgreSQL
│   ├── redis/            # Dados Redis
│   ├── rabbitmq/         # Dados RabbitMQ
│   └── uploads/          # Uploads de arquivos
├── logs/                  # Logs da aplicação
├── backups/               # Backups automatizados
├── ssl/                   # Certificados SSL
├── monitoring/            # Monitoramento
├── scripts/               # Scripts de manutenção
├── temp/                  # Arquivos temporários
└── docs/                  # Documentação

PRÓXIMOS PASSOS:
========================================
1. Editar $VPS_PATH/app/.env.production
2. Configurar domínio e SSL
3. Migrar banco de dados
4. Executar deploy inicial
5. Configurar monitoramento

COMANDOS ÚTEIS:
========================================
cd $VPS_PATH/app
./scripts/deploy.sh main
./scripts/backup.sh daily
./scripts/health-check.sh

MIGEOF

echo "Arquivo de migração criado"
EOF

# 11. Verificar estrutura criada
log "Verificando estrutura criada na VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
echo "========================================"
echo "ESTRUTURA CRIADA NA VPS:"
echo "========================================"
tree -L 3 $VPS_PATH 2>/dev/null || find $VPS_PATH -type d -name "*" | head -20
echo ""
echo "Espaço utilizado:"
du -sh $VPS_PATH
echo ""
echo "Permissões principais:"
ls -la $VPS_PATH
echo "========================================"
EOF

# 12. Resumo da migração
log "========================================"
log "MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
log "========================================"
info "Origem: $LOCAL_PATH"
info "Destino: $VPS_USER@$VPS_IP:$VPS_PATH"
info "Tamanho transferido: $(du -sh $LOCAL_PATH | cut -f1)"
info "Data/Hora: $(date)"
log ""
warning "PRÓXIMOS PASSOS:"
warning "1. Acessar VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
warning "2. Editar configurações: nano $VPS_PATH/app/.env.production"
warning "3. Executar setup: cd $VPS_PATH && ./scripts/deploy/setup-vps.sh"
warning "4. Migrar dados: Verificar documentação em $VPS_PATH/docs/"
warning "5. Iniciar serviços: cd $VPS_PATH/app && ./scripts/deploy.sh main"
log ""
info "Arquivo de informações: $VPS_PATH/MIGRATION_INFO.txt"
log "========================================"
