#!/bin/bash

echo "🔧 DIAGNÓSTICO E CORREÇÃO DA STACK EM PRODUÇÃO"
echo ""

echo "📋 1. Verificando containers ativos e portas..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🔍 Verificando uso da porta 5432..."
docker ps | grep 5432 || true
ss -ltnp | grep ':5432' || true

echo ""
echo "📁 2. Verificando qual compose está ativo..."
cd /opt/saas/atendo
docker compose ls
docker compose ps
ls -la docker-compose*.yml

echo ""
echo "🚨 3. Verificando logs (últimas linhas)..."
echo "--- Nginx ---"
docker logs --tail 30 agendamento_nginx_prod 2>/dev/null || docker logs --tail 30 nginx 2>/dev/null || echo "Nginx não encontrado"

echo ""
echo "--- Backend ---"
docker logs --tail 30 agendamento_backend_prod 2>/dev/null || docker logs --tail 30 backend 2>/dev/null || echo "Backend não encontrado"

echo ""
echo "--- Frontend ---"
docker logs --tail 30 agendamento_frontend_prod 2>/dev/null || docker logs --tail 30 frontend 2>/dev/null || echo "Frontend não encontrado"

echo ""
echo "🌐 4. Testes diretos (sem Nginx)..."
echo "Testando backend HTTP direto:"
curl -sS http://127.0.0.1:8001/health || echo "❌ Backend não responde em 8001"

echo ""
echo "Testando frontend HTTP direto:"
curl -sS http://127.0.0.1:3000 || echo "❌ Frontend não responde em 3000"

echo ""
echo "🔧 5. Aplicando correções..."
echo "Parando containers com conflito..."
docker stop $(docker ps -q --filter "publish=5432") 2>/dev/null || true
docker stop agendamento_db_prod 2>/dev/null || true

echo ""
echo "Limpando containers órfãos..."
docker compose down --remove-orphans 2>/dev/null || true

echo ""
echo "Subindo stack correta (com ports ajustados)..."
docker compose up -d

echo ""
echo "⏱️ 6. Aguardando inicialização..."
sleep 60

echo ""
echo "🧪 7. Verificação final..."
docker compose ps
echo ""
echo "Testando API via Nginx:"
curl -k -sS https://127.0.0.1/api/v1/health || echo "❌ API não responde via Nginx"

echo ""
echo "Testando Frontend via Nginx:"
curl -k -sS https://127.0.0.1/ || echo "❌ Frontend não responde via Nginx"

echo ""
echo "✅ DIAGNÓSTICO CONCLUÍDO!"
echo "🎯 Acesse: https://72.62.138.239/calendar"
