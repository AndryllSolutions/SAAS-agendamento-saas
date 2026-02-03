# Script para iniciar Agendamento SaaS com Cloud Tunnel
# Uso: .\start-tunnel-quick.ps1

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('cloudflare', 'localtunnel', 'ngrok')]
    [string]$Provider = 'localtunnel'
)

Write-Host "========================================"
Write-Host "  Agendamento SaaS - Cloud Tunnel"
Write-Host "========================================"
Write-Host ""

# Verificar Docker
Write-Host "[1/5] Verificando Docker..."
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker não está rodando!"
    Write-Host "Inicie o Docker Desktop primeiro."
    exit 1
}
Write-Host "Docker OK"

# Iniciar containers
Write-Host ""
Write-Host "[2/5] Iniciando containers..."
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao iniciar containers!"
    exit 1
}
Write-Host "Containers iniciados"
Start-Sleep -Seconds 8

# Verificar frontend
Write-Host ""
Write-Host "[3/5] Verificando frontend..."
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet
if (-not $frontendRunning) {
    Write-Host "Frontend não está rodando, iniciando..."
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\agendamento_SAAS\frontend; npm run dev" -WindowStyle Normal
    
    Write-Host "Aguardando frontend iniciar..."
    Start-Sleep -Seconds 20
} else {
    Write-Host "Frontend OK"
}

# Verificar backend
Write-Host ""
Write-Host "[4/5] Verificando backend..."
$backendRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet
if (-not $backendRunning) {
    Write-Host "Backend não está respondendo na porta 8000"
    Write-Host "Verifique os logs: docker-compose logs backend"
} else {
    Write-Host "Backend OK"
}

# Iniciar tunnels
Write-Host ""
Write-Host "[5/5] Iniciando tunnels ($Provider)..."

switch ($Provider) {

    'localtunnel' {

        $ltInstalled = Get-Command lt -ErrorAction SilentlyContinue
        if (-not $ltInstalled) {
            Write-Host "localtunnel não está instalado. Instalando..."
            npm install -g localtunnel
        }
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND TUNNEL'; lt --port 3000 --subdomain agendamento-app-$(Get-Random -Maximum 9999)" -WindowStyle Normal
        
        Start-Sleep -Seconds 2
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND TUNNEL'; lt --port 8000 --subdomain agendamento-api-$(Get-Random -Maximum 9999)" -WindowStyle Normal
    }

    'cloudflare' {
        $cfInstalled = Get-Command cloudflared -ErrorAction SilentlyContinue
        if (-not $cfInstalled) {
            Write-Host "cloudflared não está instalado!"
            Write-Host "Baixe em: https://github.com/cloudflare/cloudflared/releases"
            exit 1
        }
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND TUNNEL (Cloudflare)'; cloudflared tunnel --url http://localhost:3000" -WindowStyle Normal
        
        Start-Sleep -Seconds 2
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND TUNNEL (Cloudflare)'; cloudflared tunnel --url http://localhost:8000" -WindowStyle Normal
    }

    'ngrok' {
        $ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
        if (-not $ngrokInstalled) {
            Write-Host "ngrok não está instalado!"
            Write-Host "Baixe em: https://ngrok.com/download"
            exit 1
        }
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND TUNNEL (ngrok)'; ngrok http 3000" -WindowStyle Normal
        
        Start-Sleep -Seconds 2
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND TUNNEL (ngrok)'; ngrok http 8000" -WindowStyle Normal
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  TUDO INICIADO COM SUCESSO!"
Write-Host "========================================"
Write-Host ""
Write-Host "Front-end: http://localhost:3000"
Write-Host "Back-end:  http://localhost:8000"
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
