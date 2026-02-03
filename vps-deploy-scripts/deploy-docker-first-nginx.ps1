# Deploy Docker-first Nginx (Opção B)
# - Para Nginx do host e sobe container Nginx na porta 80/443
# - Roteamento: / -> frontend, /api/ -> backend, /api/v1/ -> backend

Write-Host "=== Docker-first Nginx Deploy ==="

# 0) Garantir diretório no VPS
Write-Host "Ensuring remote directory exists..."
ssh root@72.62.138.239 "mkdir -p /opt/saas/atendo"

# 1) Parar Nginx do host (se existir)
Write-Host "Stopping host nginx (if running)..."
try { ssh root@72.62.138.239 "systemctl stop nginx || true" } catch { $_ }
try { ssh root@72.62.138.239 "systemctl disable nginx || true" } catch { $_ }

# 2) Copiar arquivos para o VPS
Write-Host "Syncing files to VPS..."
if (Test-Path "./.env.production") {
    scp -r ./docker-compose.prod.yml ./.env.production ./docker ./vps-deploy-scripts/deploy-docker-first-nginx.sh root@72.62.138.239:/opt/saas/atendo/
} else {
    scp -r ./docker-compose.prod.yml ./docker ./vps-deploy-scripts/deploy-docker-first-nginx.sh root@72.62.138.239:/opt/saas/atendo/
}

# 3) Executar script no VPS
Write-Host "Running deploy script on VPS..."
ssh root@72.62.138.239 "cd /opt/saas/atendo && chmod +x deploy-docker-first-nginx.sh && ./deploy-docker-first-nginx.sh"

# 4) Validar externamente
Write-Host "Validating from external..."
try {
    $r = ssh root@72.62.138.239 "curl -f -s -L -k https://localhost/ | head -c 200"
    if ($r -match "html") {
        Write-Host "OK: Frontend accessible on /"
    } else {
        Write-Host "ERROR: Frontend NOT accessible on /"
    }
} catch {
    Write-Host "ERROR: Frontend NOT accessible on / - $($_.Exception.Message)"
}

try {
    $r = ssh root@72.62.138.239 "curl -f -s -L -k https://localhost/api/health"
    if ($r -match "healthy") {
        Write-Host "OK: Backend accessible on /api/health"
    } else {
        Write-Host "ERROR: Backend NOT accessible on /api/health"
    }
} catch {
    Write-Host "ERROR: Backend NOT accessible on /api/health - $($_.Exception.Message)"
}

try {
    $r = ssh root@72.62.138.239 "curl -f -s -L -k https://localhost/api/v1/health"
    if ($r -match "healthy") {
        Write-Host "OK: Backend accessible on /api/v1/health (compativel com frontend)"
    } else {
        Write-Host "ERROR: Backend NOT accessible on /api/v1/health"
    }
} catch {
    Write-Host "ERROR: Backend NOT accessible on /api/v1/health - $($_.Exception.Message)"
}

Write-Host "=== Docker-first Nginx Deploy Complete ==="
