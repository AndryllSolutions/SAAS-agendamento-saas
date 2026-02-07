#!/bin/bash

# Script de Setup Rápido para VPS
# Uso: bash setup-vps.sh

echo "🚀 SETUP ATENDO MOBILE NA VPS"
echo "=============================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. Verificar Node.js
echo ""
echo "1️⃣ Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION encontrado"
else
    print_error "Node.js não encontrado!"
    print_warning "Instale com: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# 2. Verificar npm
echo ""
echo "2️⃣ Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm $NPM_VERSION encontrado"
else
    print_error "npm não encontrado!"
    exit 1
fi

# 3. Limpar cache
echo ""
echo "3️⃣ Limpando cache do npm..."
npm cache clean --force
print_status "Cache limpo"

# 4. Remover node_modules antigos
echo ""
echo "4️⃣ Removendo node_modules antigos..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_status "node_modules removido"
fi

# 5. Remover package-lock.json
echo ""
echo "5️⃣ Removendo package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    print_status "package-lock.json removido"
fi

# 6. Instalar dependências
echo ""
echo "6️⃣ Instalando dependências..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependências instaladas com sucesso"
else
    print_warning "Tentando com --legacy-peer-deps..."
    npm install --legacy-peer-deps
fi

# 7. Verificar .env
echo ""
echo "7️⃣ Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status ".env criado a partir de .env.example"
        print_warning "⚠️ EDITE .env COM SUAS CONFIGURAÇÕES!"
    else
        print_error ".env.example não encontrado!"
    fi
else
    print_status ".env já existe"
fi

# 8. Verificar PM2
echo ""
echo "8️⃣ Verificando PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_status "PM2 $PM2_VERSION encontrado"
else
    print_warning "PM2 não encontrado. Instalando..."
    sudo npm install -g pm2
    pm2 startup
    print_status "PM2 instalado"
fi

# 9. Resumo
echo ""
echo "=============================="
echo -e "${GREEN}✅ SETUP CONCLUÍDO!${NC}"
echo "=============================="
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Execute: npm start"
echo "3. Ou com PM2: pm2 start 'npm start' --name 'atendo-mobile'"
echo ""
echo "Para mais informações, leia VPS_DEPLOYMENT_GUIDE.md"
echo ""
