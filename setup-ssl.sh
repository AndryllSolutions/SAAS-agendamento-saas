#!/bin/bash
# Script para configurar SSL/HTTPS com Let's Encrypt (Certbot)
# Uso: ./setup-ssl.sh seudominio.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Erro: Você deve fornecer um domínio"
    echo "Uso: ./setup-ssl.sh seudominio.com"
    exit 1
fi

echo "🔐 Configurando SSL para: $DOMAIN"
echo "================================================"

# 1. Criar diretório para certificados
echo "[1/5] Criando diretórios..."
mkdir -p docker/nginx/ssl
mkdir -p docker/certbot/conf
mkdir -p docker/certbot/www

# 2. Gerar certificado auto-assinado temporário (para desenvolvimento)
echo "[2/5] Gerando certificado auto-assinado temporário..."
if [ ! -f "docker/nginx/ssl/cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout docker/nginx/ssl/key.pem \
        -out docker/nginx/ssl/cert.pem \
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=$DOMAIN"
    echo "✅ Certificado auto-assinado criado (válido por 365 dias)"
else
    echo "✅ Certificado já existe"
fi

# 3. Adicionar serviço certbot ao docker-compose
echo "[3/5] Configurando Certbot no Docker Compose..."
cat >> docker-compose.ssl.yml << 'EOF'
version: '3.8'

services:
  # Certbot para renovação automática de SSL
  certbot:
    image: certbot/certbot:latest
    container_name: agendamento_certbot
    volumes:
      - ./docker/certbot/conf:/etc/letsencrypt
      - ./docker/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - agendamento_network

networks:
  agendamento_network:
    external: true
EOF

echo "✅ Arquivo docker-compose.ssl.yml criado"

# 4. Atualizar nginx para usar o novo config
echo "[4/5] Atualizando configuração do Nginx..."
cp docker/nginx/nginx-https.conf docker/nginx/nginx.conf
echo "✅ Nginx configurado para HTTPS"

# 5. Instruções para obter certificado Let's Encrypt REAL
echo ""
echo "================================================"
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "================================================"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "Para desenvolvimento local:"
echo "  1. docker-compose restart nginx"
echo "  2. Acesse: https://localhost (aceite o certificado auto-assinado)"
echo ""
echo "Para produção com Let's Encrypt:"
echo "  1. Configure seu domínio para apontar para este servidor"
echo "  2. Execute: docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d"
echo "  3. Obtenha certificado real:"
echo "     docker-compose run --rm certbot certonly --webroot \\"
echo "       --webroot-path=/var/www/certbot \\"
echo "       --email seu-email@example.com \\"
echo "       --agree-tos \\"
echo "       --no-eff-email \\"
echo "       -d $DOMAIN"
echo "  4. Atualize nginx.conf para usar:"
echo "     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;"
echo "     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;"
echo "  5. docker-compose restart nginx"
echo ""
echo "🔄 Renovação automática configurada (a cada 12h)"
echo ""

