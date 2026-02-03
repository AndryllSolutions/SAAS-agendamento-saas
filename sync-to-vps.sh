#!/bin/bash

# Script de Sincronização entre Local e VPS
# Uso: ./sync-to-vps.sh [tipo] [usuario-vps] [ip-vps] [caminho-chave-ssh]

set -e

# Configurações
SYNC_TYPE=${1:-incremental}
VPS_USER=${2:-root}
VPS_IP=${3:-SEU_IP_VPS}
SSH_KEY=${4:-~/.ssh/id_rsa}
LOCAL_PATH="/mnt/e/agendamento_SAAS"
VPS_PATH="/opt/agendamento-saas/app"
LOG_FILE="/tmp/sync-to-vps-$(date +%Y%m%d-%H%M%S).log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Verificar parâmetros
if [ "$VPS_IP" = "SEU_IP_VPS" ]; then
    error "Por favor, informe o IP da VPS: $0 $SYNC_TYPE $VPS_USER SEU_IP_VPS [chave-ssh]"
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

log "Iniciando sincronização $SYNC_TYPE para VPS"
info "Origem: $LOCAL_PATH"
info "Destino: $VPS_USER@$VPS_IP:$VPS_PATH"
info "Log: $LOG_FILE"

# Testar conexão SSH
log "Testando conexão SSH com a VPS..."
ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "echo 'Conexão SSH estabelecida'" || {
    error "Não foi possível conectar à VPS. Verifique IP, usuário e chave SSH."
    exit 1
}

# Função para sincronizar backend
sync_backend() {
    log "Sincronizando backend..."
    
    case $SYNC_TYPE in
        "full")
            info "Sincronização completa do backend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --delete \
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
                --exclude='*.log' \
                "$LOCAL_PATH/backend/" "$VPS_USER@$VPS_IP:$VPS_PATH/backend/"
            ;;
        "incremental")
            info "Sincronização incremental do backend..."
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
                --exclude='*.log' \
                "$LOCAL_PATH/backend/" "$VPS_USER@$VPS_IP:$VPS_PATH/backend/"
            ;;
        "config")
            info "Sincronizando apenas configurações do backend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --include='*/' \
                --include='*.py' \
                --include='*.txt' \
                --include='*.ini' \
                --include='*.yml' \
                --include='*.yaml' \
                --include='*.env*' \
                --exclude='*' \
                "$LOCAL_PATH/backend/" "$VPS_USER@$VPS_IP:$VPS_PATH/backend/"
            ;;
        "docker")
            info "Sincronizando arquivos Docker do backend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --include='Dockerfile*' \
                --include='requirements.txt' \
                --include='*.py' \
                --exclude='*' \
                "$LOCAL_PATH/backend/" "$VPS_USER@$VPS_IP:$VPS_PATH/backend/"
            ;;
    esac
}

# Função para sincronizar frontend
sync_frontend() {
    log "Sincronizando frontend..."
    
    case $SYNC_TYPE in
        "full")
            info "Sincronização completa do frontend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --delete \
                --exclude='.git' \
                --exclude='node_modules' \
                --exclude='.next' \
                --exclude='out' \
                --exclude='build' \
                --exclude='dist' \
                --exclude='.env.local' \
                --exclude='logs/*' \
                --exclude='*.log' \
                "$LOCAL_PATH/frontend/" "$VPS_USER@$VPS_IP:$VPS_PATH/frontend/"
            ;;
        "incremental")
            info "Sincronização incremental do frontend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --exclude='.git' \
                --exclude='node_modules' \
                --exclude='.next' \
                --exclude='out' \
                --exclude='build' \
                --exclude='dist' \
                --exclude='.env.local' \
                --exclude='logs/*' \
                --exclude='*.log' \
                "$LOCAL_PATH/frontend/" "$VPS_USER@$VPS_IP:$VPS_PATH/frontend/"
            ;;
        "config")
            info "Sincronizando apenas configurações do frontend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --include='*/' \
                --include='*.js' \
                --include='*.ts' \
                --include='*.json' \
                --include='*.tsx' \
                --include='*.jsx' \
                --include='*.css' \
                --include='*.scss' \
                --include='*.env*' \
                --exclude='*' \
                "$LOCAL_PATH/frontend/" "$VPS_USER@$VPS_IP:$VPS_PATH/frontend/"
            ;;
        "docker")
            info "Sincronizando arquivos Docker do frontend..."
            rsync -avz --progress -e "ssh -i $SSH_KEY" \
                --include='Dockerfile*' \
                --include='package*.json' \
                --include='next.config.*' \
                --exclude='*' \
                "$LOCAL_PATH/frontend/" "$VPS_USER@$VPS_IP:$VPS_PATH/frontend/"
            ;;
    esac
}

# Função para sincronizar configurações
sync_configs() {
    log "Sincronizando configurações..."
    
    rsync -avz --progress -e "ssh -i $SSH_KEY" \
        --include='docker-compose*.yml' \
        --include='*.env*' \
        --include='docker/**' \
        --exclude='*' \
        "$LOCAL_PATH/" "$VPS_USER@$VPS_IP:$VPS_PATH/"
}

