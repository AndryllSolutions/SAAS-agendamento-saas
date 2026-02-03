# PowerShell Script para Configurar Docker SAAS na VPS
# Uso: .\setup-docker-saas.ps1 [caminho-projeto]

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = "/opt/saas/atendo"
)

# Cores
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Função de log
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    Write-Host $logMessage -ForegroundColor $Colors[$Color]
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log $Message "Red"
}

function Write-SuccessLog {
    param([string]$Message)
    Write-Log $Message "Green"
}

function Write-WarningLog {
    param([string]$Message)
    Write-Log $Message "Yellow"
}

function Write-InfoLog {
    param([string]$Message)
    Write-Log $Message "Blue"
}

# Verificar se está executando como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-ErrorLog "Este script precisa ser executado como Administrador"
    exit 1
}

Write-SuccessLog "Iniciando configuração Docker para SAAS"
Write-InfoLog "Projeto: $ProjectPath"

# Conectar à VPS primeiro
Write-SuccessLog "Conectando à VPS para configurar Docker..."
$sshCommand = "ssh root@72.62.138.239"

# Script para executar na VPS
$dockerSetupScript = @"
#!/bin/bash

# Configurações
PROJECT_PATH="$ProjectPath"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] \$1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: \$1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: \$1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: \$1${NC}"
}

log "Iniciando configuração Docker para SAAS na VPS"
info "Projeto: \$PROJECT_PATH"

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

log "Docker: \$(docker --version)"
log "Docker Compose: \$(docker-compose --version)"

# 2. Verificar status do serviço Docker
log "Verificando status do serviço Docker..."
if ! systemctl is-active --quiet docker; then
    log "Iniciando serviço Docker..."
    systemctl start docker
    systemctl enable docker
fi

log "Status Docker: \$(systemctl is-active docker)"

# 3. Verificar se o diretório do projeto existe
if [ ! -d "\$PROJECT_PATH" ]; then
    error "Diretório do projeto não encontrado: \$PROJECT_PATH"
    exit 1
fi

cd \$PROJECT_PATH

# 4. Criar estrutura de diretórios para volumes
log "Criando estrutura de diretórios para volumes Docker..."
mkdir -p data/{postgres,redis,rabbitmq,uploads}
mkdir -p logs/{nginx,backend,frontend,celery}
mkdir -p backups/{database,files,config}
mkdir -p ssl/{certbot,certificates}

# 5. Configurar permissões dos diretórios
log "Configurando permissões..."
chmod 755 data
chmod 755 logs
chmod 755 backups
chmod 700 ssl

# 6. Verificar e preparar arquivos de configuração
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

# 8. Limpar ambiente Docker
log "Limpando ambiente Docker..."
docker system prune -f
docker volume prune -f

# 9. Build das imagens
log "Construindo imagens Docker..."
docker-compose build --no-cache

# 10. Iniciar serviços de infraestrutura
log "Iniciando serviços de infraestrutura..."
docker-compose up -d db redis rabbitmq

# 11. Aguardar serviços
log "Aguardando serviços de infraestrutura..."
sleep 30

# 12. Verificar saúde dos serviços
log "Verificando saúde dos serviços..."
for service in db redis rabbitmq; do
    if docker-compose ps \$service | grep -q "Up"; then
        log "✅ \$service está rodando"
    else
        error "❌ \$service não está rodando"
        docker-compose logs \$service
    fi
done

# 13. Iniciar backend
log "Iniciando backend..."
docker-compose up -d backend

# 14. Aguardar backend
sleep 20

# 15. Iniciar frontend
log "Iniciando frontend..."
docker-compose up -d frontend

# 16. Aguardar frontend
sleep 15

# 17. Iniciar serviços adicionais
log "Iniciando serviços adicionais..."
docker-compose up -d celery_worker celery_beat nginx

# 18. Status final
log "========================================"
log "STATUS FINAL DOS SERVIÇOS:"
log "========================================"
docker-compose ps

# 19. Obter IP da VPS
VPS_IP=\$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')

# 20. URLs de acesso
log "========================================"
log "URLS DE ACESSO:"
log "========================================"
log "Frontend: http://\$VPS_IP:3001"
log "Backend API: http://\$VPS_IP:8001"
log "Nginx (se configurado): http://\$VPS_IP:80"
log "RabbitMQ Management: http://\$VPS_IP:15672"
log ""
log "COMANDOS ÚTEIS:"
log "Verificar logs: docker-compose logs -f [serviço]"
log "Reiniciar serviço: docker-compose restart [serviço]"
log "Parar tudo: docker-compose down"
log "Verificar uso: docker stats"
log "========================================"

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
"@

# Executar script na VPS
Write-SuccessLog "Enviando e executando script de configuração Docker na VPS..."
try {
    $result = ssh root@72.62.138.239 $dockerSetupScript 2>&1
    Write-Host $result
    
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Configuração Docker concluída com sucesso na VPS!"
    } else {
        Write-WarningLog "Possíveis problemas na configuração Docker"
    }
} catch {
    Write-ErrorLog "Erro ao configurar Docker na VPS: $_"
}

# Verificar status final
Write-SuccessLog "Verificando status final dos serviços..."
try {
    $statusCheck = ssh root@72.62.138.239 "cd $ProjectPath && docker-compose ps"
    Write-Host $statusCheck
} catch {
    Write-WarningLog "Não foi possível verificar o status final"
}

Write-SuccessLog "========================================"
Write-SuccessLog "PROCESSO CONCLUÍDO!"
Write-SuccessLog "========================================"
Write-InfoLog "Acesse a VPS para verificar: ssh root@72.62.138.239"
Write-InfoLog "Projeto: $ProjectPath"
Write-WarningLog "Próximos passos:"
Write-WarningLog "1. Acessar VPS: ssh root@72.62.138.239"
Write-WarningLog "2. Verificar logs: cd $ProjectPath && docker-compose logs -f"
Write-WarningLog "3. Editar .env: nano $ProjectPath/.env"
Write-WarningLog "4. Testar aplicação"
Write-SuccessLog "========================================"
