#!/bin/bash
set -euo pipefail

# Deploy Docker-first Nginx (Opção B)
# - Para Nginx do host e sobe container Nginx na porta 80/443
# - Roteamento: / -> frontend, /api/ -> backend, /api/v1/ -> backend

echo "=== Docker-first Nginx Deploy ==="

# 1) Parar Nginx do host (se existir)
echo "Stopping host nginx (if running)..."
systemctl stop nginx || true
systemctl disable nginx || true

# 2) Copiar/Atualizar arquivos no /opt/saas/atendo
echo "Syncing files to /opt/saas/atendo..."
cd /opt/saas/atendo

# Garante que os arquivos existam
mkdir -p docker/nginx

# Copiar compose e nginx.conf (se vier de outro dir)
cp -f docker-compose.prod.yml . 2>/dev/null || true
cp -f docker/nginx/nginx.docker-first.conf docker/nginx/nginx.prod.conf 2>/dev/null || true

# 3) Build e up (docker-first)
echo "Building and starting containers (docker-first)..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 4) Aguardar containers saudáveis
echo "Waiting for containers to be healthy..."
sleep 15

# 5) Validar
echo "Validating deployment..."
if curl -f -s -L -k https://localhost/ | grep -q "html"; then
  echo "✅ Frontend accessible on /"
else
  echo "❌ Frontend NOT accessible on /"
fi

if curl -f -s -L -k https://localhost/api/health | grep -q "healthy"; then
  echo "✅ Backend accessible on /api/health"
else
  echo "❌ Backend NOT accessible on /api/health"
fi

if curl -f -s -L -k https://localhost/api/v1/health | grep -q "healthy"; then
  echo "✅ Backend accessible on /api/v1/health (compatível com frontend)"
else
  echo "❌ Backend NOT accessible on /api/v1/health"
fi

echo "=== Docker-first Nginx Deploy Complete ==="
