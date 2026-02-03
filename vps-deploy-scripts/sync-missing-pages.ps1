# Script para sincronizar todas as páginas TSX faltantes na VPS
Write-Host "=== Sincronizando Páginas TSX Faltantes ==="

$localPath = "e:\agendamento_SAAS\frontend\src\app"
$vpsPath = "/opt/saas/atendo/frontend/src/app"

# Obter todas as páginas locais
$localPages = Get-ChildItem -Path $localPath -Recurse -Filter "page.tsx" | ForEach-Object { $_.FullName.Replace($localPath, "").Replace("\", "/").TrimStart("/") }

# Obter páginas existentes na VPS
$vpsPages = ssh -o StrictHostKeyChecking=no root@72.62.138.239 "cd $vpsPath && find . -name 'page.tsx' | sed 's|^\./||'"

$pagesArray = $vpsPages -split "`n"
$missingPages = @()

foreach ($page in $localPages) {
    if ($page -notin $pagesArray) {
        $missingPages += $page
    }
}

Write-Host "Páginas locais: $($localPages.Count)"
Write-Host "Páginas na VPS: $($pagesArray.Count)"
Write-Host "Páginas faltantes: $($missingPages.Count)"

if ($missingPages.Count -gt 0) {
    Write-Host "`n=== Sincronizando páginas faltantes ==="
    
    foreach ($page in $missingPages) {
        $localFile = "$localPath\$($page.Replace('/', '\'))"
        $remoteFile = "$vpsPath/$page"
        $remoteDir = Split-Parent $remoteFile
        
        Write-Host "Sincronizando: $page"
        
        # Criar diretório remoto se não existir
        ssh -o StrictHostKeyChecking=no root@72.62.138.239 "mkdir -p '$remoteDir'"
        
        # Copiar arquivo
        scp -o StrictHostKeyChecking=no $localFile root@72.62.138.239:$remoteFile
    }
    
    Write-Host "`n=== Reconstruindo Frontend ==="
    ssh -o StrictHostKeyChecking=no root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml stop frontend && docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d frontend"
    
    Write-Host "=== Reiniciando Nginx ==="
    ssh -o StrictHostKeyChecking=no root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart nginx"
    
    Write-Host "`n=== Verificação Final ==="
    $finalCount = ssh -o StrictHostKeyChecking=no root@72.62.138.239 "cd $vpsPath && find . -name 'page.tsx' | wc -l"
    Write-Host "Total de páginas na VPS após sincronização: $finalCount"
} else {
    Write-Host "Todas as páginas já estão sincronizadas!"
}

Write-Host "=== Sincronização Concluída ==="
