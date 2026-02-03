#!/bin/bash
# Script de Deploy do Frontend para VPS - CORREÇÃO SIDEBAR
# Uso: ./deploy-frontend-sidebar-fix.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VPS_IP="72.62.138.239"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DEPLOY FRONTEND - CORREÇÃO SIDEBAR${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erro: Execute este script da pasta raiz do projeto${NC}"
    exit 1
fi

# 2. Sincronizar apenas arquivos alterados do frontend
echo -e "${YELLOW}📦 Sincronizando frontend para VPS...${NC}"
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='build' \
    --exclude='dist' \
    --exclude='.env.local' \
    --exclude='*.log' \
    ./frontend/ "$VPS_USER@$VPS_IP:$VPS_PATH/frontend/"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao sincronizar frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend sincronizado!${NC}"
echo ""

# 3. Build e restart do frontend na VPS (sem afetar banco)
echo -e "${YELLOW}🔨 Rebuildando imagem do frontend (sem cache)...${NC}"
ssh "$VPS_USER@$VPS_IP" << EOF
cd $VPS_PATH

echo "Parando container frontend..."
docker-compose -f docker-compose.prod.yml stop frontend

echo "Removendo container antigo..."
docker-compose -f docker-compose.prod.yml rm -f frontend

echo "Buildando nova imagem (sem cache)..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

echo "Iniciando novo container..."
docker-compose -f docker-compose.prod.yml up -d frontend

echo "Aguardando inicialização..."
sleep 30

echo ""
echo "Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Logs do frontend (últimas 20 linhas):"
docker-compose -f docker-compose.prod.yml logs --tail 20 frontend
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}🔗 Acesse: https://$VPS_IP${NC}"
    echo -e "${BLUE}🎯 O menu lateral deve estar visível agora${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dica: Faça hard reload (Ctrl+F5) no navegador${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro no deploy. Verifique os logs acima.${NC}"
    exit 1
fi
