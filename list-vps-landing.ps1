#!/usr/bin/env pwsh
# Script para listar arquivos da landing page na VPS e salvar em JSON

$vpsIp = "72.62.138.239"
$vpsUser = "root"
$landingPath = "/opt/saas/atendo/frontend/src/app/landing"
$outputFile = "landing-vps-files.json"

Write-Host "🔍 Conectando à VPS para listar arquivos da landing..." -ForegroundColor Cyan
Write-Host "📍 VPS: ${vpsUser}@${vpsIp}" -ForegroundColor Gray
Write-Host "📁 Path: $landingPath" -ForegroundColor Gray
Write-Host ""

# Comando SSH para listar arquivos com detalhes
$sshCommand = @"
find $landingPath -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' -o -name '*.json' \) -exec stat --format='{"path":"%n","size":%s,"modified":"%y"}' {} \; 2>/dev/null
"@

try {
    Write-Host "⏳ Executando comando na VPS (digite a senha quando solicitado)..." -ForegroundColor Yellow
    
    # Executa SSH e captura saída
    $output = ssh "${vpsUser}@${vpsIp}" $sshCommand 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao conectar à VPS" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
    
    # Processa a saída e cria array de arquivos
    $files = @()
    $lines = $output -split "`n"
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        if ($line -match '^\{.*\}$') {
            try {
                $fileInfo = $line | ConvertFrom-Json
                # Extrai nome relativo do arquivo
                $relativePath = $fileInfo.path -replace [regex]::Escape($landingPath + "/"), ""
                $fileInfo | Add-Member -NotePropertyName "relativePath" -NotePropertyValue $relativePath -Force
                $files += $fileInfo
            } catch {
                Write-Host "⚠️  Ignorando linha inválida: $line" -ForegroundColor DarkYellow
            }
        }
    }
    
    # Ordena por data de modificação (mais recente primeiro)
    $sortedFiles = $files | Sort-Object { $_.modified } -Descending
    
    # Cria objeto final
    $result = @{
        timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        vps = "${vpsUser}@${vpsIp}"
        path = $landingPath
        totalFiles = $files.Count
        files = $sortedFiles
    }
    
    # Salva em JSON
    $result | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "✅ Arquivos listados com sucesso!" -ForegroundColor Green
    Write-Host "📊 Total: $($files.Count) arquivos" -ForegroundColor Green
    Write-Host "💾 Salvo em: $outputFile" -ForegroundColor Green
    Write-Host ""
    
    # Mostra os 10 arquivos mais recentes
    Write-Host "📋 Top 10 arquivos mais recentes:" -ForegroundColor Cyan
    Write-Host "─" * 80 -ForegroundColor Gray
    
    $counter = 0
    foreach ($file in ($sortedFiles | Select-Object -First 10)) {
        $counter++
        $sizeKB = [math]::Round($file.size / 1024, 2)
        $modified = $file.modified -replace "\..*", ""  # Remove microssegundos
        
        Write-Host "$counter. " -ForegroundColor Gray -NoNewline
        Write-Host $file.relativePath -ForegroundColor White -NoNewline
        Write-Host " ($sizeKB KB)" -ForegroundColor DarkGray -NoNewline
        Write-Host " - $modified" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "💡 Dica: Use 'Compare-LandingFiles.ps1' para comparar com localhost" -ForegroundColor DarkCyan
    
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
}
