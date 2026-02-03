#!/usr/bin/env pwsh

# Script de Backup Local Completo
# Cria backup completo do projeto local

param(
    [Parameter(Position=0)]
    [ValidateSet("full", "code", "database", "config")]
    [string]$Tipo = "full"
)

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = "e:\agendamento_SAAS"
$BACKUP_DIR = "e:\agendamento_SAAS\backups"
$DATE = Get-Date -Format "yyyyMMdd-HHmmss"

function Log-Message {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Create-BackupDirectories {
    if (-not (Test-Path $BACKUP_DIR)) {
        New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
        Log-Message "Criado diretório de backup: $BACKUP_DIR"
    }
}

function Backup-Code {
    Log-Message "Fazendo backup do código fonte..."
    $codeBackupPath = "$BACKUP_DIR\code-$DATE.zip"
    
    # Excluir diretórios grandes e desnecessários
    $excludePaths = @(
        "$PROJECT_ROOT\.git", 
        "$PROJECT_ROOT\node_modules", 
        "$PROJECT_ROOT\__pycache__", 
        "$PROJECT_ROOT\.pytest_cache", 
        "$PROJECT_ROOT\.next", 
        "$PROJECT_ROOT\dist", 
        "$PROJECT_ROOT\build", 
        "$PROJECT_ROOT\.venv", 
        "$PROJECT_ROOT\venv", 
        "$PROJECT_ROOT\env",
        "$PROJECT_ROOT\backups", 
        "$PROJECT_ROOT\nao subir pra produção"
    )
    
    # Criar lista de arquivos para backup (excluíndo os diretórios)
    $filesToBackup = Get-ChildItem -Path $PROJECT_ROOT -File | Select-Object -ExpandProperty FullName
    $dirsToBackup = Get-ChildItem -Path $PROJECT_ROOT -Directory | Where-Object {
        $excludePaths -notcontains $_.FullName
    } | Select-Object -ExpandProperty FullName
    
    $allPaths = $filesToBackup + $dirsToBackup
    
    if ($allPaths.Count -gt 0) {
        Compress-Archive -Path $allPaths -DestinationPath $codeBackupPath -Force
        
        if (Test-Path $codeBackupPath) {
            $size = (Get-Item $codeBackupPath).Length / 1MB
            Log-Message "Backup do código criado: $codeBackupPath ($([math]::Round($size, 2)) MB)"
        } else {
            throw "Falha ao criar backup do código"
        }
    } else {
        Log-Message "Nenhum arquivo encontrado para backup"
    }
}

function Backup-Database {
    Log-Message "Fazendo backup do banco de dados local (se existir)..."
    
    # Verificar se há um banco local
    $dbFiles = @(
        "$PROJECT_ROOT\backend\app.db",
        "$PROJECT_ROOT\data\database.db",
        "$PROJECT_ROOT\database\*.db",
        "$PROJECT_ROOT\*.db"
    )
    
    $foundDb = $false
    foreach ($dbFile in $dbFiles) {
        if (Test-Path $dbFile) {
            $foundDb = $true
            $dbBackupPath = "$BACKUP_DIR\database-$DATE.zip"
            Compress-Archive -Path $dbFile -DestinationPath $dbBackupPath -Force
            Log-Message "Backup do banco criado: $dbBackupPath"
        }
    }
    
    if (-not $foundDb) {
        Log-Message "Nenhum banco de dados local encontrado"
    }
}

function Backup-Config {
    Log-Message "Fazendo backup das configurações..."
    $configBackupPath = "$BACKUP_DIR\config-$DATE.zip"
    
    $configFiles = @()
    $possibleConfigs = @(
        "$PROJECT_ROOT\.env.production",
        "$PROJECT_ROOT\.env.test",
        "$PROJECT_ROOT\.env.example",
        "$PROJECT_ROOT\docker-compose.prod.yml",
        "$PROJECT_ROOT\docker-compose.yml",
        "$PROJECT_ROOT\Dockerfile",
        "$PROJECT_ROOT\Dockerfile.prod",
        "$PROJECT_ROOT\frontend\package.json",
        "$PROJECT_ROOT\backend\requirements.txt",
        "$PROJECT_ROOT\alembic.ini",
        "$PROJECT_ROOT\backend\alembic.ini"
    )
    
    foreach ($configFile in $possibleConfigs) {
        if (Test-Path $configFile) {
            $configFiles += $configFile
        }
    }
    
    if ($configFiles.Count -gt 0) {
        Compress-Archive -Path $configFiles -DestinationPath $configBackupPath -Force
        Log-Message "Backup das configurações criado: $configBackupPath"
    } else {
        Log-Message "Nenhum arquivo de configuração encontrado"
    }
}

function Backup-Full {
    Log-Message "Fazendo backup completo..."
    $fullBackupPath = "$BACKUP_DIR\full-$DATE.zip"
    
    # Excluir apenas os diretórios muito grandes
    $excludePaths = @(
        "$PROJECT_ROOT\.git", 
        "$PROJECT_ROOT\node_modules", 
        "$PROJECT_ROOT\__pycache__", 
        "$PROJECT_ROOT\.pytest_cache", 
        "$PROJECT_ROOT\.next", 
        "$PROJECT_ROOT\dist", 
        "$PROJECT_ROOT\build", 
        "$PROJECT_ROOT\.venv", 
        "$PROJECT_ROOT\venv", 
        "$PROJECT_ROOT\env",
        "$PROJECT_ROOT\backups", 
        "$PROJECT_ROOT\nao subir pra produção"
    )
    
    # Criar lista de arquivos para backup (excluíndo os diretórios)
    $filesToBackup = Get-ChildItem -Path $PROJECT_ROOT -File | Select-Object -ExpandProperty FullName
    $dirsToBackup = Get-ChildItem -Path $PROJECT_ROOT -Directory | Where-Object {
        $excludePaths -notcontains $_.FullName
    } | Select-Object -ExpandProperty FullName
    
    $allPaths = $filesToBackup + $dirsToBackup
    
    if ($allPaths.Count -gt 0) {
        Compress-Archive -Path $allPaths -DestinationPath $fullBackupPath -Force
        
        if (Test-Path $fullBackupPath) {
            $size = (Get-Item $fullBackupPath).Length / 1MB
            Log-Message "Backup completo criado: $fullBackupPath ($([math]::Round($size, 2)) MB)"
        } else {
            throw "Falha ao criar backup completo"
        }
    } else {
        Log-Message "Nenhum arquivo encontrado para backup"
    }
}

function Clean-OldBackups {
    param([int]$Days)
    
    Log-Message "Limpando backups com mais de $Days dias..."
    
    Get-ChildItem -Path $BACKUP_DIR -Filter "*.zip" | Where-Object {
        $_.CreationTime -lt (Get-Date).AddDays(-$Days)
    } | Remove-Item -Force
    
    Log-Message "Limpeza concluída"
}

function Generate-BackupReport {
    $reportPath = "$BACKUP_DIR\backup-report-$DATE.txt"
    
    $report = @"
========================================
RELATÓRIO DE BACKUP LOCAL - $DATE
========================================
Tipo: $Tipo
Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Projeto: $PROJECT_ROOT

Arquivos criados:
"@
    
    Get-ChildItem -Path $BACKUP_DIR -Filter "*$DATE*.zip" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        $report += "`n$($_.Name) - $size MB"
    }
    
    $report += @"

========================================
Estrutura do projeto:
"@
    
    Get-ChildItem -Path $PROJECT_ROOT | Where-Object { $_.PSIsContainer } | ForEach-Object {
        $report += "`n$($_.Name)/"
    }
    
    $report += @"

========================================
Espaço em disco:
"@
    
    $drive = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "E:" }
    if ($drive) {
        $total = [math]::Round($drive.Size / 1GB, 2)
        $free = [math]::Round($drive.FreeSpace / 1GB, 2)
        $used = $total - $free
        $report += "Drive E: $total GB total, $used GB usado, $free GB livre"
    }
    
    $report += "`n========================================"
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Log-Message "Relatório salvo em: $reportPath"
}

# Execução principal
try {
    Log-Message "Iniciando backup local do tipo: $Tipo"
    Create-BackupDirectories
    
    switch ($Tipo) {
        "code" {
            Backup-Code
            Clean-OldBackups -Days 7
        }
        
        "database" {
            Backup-Database
        }
        
        "config" {
            Backup-Config
        }
        
        "full" {
            Backup-Code
            Backup-Database
            Backup-Config
            Backup-Full
            Clean-OldBackups -Days 7
        }
    }
    
    Generate-BackupReport
    
    Log-Message "Backup local concluído com sucesso!"
    Log-Message "Tipo: $Tipo"
    Log-Message "Data: $DATE"
    
} catch {
    Log-Message "ERRO: $_" -ForegroundColor Red
    exit 1
}
