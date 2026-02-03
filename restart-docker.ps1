# Script de Reinicializacao do Sistema Docker
# Aplica migrations RLS e reinicia todos os servicos

Write-Host "[RLS] Reiniciando Sistema SaaS Agendamento..." -ForegroundColor Cyan
Write-Host ""

# Parar todos os containers
Write-Host "[INFO] Parando containers..." -ForegroundColor Yellow
docker-compose down

# Remover volumes antigos (opcional - descomente para limpar dados)
# Write-Host "🗑️  Removendo volumes..." -ForegroundColor Yellow
# docker-compose down -v

Write-Host ""
Write-Host "[INFO] Iniciando containers..." -ForegroundColor Green

# Iniciar banco de dados primeiro
Write-Host "   [DB] PostgreSQL..." -ForegroundColor Gray
docker-compose up -d db

# Aguardar banco ficar pronto
Write-Host "   [WAIT] Aguardando PostgreSQL ficar pronto..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Iniciar Redis
Write-Host "   [CACHE] Redis..." -ForegroundColor Gray
docker-compose up -d redis

# Iniciar RabbitMQ
Write-Host "   [QUEUE] RabbitMQ..." -ForegroundColor Gray
docker-compose up -d rabbitmq

# Aguardar serviços ficarem prontos
Write-Host "   [WAIT] Aguardando servicos ficarem prontos..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Iniciar backend (vai rodar migrations automaticamente)
Write-Host ""
Write-Host "   [RLS] Backend (aplicando migrations RLS)..." -ForegroundColor Cyan
docker-compose up -d backend

# Aguardar backend processar migrations
Write-Host "   [WAIT] Aguardando migrations..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Iniciar Celery workers
Write-Host "   [WORKER] Celery Worker..." -ForegroundColor Gray
docker-compose up -d celery_worker

Write-Host "   [SCHEDULER] Celery Beat..." -ForegroundColor Gray
docker-compose up -d celery_beat

# Iniciar frontend
Write-Host "   [UI] Frontend..." -ForegroundColor Gray
docker-compose up -d frontend

# Iniciar Nginx
Write-Host "   [PROXY] Nginx..." -ForegroundColor Gray
docker-compose up -d nginx

Write-Host ""
Write-Host "[OK] Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Status dos containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "[INFO] Verificando logs do backend (migrations):" -ForegroundColor Cyan
docker-compose logs backend | Select-String -Pattern "alembic|migration|RLS" | Select-Object -Last 20

Write-Host ""
Write-Host "[INFO] URLs Disponiveis:" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Métricas: http://localhost:8000/metrics" -ForegroundColor White
Write-Host "   RabbitMQ: http://localhost:15672 (admin/senha)" -ForegroundColor White
Write-Host ""
Write-Host "[HELP] Para ver logs: docker-compose logs -f [servico]" -ForegroundColor Gray
Write-Host "[HELP] Para parar: docker-compose down" -ForegroundColor Gray
Write-Host ""
