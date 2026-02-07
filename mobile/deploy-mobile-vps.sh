#!/bin/bash
# Script de deploy do mobile para VPS
# Execute na VPS após fazer SSH

set -e

echo "=== DEPLOY ATENDO MOBILE ==="

# Configurações
APP_DIR="/var/www/atendo-mobile"
REPO_URL="https://github.com/AndryllSolutions/SAAS-agendamento-saas.git"  # ajuste se necessário
BRANCH="main"

# 1. Instalar dependências se não tiver
echo "[1/6] Instalando dependências..."
apt-get update -qq
apt-get install -y -qq nginx git curl || true

# 2. Configurar Node.js 18+
echo "[2/6] Configurando Node.js..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "18" ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y -qq nodejs
fi

# Instalar Expo CLI globalmente
npm install -g expo-cli @expo/ngrok@^4.1.0 2>/dev/null || true

# 3. Clonar ou atualizar código
echo "[3/6] Atualizando código..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    rm -rf "$APP_DIR"
    git clone -b $BRANCH "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Entrar na pasta do mobile
cd "$APP_DIR/mobile/atendo-mobile"

# 4. Instalar dependências
echo "[4/6] Instalando dependências do projeto..."
npm ci --silent

# 5. Build web
echo "[5/6] Fazendo build web..."
npx expo export --platform web --output-dir web-build

# 6. Configurar nginx
echo "[6/6] Configurando nginx..."
cat > /etc/nginx/sites-available/atendo-mobile << 'EOF'
server {
    listen 80;
    server_name mobile.atendo.website;  # ajuste seu domínio
    root /var/www/atendo-mobile/mobile/atendo-mobile/web-build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/atendo-mobile /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Testar e recarregar nginx
nginx -t
systemctl reload nginx

echo ""
echo "=== DEPLOY CONCLUÍDO ==="
echo "Acesse: http://mobile.atendo.website"
echo "Ou: http://72.62.138.239"
