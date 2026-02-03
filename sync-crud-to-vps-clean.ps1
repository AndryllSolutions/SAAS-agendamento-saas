# Script PowerShell para sincronizar apenas arquivos CRUD, services e core para VPS
# Execute: ./sync-crud-to-vps.ps1

Write-Host "Iniciando sincronizacao de arquivos CRUD para VPS..." -ForegroundColor Green

# Verificar se esta no diretorio correto
if (-not (Test-Path "backend")) {
    Write-Host "Erro: Execute este script da pasta raiz do projeto (onde esta a pasta 'backend')" -ForegroundColor Red
    exit 1
}

# Lista de pastas/arquivos para sincronizar
$pathsToSync = @(
    "backend/app/api/v1/endpoints/appointments.py",
    "backend/app/api/v1/endpoints/addons.py",
    "backend/app/api/v1/endpoints/commissions.py",
    "backend/app/api/v1/endpoints/notifications.py",
    "backend/app/api/v1/endpoints/push_notifications.py",
    "backend/app/api/v1/endpoints/saas_admin.py",
    "backend/app/api/v1/endpoints/whatsapp_automated_campaigns.py",
    "backend/app/api/v1/endpoints/uploads.py",
    "backend/app/api/v1/endpoints/standalone_services.py",
    "backend/app/api/v1/endpoints/global_settings.py",
    "backend/app/schemas/appointment.py",
    "backend/app/schemas/addon.py",
    "backend/app/schemas/commission.py",
    "backend/app/schemas/global_settings.py",
    "backend/app/schemas/notification.py",
    "backend/app/schemas/push_notification.py",
    "backend/app/schemas/standalone_service.py",
    "backend/app/models/global_settings.py",
    "backend/app/core/audit_helpers.py",
    "backend/app/services/audit_service.py"
)

Write-Host "Sincronizando arquivos para VPS..." -ForegroundColor Yellow

# Sincronizar cada arquivo
$successCount = 0
$totalCount = $pathsToSync.Count

foreach ($path in $pathsToSync) {
    $remotePath = "root@72.62.138.239:/opt/saas/atendo/$path"
    
    Write-Host "Sincronizando: $path" -ForegroundColor Cyan
    
    try {
        # Criar diretorio remoto se nao existir
        $remoteDir = Split-Path -Parent $remotePath
        $createDirCmd = "ssh root@72.62.138.239 'mkdir -p $remoteDir'"
        $null = Invoke-Expression $createDirCmd
        
        # Copiar arquivo
        $scpCmd = "scp -r `"$path`" `"$remotePath`""
        $null = Invoke-Expression $scpCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Sucesso" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  Falha" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  Erro ao sincronizar $path" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "Resumo da sincronizacao:" -ForegroundColor White
Write-Host "   Sucesso: $successCount/$totalCount arquivos" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($successCount -eq $totalCount) {
    Write-Host "Construindo imagem Docker..." -ForegroundColor Yellow
    
    try {
        $buildCmd = "ssh root@72.62.138.239 'cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml build'"
        $null = Invoke-Expression $buildCmd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build concluido com sucesso!" -ForegroundColor Green
            
            Write-Host "Reiniciando containers..." -ForegroundColor Yellow
            $restartCmd = "ssh root@72.62.138.239 'cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart'"
            $null = Invoke-Expression $restartCmd
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Deploy concluido com sucesso!" -ForegroundColor Green
                Write-Host "Verificando status dos containers..." -ForegroundColor Yellow
                
                $statusCmd = "ssh root@72.62.138.239 'cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml ps'"
                $null = Invoke-Expression $statusCmd
                
                Write-Host "Deploy finalizado!" -ForegroundColor Green
            } else {
                Write-Host "Erro ao reiniciar containers" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Erro no build da imagem Docker" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Erro durante o build/restart" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Alguns arquivos nao foram sincronizados. Verifique os erros acima." -ForegroundColor Yellow
}

Write-Host "Script concluido!" -ForegroundColor White
