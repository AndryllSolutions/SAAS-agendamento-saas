# MIGRAÇÃO VPS: Pages Router → App Router (PowerShell)
# Execute este script no PowerShell local

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

Write-Host "🚀 Iniciando migração VPS para App Router..." -ForegroundColor Green

# 1. Verificar estrutura atual
Write-Host "📋 1. Verificando estrutura atual do VPS..." -ForegroundColor Yellow
ssh root@$VPS_IP "cd $VPS_PATH/frontend/src && echo '=== PASTAS ===' && ls -la && echo '=== PAGES ===' && ls -la pages/ 2>/dev/null || echo 'Pasta pages não existe' && echo '=== APP ===' && ls -la app/ | head -10"

# 2. Backup completo do frontend
Write-Host "💾 2. Fazendo backup completo do frontend..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh root@$VPS_IP "cd $VPS_PATH && cp -r frontend frontend_backup_pages_router_$timestamp && echo 'Backup criado com sucesso'"

# 3. Remover pasta pages (se existir)
Write-Host "🗑️ 3. Removendo pasta pages do VPS..." -ForegroundColor Yellow
ssh root@$VPS_IP "cd $VPS_PATH/frontend/src && rm -rf pages/ && echo 'Pasta pages removida' || echo 'Pasta pages não existia'"

# 4. Limpar next.config.js (remover appDir)
Write-Host "🔧 4. Limpando configuração next.config.js..." -ForegroundColor Yellow
ssh root@$VPS_IP "cd $VPS_PATH/frontend && sed -i '/appDir: true/d' next.config.js && echo 'appDir removido do next.config.js'"

# 5. Sincronizar frontend atualizado (App Router)
Write-Host "📦 5. Sincronizando frontend atualizado (App Router)..." -ForegroundColor Yellow
Write-Host "   Enviando pasta app/ completa (45+ páginas)..." -ForegroundColor Cyan
scp -r "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/" root@$VPS_IP":$VPS_PATH/frontend/src/"

Write-Host "   Enviando next.config.js atualizado..." -ForegroundColor Cyan
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/next.config.js" root@$VPS_IP":$VPS_PATH/frontend/"

Write-Host "   Enviando arquivos críticos..." -ForegroundColor Cyan
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/layout.tsx" root@$VPS_IP":$VPS_PATH/frontend/src/app/"
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/globals.css" root@$VPS_IP":$VPS_PATH/frontend/src/app/"

# 6. Rebuildar frontend no VPS
Write-Host "🔨 6. Rebuildando frontend no VPS..." -ForegroundColor Yellow
ssh root@$VPS_IP "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml exec frontend npm run build"

# 7. Reiniciar containers
Write-Host "🔄 7. Reiniciando containers..." -ForegroundColor Yellow
ssh root@$VPS_IP "cd $VPS_PATH && docker-compose -f docker-compose.prod.yml restart frontend nginx"

# 8. Verificar estrutura final
Write-Host "✅ 8. Verificando estrutura final..." -ForegroundColor Green
ssh root@$VPS_IP "cd $VPS_PATH/frontend/src && echo '=== ESTRUTURA FINAL ===' && ls -la && echo '=== APP PAGES ===' && find app -name 'page.tsx' | wc -l && echo 'páginas no App Router'"

Write-Host ""
Write-Host "🎉 MIGRAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "📱 Teste o login em: https://atendo.website/login" -ForegroundColor Cyan
Write-Host "🔍 Verifique as páginas em: https://atendo.website/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Em caso de problemas, restore o backup:" -ForegroundColor Red
Write-Host "   ssh root@$VPS_IP 'cd $VPS_PATH && rm -rf frontend && mv frontend_backup_* frontend'" -ForegroundColor Red

Read-Host "Pressione Enter para continuar..."
