# Script Rapido de Deploy RLS + Observabilidade
# Executa migrations e reinicia apenas os servicos necessarios

Write-Host "[RLS] Aplicando RLS + Observabilidade..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Docker nao esta rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Opção 1: Reinicialização limpa (recomendado)
Write-Host "Escolha uma opção:" -ForegroundColor Yellow
Write-Host "1. Reinicialização limpa (parar tudo e subir novamente)" -ForegroundColor White
Write-Host "2. Apenas aplicar migrations (mantém containers rodando)" -ForegroundColor White
Write-Host "3. Reinicializacao completa + limpar volumes (AVISO: PERDE DADOS)" -ForegroundColor Red
Write-Host ""
$choice = Read-Host "Digite 1, 2 ou 3"

if ($choice -eq "3") {
    Write-Host ""
    Write-Host "[AVISO] ATENCAO: Isso vai APAGAR TODOS OS DADOS!" -ForegroundColor Red
    $confirm = Read-Host "Tem certeza? (digite SIM para confirmar)"
    if ($confirm -ne "SIM") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
    Write-Host "[INFO] Removendo tudo..." -ForegroundColor Red
    docker-compose down -v
    Start-Sleep -Seconds 3
    $choice = "1"  # Continuar com reinicialização limpa
}

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "[INFO] Parando containers..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host ""
    Write-Host "[INFO] Subindo servicos..." -ForegroundColor Green
    
    # Subir banco primeiro
    docker-compose up -d db
    Write-Host "   [WAIT] Aguardando PostgreSQL..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    # Subir Redis e RabbitMQ
    docker-compose up -d redis rabbitmq
    Write-Host "   [WAIT] Aguardando Redis e RabbitMQ..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
    
    # Subir backend (vai rodar migrations automaticamente)
    Write-Host ""
    Write-Host "   [RLS] Iniciando Backend (aplicando migrations RLS)..." -ForegroundColor Cyan
    docker-compose up -d backend
    
    Write-Host "   [WAIT] Aplicando migrations..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Verificar se migrations foram aplicadas
    Write-Host ""
    Write-Host "[INFO] Verificando migrations:" -ForegroundColor Cyan
    docker-compose exec -T backend alembic current
    
    # Subir resto dos serviços
    docker-compose up -d celery_worker celery_beat frontend nginx
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "[INFO] Aplicando migrations..." -ForegroundColor Cyan
    
    # Verificar se backend está rodando
    $backendRunning = docker-compose ps backend | Select-String "Up"
    if (-not $backendRunning) {
        Write-Host "[ERRO] Backend nao esta rodando. Use opcao 1 para iniciar." -ForegroundColor Red
        exit 1
    }
    
    # Aplicar migrations
    docker-compose exec backend alembic upgrade head
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Migrations aplicadas!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[INFO] Reiniciando backend para ativar observabilidade..." -ForegroundColor Cyan
        docker-compose restart backend celery_worker celery_beat
        Start-Sleep -Seconds 8
    } else {
        Write-Host ""
        Write-Host "[ERRO] Erro ao aplicar migrations." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERRO] Opcao invalida." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Deploy concluido!" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "[INFO] Status dos containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "[TEST] Testando endpoints:" -ForegroundColor Cyan

# Testar health check
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "   [OK] Health Check: OK" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Health Check: FALHOU" -ForegroundColor Red
}

# Testar metrics
try {
    $metrics = Invoke-WebRequest -Uri "http://localhost:8000/metrics" -TimeoutSec 5 -UseBasicParsing
    Write-Host "   [OK] Metrics: OK (Prometheus ativo)" -ForegroundColor Green
} catch {
    Write-Host "   [WAIT] Metrics: Aguardando backend iniciar..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[INFO] URLs Disponiveis:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Metricas: http://localhost:8000/metrics" -ForegroundColor White
Write-Host "   Health: http://localhost:8000/health" -ForegroundColor White
Write-Host ""

Write-Host "[INFO] Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Teste RLS: cd backend && pytest tests/test_rls.py -v" -ForegroundColor Gray
Write-Host "   2. Ver logs: docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "   3. Consulte: RLS_OBSERVABILITY_GUIDE.md" -ForegroundColor Gray
Write-Host ""
