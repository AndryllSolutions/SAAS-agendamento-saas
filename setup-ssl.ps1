# Script para configurar SSL/HTTPS com Let's Encrypt (Certbot)
# Uso: .\setup-ssl.ps1 seudominio.com

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

Write-Host "=============================================="
Write-Host "  Configurando SSL para: $Domain"
Write-Host "=============================================="
Write-Host ""

# 1. Criar diretórios
Write-Host "[1/5] Criando diretórios..."
New-Item -ItemType Directory -Force -Path "docker\nginx\ssl" | Out-Null
New-Item -ItemType Directory -Force -Path "docker\certbot\conf" | Out-Null
New-Item -ItemType Directory -Force -Path "docker\certbot\www" | Out-Null
Write-Host "OK" -ForegroundColor Green

# 2. Gerar certificado auto-assinado (desenvolvimento)
Write-Host ""
Write-Host "[2/5] Gerando certificado auto-assinado temporário..."
if (!(Test-Path "docker\nginx\ssl\cert.pem")) {
    $certPath = "docker\nginx\ssl\cert.pem"
    $keyPath = "docker\nginx\ssl\key.pem"
    
    # Gerar certificado auto-assinado com OpenSSL (Windows)
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $keyPath `
        -out $certPath `
        -subj "/C=BR/ST=State/L=City/O=Organization/CN=$Domain"
    
    Write-Host "OK - Certificado criado (válido por 365 dias)" -ForegroundColor Green
} else {
    Write-Host "OK - Certificado já existe" -ForegroundColor Yellow
}

# 3. Criar docker-compose.ssl.yml
Write-Host ""
Write-Host "[3/5] Configurando Certbot no Docker Compose..."
$sslCompose = @"
version: '3.8'

services:
  # Certbot para renovação automática de SSL
  certbot:
    image: certbot/certbot:latest
    container_name: agendamento_certbot
    volumes:
      - ./docker/certbot/conf:/etc/letsencrypt
      - ./docker/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait `$`$!; done;'"
    networks:
      - agendamento_network

networks:
  agendamento_network:
    external: true
"@

Set-Content -Path "docker-compose.ssl.yml" -Value $sslCompose
Write-Host "OK - Arquivo docker-compose.ssl.yml criado" -ForegroundColor Green

# 4. Copiar configuração HTTPS do nginx
Write-Host ""
Write-Host "[4/5] Atualizando configuração do Nginx..."
Copy-Item "docker\nginx\nginx-https.conf" "docker\nginx\nginx.conf" -Force
Write-Host "OK - Nginx configurado para HTTPS" -ForegroundColor Green

# 5. Instruções finais
Write-Host ""
Write-Host "=============================================="
Write-Host "  CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para desenvolvimento local:" -ForegroundColor Cyan
Write-Host "  1. docker-compose restart nginx"
Write-Host "  2. Acesse: https://localhost (aceite o certificado auto-assinado)"
Write-Host ""
Write-Host "Para produção com Let's Encrypt:" -ForegroundColor Cyan
Write-Host "  1. Configure seu domínio para apontar para este servidor"
Write-Host "  2. Execute: docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d"
Write-Host "  3. Obtenha certificado real:"
Write-Host "     docker-compose run --rm certbot certonly --webroot \"
Write-Host "       --webroot-path=/var/www/certbot \"
Write-Host "       --email seu-email@example.com \"
Write-Host "       --agree-tos \"
Write-Host "       --no-eff-email \"
Write-Host "       -d $Domain"
Write-Host "  4. Atualize docker\nginx\nginx.conf para usar:"
Write-Host "     ssl_certificate /etc/letsencrypt/live/$Domain/fullchain.pem;"
Write-Host "     ssl_certificate_key /etc/letsencrypt/live/$Domain/privkey.pem;"
Write-Host "  5. docker-compose restart nginx"
Write-Host ""
Write-Host "Renovação automática configurada (a cada 12h)" -ForegroundColor Green
Write-Host ""

