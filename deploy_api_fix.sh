#!/bin/bash

# Deploy correção API URL para produção
echo "🔧 Aplicando correção de API URL..."

# Fazer rebuild do frontend com as alterações
cd /opt/saas/atendo
docker compose build --no-cache frontend
docker compose up -d frontend

echo "✅ Frontend reconstruído com API URL corrigida!"
echo "🌐 API agora aponta para https://72.62.138.239"
echo "⏱️ Aguardando 30 segundos para inicialização..."
sleep 30

echo "🧪 Testando API..."
curl -k https://72.62.138.239/api/v1/health || echo "❌ API não respondeu"

echo "📊 Status dos containers:"
docker compose ps
