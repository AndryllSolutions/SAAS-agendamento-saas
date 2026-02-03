param(
    [Parameter(Mandatory=$false)][string]$VpsHost = "72.62.138.239",
    [Parameter(Mandatory=$false)][string]$VpsUser = "root",
    [Parameter(Mandatory=$false)][string]$RemoteDir = "/opt/saas/atendo",
    [Parameter(Mandatory=$false)][string]$PublicHost = "72.62.138.239",
    [Parameter(Mandatory=$false)][switch]$SeedDemoData,
    [Parameter(Mandatory=$false)][switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function New-SafePassword {
    param([int]$Length = 32)

    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray()
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)

    $sb = New-Object System.Text.StringBuilder
    foreach ($b in $bytes) {
        [void]$sb.Append($chars[$b % $chars.Length])
    }
    $sb.ToString()
}

function New-Base64Secret {
    param([int]$Bytes = 48)

    $buf = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($buf)
    [Convert]::ToBase64String($buf)
}

function Escape-ForEnvValue {
    param([string]$Value)

    $Value = $Value -replace "`r", "" -replace "`n", ""
    if ($Value -match '[\s#"]') {
        return '"' + ($Value -replace '"','`"') + '"'
    }
    return $Value
}

function Assert-FileExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Arquivo não encontrado: $Path"
    }
}

Write-Host "=== Deploy Produção (docker-compose.prod.yml) ===" -ForegroundColor Green
Write-Host "VPS: $VpsUser@$VpsHost" -ForegroundColor Cyan
Write-Host "RemoteDir: $RemoteDir" -ForegroundColor Cyan
Write-Host "PublicHost: $PublicHost" -ForegroundColor Cyan

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
Push-Location $projectRoot

