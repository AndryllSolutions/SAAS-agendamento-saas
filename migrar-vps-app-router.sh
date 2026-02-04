#!/bin/bash

# MIGRAÇÃO VPS: Pages Router → App Router
# Este script remove Pages Router e mantém App Router (45+ páginas)

VPS_IP="72.62.138.239"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo "🚀 Iniciando migração VPS para App Router..."

# 1. Verificar estrutura atual
echo "📋 1. Verificando estrutura atual do VPS..."
ssh root@${VPS_IP} "cd ${VPS_PATH}/frontend/src && echo '=== PASTAS ===' && ls -la && echo '=== PAGES ===' && ls -la pages/ 2>/dev/null || echo 'Pasta pages não existe' && echo '=== APP ===' && ls -la app/ | head -10"

# 2. Backup completo do frontend
echo "💾 2. Fazendo backup completo do frontend..."
ssh root@${VPS_IP} "cd ${VPS_PATH} && cp -r frontend frontend_backup_pages_router_$(date +%Y%m%d_%H%M%S) && echo 'Backup criado com sucesso'"

# 3. Remover pasta pages (se existir)
echo "🗑️ 3. Removendo pasta pages do VPS..."
ssh root@${VPS_IP} "cd ${VPS_PATH}/frontend/src && rm -rf pages/ && echo 'Pasta pages removida' || echo 'Pasta pages não existia'"

# 4. Limpar next.config.js (remover appDir)
echo "🔧 4. Limpando configuração next.config.js..."
ssh root@${VPS_IP} "cd ${VPS_PATH}/frontend && sed -i '/appDir: true/d' next.config.js && echo 'appDir removido do next.config.js'"

# 5. Sincronizar frontend atualizado (App Router)
echo "📦 5. Sincronizando frontend atualizado (App Router)..."
echo "   Enviando pasta app/ completa (45+ páginas)..."
scp -r "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/" root@${VPS_IP}:${VPS_PATH}/frontend/src/

echo "   Enviando next.config.js atualizado..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/next.config.js" root@${VPS_IP}:${VPS_PATH}/frontend/

echo "   Enviando arquivos críticos..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/layout.tsx" root@${VPS_IP}:${VPS_PATH}/frontend/src/app/
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/globals.css" root@${VPS_IP}:${VPS_PATH}/frontend/src/app/

# 6. Rebuildar frontend no VPS
echo "🔨 6. Rebuildando frontend no VPS..."
ssh root@${VPS_IP} "cd ${VPS_PATH} && docker-compose -f docker-compose.prod.yml exec frontend npm run build"

# 7. Reiniciar containers
echo "🔄 7. Reiniciando containers..."
ssh root@${VPS_IP} "cd ${VPS_PATH} && docker-compose -f docker-compose.prod.yml restart frontend nginx"

# 8. Verificar estrutura final
echo "✅ 8. Verificando estrutura final..."
ssh root@${VPS_IP} "cd ${VPS_PATH}/frontend/src && echo '=== ESTRUTURA FINAL ===' && ls -la && echo '=== APP PAGES ===' && find app -name 'page.tsx' | wc -l && echo 'páginas no App Router'"

echo ""
echo "🎉 MIGRAÇÃO CONCLUÍDA!"
echo "📱 Teste o login em: https://atendo.website/login"
echo "🔍 Verifique as páginas em: https://atendo.website/dashboard"
echo ""
echo "⚠️  Em caso de problemas, restore o backup:"
echo "   ssh root@${VPS_IP} 'cd ${VPS_PATH} && rm -rf frontend && mv frontend_backup_* frontend'"
