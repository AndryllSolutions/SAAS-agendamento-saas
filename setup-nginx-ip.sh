#!/bin/bash

# Script de Configuração Nginx para IP (sem domínio) - Atendo SAAS
# Uso: ./setup-nginx-ip.sh [ip-vps]

set -e

VPS_IP=${1:-72.62.138.239}

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script precisa ser executado como root"
    exit 1
fi

log "Iniciando configuração Nginx para IP"
info "IP: $VPS_IP"

# 1. Instalar Nginx
log "Instalando Nginx..."
apt-get update
apt-get install -y nginx

# 2. Criar diretórios necessários
log "Criando estrutura de diretórios..."
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled
mkdir -p /var/log/nginx

# 3. Configurar Nginx principal
log "Configurando Nginx principal..."
cat > /etc/nginx/nginx.conf << 'NGINXEOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINXEOF

# 4. Criar configuração do site para IP
log "Criando configuração do site para IP $VPS_IP..."
cat > /etc/nginx/sites-available/atendo-ip << SITEEOF
# Configuração do site Atendo SAAS - IP: $VPS_IP
server {
    listen 80;
    server_name $VPS_IP _;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';";

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
    }

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since" always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Login (rate limiting mais restrito)
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://127.0.0.1:8001/auth/login;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    # Upload endpoints
    location /api/upload {
        limit_req zone=api burst=3 nodelay;
        
        proxy_pass http://127.0.0.1:8001/upload;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeout maior para uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_body_timeout 300s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|log|conf|sql|bak|backup)$ {
        deny all;
    }

    # Block common attack patterns
    location ~* \.(aspx|php|jsp|cgi)$ {
        deny all;
    }
}
SITEEOF

# 5. Ativar site
log "Ativando site para IP..."
ln -sf /etc/nginx/sites-available/atendo-ip /etc/nginx/sites-enabled/

# 6. Remover site default
rm -f /etc/nginx/sites-enabled/default

# 7. Testar configuração Nginx
log "Testando configuração Nginx..."
nginx -t

# 8. Reiniciar Nginx
log "Reiniciando Nginx..."
systemctl restart nginx
systemctl enable nginx

# 9. Configurar firewall
log "Configurando firewall..."
ufw allow ssh
ufw allow 80
ufw --force enable

# 10. Criar página de manutenção
log "Criando página de manutenção..."
cat > /var/www/html/maintenance.html << 'MAINEOF'
<!DOCTYPE html>
<html>
<head>
    <title>Manutenção - Atendo SAAS</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Manutenção Programada</h1>
        <div class="spinner"></div>
        <p>Estamos realizando melhorias em nosso sistema para oferecer um serviço ainda melhor.</p>
        <p>A manutenção levará apenas alguns minutos. Obrigado pela sua paciência!</p>
        <p><small>Atendo SAAS - Sistema de Agendamento</small></p>
    </div>
</body>
</html>
MAINEOF

# 11. Criar script de manutenção
log "Criando script de manutenção..."
cat > /usr/local/bin/nginx-maintenance << 'MAINTEOF'
#!/bin/bash

# Script para ativar/desativar modo manutenção
# Uso: nginx-maintenance [on|off]

MODE=$1
SITE_FILE="/etc/nginx/sites-enabled/atendo-ip"

if [ "$MODE" = "on" ]; then
    echo "Ativando modo manutenção..."
    sed -i 's|proxy_pass http://127.0.0.1:3001;|root /var/www/html; index maintenance.html;|' $SITE_FILE
    sed -i 's|proxy_pass http://127.0.0.1:8001/;|return 503;|' $SITE_FILE
    nginx -t && systemctl reload nginx
    echo "Modo manutenção ATIVADO"
elif [ "$MODE" = "off" ]; then
    echo "Desativando modo manutenção..."
    sed -i 's|root /var/www/html; index maintenance.html;|proxy_pass http://127.0.0.1:3001;|' $SITE_FILE
    sed -i 's|return 503;|proxy_pass http://127.0.0.1:8001/;|' $SITE_FILE
    nginx -t && systemctl reload nginx
    echo "Modo manutenção DESATIVADO"
else
    echo "Uso: $0 [on|off]"
    exit 1
fi
MAINTEOF

chmod +x /usr/local/bin/nginx-maintenance

# 12. Verificar status final
log "Verificando status final..."
systemctl status nginx --no-pager

# 13. Testar acesso
log "Testando acesso ao Nginx..."
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" "http://$VPS_IP/health" | grep -q "200"; then
        log "✅ Nginx respondendo corretamente"
    else
        warning "⚠️ Nginx pode não estar respondendo corretamente"
    fi
fi

# 14. Informações finais
log "========================================"
log "CONFIGURAÇÃO NGINX IP CONCLUÍDA!"
log "========================================"
info "IP: $VPS_IP"
info "Porta: 80 (HTTP)"
info "Firewall: Configurado"
info ""
info "URLs de Acesso:"
info "Frontend: http://$VPS_IP"
info "API: http://$VPS_IP/api/"
info "Health: http://$VPS_IP/health"
info ""
info "Comandos Úteis:"
info "Verificar status: systemctl status nginx"
info "Testar config: nginx -t"
info "Recarregar: systemctl reload nginx"
info "Logs: tail -f /var/log/nginx/access.log"
info "Modo manutenção: nginx-maintenance on/off"
log "========================================"
warning "PRÓXIMOS PASSOS:"
warning "1. Verifique se os containers estão rodando nas portas corretas"
warning "2. Teste o acesso via navegador: http://$VPS_IP"
warning "3. Quando tiver domínio, use setup-nginx.sh para SSL"
warning "4. Configure monitoramento e alertas"
log "========================================"
