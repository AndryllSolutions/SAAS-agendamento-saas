#!/bin/bash
# Comandos para executar na VPS após upload dos arquivos
# Execute via SSH: ssh root@72.62.138.239

echo "=== Comandos VPS - DrawerStack ==="

# 1. Entrar no diretório
cd /opt/saas/atendo

# 2. Fazer backup do .env atual (se existir)
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# 3. Parar containers
echo "Parando containers..."
docker-compose -f docker-compose.prod.yml down

# 4. Build e subir containers
echo "Build e subindo containers..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 5. Verificar status
echo "Verificando status..."
docker-compose -f docker-compose.prod.yml ps

# 6. Verificar logs do backend
echo "Verificando logs do backend..."
docker-compose -f docker-compose.prod.yml logs -f --tail=50 backend

echo "=== Deploy DrawerStack concluído! ==="
echo "Acesse: https://seu-dominio.com/professionals"
