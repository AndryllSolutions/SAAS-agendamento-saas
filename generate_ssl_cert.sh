#!/bin/bash

# Script para gerar certificado SSL autoassinado para atendo.website

echo "🔐 Gerando certificado SSL para atendo.website..."

# Criar diretório SSL se não existir
mkdir -p /opt/saas/atendo/ssl

# Copiar arquivo de configuração
cp ssl_cert_config.conf /opt/saas/atendo/ssl/

# Gerar chave privada
echo "📝 Gerando chave privada..."
openssl genrsa -out /opt/saas/atendo/ssl/server.key 2048

# Gerar CSR
echo "📝 Gerando CSR..."
openssl req -new -key /opt/saas/atendo/ssl/server.key -out /opt/saas/atendo/ssl/server.csr -config /opt/saas/atendo/ssl/ssl_cert_config.conf

# Gerar certificado autoassinado
echo "📝 Gerando certificado autoassinado..."
openssl x509 -req -days 365 -in /opt/saas/atendo/ssl/server.csr -signkey /opt/saas/atendo/ssl/server.key -out /opt/saas/atendo/ssl/server.crt -extensions v3_req -extfile /opt/saas/atendo/ssl/ssl_cert_config.conf

# Verificar certificado
echo "📋 Verificando certificado..."
openssl x509 -in /opt/saas/atendo/ssl/server.crt -noout -text | grep -A 10 "Subject Alternative Name"

# Copiar para o container nginx
echo "📦 Copiando certificado para o container nginx..."
docker cp /opt/saas/atendo/ssl/server.crt agendamento_nginx_prod:/etc/nginx/ssl/server.crt
docker cp /opt/saas/atendo/ssl/server.key agendamento_nginx_prod:/etc/nginx/ssl/server.key

# Reiniciar nginx
echo "🔄 Reiniciando nginx..."
docker restart agendamento_nginx_prod

# Aguardar nginx iniciar
sleep 10

# Testar certificado
echo "🧪 Testando certificado..."
curl -I https://atendo.website 2>/dev/null | head -1

echo "✅ Certificado SSL gerado e instalado com sucesso!"
