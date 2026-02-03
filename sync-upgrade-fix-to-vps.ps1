# Script para sincronizar as correcoes de upgrade para VPS
Write-Host "=== Sincronizando correcoes de upgrade para VPS ==="

# 1. Sincronizar backend
Write-Host "Syncing backend files..."
scp -r ./backend/app root@72.62.138.239:/opt/saas/atendo/backend/
scp -r ./backend/alembic root@72.62.138.239:/opt/saas/atendo/backend/
scp -r ./backend/requirements.txt root@72.62.138.239:/opt/saas/atendo/backend/

# 2. Sincronizar frontend
Write-Host "Syncing frontend files..."
scp -r ./frontend/src root@72.62.138.239:/opt/saas/atendo/frontend/
scp -r ./frontend/package.json root@72.62.138.239:/opt/saas/atendo/frontend/
scp -r ./frontend/next.config.js root@72.62.138.239:/opt/saas/atendo/frontend/
scp -r ./frontend/Dockerfile root@72.62.138.239:/opt/saas/atendo/frontend/

# 3. Sincronizar docker configs
Write-Host "Syncing docker configs..."
scp ./docker-compose.prod.yml root@72.62.138.239:/opt/saas/atendo/
scp -r ./docker root@72.62.138.239:/opt/saas/atendo/

# 4. Build e restart containers
Write-Host "Building and restarting containers..."
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml build"
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml up -d"

# 5. Aguardar containers
Write-Host "Waiting for containers to start..."
Start-Sleep -Seconds 20

# 6. Validar deploy
Write-Host "Validating deployment..."
try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://72.62.138.239/" -TimeoutSec 15
    if ($r.Content -match "html") {
        Write-Host "✅ Frontend OK"
    } else {
        Write-Host "❌ Frontend ERROR"
    }
} catch {
    Write-Host "❌ Frontend ERROR - $($_.Exception.Message)"
}

try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://72.62.138.239/api/health" -TimeoutSec 15
    if ($r.Content -match "healthy") {
        Write-Host "✅ Backend OK"
    } else {
        Write-Host "❌ Backend ERROR"
    }
} catch {
    Write-Host "❌ Backend ERROR - $($_.Exception.Message)"
}

Write-Host "=== Deploy Finalizado ==="
Write-Host "Teste o upgrade em: http://72.62.138.239/plans"
