#!/usr/bin/env pwsh

# Script de Backup na VPS
# Conecta na VPS e executa backup completo

param(
    [Parameter(Position=0)]
    [ValidateSet("daily", "weekly", "full", "before-deploy", "after-deploy")]
    [string]$Tipo = "full",
    
    [Parameter(Position=1)]
    [string]$VPS_IP = "72.62.138.239",
    
    [Parameter(Position=2)]
    [string]$VPS_USER = "root"
)

$ErrorActionPreference = "Stop"

function Log-Message {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Test-VPSConnection {
    Log-Message "Testando conexao com VPS $VPS_IP..."
    
    $pingResult = Test-Connection -ComputerName $VPS_IP -Count 2 -Quiet
    if (-not $pingResult) {
        throw "VPS $VPS_IP não está respondendo ao ping"
    }
    
    Log-Message "VPS respondendo. Testando conexao SSH..."
    
    # Testar se SSH está disponível
    $sshTest = ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_USER@$VPS_IP "echo 'SSH OK'" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Falha na conexao SSH com $VPS_USER@$VPS_IP"
    }
    
    Log-Message "Conexao SSH estabelecida com sucesso"
}

function Execute-RemoteBackup {
    param([string]$BackupType)
    
    Log-Message "Executando backup remoto do tipo: $BackupType"
    
    $remoteScript = @"
#!/bin/bash

# Script de Backup Remoto
set -e

APP_DIR="/opt/agendamento-saas"
BACKUP_DIR="/opt/agendamento-saas/backups"
DATE=$(date +%Y%m%d-%H%M%S)

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Iniciando backup remoto do tipo: $BackupType"

# Criar diretorios de backup
mkdir -p "$BACKUP_DIR/database" "$BACKUP_DIR/files" "$BACKUP_DIR/config" "$BACKUP_DIR/full"

case $BackupType in
    "daily")
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup diário..."
        
        # Backup do banco
        cd $APP_DIR
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > "$BACKUP_DIR/database/db-$DATE.sql"
        
        # Backup dos arquivos
        tar -czf "$BACKUP_DIR/files/uploads-$DATE.tar.gz" -C /opt/agendamento-saas/data uploads/ 2>/dev/null || echo "Diretório uploads não encontrado"
        
        # Backup das configurações
        tar -czf "$BACKUP_DIR/config/config-$DATE.tar.gz" -C /opt/agendamento-saas/app .env.production docker-compose.prod.yml 2>/dev/null || echo "Arquivos de config não encontrados"
        
        # Limpar backups antigos (7 dias)
        find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
        find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
        ;;
        
    "weekly")
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup semanal..."
        
        # Backup completo
        tar --exclude="$BACKUP_DIR" --exclude="*.log" --exclude="node_modules" --exclude=".git" --exclude="__pycache__" -czf "$BACKUP_DIR/full/full-$DATE.tar.gz" -C /opt/agendamento-saas . 2>/dev/null || echo "Erro no backup completo"
        
        # Limpar backups semanais antigos (28 dias)
        find "$BACKUP_DIR/full" -name "*.tar.gz" -mtime +28 -delete 2>/dev/null || true
        ;;
        
    "full")
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup completo..."
        
        cd $APP_DIR
        
        # Backup do banco
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > "$BACKUP_DIR/database/db-$DATE.sql"
        
        # Backup dos arquivos
        tar -czf "$BACKUP_DIR/files/uploads-$DATE.tar.gz" -C /opt/agendamento-saas/data uploads/ 2>/dev/null || echo "Diretório uploads não encontrado"
        
        # Backup das configurações
        tar -czf "$BACKUP_DIR/config/config-$DATE.tar.gz" -C /opt/agendamento-saas/app .env.production docker-compose.prod.yml 2>/dev/null || echo "Arquivos de config não encontrados"
        
        # Backup completo
        tar --exclude="$BACKUP_DIR" --exclude="*.log" --exclude="node_modules" --exclude=".git" --exclude="__pycache__" -czf "$BACKUP_DIR/full/full-$DATE.tar.gz" -C /opt/agendamento-saas . 2>/dev/null || echo "Erro no backup completo"
        
        # Limpar backups antigos (7 dias)
        find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete 2>/dev/null || true
        find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
        ;;
        
    "before-deploy"|"after-deploy")
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup de deploy $BackupType..."
        
        cd $APP_DIR
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > "$BACKUP_DIR/database/deploy-$BackupType-$DATE.sql"
        ;;
esac

# Listar arquivos criados
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Arquivos de backup criados:"
find "$BACKUP_DIR" -name "*$DATE*" -exec ls -lh {} \; 2>/dev/null || echo "Nenhum arquivo encontrado"

# Espaço em disco
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Espaço em disco:"
df -h /opt/agendamento-saas 2>/dev/null || echo "Não foi possível obter informações de disco"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup remoto concluído: $BackupType ($DATE)"
"@
    
    # Executar script remoto via SSH
    $remoteScript | ssh $VPS_USER@$VPS_IP "bash -s -- $BackupType"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Falha na execução do backup remoto"
    }
}

function Download-BackupFiles {
    param([string]$Date)
    
    Log-Message "Baixando arquivos de backup da VPS..."
    
    $localBackupDir = "e:\agendamento_SAAS\backups\$Date"
    if (-not (Test-Path $localBackupDir)) {
        New-Item -ItemType Directory -Path $localBackupDir -Force | Out-Null
    }
    
    # Baixar arquivos de backup
    $scpCommands = @(
        "scp -r $VPS_USER@$VPS_IP`:/opt/agendamento-saas/backups/database/*$Date*.sql $localBackupDir\",
        "scp -r $VPS_USER@$VPS_IP`:/opt/agendamento-saas/backups/files/*$Date*.tar.gz $localBackupDir\",
        "scp -r $VPS_USER@$VPS_IP`:/opt/agendamento-saas/backups/config/*$Date*.tar.gz $localBackupDir\",
        "scp -r $VPS_USER@$VPS_IP`:/opt/agendamento-saas/backups/full/*$Date*.tar.gz $localBackupDir\"
    )
    
    foreach ($cmd in $scpCommands) {
        try {
            Invoke-Expression $cmd
            Log-Message "Download executado: $cmd"
        } catch {
            Log-Message "Aviso: Falha no download - $_"
        }
    }
    
    Log-Message "Arquivos de backup baixados para: $localBackupDir"
}

# Execução principal
try {
    Log-Message "Iniciando processo de backup na VPS"
    
    # Testar conexão
    Test-VPSConnection
    
    # Executar backup remoto
    Execute-RemoteBackup -BackupType $Tipo
    
    # Gerar timestamp para download
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    
    # Opcional: baixar arquivos de backup
    $downloadChoice = Read-Host "Deseja baixar os arquivos de backup para a máquina local? (S/N)"
    if ($downloadChoice -eq "S" -or $downloadChoice -eq "s") {
        Download-BackupFiles -Date $timestamp
    }
    
    Log-Message "Backup concluído com sucesso!"
    Log-Message "Tipo: $Tipo"
    Log-Message "VPS: $VPS_IP"
    
} catch {
    Log-Message "ERRO: $_" -ForegroundColor Red
    exit 1
}
