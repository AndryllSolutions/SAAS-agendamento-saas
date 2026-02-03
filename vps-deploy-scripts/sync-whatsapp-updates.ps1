# Sync WhatsApp Marketing Updates to VPS
# Deploy backend changes for WhatsApp Marketing module

Write-Host "=== Sync WhatsApp Marketing Updates ==="

# 1) Sync backend files
Write-Host "Syncing backend files..."
rsync -avz -e "ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=3" `
    ./backend/app/models/whatsapp_automated_campaigns.py `
    ./backend/app/schemas/whatsapp_automated_campaigns.py `
    ./backend/app/api/v1/endpoints/whatsapp_automated_campaigns.py `
    ./backend/alembic/versions/add_is_configured_to_whatsapp_automated_campaigns.py `
    ./backend/app/services/whatsappMarketingService.ts `
    root@72.62.138.239:/opt/saas/atendo/backend/app/

# 2) Sync frontend files
Write-Host "Syncing frontend files..."
rsync -avz -e "ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=3" `
    ./frontend/src/services/whatsappMarketingService.ts `
    ./frontend/src/app/whatsapp-marketing/page.tsx `
    root@72.62.138.239:/opt/saas/atendo/frontend/src/

# 3) Run database migration
Write-Host "Running database migration..."
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head"

# 4) Restart backend container
Write-Host "Restarting backend container..."
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart backend"

# 5) Rebuild and restart frontend
Write-Host "Rebuilding frontend..."
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml build --no-cache frontend"
ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml up -d frontend"

# 6) Health checks
Write-Host "Running health checks..."
try {
    $r = ssh root@72.62.138.239 "curl -f -s http://localhost/api/health"
    if ($r -match "healthy") {
        Write-Host "✅ Backend health check passed"
    } else {
        Write-Host "❌ Backend health check failed"
    }
} catch {
    Write-Host "❌ Backend health check failed - $($_.Exception.Message)"
}

try {
    $r = ssh root@72.62.138.239 "curl -f -s http://localhost/api/api/v1/health"
    if ($r -match "healthy") {
        Write-Host "✅ Backend API v1 health check passed"
    } else {
        Write-Host "❌ Backend API v1 health check failed"
    }
} catch {
    Write-Host "❌ Backend API v1 health check failed - $($_.Exception.Message)"
}

# 7) Check WhatsApp endpoint
Write-Host "Checking WhatsApp endpoint..."
try {
    $r = ssh root@72.62.138.239 "curl -f -s http://localhost/api/api/v1/whatsapp-marketing/automated-campaigns"
    if ($r -match "UNAUTHORIZED") {
        Write-Host "✅ WhatsApp endpoint accessible (requires auth - expected)"
    } else {
        Write-Host "⚠️ WhatsApp endpoint response unexpected: $r"
    }
} catch {
    Write-Host "❌ WhatsApp endpoint check failed - $($_.Exception.Message)"
}

Write-Host "=== WhatsApp Marketing Updates Complete ==="
