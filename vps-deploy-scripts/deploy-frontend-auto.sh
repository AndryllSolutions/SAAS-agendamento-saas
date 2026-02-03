#!/bin/bash
# Deploy Frontend com Auto-Restart do Nginx
# Solucao permanente para problema de DNS/IP do Nginx

set -euo pipefail

VPS_PATH="/opt/saas/atendo"

echo "=== Deploy Frontend com Auto-Restart Nginx ==="

echo ""
echo "[1/3] Rebuild do container frontend..."
cd "$VPS_PATH"
docker compose -f docker-compose.prod.yml stop frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend

echo ""
echo "[2/3] Aguardando frontend inicializar..."
sleep 10

echo ""
echo "[3/3] Reiniciando Nginx (SOLUCAO PERMANENTE)..."
docker compose -f docker-compose.prod.yml restart nginx
sleep 5

echo ""
echo "Status dos containers:"
docker compose -f docker-compose.prod.yml ps | grep -E 'frontend|nginx'

echo ""
echo "=== Deploy Concluido ==="
echo "Nginx foi reiniciado automaticamente para resolver novo IP!"
