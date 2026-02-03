# PowerShell Script para Migração SAAS para VPS
# Uso: .\migrate-to-vps.ps1 [usuario-vps] [ip-vps] [caminho-chave-ssh]

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsUser,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$SshKey = "$env:USERPROFILE\.ssh\id_rsa"
)

# Configurações
$LocalPath = "e:\agendamento_SAAS"
$VpsBasePath = "/opt"
$RemoteProjectName = "agendamento-saas"
$VpsPath = "$VpsBasePath/$RemoteProjectName"
$LogFile = "C:\temp\migrate-to-vps-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Função de log
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    Write-Host $logMessage -ForegroundColor $Colors[$Color]
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-ErrorLog {
    param([string]$Message)
    Write-Log $Message "Red"
}

function Write-SuccessLog {
    param([string]$Message)
    Write-Log $Message "Green"
}

function Write-WarningLog {
    param([string]$Message)
    Write-Log $Message "Yellow"
}

function Write-InfoLog {
    param([string]$Message)
    Write-Log $Message "Blue"
}

# Verificar se o caminho local existe
if (-not (Test-Path $LocalPath)) {
    Write-ErrorLog "Caminho local não encontrado: $LocalPath"
    exit 1
}

# Verificar se a chave SSH existe
if (-not (Test-Path $SshKey)) {
    Write-ErrorLog "Chave SSH não encontrada: $SshKey"
    exit 1
}

# Criar diretório de logs se não existir
$logDir = Split-Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Write-SuccessLog "Iniciando migração organizada do SAAS para VPS"
Write-InfoLog "Origem: $LocalPath"
Write-InfoLog "Destino: $VpsUser@$VpsIp`:$VpsPath"
Write-InfoLog "Log: $LogFile"

# Testar conexão SSH
Write-SuccessLog "Testando conexão SSH com a VPS..."
try {
    $sshTest = ssh -i $SshKey -o ConnectTimeout=10 "$VpsUser@$VpsIp" "echo 'Conexão SSH estabelecida com sucesso'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorLog "Não foi possível conectar à VPS. Verifique IP, usuário e chave SSH."
        Write-ErrorLog "Detalhes: $sshTest"
        exit 1
    }
    Write-SuccessLog "Conexão SSH estabelecida com sucesso"
} catch {
    Write-ErrorLog "Erro ao testar conexão SSH: $_"
    exit 1
}

# Criar estrutura de diretórios na VPS
Write-SuccessLog "Criando estrutura de diretórios na VPS..."
$createDirsScript = @"
# Criar estrutura principal
mkdir -p $VpsPath/{app,config,data,logs,backups,ssl,monitoring,scripts,temp}

# Criar subdiretórios organizados
mkdir -p $VpsPath/app/{backend,frontend,docker,docs}
mkdir -p $VpsPath/config/{nginx,ssl,env}
mkdir -p $VpsPath/data/{postgres,redis,rabbitmq,uploads,static}
mkdir -p $VpsPath/logs/{nginx,backend,frontend,celery,system,deploy}
mkdir -p $VpsPath/backups/{database,files,config,full}
mkdir -p $VpsPath/ssl/{certbot,certificates}
mkdir -p $VpsPath/monitoring/{prometheus,grafana,alerts}
mkdir -p $VpsPath/scripts/{deploy,backup,maintenance,monitoring}
mkdir -p $VpsPath/temp/{builds,cache,uploads}

# Definir permissões
chmod 755 $VpsPath
chmod 700 $VpsPath/config
chmod 700 $VpsPath/ssl
chmod 755 $VpsPath/logs
chmod 755 $VpsPath/backups

echo "Estrutura de diretórios criada com sucesso"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $createDirsScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Estrutura de diretórios criada com sucesso"
    } else {
        Write-ErrorLog "Erro ao criar estrutura de diretórios: $result"
        exit 1
    }
} catch {
    Write-ErrorLog "Erro ao criar estrutura de diretórios: $_"
    exit 1
}

