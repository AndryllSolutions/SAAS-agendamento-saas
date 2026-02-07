#!/bin/bash
# Script de deploy do MOBILE para VPS
# Estrutura: /opt/sas/atend/mobile/

set -e

echo "=== DEPLOY ATENDO MOBILE ==="
echo "Diretório: /opt/sas/atend/mobile/"

# Configurações
BASE_DIR="/opt/sas/atend"
MOBILE_DIR="$BASE_DIR/mobile"
BUILD_DIR="$MOBILE_DIR/web-build"
NGINX_CONF="/etc/nginx/sites-available/atendo-mobile"

# Verificar se diretório base existe
if [ ! -d "$BASE_DIR" ]; then
    echo "ERRO: Diretório $BASE_DIR não existe!"
    echo "Verifique o caminho correto na VPS."
    exit 1
fi

echo "[1/5] Verificando estrutura..."
echo "Base: $BASE_DIR"
ls -la "$BASE_DIR"

# Verificar se pasta mobile existe (deve ter sido enviada via SCP)
if [ ! -d "$MOBILE_DIR" ]; then
    echo "ERRO: Pasta $MOBILE_DIR não encontrada!"
    echo "Envie a pasta mobile primeiro via SCP:"
    echo "  scp -r mobile/atendo-mobile root@72.62.138.239:/opt/sas/atend/mobile"
    exit 1
fi

echo "[2/5] Instalando dependências..."
apt-get update -qq
apt-get install -y -qq curl git || true

# Node.js 18+
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y -qq nodejs
fi

# Verificar node
node -v
npm -v

echo "[3/5] Instalando dependências do projeto..."
cd "$MOBILE_DIR"
rm -rf node_modules package-lock.json
npm install --silent

echo "[4/5] Fazendo build web..."
npx expo export --platform web --output-dir web-build

echo "[5/5] Configurando nginx..."
# Criar config nginx para /mobile (sub-rota)
cat > "$NGINX_CONF" << EOF
# Configuração do mobile - servido em /mobile
location /mobile {
    alias $BUILD_DIR;
    index index.html;
    try_files \$uri \$uri/ /mobile/index.html;
    
    # Cache para assets estáticos
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Incluir no nginx principal se não estiver incluído
if ! grep -q "include $NGINX_CONF" /etc/nginx/nginx.conf 2>/dev/null; then
    # Adicionar include no sites-enabled ou nginx.conf
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/ 2>/dev/null || true
fi

# Testar nginx
nginx -t

# Recarregar nginx
systemctl reload nginx || nginx -s reload

echo ""
echo "=== DEPLOY CONCLUÍDO ==="
echo ""
echo "Mobile disponível em:"
echo "  https://atendo.website/mobile"
echo ""
echo "Verifique se o build está em:"
echo "  $BUILD_DIR"
echo ""
echo "Arquivos na pasta mobile:"
ls -la "$BUILD_DIR"