# Função para sincronizar scripts
sync_scripts() {
    log "Sincronizando scripts..."
    
    if [ -d "$LOCAL_PATH/vps-deploy-scripts" ]; then
        rsync -avz --progress -e "ssh -i $SSH_KEY" \
            "$LOCAL_PATH/vps-deploy-scripts/" "$VPS_USER@$VPS_IP:$VPS_PATH/../scripts/deploy/"
    fi
    
    if [ -d "$LOCAL_PATH/scripts" ]; then
        rsync -avz --progress -e "ssh -i $SSH_KEY" \
            "$LOCAL_PATH/scripts/" "$VPS_USER@$VPS_IP:$VPS_PATH/scripts/"
    fi
}

# Função para sincronizar documentação
sync_docs() {
    log "Sincronizando documentação..."
    
    rsync -avz --progress -e "ssh -i $SSH_KEY" \
        --include='*.md' \
        --include='*.txt' \
        --include='docs/**' \
        --exclude='*' \
        "$LOCAL_PATH/" "$VPS_USER@$VPS_IP:$VPS_PATH/../docs/"
}

# Executar sincronização baseada no tipo
case $SYNC_TYPE in
    "full")
        log "Executando sincronização COMPLETA..."
        sync_backend
        sync_frontend
        sync_configs
        sync_scripts
        sync_docs
        ;;
    "incremental")
        log "Executando sincronização INCREMENTAL..."
        sync_backend
        sync_frontend
        sync_configs
        sync_scripts
        ;;
    "config")
        log "Executando sincronização de CONFIGURAÇÕES..."
        sync_backend
        sync_frontend
        sync_configs
        ;;
    "docker")
        log "Executando sincronização DOCKER..."
        sync_backend
        sync_frontend
        sync_configs
        ;;
    "backend")
        log "Executando sincronização BACKEND apenas..."
        sync_backend
        ;;
    "frontend")
        log "Executando sincronização FRONTEND apenas..."
        sync_frontend
        ;;
    "scripts")
        log "Executando sincronização SCRIPTS apenas..."
        sync_scripts
        ;;
    "docs")
        log "Executando sincronização DOCUMENTAÇÃO apenas..."
        sync_docs
        ;;
    *)
        error "Tipo de sincronização inválido: $SYNC_TYPE"
        info "Tipos válidos: full, incremental, config, docker, backend, frontend, scripts, docs"
        exit 1
        ;;
esac

# Configurar permissões na VPS
log "Configurando permissões na VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
# Permissões básicas
chmod 755 $VPS_PATH
chmod 755 $VPS_PATH/backend
chmod 755 $VPS_PATH/frontend

# Scripts executáveis
find $VPS_PATH -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

# Logs (se existirem)
chmod 755 $VPS_PATH/logs 2>/dev/null || true
chmod 644 $VPS_PATH/logs/*.log 2>/dev/null || true

echo "Permissões configuradas"
EOF

# Verificar status da sincronização
log "Verificando status da sincronização..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_IP" << EOF
echo "========================================"
echo "STATUS DA SINCRONIZAÇÃO:"
echo "========================================"
echo "Data/Hora: $(date)"
echo "Tipo: $SYNC_TYPE"
echo "Origem: $LOCAL_PATH"
echo "Destino: $VPS_PATH"
echo ""
echo "Estrutura sincronizada:"
ls -la $VPS_PATH/
echo ""
echo "Espaço utilizado:"
du -sh $VPS_PATH
echo "========================================"
EOF

# Gerar relatório
log "Gerando relatório da sincronização..."
{
    echo "========================================"
    echo "RELATÓRIO DE SINCRONIZAÇÃO"
    echo "========================================"
    echo "Data/Hora: $(date)"
    echo "Tipo: $SYNC_TYPE"
    echo "Origem: $LOCAL_PATH"
    echo "Destino: $VPS_USER@$VPS_IP:$VPS_PATH"
    echo "Usuário: $(whoami)"
    echo "IP Origem: $(curl -s ifconfig.me 2>/dev/null || echo 'N/A')"
    echo ""
    echo "Arquivos sincronizados:"
    echo "- Backend: $(find $LOCAL_PATH/backend -type f | wc -l) arquivos"
    echo "- Frontend: $(find $LOCAL_PATH/frontend -type f | wc -l) arquivos"
    echo "- Total: $(find $LOCAL_PATH -type f | wc -l) arquivos"
    echo ""
    echo "Espaço transferido:"
    echo "- Origem: $(du -sh $LOCAL_PATH | cut -f1)"
    echo "- Destino: $(ssh -i $SSH_KEY $VPS_USER@$VPS_IP du -sh $VPS_PATH 2>/dev/null | cut -f1 || echo 'N/A')"
    echo ""
    echo "Próximos passos:"
    echo "1. Acessar VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
    echo "2. Verificar arquivos: ls -la $VPS_PATH"
    echo "3. Executar deploy: cd $VPS_PATH && ./scripts/deploy.sh main"
    echo "========================================"
} | tee -a "$LOG_FILE"

# Resumo final
log "========================================"
log "SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!"
log "========================================"
info "Tipo: $SYNC_TYPE"
info "Origem: $LOCAL_PATH"
info "Destino: $VPS_USER@$VPS_IP:$VPS_PATH"
info "Log completo: $LOG_FILE"
log ""
warning "PRÓXIMOS PASSOS:"
warning "1. Acessar VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
warning "2. Verificar arquivos: ls -la $VPS_PATH"
warning "3. Executar deploy: cd $VPS_PATH && ./scripts/deploy.sh main"
warning "4. Verificar status: docker-compose ps"
log "========================================"
