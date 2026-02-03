# Script para gerar senhas seguras para o .env
# Uso: .\generate-secrets.ps1

Write-Host "=============================================="
Write-Host "  Gerador de Senhas Seguras"
Write-Host "=============================================="
Write-Host ""

# Função para gerar senha aleatória
function New-RandomPassword {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

Write-Host "Gerando senhas seguras..." -ForegroundColor Yellow
Write-Host ""

$secrets = @{
    "SECRET_KEY" = New-RandomPassword -Length 48
    "POSTGRES_PASSWORD" = New-RandomPassword -Length 32
    "REDIS_PASSWORD" = New-RandomPassword -Length 32
    "RABBITMQ_PASSWORD" = New-RandomPassword -Length 32
}

Write-Host "🔐 SENHAS GERADAS:" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""

foreach ($key in $secrets.Keys) {
    Write-Host "$key=" -NoNewline -ForegroundColor Cyan
    Write-Host $secrets[$key] -ForegroundColor White
}

Write-Host ""
Write-Host "=============================================="
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Copie estas senhas para seu arquivo .env"
Write-Host "2. Atualize DATABASE_URL com a senha do PostgreSQL"
Write-Host "3. Atualize REDIS_URL com a senha do Redis"
Write-Host "4. Atualize RABBITMQ_URL e CELERY_BROKER_URL com a senha do RabbitMQ"
Write-Host "5. NUNCA compartilhe este arquivo ou commit no git!"
Write-Host ""
Write-Host "Exemplo de DATABASE_URL:"
Write-Host "postgresql://agendamento_user:" -NoNewline
Write-Host $secrets["POSTGRES_PASSWORD"] -NoNewline -ForegroundColor Yellow
Write-Host "@db:5432/agendamento"
Write-Host ""
Write-Host "Exemplo de REDIS_URL:"
Write-Host "redis://:" -NoNewline
Write-Host $secrets["REDIS_PASSWORD"] -NoNewline -ForegroundColor Yellow
Write-Host "@redis:6379/0"
Write-Host ""
Write-Host "Exemplo de RABBITMQ_URL:"
Write-Host "amqp://admin:" -NoNewline
Write-Host $secrets["RABBITMQ_PASSWORD"] -NoNewline -ForegroundColor Yellow
Write-Host "@rabbitmq:5672/"
Write-Host ""

