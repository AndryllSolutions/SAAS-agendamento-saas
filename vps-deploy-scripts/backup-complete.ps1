#!/usr/bin/env pwsh

# Script de Backup Completo do Sistema SaaS
# Uso: ./backup-complete.ps1 [tipo]

param(
    [Parameter(Position=0)]
    [ValidateSet("daily", "weekly", "full", "before-deploy", "after-deploy")]
    [string]$Tipo = "full"
)

$ErrorActionPreference = "Stop"

$APP_DIR = "/opt/agendamento-saas"
$BACKUP_DIR = "/opt/agendamento-saas/backups"
$DATE = Get-Date -Format "yyyyMMdd-HHmmss"

function Log-Message {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Create-BackupDirectories {
    $dirs = @("$BACKUP_DIR/database", "$BACKUP_DIR/files", "$BACKUP_DIR/config", "$BACKUP_DIR/full")
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Log-Message "Criado diretório: $dir"
        }
    }
}

function Backup-Database {
    Log-Message "Fazendo backup do banco de dados..."
    $dbBackupPath = "$BACKUP_DIR/database/db-$DATE.sql"
    
    $dockerCmd = "docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U agendamento_prod agendamento_prod > $dbBackupPath"
    Invoke-Expression $dockerCmd
    
    if (Test-Path $dbBackupPath) {
        $size = (Get-Item $dbBackupPath).Length / 1MB
        Log-Message "Backup do banco criado: $dbBackupPath ($([math]::Round($size, 2)) MB)"
    } else {
        throw "Falha ao criar backup do banco de dados"
    }
}

function Backup-Files {
    Log-Message "Fazendo backup dos arquivos de uploads..."
    $filesBackupPath = "$BACKUP_DIR/files/uploads-$DATE.tar.gz"
    
    $tarCmd = "tar -czf `"$filesBackupPath`" -C /opt/agendamento-saas/data uploads/"
    Invoke-Expression $tarCmd
    
    if (Test-Path $filesBackupPath) {
        $size = (Get-Item $filesBackupPath).Length / 1MB
        Log-Message "Backup dos arquivos criado: $filesBackupPath ($([math]::Round($size, 2)) MB)"
    } else {
        throw "Falha ao criar backup dos arquivos"
    }
}

function Backup-Config {
    Log-Message "Fazendo backup das configuracoes..."
    $configBackupPath = "$BACKUP_DIR/config/config-$DATE.tar.gz"
    
    $tarCmd = "tar -czf `"$configBackupPath`" -C /opt/agendamento-saas/app .env.production docker-compose.prod.yml"
    Invoke-Expression $tarCmd
    
    if (Test-Path $configBackupPath) {
        $size = (Get-Item $configBackupPath).Length / 1MB
        Log-Message "Backup das configuracoes criado: $configBackupPath ($([math]::Round($size, 2)) MB)"
    } else {
        throw "Falha ao criar backup das configuracoes"
    }
}

function Backup-Full {
    Log-Message "Fazendo backup completo do sistema..."
    $fullBackupPath = "$BACKUP_DIR/full/full-$DATE.tar.gz"
    
    # Excluir backups antigos e cache para economizar espaço
    $excludeCmd = "tar --exclude=`"$BACKUP_DIR`" --exclude=`"*.log`" --exclude=`"node_modules`" --exclude=`".git`" --exclude=`"__pycache__`" -czf `"$fullBackupPath`" -C /opt/agendamento-saas ."
    Invoke-Expression $excludeCmd
    
    if (Test-Path $fullBackupPath) {
        $size = (Get-Item $fullBackupPath).Length / 1MB
        Log-Message "Backup completo criado: $fullBackupPath ($([math]::Round($size, 2)) MB)"
    } else {
        throw "Falha ao criar backup completo"
    }
}

function Clean-OldBackups {
    param([int]$Days)
    
    Log-Message "Limpando backups com mais de $Days dias..."
    
    # Limpar backups antigos do banco
    Get-ChildItem -Path "$BACKUP_DIR/database" -Filter "*.sql" | Where-Object {
        $_.CreationTime -lt (Get-Date).AddDays(-$Days)
    } | Remove-Item -Force
    
    # Limpar backups antigos de arquivos
    Get-ChildItem -Path "$BACKUP_DIR/files" -Filter "*.tar.gz" | Where-Object {
        $_.CreationTime -lt (Get-Date).AddDays(-$Days)
    } | Remove-Item -Force
    
    # Limpar backups antigos de configuracoes
    Get-ChildItem -Path "$BACKUP_DIR/config" -Filter "*.tar.gz" | Where-Object {
        $_.CreationTime -lt (Get-Date).AddDays(-$Days)
    } | Remove-Item -Force
    
    Log-Message "Limpeza concluída"
}

# Início do backup
Log-Message "Iniciando backup do tipo: $Tipo"
Create-BackupDirectories

switch ($Tipo) {
    "daily" {
        Backup-Database
        Backup-Files
        Backup-Config
        Clean-OldBackups -Days 7
    }
    
    "weekly" {
        Backup-Full
        Clean-OldBackups -Days 28
    }
    
    "full" {
        Backup-Database
        Backup-Files
        Backup-Config
        Backup-Full
        Clean-OldBackups -Days 7
    }
    
    "before-deploy" {
        Backup-Database
    }
    
    "after-deploy" {
        Backup-Database
    }
}

# Gerar relatório do backup
$reportPath = "$BACKUP_DIR/backup-report-$DATE.txt"
$report = @"
========================================
RELATÓRIO DE BACKUP - $DATE
========================================
Tipo: $Tipo
Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

Arquivos criados:
"@

Get-ChildItem -Path $BACKUP_DIR -Recurse | Where-Object {
    $_.CreationTime -ge (Get-Date).AddMinutes(-5)
} | ForEach-Object {
    $size = if ($_.PSIsContainer) { "DIR" } else { "$([math]::Round($_.Length / 1MB, 2)) MB" }
    $report += "`n$($_.FullName) - $size"
}

$report += @"

========================================
Espaço utilizado em disco:
"@

$diskUsage = df -h /opt/agendamento-saas 2>$null
if ($diskUsage) {
    $report += $diskUsage
} else {
    $report += "Não foi possível obter informações de disco"
}

$report += "`n========================================"
$report | Out-File -FilePath $reportPath -Encoding UTF8

Log-Message "Backup concluído com sucesso!"
Log-Message "Relatório salvo em: $reportPath"
Log-Message "Tipo do backup: $Tipo ($DATE)"
