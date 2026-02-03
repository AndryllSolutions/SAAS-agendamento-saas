# Script para Atualizar VPS com Versão Completa do Frontend
# RESOLUÇÃO: Menu completo + Favicon + Funcionalidades

Write-Host "=== ATUALIZAÇÃO COMPLETA DA VPS ===" -ForegroundColor Cyan
Write-Host "Isto vai sincronizar TODAS as funcionalidades do ambiente local" -ForegroundColor Yellow

# Configurações
$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

# Arquivos CRÍTICOS que precisam ser sincronizados
$arquivosCriticos = @(
    "frontend/src/components/Sidebar.tsx",
    "frontend/src/app/layout.tsx", 
    "frontend/src/app/news/page.tsx",
    "frontend/src/app/register/page.tsx",
    "frontend/public/favicon.svg",
    "frontend/public/favicon.ico",
    "frontend/public/README_FAVICON.md",
    "frontend/src/components/ThemeProvider.tsx",
    "frontend/src/components/Providers.tsx",
    "frontend/src/components/AuthGuard.tsx"
)

Write-Host "`n🔧 ETAPA 1: Sincronizando arquivos críticos..." -ForegroundColor Green

foreach ($arquivo in $arquivosCriticos) {
    $localPath = Join-Path $PSScriptRoot $arquivo
    if (Test-Path $localPath) {
        $remotePath = "${VPS_USER}@${VPS_IP}:${VPS_PATH}/$arquivo"
        Write-Host "  ✓ Sincronizando: $arquivo" -ForegroundColor Gray
        
        # Criar diretório remoto se não existir
        $remoteDir = Split-Parent $remotePath
        ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $(Split-Parent $VPS_PATH/$arquivo)"
        
        # Copiar arquivo
        scp $localPath $remotePath
    } else {
        Write-Host "  ✗ Arquivo não encontrado: $arquivo" -ForegroundColor Red
    }
}

Write-Host "`n🐳 ETAPA 2: Reconstruindo container Docker..." -ForegroundColor Green

# Parar container
ssh "${VPS_USER}@${VPS_IP}" "cd $VPS_PATH && docker compose -f docker-compose.prod.yml stop frontend"
Write-Host "  ✓ Container frontend parado" -ForegroundColor Gray

# Reconstruir imagem
ssh "${VPS_USER}@${VPS_IP}" "cd $VPS_PATH && docker compose -f docker-compose.prod.yml build --no-cache frontend"
Write-Host "  ✓ Imagem frontend reconstruída" -ForegroundColor Gray

# Iniciar container
ssh "${VPS_USER}@${VPS_IP}" "cd $VPS_PATH && docker compose -f docker-compose.prod.yml up -d frontend"
Write-Host "  ✓ Container frontend iniciado" -ForegroundColor Gray

Write-Host "`n🔍 ETAPA 3: Verificando status..." -ForegroundColor Green

# Verificar saúde do container
ssh "${VPS_USER}@${VPS_IP}" "cd $VPS_PATH && docker compose -f docker-compose.prod.yml ps frontend"

Write-Host "`n✅ ATUALIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://$VPS_IP" -ForegroundColor Cyan
Write-Host "📋 Verifique:" -ForegroundColor Yellow
Write-Host "  - Menu lateral completo (9 seções)" -ForegroundColor Gray
Write-Host "  - Favicon personalizado" -ForegroundColor Gray
Write-Host "  - Todas as funcionalidades disponíveis" -ForegroundColor Gray
