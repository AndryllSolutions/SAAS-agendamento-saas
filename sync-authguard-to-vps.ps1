# Script de Sincronização do AuthGuard para VPS
# Uso: .\sync-authguard-to-vps.ps1

param(
    [string]$VPS_IP = "72.62.138.239",
    [string]$VPS_USER = "root",
    [string]$VPS_PATH = "/opt/saas/atendo"
)

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green" 
    Yellow = "Yellow"
    Blue = "Blue"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Log-Info {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] INFO: $Message" $Colors.Blue
}

function Log-Success {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] SUCCESS: $Message" $Colors.Green
}

function Log-Warning {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] WARNING: $Message" $Colors.Yellow
}

function Log-Error {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] ERROR: $Message" $Colors.Red
}

# Verificar se o scp está disponível
try {
    $null = Get-Command scp -ErrorAction Stop
} catch {
    Log-Error "scp não encontrado. Por favor, instale OpenSSH ou use Git Bash"
    exit 1
}

# Arquivos do AuthGuard para sincronizar
$authGuardFiles = @(
    "frontend/src/components/AuthGuard.tsx",
    "frontend/src/hooks/useAuth.ts",
    "frontend/src/app/login/page.tsx",
    "frontend/src/app/register/page.tsx",
    "frontend/src/app/saas-admin/page.tsx"
)

# Verificar se os arquivos existem localmente
Log-Info "Verificando arquivos locais..."
$filesToSync = @()
foreach ($file in $authGuardFiles) {
    $localPath = Join-Path "e:\agendamento_SAAS" $file
    if (Test-Path $localPath) {
        $filesToSync += $file
        Log-Success "Arquivo encontrado: $file"
    } else {
        Log-Warning "Arquivo não encontrado: $file"
    }
}

if ($filesToSync.Count -eq 0) {
    Log-Error "Nenhum arquivo do AuthGuard encontrado para sincronizar"
    exit 1
}

# Sincronizar arquivos
Log-Info "Iniciando sincronização do AuthGuard para VPS..."
Log-Info "Destino: $VPS_USER@$VPS_IP`:$VPS_PATH"

foreach ($file in $filesToSync) {
    $localPath = Join-Path "e:\agendamento_SAAS" $file
    $remotePath = "$VPS_PATH/$file"
    
    Log-Info "Sincronizando: $file"
    
    try {
        # Criar diretório remoto se não existir
        $remoteDir = Split-Path $remotePath -Parent
        $createDirCmd = "ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP 'mkdir -p $remoteDir'"
        $null = Invoke-Expression $createDirCmd
        
        # Copiar arquivo
        $scpCmd = "scp -o StrictHostKeyChecking=no `"$localPath`" `"$VPS_USER@$VPS_IP`:$remotePath`""
        $null = Invoke-Expression $scpCmd
        
        Log-Success "Arquivo sincronizado: $file"
    } catch {
        Log-Error "Erro ao sincronizar $file`: $_"
    }
}

# Verificar status na VPS
Log-Info "Verificando status na VPS..."
try {
    $checkCmd = "ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP 'ls -la $VPS_PATH/frontend/src/components/AuthGuard.tsx'"
    $result = Invoke-Expression $checkCmd
    Log-Success "AuthGuard.tsx verificado na VPS:"
    Write-Host $result
} catch {
    Log-Error "Erro ao verificar status na VPS: $_"
}

# Reiniciar containers se necessário
Log-Info "Deseja reiniciar os containers na VPS? (y/n)"
$answer = Read-Host

if ($answer -eq 'y' -or $answer -eq 'Y') {
    Log-Info "Reiniciando containers..."
    try {
        $restartCmd = "ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP 'cd $VPS_PATH && docker-compose restart'"
        $null = Invoke-Expression $restartCmd
        Log-Success "Containers reiniciados com sucesso"
    } catch {
        Log-Error "Erro ao reiniciar containers: $_"
    }
}

Log-Success "Sincronização do AuthGuard concluída!"
Log-Info "Próximos passos:"
Log-Info "1. Verifique a aplicação em http://$VPS_IP"
Log-Info "2. Teste o fluxo de autenticação"
Log-Info "3. Verifique os logs se necessário: ssh $VPS_USER@$VPS_IP 'cd $VPS_PATH && docker-compose logs -f backend'"
