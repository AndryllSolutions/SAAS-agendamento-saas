# Script para iniciar serviços com verificação de configuração (Windows PowerShell)

Write-Host "🚀 Iniciando serviços SaaS com verificação de configuração" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar arquivo .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️ Arquivo .env não encontrado. Copiando do .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "📝 Por favor, edite o arquivo .env com suas configurações antes de continuar." -ForegroundColor Yellow
    Write-Host "   - Altere as senhas padrão" -ForegroundColor Yellow
    Write-Host "   - Configure suas chaves de API" -ForegroundColor Yellow
    Write-Host "   - Ajuste as URLs para seu ambiente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para continuar ou Ctrl+C para cancelar"
}

# Parar serviços existentes
Write-Host "🛑 Parando serviços existentes..." -ForegroundColor Yellow
docker-compose down -v

# Construir imagens
Write-Host "🔨 Construindo imagens Docker..." -ForegroundColor Yellow
docker-compose build --no-cache

# Iniciar serviços na ordem correta
Write-Host "📦 Iniciando serviços na ordem correta..." -ForegroundColor Blue

# 1. Banco de dados e cache
Write-Host "   1. Iniciando PostgreSQL, Redis e RabbitMQ..." -ForegroundColor Blue
docker-compose up -d db redis rabbitmq

# Aguardar serviços estarem prontos
Write-Host "⏳ Aguardando serviços estarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar saúde dos serviços
Write-Host "🔍 Verificando saúde dos serviços..." -ForegroundColor Yellow
docker-compose ps

# 2. Backend API
Write-Host "   2. Iniciando Backend API..." -ForegroundColor Blue
docker-compose up -d backend

# Aguardar backend
Start-Sleep -Seconds 15

# 3. Workers Celery
Write-Host "   3. Iniciando Workers Celery..." -ForegroundColor Blue
docker-compose up -d celery_worker celery_beat

# 4. Frontend
Write-Host "   4. Iniciando Frontend..." -ForegroundColor Blue
docker-compose up -d frontend

# 5. Nginx
Write-Host "   5. Iniciando Nginx..." -ForegroundColor Blue
docker-compose up -d nginx

# Aguardar todos os serviços
Write-Host "⏳ Aguardando todos os serviços estarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Verificar status final
Write-Host "📊 Status final dos serviços:" -ForegroundColor Green
docker-compose ps

# Verificar configuração do Celery
Write-Host "🔧 Verificando configuração do Celery..." -ForegroundColor Yellow
try {
    docker-compose exec backend python scripts/check_celery_config.py
} catch {
    Write-Host "⚠️ Não foi possível verificar a configuração do Celery (pode ser normal no primeiro start)" -ForegroundColor Yellow
}

# Mostrar URLs de acesso
Write-Host ""
Write-Host "🌐 URLs de acesso:" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8001" -ForegroundColor White
Write-Host "   RabbitMQ Management: http://localhost:15672 (admin/rabbitmq_secure_password_change_me)" -ForegroundColor White
Write-Host "   Nginx (produção): http://localhost:80" -ForegroundColor White
Write-Host ""
Write-Host "📝 Logs úteis:" -ForegroundColor Cyan
Write-Host "   Verificar logs do Celery: docker-compose logs -f celery_worker" -ForegroundColor White
Write-Host "   Verificar logs do RabbitMQ: docker-compose logs -f rabbitmq" -ForegroundColor White
Write-Host "   Verificar logs do Redis: docker-compose logs -f redis" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Serviços iniciados com sucesso!" -ForegroundColor Green
Write-Host "   Use docker-compose logs -f [servico] para acompanhar os logs" -ForegroundColor Cyan
Write-Host "   Use docker-compose down para parar todos os serviços" -ForegroundColor Cyan
