# Deploy Rebranding Atendo para VPS
# Sincroniza alteracoes do frontend e rebuild do container

Write-Host "=== Deploy Rebranding Atendo para VPS ===" -ForegroundColor Cyan

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

# 1) Sincronizar arquivos do frontend
Write-Host "`n[1/4] Sincronizando arquivos do frontend..." -ForegroundColor Yellow

# Criar lista de arquivos alterados
$frontendFiles = @(
    "frontend/src/components/Sidebar.tsx",
    "frontend/src/app/news/page.tsx",
    "frontend/src/app/register/page.tsx",
    "frontend/src/app/layout.tsx",
    "frontend/public/favicon.svg",
    "frontend/public/favicon.ico",
    "frontend/public/README_FAVICON.md",
    "frontend/app/icon.tsx"
)

Write-Host "Sincronizando arquivos modificados..." -ForegroundColor Gray

foreach ($file in $frontendFiles) {
    $localPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $localPath) {
        $remotePath = "${VPS_USER}@${VPS_IP}:${VPS_PATH}/$file"
        Write-Host "  - $file" -ForegroundColor DarkGray
        scp $localPath $remotePath
    } else {
        Write-Host "  ! Arquivo nao encontrado: $file" -ForegroundColor Red
    }
}

# 2) Rebuild do container frontend
Write-Host "`n[2/4] Rebuild do container frontend no VPS..." -ForegroundColor Yellow

$rebuildScript = @"
cd $VPS_PATH
echo "Parando container frontend..."
docker compose -f docker-compose.prod.yml stop frontend

echo "Rebuild do frontend..."
docker compose -f docker-compose.prod.yml build frontend

echo "Iniciando container frontend..."
docker compose -f docker-compose.prod.yml up -d frontend

echo "Aguardando container inicializar..."
sleep 10

echo "Status dos containers:"
docker compose -f docker-compose.prod.yml ps
"@

Write-Host "Executando rebuild no VPS..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_IP}" $rebuildScript

# 3) Validar deployment
Write-Host "`n[3/4] Validando deployment..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://${VPS_IP}/" -TimeoutSec 15
    if ($response.Content -match "Atendo") {
        Write-Host "  OK Frontend acessivel e com novo branding 'Atendo'" -ForegroundColor Green
    } else {
        Write-Host "  AVISO Frontend acessivel mas branding nao detectado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERRO Frontend nao acessivel: $($_.Exception.Message)" -ForegroundColor Red
}

# 4) Verificar favicon
Write-Host "`n[4/4] Verificando favicon..." -ForegroundColor Yellow

try {
    $faviconResponse = Invoke-WebRequest -UseBasicParsing -Uri "http://${VPS_IP}/favicon.svg" -TimeoutSec 10
    if ($faviconResponse.StatusCode -eq 200) {
        Write-Host "  OK Favicon SVG acessivel" -ForegroundColor Green
    }
} catch {
    Write-Host "  AVISO Favicon SVG nao acessivel (pode estar em cache)" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n=== Deploy Concluido ===" -ForegroundColor Cyan
Write-Host "Frontend: http://${VPS_IP}/" -ForegroundColor White
Write-Host "Backend: http://${VPS_IP}/api/health" -ForegroundColor White
Write-Host "`nLimpe o cache do navegador para ver o novo favicon!" -ForegroundColor Yellow
