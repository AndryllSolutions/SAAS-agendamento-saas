#!/bin/bash
# Script para corrigir URLs HTTP para HTTPS no .env

echo "Atualizando URLs para HTTPS..."

cd /opt/saas/atendo

# Backup dos arquivos
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar NEXT_PUBLIC_API_URL para HTTPS
sed -i 's|NEXT_PUBLIC_API_URL=http://72.62.138.239|NEXT_PUBLIC_API_URL=https://72.62.138.239|g' .env
sed -i 's|NEXT_PUBLIC_API_URL=http://72.62.138.239|NEXT_PUBLIC_API_URL=https://72.62.138.239|g' .env.production

# Atualizar PUBLIC_URL para HTTPS
sed -i 's|PUBLIC_URL=http://72.62.138.239|PUBLIC_URL=https://72.62.138.239|g' .env
sed -i 's|PUBLIC_URL=http://72.62.138.239|PUBLIC_URL=https://72.62.138.239|g' .env.production

# Atualizar API_URL para HTTPS
sed -i 's|API_URL=http://72.62.138.239|API_URL=https://72.62.138.239|g' .env
sed -i 's|API_URL=http://72.62.138.239|API_URL=https://72.62.138.239|g' .env.production

# Atualizar FRONTEND_URL para HTTPS
sed -i 's|FRONTEND_URL=http://72.62.138.239|FRONTEND_URL=https://72.62.138.239|g' .env
sed -i 's|FRONTEND_URL=http://72.62.138.239|FRONTEND_URL=https://72.62.138.239|g' .env.production

# Atualizar CORS_ORIGIN para HTTPS
sed -i 's|CORS_ORIGIN=http://72.62.138.239|CORS_ORIGIN=https://72.62.138.239|g' .env
sed -i 's|CORS_ORIGIN=http://72.62.138.239|CORS_ORIGIN=https://72.62.138.239|g' .env.production

echo "Verificando alteracoes em .env:"
grep "NEXT_PUBLIC_API_URL" .env
grep "PUBLIC_URL" .env
grep "API_URL" .env
grep "FRONTEND_URL" .env
grep "CORS_ORIGIN" .env

echo ""
echo "Pronto! Agora rebuild o frontend:"
echo "docker compose -f docker-compose.prod.yml build frontend"
echo "docker compose -f docker-compose.prod.yml up -d frontend"
