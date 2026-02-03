#!/bin/bash

echo "🧹 LIMPANDO CACHE DO NEXT.J E REBUILD DOCKER"

echo ""
echo "🛑 1. Parando frontend..."
docker stop agendamento_frontend_prod || echo "Container já parado"

echo ""
echo "🗑️ 2. Removendo cache do Next.js..."
cd /opt/saas/atendo/frontend

# Remover pastas de cache
rm -rf .next
rm -rf node_modules/.cache
rm -rf out
rm -rf .next/cache

echo "✅ Cache do Next.js removido"

echo ""
echo "🗑️ 3. Limpando cache do Docker..."
docker system prune -f
docker image prune -f

echo "✅ Cache do Docker limpo"

echo ""
echo "🏗️ 4. Build sem cache do frontend..."
cd /opt/saas/atendo
docker compose build --no-cache frontend

echo "✅ Build concluído"

echo ""
echo "🚀 5. Iniciando frontend..."
docker compose up -d frontend

echo "✅ Frontend iniciado"

echo ""
echo "⏱️ 6. Aguardando inicialização..."
sleep 45

echo ""
echo "🧪 7. Verificando status..."
docker compose ps | grep frontend
docker logs agendamento_frontend_prod --tail 20

echo ""
echo "🌐 8. Testando API..."
curl -k https://72.62.138.239/api/v1/health

echo ""
echo "✅ PROCESSO CONCLUÍDO!"
echo "🎯 Teste a agenda em: https://72.62.138.239/calendar"
