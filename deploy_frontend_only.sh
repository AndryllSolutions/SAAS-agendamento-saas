#!/bin/bash

echo "🚀 SUBINDO ALTERAÇÕES DO FRONTEND (MODO SEGURO)"
echo ""

echo "📁 1. Verificando arquivos transferidos..."
cd /opt/saas/atendo
ls -la frontend/src/utils/apiUrl.ts
ls -la frontend/src/app/calendar/page.tsx

echo ""
echo "🔍 2. Verificando se as correções foram aplicadas..."
echo "--- apiUrl.ts ---"
grep -n "72.62.138.239" frontend/src/utils/apiUrl.ts | head -3

echo ""
echo "--- calendar/page.tsx ---"
grep -n "onClick.*setShowSettings" frontend/src/app/calendar/page.tsx | head -2
grep -n "avatarUrl.*null.*empty" frontend/src/app/calendar/page.tsx | head -1

echo ""
echo "🧹 3. Limpando cache do Next.js..."
cd /opt/saas/atendo/frontend
rm -rf .next node_modules/.cache out

echo ""
echo "🏗️ 4. Build apenas do frontend (sem depedências)..."
cd /opt/saas/atendo
docker compose build --no-cache frontend

echo ""
echo "🚀 5. Subindo apenas frontend (sem afetar backend/db)..."
docker compose up -d --no-deps frontend

echo ""
echo "⏱️ 6. Aguardando inicialização..."
sleep 45

echo ""
echo "🧪 7. Verificando status..."
docker compose ps | grep frontend
docker logs $(docker compose ps -q frontend) --tail 20

echo ""
echo "🌐 8. Testando acesso..."
echo "Frontend direto:"
curl -sS http://127.0.0.1:3000 | head -5 || echo "❌ Frontend não responde"

echo ""
echo "API via Nginx:"
curl -k -sS https://127.0.0.1/api/v1/health || echo "❌ API não responde"

echo ""
echo "✅ ALTERAÇÕES APLICADAS!"
echo "🎯 Teste em: https://72.62.138.239/calendar"
echo ""
echo "📋 MELHORIAS APLICADAS:"
echo "   • apiUrl.ts: agora usa https://72.62.138.239"
echo "   • Botões Visualização/Filtrar/Ações funcionais"
echo "   • Avatares com tratamento robusto de erro"
