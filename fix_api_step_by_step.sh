#!/bin/bash

echo "🔧 PASSO 1: Aplicando correção API URL..."

# Backup do arquivo original
cp /opt/saas/atendo/frontend/src/utils/apiUrl.ts /opt/saas/atendo/frontend/src/utils/apiUrl.ts.backup

# Aplicar correção manualmente (substituir atendo.website por 72.62.138.239)
sed -i 's/https:\/\/atendo\.website/https:\/\/72\.62\.138\.239/g' /opt/saas/atendo/frontend/src/utils/apiUrl.ts

echo "✅ Arquivo apiUrl.ts atualizado"
echo "📄 Verificando alteração..."
grep -n "72.62.138.239" /opt/saas/atendo/frontend/src/utils/apiUrl.ts

echo ""
echo "🧹 PASSO 2: Limpando cache do Next.js..."

# Parar frontend
docker stop agendamento_frontend_prod

# Remover cache do Next.js
rm -rf /opt/saas/atendo/frontend/.next
rm -rf /opt/saas/atendo/frontend/node_modules/.cache

# Limpar cache do Docker
docker system prune -f

echo "✅ Cache limpo"

echo ""
echo "🏗️ PASSO 3: Rebuild do frontend..."

# Build sem cache
cd /opt/saas/atendo
docker compose build --no-cache frontend

echo "✅ Build concluído"

echo ""
echo "🚀 PASSO 4: Iniciando frontend..."

# Iniciar frontend
docker compose up -d frontend

echo "✅ Frontend iniciado"
echo "⏱️ Aguardando 30 segundos..."
sleep 30

echo ""
echo "🧪 PASSO 5: Testando API..."

# Testar API
curl -k https://72.62.138.239/api/v1/health

echo ""
echo "📊 Status final:"
docker compose ps | grep frontend