try {
    Assert-FileExists "./docker-compose.prod.yml"
    Assert-FileExists "./docker/nginx/nginx.docker-first.conf"
    Assert-FileExists "./frontend/Dockerfile.prod"

    $postgresUser = "agendamento"
    $postgresDb = "agendamento_db"

    $secrets = [ordered]@{}
    $secrets["POSTGRES_USER"] = $postgresUser
    $secrets["POSTGRES_PASSWORD"] = New-SafePassword -Length 32
    $secrets["POSTGRES_DB"] = $postgresDb
    $secrets["SECRET_KEY"] = New-Base64Secret -Bytes 48
    $secrets["SETTINGS_ENCRYPTION_KEY"] = New-Base64Secret -Bytes 32
    $secrets["REDIS_PASSWORD"] = New-SafePassword -Length 32
    $secrets["RABBITMQ_PASSWORD"] = New-SafePassword -Length 32

    $encodedPgPass = [uri]::EscapeDataString($secrets["POSTGRES_PASSWORD"])
    $encodedRedisPass = [uri]::EscapeDataString($secrets["REDIS_PASSWORD"])
    $encodedRabbitPass = [uri]::EscapeDataString($secrets["RABBITMQ_PASSWORD"])

    $envLines = New-Object System.Collections.Generic.List[string]
    $envLines.Add("POSTGRES_USER=$($secrets["POSTGRES_USER"])\n")
    $envLines.Add("POSTGRES_PASSWORD=$($secrets["POSTGRES_PASSWORD"])\n")
    $envLines.Add("POSTGRES_DB=$($secrets["POSTGRES_DB"])\n")
    $envLines.Add("DATABASE_URL=postgresql+psycopg2://$postgresUser:$encodedPgPass@db:5432/$postgresDb\n")
    $envLines.Add("SECRET_KEY=$($secrets["SECRET_KEY"])\n")
    $envLines.Add("ALGORITHM=HS256\n")
    $envLines.Add("ACCESS_TOKEN_EXPIRE_MINUTES=30\n")
    $envLines.Add("REFRESH_TOKEN_EXPIRE_DAYS=7\n")
    $envLines.Add("SETTINGS_ENCRYPTION_KEY=$($secrets["SETTINGS_ENCRYPTION_KEY"])\n")

    $envLines.Add("PUBLIC_URL=https://$PublicHost\n")
    $envLines.Add("API_URL=https://$PublicHost\n")
    $envLines.Add("FRONTEND_URL=https://$PublicHost\n")
    $envLines.Add("CORS_ORIGIN=https://$PublicHost,http://$PublicHost,https://localhost,http://localhost,http://localhost:3000,http://localhost:3001\n")
    $envLines.Add("NEXT_PUBLIC_API_URL=https://$PublicHost/api\n")

    $envLines.Add("REDIS_PASSWORD=$($secrets["REDIS_PASSWORD"])\n")
    $envLines.Add("REDIS_URL=redis://:$encodedRedisPass@redis:6379/0\n")

    $envLines.Add("RABBITMQ_PASSWORD=$($secrets["RABBITMQ_PASSWORD"])\n")
    $envLines.Add("RABBITMQ_URL=amqp://admin:$encodedRabbitPass@rabbitmq:5672/%2F\n")
    $envLines.Add("CELERY_BROKER_URL=amqp://admin:$encodedRabbitPass@rabbitmq:5672/%2F\n")
    $envLines.Add("CELERY_RESULT_BACKEND=redis://:$encodedRedisPass@redis:6379/0\n")

    $envLines.Add("ENVIRONMENT=production\n")
    $envLines.Add("DEBUG=false\n")
    $envLines.Add("LOG_LEVEL=INFO\n")
    $envLines.Add("CORS_ALLOW_ALL=false\n")

    $envLines.Add("CELERY_WORKER_CONCURRENCY=4\n")
    $envLines.Add("UVICORN_TIMEOUT_KEEP_ALIVE=75\n")

    $localEnvProduction = Join-Path $projectRoot ".env.production"
    [System.IO.File]::WriteAllText($localEnvProduction, ($envLines -join ""), (New-Object System.Text.UTF8Encoding($false)))

    $localWebProduction = Join-Path $projectRoot ".webproduction"
    [System.IO.File]::WriteAllText($localWebProduction, ($envLines -join ""), (New-Object System.Text.UTF8Encoding($false)))

    Write-Host "Gerado: .env.production e .webproduction (local)" -ForegroundColor Green

    Write-Host "Criando diretórios na VPS..." -ForegroundColor Yellow
    ssh "$VpsUser@$VpsHost" "mkdir -p $RemoteDir/docker/nginx $RemoteDir/frontend"

    Write-Host "Enviando arquivos para VPS..." -ForegroundColor Yellow
    scp "./docker-compose.prod.yml" "$VpsUser@$VpsHost`:$RemoteDir/"
    scp "$localEnvProduction" "$VpsUser@$VpsHost`:$RemoteDir/.env.production"
    scp "./docker/nginx/nginx.docker-first.conf" "$VpsUser@$VpsHost`:$RemoteDir/docker/nginx/nginx.docker-first.conf"
    scp "./frontend/Dockerfile.prod" "$VpsUser@$VpsHost`:$RemoteDir/frontend/Dockerfile.prod"

    Write-Host "Subindo stack de produção (sem apagar volumes)..." -ForegroundColor Yellow

    $remoteCmd = @()
    $remoteCmd += "set -e"
    $remoteCmd += "cd $RemoteDir"
    $remoteCmd += "docker-compose -f docker-compose.prod.yml down || true"
    if ($SkipBuild) {
        $remoteCmd += "docker-compose -f docker-compose.prod.yml up -d"
    } else {
        $remoteCmd += "docker-compose -f docker-compose.prod.yml up -d --build"
    }
    $remoteCmd += "docker-compose -f docker-compose.prod.yml ps"

    ssh "$VpsUser@$VpsHost" ($remoteCmd -join " && ")

    Write-Host "Validando health checks..." -ForegroundColor Yellow
    try {
        $health = ssh "$VpsUser@$VpsHost" "curl -s -f http://localhost:8000/health"
        Write-Host "Backend /health: $health" -ForegroundColor Green
    } catch {
        Write-Host "Falha no /health do backend. Verifique logs: docker-compose -f docker-compose.prod.yml logs backend" -ForegroundColor Red
    }

    try {
        $healthApi = ssh "$VpsUser@$VpsHost" "curl -s -f -k https://localhost/api/health || curl -s -f http://localhost/api/health"
        Write-Host "Nginx /api/health: $healthApi" -ForegroundColor Green
    } catch {
        Write-Host "Falha no /api/health via Nginx. Verifique logs: docker-compose -f docker-compose.prod.yml logs nginx" -ForegroundColor Red
    }

    if ($SeedDemoData) {
        Write-Host "Seed demo data (idempotente, sem apagar dados)..." -ForegroundColor Yellow

        $seedSql = @"
DO $$
DECLARE
  cid integer;
BEGIN
  INSERT INTO companies (name, slug, description, email, phone, website, address, city, state, country, postal_code, business_hours, timezone, currency, primary_color, secondary_color, is_active, subscription_plan, features, settings, created_at, updated_at)
  VALUES (
      'Studio Elegance', 'studio-elegance',
      'Studio de beleza e estética premium com serviços de alta qualidade',
      'contato@studioelegance.com.br', '(11) 98765-4321',
      'www.studioelegance.com.br', 'Rua das Flores, 123',
      'São Paulo', 'SP', 'Brasil', '01402-000',
      '{\"monday\":{\"start\":\"09:00\",\"end\":\"19:00\",\"closed\":false}}',
      'America/Sao_Paulo', 'BRL', '#E91E63', '#9C27B0',
      true, 'ESSENCIAL',
      '[\"whatsapp\",\"online_booking\",\"financial_complete\"]',
      '{\"online_booking\":{\"enabled\":true}}',
      NOW(), NOW()
  )
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO cid FROM companies WHERE slug='studio-elegance' LIMIT 1;

  INSERT INTO users (company_id, email, password_hash, full_name, phone, role, is_active, is_verified, bio, specialties, commission_rate, notification_preferences, created_at, updated_at)
  VALUES (
      cid, 'andrekaidellisola@gmail.com',
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw/2Ej7W',
      'André Kaidellis Sola', '(11) 98765-4321',
      'ADMIN', true, true,
      'Proprietário e gestor do Studio Elegance',
      '[\"Gestão\",\"Atendimento ao Cliente\"]', 0,
      '{\"email\":true,\"sms\":false,\"whatsapp\":true,\"push\":true}',
      NOW(), NOW()
  )
  ON CONFLICT (email) DO NOTHING;
END $$;
"@

        $seedRemotePath = "$RemoteDir/seed_demo.sql"

        $seedRemoteCmd = @()
        $seedRemoteCmd += "set -e"
        $seedRemoteCmd += "cd $RemoteDir"
        $seedRemoteCmd += "cat > $seedRemotePath << 'SQL_EOF'"
        $seedRemoteCmd += $seedSql
        $seedRemoteCmd += "SQL_EOF"
        $seedRemoteCmd += "docker exec -i agendamento_db_prod psql -U $postgresUser -d $postgresDb -f $seedRemotePath"

        ssh "$VpsUser@$VpsHost" ($seedRemoteCmd -join "`n")

        Write-Host "Seed concluído." -ForegroundColor Green
    }

    Write-Host "=== Concluído ===" -ForegroundColor Green
    Write-Host "Acesse: https://$PublicHost" -ForegroundColor Cyan
    Write-Host "API: https://$PublicHost/api/health" -ForegroundColor Cyan
} finally {
    Pop-Location
}
