#!/bin/bash

# Script de Configuração Docker para SAAS na VPS
# Uso: ./setup-docker-saas.sh [caminho-projeto]

set -e

PROJECT_PATH=${1:-/opt/saas/atendo}

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

# Verificar se o diretório do projeto existe
if [ ! -d "$PROJECT_PATH" ]; then
    error "Diretório do projeto não encontrado: $PROJECT_PATH"
    exit 1
fi

log "Iniciando configuração Docker para SAAS"
info "Projeto: $PROJECT_PATH"

# 1. Verificar instalação Docker
log "Verificando instalação Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado"
    exit 1
fi

log "Docker: $(docker --version)"
log "Docker Compose: $(docker-compose --version)"

# 2. Verificar status do serviço Docker
log "Verificando status do serviço Docker..."
if ! systemctl is-active --quiet docker; then
    log "Iniciando serviço Docker..."
    systemctl start docker
    systemctl enable docker
fi

log "Status Docker: $(systemctl is-active docker)"

# 3. Adicionar usuário ao grupo docker (se não for root)
if [ "$SUDO_USER" != "" ] && [ "$SUDO_USER" != "root" ]; then
    log "Adicionando usuário $SUDO_USER ao grupo docker..."
    usermod -aG docker $SUDO_USER
    warning "Será necessário fazer logout/login para as permissões surtirem efeito"
fi

# 4. Criar estrutura de diretórios para volumes
log "Criando estrutura de diretórios para volumes Docker..."
mkdir -p $PROJECT_PATH/data/{postgres,redis,rabbitmq,uploads}
mkdir -p $PROJECT_PATH/logs/{nginx,backend,frontend,celery}
mkdir -p $PROJECT_PATH/backups/{database,files,config}
mkdir -p $PROJECT_PATH/ssl/{certbot,certificates}

# 5. Configurar permissões dos diretórios
log "Configurando permissões..."
chmod 755 $PROJECT_PATH/data
chmod 755 $PROJECT_PATH/logs
chmod 755 $PROJECT_PATH/backups
chmod 700 $PROJECT_PATH/ssl

# 6. Verificar e preparar arquivos de configuração
cd $PROJECT_PATH

# Verificar docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    warning "docker-compose.yml não encontrado. Verificando alternativas..."
    if [ -f "docker-compose.prod.yml" ]; then
        info "Encontrado docker-compose.prod.yml"
        cp docker-compose.prod.yml docker-compose.yml
    else
        error "Nenhum arquivo docker-compose encontrado"
        exit 1
    fi
fi

# Verificar .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log "Criando .env a partir do .env.example"
        cp .env.example .env
        warning "⚠️  EDITE O ARQUIVO .env COM SUAS CONFIGURAÇÕES!"
    else
        error "Arquivo .env.example não encontrado"
        exit 1
    fi
fi

# 7. Verificar Dockerfiles
log "Verificando Dockerfiles..."
if [ ! -f "backend/Dockerfile" ]; then
    error "Dockerfile do backend não encontrado"
    exit 1
fi

if [ ! -f "frontend/Dockerfile" ]; then
    error "Dockerfile do frontend não encontrado"
    exit 1
fi

# 8. Limpar imagens e containers antigos (opcional)
log "Limpando ambiente Docker (opcional)..."
docker system prune -f
docker volume prune -f

# 9. Build das imagens
log "Construindo imagens Docker..."
docker-compose build --no-cache

# 10. Verificar configuração de portas
log "Verificando configuração de portas..."

# Portas que serão usadas
ports=("80:80" "443:443" "3001:3000" "8001:8000" "5433:5432" "6379:6379" "5672:5672" "15672:15672")

for port in "${ports[@]}"; do
    IFS=':' read -r host_port container_port <<< "$port"
    if netstat -tuln | grep -q ":$host_port "; then
        warning "Porta $host_port já está em uso"
    else
        log "Porta $host_port está livre"
    fi
done

# 11. Criar rede Docker
log "Criando rede Docker..."
docker network create saas_network 2>/dev/null || true

# 12. Iniciar serviços de infraestrutura primeiro
log "Iniciando serviços de infraestrutura..."
docker-compose up -d db redis rabbitmq

# 13. Aguardar serviços ficarem prontos
log "Aguardando serviços de infraestrutura..."
sleep 30

# 14. Verificar saúde dos serviços
log "Verificando saúde dos serviços..."
for service in db redis rabbitmq; do
    if docker-compose ps $service | grep -q "Up"; then
        log "✅ $service está rodando"
    else
        error "❌ $service não está rodando"
        docker-compose logs $service
    fi
done

# 15. Iniciar backend
log "Iniciando backend..."
docker-compose up -d backend

# 16. Aguardar backend
sleep 20

# 17. Verificar backend
if docker-compose ps backend | grep -q "Up"; then
    log "✅ Backend está rodando"
else
    error "❌ Backend não está rodando"
    docker-compose logs backend
fi

# 18. Iniciar frontend
log "Iniciando frontend..."
docker-compose up -d frontend

# 19. Aguardar frontend
sleep 15

# 20. Verificar frontend
if docker-compose ps frontend | grep -q "Up"; then
    log "✅ Frontend está rodando"
else
    error "❌ Frontend não está rodando"
    docker-compose logs frontend
fi

# 21. Iniciar serviços adicionais
log "Iniciando serviços adicionais..."
docker-compose up -d celery_worker celery_beat nginx

# 22. Status final
log "========================================"
log "STATUS FINAL DOS SERVIÇOS:"
log "========================================"
docker-compose ps

# 23. Verificar logs de erros
log "Verificando logs de erros..."
for service in backend frontend db redis rabbitmq; do
    error_count=$(docker-compose logs $service 2>&1 | grep -i error | wc -l)
    if [ $error_count -gt 0 ]; then
        warning "⚠️  Encontrados $error_count erros no serviço $service"
    fi
done

# 24. URLs de acesso
log "========================================"
log "URLS DE ACESSO:"
log "========================================"
log "Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):3001"
log "Backend API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):8001"
log "Nginx (se configurado): http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):80"
log "RabbitMQ Management: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):15672"
log ""
log "COMANDOS ÚTEIS:"
log "Verificar logs: docker-compose logs -f [serviço]"
log "Reiniciar serviço: docker-compose restart [serviço]"
log "Parar tudo: docker-compose down"
log "Verificar uso: docker stats"
log "========================================"

# 25. Testes de conectividade
log "Testando conectividade..."
sleep 10

# Testar backend
if curl -f -s http://localhost:8001/health > /dev/null 2>&1; then
    log "✅ Backend API respondendo"
else
    warning "⚠️  Backend API não respondendo (pode ser normal no início)"
fi

# Testar frontend
if curl -f -s http://localhost:3001 > /dev/null 2>&1; then
    log "✅ Frontend respondendo"
else
    warning "⚠️  Frontend não respondendo (pode ser normal no início)"
fi

log "========================================"
log "CONFIGURAÇÃO DOCKER CONCLUÍDA!"
log "========================================"
warning "PRÓXIMOS PASSOS:"
warning "1. Configure o .env com suas credenciais"
warning "2. Verifique os logs: docker-compose logs -f"
warning "3. Teste as URLs acima"
warning "4. Configure SSL/Nginx se necessário"
warning "5. Configure backup e monitoramento"
log "========================================"
