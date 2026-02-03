# Comandos para executar na VPS após upload - PowerShell Script
# Execute via SSH: ssh root@72.62.138.239

Write-Host "=== Comandos VPS - DrawerStack ===" -ForegroundColor Green

# Conectar via SSH primeiro
Write-Host "1. Conectando via SSH..." -ForegroundColor Yellow
Write-Host "ssh root@72.62.138.239" -ForegroundColor White
Write-Host "Depois de conectar, execute os comandos abaixo:" -ForegroundColor Cyan

Write-Host ""
Write-Host "2. Entrar no diretório:" -ForegroundColor Yellow
Write-Host "cd /opt/saas/atendo" -ForegroundColor White

Write-Host ""
Write-Host "3. Fazer backup do .env atual:" -ForegroundColor Yellow
Write-Host "if [ -f .env ]; then cp .env .env.backup.$(date +%Y%m%d_%H%M%S); fi" -ForegroundColor White

Write-Host ""
Write-Host "4. Parar containers:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.prod.yml down" -ForegroundColor White

Write-Host ""
Write-Host "5. Build e subir containers:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.prod.yml build --no-cache" -ForegroundColor White
Write-Host "docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White

Write-Host ""
Write-Host "6. Verificar status:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.prod.yml ps" -ForegroundColor White

Write-Host ""
Write-Host "7. Verificar logs do backend:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.prod.yml logs -f --tail=50 backend" -ForegroundColor White

Write-Host ""
Write-Host "=== Deploy DrawerStack concluído! ===" -ForegroundColor Green
Write-Host "Acesse: https://seu-dominio.com/professionals" -ForegroundColor Cyan
