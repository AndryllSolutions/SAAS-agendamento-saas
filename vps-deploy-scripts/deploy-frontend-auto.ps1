# Deploy Frontend com Auto-Restart do Nginx
# Solucao permanente para problema de DNS/IP do Nginx

Write-Host "=== Deploy Frontend com Auto-Restart Nginx ===" -ForegroundColor Cyan

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

Write-Host "`n[1/4] Sincronizando codigo frontend..." -ForegroundColor Yellow

# Sincronizar diretorio frontend completo
scp -r ../frontend/src "${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/"
scp -r ../frontend/public "${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/"
scp ../frontend/package.json "${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/"

Write-Host "`n[2/4] Rebuild do container frontend..." -ForegroundColor Yellow

ssh "${VPS_USER}@${VPS_IP}" @"
cd ${VPS_PATH}
echo "Parando frontend..."
docker compose -f docker-compose.prod.yml stop frontend

echo "Build do frontend..."
docker compose -f docker-compose.prod.yml build frontend

echo "Iniciando frontend..."
docker compose -f docker-compose.prod.yml up -d frontend

echo "Aguardando frontend inicializar..."
sleep 10
"@

Write-Host "`n[3/4] Reiniciando Nginx (SOLUCAO PERMANENTE)..." -ForegroundColor Yellow

ssh "${VPS_USER}@${VPS_IP}" @"
cd ${VPS_PATH}
echo "Reiniciando Nginx para resolver novo IP do frontend..."
docker compose -f docker-compose.prod.yml restart nginx

echo "Aguardando Nginx..."
sleep 5

echo "Status dos containers:"
docker compose -f docker-compose.prod.yml ps | grep -E 'frontend|nginx'
"@

Write-Host "`n[4/4] Validando deployment..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "https://atendo.website/" -UseBasicParsing -TimeoutSec 15 -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Frontend acessivel (HTTPS 200)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERRO Frontend nao acessivel: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Deploy Concluido ===" -ForegroundColor Cyan
Write-Host "Frontend: https://atendo.website/" -ForegroundColor White
Write-Host "`nNginx foi reiniciado automaticamente para resolver novo IP!" -ForegroundColor Green
