# Script para abrir o sistema SAAS de agendamento no navegador

Write-Host "🚀 Iniciando Sistema SAAS de Agendamento..." -ForegroundColor Green
Write-Host ""

# Verificar se todos os containers estão rodando
$containers = docker-compose -f docker-compose.prod.yml ps --format json | ConvertFrom-Json

$healthyServices = @()
$unhealthyServices = @()

foreach ($container in $containers) {
    $serviceName = $container.Service
    $status = $container.State
    
    if ($status -like "*healthy*" -or $status -like "*running*") {
        $healthyServices += $serviceName
        Write-Host "✅ $serviceName : $status" -ForegroundColor Green
    } else {
        $unhealthyServices += $serviceName
        Write-Host "❌ $serviceName : $status" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Status: $($healthyServices.Count) serviços ativos, $($unhealthyServices.Count) com problemas" -ForegroundColor Cyan

if ($unhealthyServices.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Alguns serviços não estão saudáveis. Verifique os logs:" -ForegroundColor Yellow
    foreach ($service in $unhealthyServices) {
        Write-Host "   docker logs agendamento_${service}_prod" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🌐 Abrindo sistema no navegador..." -ForegroundColor Cyan

# Abrir URLs
$urls = @(
    "http://localhost",           # Frontend principal
    "http://localhost/health",   # Health check
    "http://localhost/api/v1/docs" # Documentação API (se disponível)
)

foreach ($url in $urls) {
    try {
        Start-Process $url
        Write-Host "✅ Aberto: $url" -ForegroundColor Green
        Start-Sleep -Milliseconds 500
    } catch {
        Write-Host "❌ Erro ao abrir: $url" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Verificar status: docker-compose -f docker-compose.prod.yml ps" -ForegroundColor Gray
Write-Host "   Verificar logs:   docker logs agendamento_backend_prod" -ForegroundColor Gray
Write-Host "   Reiniciar:        docker-compose -f docker-compose.prod.yml restart" -ForegroundColor Gray
Write-Host "   Parar:            docker-compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host ""
