#!/bin/bash

# Script de Deploy Produção - Atendo SAAS
# Uso: ./deploy-production.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script precisa ser executado como root"
    exit 1
fi

# Verificar arquivos necessários
log "Verificando arquivos necessários..."

required_files=(
    "docker-compose.prod.yml"
    ".env.production"
    "backend/Dockerfile.prod"
    "frontend/Dockerfile.prod"
    "docker/nginx/nginx.prod.conf"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        error "Arquivo obrigatório não encontrado: $file"
        exit 1
    fi
done

log "Todos os arquivos necessários encontrados"

# Verificar configuração .env.production
log "Verificando configuração .env.production..."

# Verificar se as senhas padrão foram trocadas
if grep -q "TROCAR_POR_SENHA_FORTE" .env.production; then
    error "Você ainda não trocou as senhas padrão no .env.production"
    error "Edite o arquivo .env.production e substitua as senhas padrão"
    exit 1
fi

if grep -q "COPIAR_CHAVE_32_CHARS" .env.production; then
    error "Você ainda não configurou as chaves de segurança no .env.production"
    error "Edite o arquivo .env.production e configure as chaves"
    exit 1
fi

if grep -q "seu-dominio.com" .env.production; then
    error "Você ainda não configurou seu domínio no .env.production"
    error "Edite o arquivo .env.production e substitua 'seu-dominio.com'"
    exit 1
fi

log "Configuração .env.production validada"

# Backup antes do deploy
log "Fazendo backup antes do deploy..."
backup_dir="./backups/before-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

# Backup do banco de dados se já existir
if docker-compose -f docker-compose.prod.yml ps db | grep -q "Up"; then
    log "Fazendo backup do banco de dados..."
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $(grep POSTGRES_USER .env.production | cut -d= -f2) $(grep POSTGRES_DB .env.production | cut -d= -f2) > "$backup_dir/database.sql"
fi

# Backup das configurações
cp .env.production "$backup_dir/"
cp docker-compose.prod.yml "$backup_dir/"

log "Backup concluído em: $backup_dir"

# Parar serviços existentes
log "Parando serviços existentes..."
docker-compose -f docker-compose.prod.yml down

# Limpar imagens antigas (opcional)
read -p "Deseja limpar imagens Docker antigas? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    log "Limpando imagens Docker antigas..."
    docker system prune -f
    docker volume prune -f
fi

# Build das imagens de produção
log "Construindo imagens de produção..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar serviços de infraestrutura
log "Iniciando serviços de infraestrutura..."
docker-compose -f docker-compose.prod.yml up -d db redis rabbitmq

# Aguardar serviços de infraestrutura
log "Aguardando serviços de infraestrutura ficarem prontos..."
sleep 30

# Verificar saúde dos serviços de infraestrutura
log "Verificando saúde dos serviços de infraestrutura..."
for service in db redis rabbitmq; do
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "Up"; then
        log "✅ $service está rodando"
    else
        error "❌ $service não está rodando"
        docker-compose -f docker-compose.prod.yml logs $service
        exit 1
    fi
done

# Iniciar backend
log "Iniciando backend..."
docker-compose -f docker-compose.prod.yml up -d backend

# Aguardar backend
log "Aguardando backend iniciar..."
sleep 30

# Verificar backend
if docker-compose -f docker-compose.prod.yml ps backend | grep -q "Up"; then
    log "✅ Backend está rodando"
else
    error "❌ Backend não está rodando"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Iniciar frontend
log "Iniciando frontend..."
docker-compose -f docker-compose.prod.yml up -d frontend

# Aguardar frontend
log "Aguardando frontend iniciar..."
sleep 20

# Verificar frontend
if docker-compose -f docker-compose.prod.yml ps frontend | grep -q "Up"; then
    log "✅ Frontend está rodando"
else
    error "❌ Frontend não está rodando"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Iniciar serviços adicionais
log "Iniciando serviços adicionais..."
docker-compose -f docker-compose.prod.yml up -d celery_worker celery_beat nginx

# Aguardar todos os serviços
log "Aguardando todos os serviços ficarem prontos..."
sleep 20

# Status final
log "========================================"
log "STATUS FINAL DOS SERVIÇOS:"
log "========================================"
docker-compose -f docker-compose.prod.yml ps

# Verificar saúde de todos os serviços
log "Verificando saúde de todos os serviços..."
all_healthy=true

for service in backend frontend db redis rabbitmq celery_worker; do
    health=$(docker-compose -f docker-compose.prod.yml ps $service | grep "healthy\|Up" | wc -l)
    if [ $health -gt 0 ]; then
        log "✅ $service está saudável"
    else
        error "❌ $service não está saudável"
        all_healthy=false
    fi
done

# Testar conectividade
log "Testando conectividade..."
sleep 10

# Obter IP da VPS
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')

# Testar backend API
if curl -f -s http://localhost:8001/health > /dev/null 2>&1; then
    log "✅ Backend API respondendo"
else
    warning "⚠️ Backend API não respondendo (pode ser normal no início)"
fi

# Testar frontend
if curl -f -s http://localhost:3001 > /dev/null 2>&1; then
    log "✅ Frontend respondendo"
else
    warning "⚠️ Frontend não respondendo (pode ser normal no início)"
fi

# Mostrar URLs de acesso
log "========================================"
log "URLS DE ACESSO:"
log "========================================"
log "Frontend: http://$VPS_IP:3001"
log "Backend API: http://$VPS_IP:8001"
log "Nginx (SSL): https://seu-dominio.com"
log "RabbitMQ Management: http://$VPS_IP:15672"
log ""
log "COMANDOS ÚTEIS:"
log "Verificar logs: docker-compose -f docker-compose.prod.yml logs -f [serviço]"
log "Reiniciar serviço: docker-compose -f docker-compose.prod.yml restart [serviço]"
log "Parar tudo: docker-compose -f docker-compose.prod.yml down"
log "Verificar uso: docker stats"
log "========================================"

# Backup pós-deploy
log "Fazendo backup pós-deploy..."
post_backup_dir="./backups/after-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$post_backup_dir"
cp .env.production "$post_backup_dir/"
cp docker-compose.prod.yml "$post_backup_dir/"

# Resultado final
if [ "$all_healthy" = true ]; then
    log "========================================"
    log "🎉 DEPLOY PRODUÇÃO CONCLUÍDO COM SUCESSO!"
    log "========================================"
    info "Backup antes: $backup_dir"
    info "Backup depois: $post_backup_dir"
    info "VPS IP: $VPS_IP"
    warning "PRÓXIMOS PASSOS:"
    warning "1. Configure o SSL certificado para seu domínio"
    warning "2. Atualize 'seu-dominio.com' no nginx.prod.conf"
    warning "3. Teste todas as funcionalidades"
    warning "4. Configure monitoramento e alertas"
    warning "5. Agende backups automáticos"
    log "========================================"
else
    error "========================================"
    error "❌ DEPLOY COM PROBLEMAS!"
    error "========================================"
    error "Verifique os logs dos serviços com problemas"
    error "Comando: docker-compose -f docker-compose.prod.yml logs -f [serviço]"
    exit 1
fi
