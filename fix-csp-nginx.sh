#!/bin/bash
# Script para corrigir Content Security Policy no nginx

echo "Atualizando Content Security Policy no nginx..."

cd /opt/saas/atendo/docker/nginx

# Backup do arquivo atual
cp nginx.docker-first.conf nginx.docker-first.conf.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar CSP para permitir conexões ao IP da VPS
sed -i "s|connect-src 'self' https://\*.ngrok-free.app https://\*.ngrok.io|connect-src 'self' http://72.62.138.239 https://72.62.138.239|g" nginx.docker-first.conf

echo "Verificando alteração:"
grep "connect-src" nginx.docker-first.conf

echo "Pronto! Agora reinicie o nginx:"
echo "docker compose -f docker-compose.prod.yml restart nginx"