# Migrar código fonte do backend
Write-SuccessLog "Migrando código fonte do backend..."
$rsyncBackend = @"
rsync -avz --progress -e 'ssh -i $SshKey' \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.venv' \
    --exclude='node_modules' \
    --exclude='.pytest_cache' \
    --exclude='coverage' \
    --exclude='.coverage' \
    --exclude='logs/*' \
    --exclude='data/*' \
    '$LocalPath/backend/' '$VpsUser@$VpsIp`:$VpsPath/app/backend/'
"@

try {
    Invoke-Expression $rsyncBackend
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Backend migrado com sucesso"
    } else {
        Write-WarningLog "Aviso: Possíveis problemas na migração do backend"
    }
} catch {
    Write-WarningLog "Erro na migração do backend: $_"
}

# Migrar código fonte do frontend
Write-SuccessLog "Migrando código fonte do frontend..."
$rsyncFrontend = @"
rsync -avz --progress -e 'ssh -i $SshKey' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='out' \
    --exclude='build' \
    --exclude='dist' \
    --exclude='.env.local' \
    --exclude='logs/*' \
    '$LocalPath/frontend/' '$VpsUser@$VpsIp`:$VpsPath/app/frontend/'
"@

try {
    Invoke-Expression $rsyncFrontend
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Frontend migrado com sucesso"
    } else {
        Write-WarningLog "Aviso: Possíveis problemas na migração do frontend"
    }
} catch {
    Write-WarningLog "Erro na migração do frontend: $_"
}

# Migrar configurações Docker
Write-SuccessLog "Migrando configurações Docker..."
$rsyncDocker = @"
rsync -avz --progress -e 'ssh -i $SshKey' \
    '$LocalPath/docker/' '$VpsUser@$VpsIp`:$VpsPath/app/docker/'
"@

try {
    Invoke-Expression $rsyncDocker
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Configurações Docker migradas com sucesso"
    } else {
        Write-WarningLog "Aviso: Possíveis problemas na migração das configurações Docker"
    }
} catch {
    Write-WarningLog "Erro na migração das configurações Docker: $_"
}

# Migrar scripts de deploy
Write-SuccessLog "Migrando scripts de deploy..."
if (Test-Path "$LocalPath\vps-deploy-scripts") {
    $rsyncScripts = @"
rsync -avz --progress -e 'ssh -i $SshKey' \
    '$LocalPath\vps-deploy-scripts/' '$VpsUser@$VpsIp`:$VpsPath/scripts/deploy/'
"@
    
    try {
        Invoke-Expression $rsyncScripts
        if ($LASTEXITCODE -eq 0) {
            Write-SuccessLog "Scripts de deploy migrados com sucesso"
        } else {
            Write-WarningLog "Aviso: Possíveis problemas na migração dos scripts"
        }
    } catch {
        Write-WarningLog "Erro na migração dos scripts: $_"
    }
}

# Migrar documentação
Write-SuccessLog "Migrando documentação..."
$rsyncDocs = @"
rsync -avz --progress -e 'ssh -i $SshKey' \
    --include='*.md' \
    --exclude='*' \
    '$LocalPath/' '$VpsUser@$VpsIp`:$VpsPath/docs/'
"@

try {
    Invoke-Expression $rsyncDocs
    if ($LASTEXITCODE -eq 0) {
        Write-SuccessLog "Documentação migrada com sucesso"
    } else {
        Write-WarningLog "Aviso: Possíveis problemas na migração da documentação"
    }
} catch {
    Write-WarningLog "Erro na migração da documentação: $_"
}

# Configurar arquivos de ambiente na VPS
Write-SuccessLog "Configurando arquivos de ambiente..."
$setupEnvScript = @"
# Criar .env.production a partir do exemplo
cp $VpsPath/app/docker-compose.yml $VpsPath/config/
cp $VpsPath/app/.env.example $VpsPath/config/env/ 2>/dev/null || true

# Migrar scripts de deploy
cp -r $VpsPath/scripts/deploy/* $VpsPath/app/scripts/ 2>/dev/null || true

echo "Arquivos de ambiente configurados"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $setupEnvScript 2>&1
    Write-SuccessLog "Arquivos de ambiente configurados"
} catch {
    Write-WarningLog "Erro na configuração dos arquivos de ambiente: $_"
}

# Configurar permissões na VPS
Write-SuccessLog "Configurando permissões..."
$permissionsScript = @"
# Dono dos diretórios
chown -R root:root $VpsPath

# Permissões específicas
chmod 755 $VpsPath/app
chmod 755 $VpsPath/app/backend
chmod 755 $VpsPath/app/frontend
chmod 755 $VpsPath/app/docker
chmod 755 $VpsPath/docs

# Scripts executáveis
chmod +x $VpsPath/scripts/deploy/*.sh 2>/dev/null || true
chmod +x $VpsPath/app/scripts/*.sh 2>/dev/null || true

# Logs e backups
chmod 755 $VpsPath/logs 2>/dev/null || true
chmod 755 $VpsPath/backups 2>/dev/null || true

echo "Permissões configuradas"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $permissionsScript 2>&1
    Write-SuccessLog "Permissões configuradas"
} catch {
    Write-WarningLog "Erro na configuração das permissões: $_"
}

# Criar links simbólicos
Write-SuccessLog "Criando links simbólicos..."
$symlinksScript = @"
# Links simbólicos para facilitar acesso
ln -sf $VpsPath/app /opt/agendamento-saas/current 2>/dev/null || true
ln -sf $VpsPath/logs /opt/agendamento-saas/logs 2>/dev/null || true
ln -sf $VpsPath/data /opt/agendamento-saas/data 2>/dev/null || true
ln -sf $VpsPath/config /opt/agendamento-saas/config 2>/dev/null || true
ln -sf $VpsPath/scripts /opt/agendamento-saas/scripts 2>/dev/null || true

echo "Links simbólicos criados"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $symlinksScript 2>&1
    Write-SuccessLog "Links simbólicos criados"
} catch {
    Write-WarningLog "Erro na criação dos links simbólicos: $_"
}

# Gerar arquivo de informação da migração
Write-SuccessLog "Gerando arquivo de informação da migração..."
$migrationInfo = @"
cat > $VpsPath/MIGRATION_INFO.txt << 'MIGEOF'
========================================
INFORMAÇÕES DA MIGRAÇÃO
========================================
Data: $(date)
Origem: $LocalPath
Destino: $VpsPath
Usuario: $VpsUser
SO Origem: Windows PowerShell
SO Destino: Linux

ESTRUTURA DE DIRETÓRIOS:
========================================
$VpsPath/
├── app/                    # Código fonte
│   ├── backend/           # Backend FastAPI
│   ├── frontend/          # Frontend Next.js
│   ├── docker/            # Configurações Docker
│   └── scripts/           # Scripts de deploy
├── config/                # Configurações
│   ├── nginx/            # Config Nginx
│   ├── ssl/              # Certificados SSL
│   └── env/              # Variáveis ambiente
├── data/                  # Dados persistentes
│   ├── postgres/         # Dados PostgreSQL
│   ├── redis/            # Dados Redis
│   ├── rabbitmq/         # Dados RabbitMQ
│   └── uploads/          # Uploads de arquivos
├── logs/                  # Logs da aplicação
├── backups/               # Backups automatizados
├── ssl/                   # Certificados SSL
├── monitoring/            # Monitoramento
├── scripts/               # Scripts de manutenção
├── temp/                  # Arquivos temporários
└── docs/                  # Documentação

PRÓXIMOS PASSOS:
========================================
1. Editar $VpsPath/app/.env.production
2. Configurar domínio e SSL
3. Migrar banco de dados
4. Executar deploy inicial
5. Configurar monitoramento

COMANDOS ÚTEIS:
========================================
cd $VpsPath/app
./scripts/deploy.sh main
./scripts/backup.sh daily
./scripts/health-check.sh

OBSERVAÇÕES:
========================================
- Migração feita via PowerShell (Windows)
- Data/hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- Usuário Windows: $env:USERNAME
- IP Origem: (curl -s ifconfig.me 2>/dev/null || echo 'N/A')
MIGEOF

echo "Arquivo de migração criado"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $migrationInfo 2>&1
    Write-SuccessLog "Arquivo de informação da migração criado"
} catch {
    Write-WarningLog "Erro na criação do arquivo de informação: $_"
}

# Verificar estrutura criada
Write-SuccessLog "Verificando estrutura criada na VPS..."
$verifyScript = @"
echo "========================================"
echo "ESTRUTURA CRIADA NA VPS:"
echo "========================================"
ls -la $VpsPath 2>/dev/null || echo "Diretório principal não encontrado"
echo ""
echo "Estrutura de app:"
ls -la $VpsPath/app 2>/dev/null || echo "App não encontrado"
echo ""
echo "Espaço utilizado:"
du -sh $VpsPath 2>/dev/null || echo "Não foi possível verificar espaço"
echo "========================================"
"@

try {
    $result = ssh -i $SshKey "$VpsUser@$VpsIp" $verifyScript 2>&1
    Write-Host $result
} catch {
    Write-WarningLog "Erro na verificação da estrutura: $_"
}

# Resumo final
Write-SuccessLog "========================================"
Write-SuccessLog "MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
Write-SuccessLog "========================================"
Write-InfoLog "Origem: $LocalPath"
Write-InfoLog "Destino: $VpsUser@$VpsIp`:$VpsPath"
Write-InfoLog "Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-InfoLog "Log completo: $LogFile"
Write-Host ""
Write-WarningLog "PRÓXIMOS PASSOS:"
Write-WarningLog "1. Acessar VPS: ssh -i $SshKey $VpsUser@$VpsIp"
Write-WarningLog "2. Editar configurações: nano $VpsPath/app/.env.production"
Write-WarningLog "3. Executar setup: cd $VpsPath && ./scripts/deploy/setup-vps.sh"
Write-WarningLog "4. Migrar dados: Verificar documentação em $VpsPath/docs/"
Write-WarningLog "5. Iniciar serviços: cd $VpsPath/app && ./scripts/deploy.sh main"
Write-Host ""
Write-InfoLog "Arquivo de informações: $VpsPath/MIGRATION_INFO.txt"
Write-SuccessLog "========================================"

# Abrir o log se solicitado
Write-Host ""
Write-Host "Deseja abrir o arquivo de log? (S/N): " -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'S' -or $response -eq 's') {
    Invoke-Item $LogFile
}
