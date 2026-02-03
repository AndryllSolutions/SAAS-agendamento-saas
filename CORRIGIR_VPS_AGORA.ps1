# Script CORRIGIDO para atualizar VPS com caminhos absolutos
# Execute este script no PowerShell como Administrador

Write-Host "=== CORRIGINDO VPS COM CAMINHOS CORRETOS ===" -ForegroundColor Cyan

# Configurações
$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

# Diretório base do projeto
$BASE_DIR = "c:\PROJETOS\agendamento_SAAS (1)\agendamento_SAAS"

Write-Host "Diretório base: $BASE_DIR" -ForegroundColor Yellow

# Arquivos para sincronizar com caminhos absolutos
$arquivos = @(
    @{
        Local = "$BASE_DIR\frontend\src\components\Sidebar.tsx"
        Remoto = "$VPS_PATH/frontend/src/components/Sidebar.tsx"
    },
    @{
        Local = "$BASE_DIR\frontend\src\app\layout.tsx"
        Remoto = "$VPS_PATH/frontend/src/app/layout.tsx"
    },
    @{
        Local = "$BASE_DIR\frontend\public\favicon.svg"
        Remoto = "$VPS_PATH/frontend/public/favicon.svg"
    },
    @{
        Local = "$BASE_DIR\frontend\public\favicon.ico"
        Remoto = "$VPS_PATH/frontend/public/favicon.ico"
    }
)

Write-Host "`n🔧 ETAPA 1: Verificando arquivos locais..." -ForegroundColor Green

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo.Local) {
        $tamanho = (Get-Item $arquivo.Local).Length
        Write-Host "  ✓ Encontrado: $($arquivo.Local) ($tamanho bytes)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ NÃO encontrado: $($arquivo.Local)" -ForegroundColor Red
    }
}

Write-Host "`n📤 ETAPA 2: Enviando arquivos para VPS..." -ForegroundColor Green

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo.Local) {
        $nomeArquivo = Split-Path $arquivo.Local -Leaf
        Write-Host "  → Enviando: $nomeArquivo" -ForegroundColor Gray
        
        # Criar diretório remoto se não existir
        $dirRemoto = Split-Path $arquivo.Remoto -Parent
        ssh "${VPS_USER}@${VPS_IP}" "mkdir -p $dirRemoto"
        
        # Copiar arquivo
        scp $arquivo.Local "${VPS_USER}@${VPS_IP}:$($arquivo.Remoto)"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Sucesso!" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Erro ao copiar!" -ForegroundColor Red
        }
    }
}

Write-Host "`n🐳 ETAPA 3: Reconstruindo container frontend..." -ForegroundColor Green

# Comandos para executar na VPS
$comandosVPS = @(
    "cd $VPS_PATH",
    "echo 'Parando container frontend...'",
    "docker compose -f docker-compose.prod.yml stop frontend",
    "echo 'Reconstruindo imagem frontend...'",
    "docker compose -f docker-compose.prod.yml build --no-cache frontend",
    "echo 'Iniciando container frontend...'",
    "docker compose -f docker-compose.prod.yml up -d frontend",
    "echo 'Verificando status...'",
    "docker compose -f docker-compose.prod.yml ps frontend"
)

foreach ($comando in $comandosVPS) {
    Write-Host "  → Executando: $comando" -ForegroundColor Gray
    ssh "${VPS_USER}@${VPS_IP}" $comando
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ⚠ Erro no comando: $comando" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://$VPS_IP" -ForegroundColor Cyan
Write-Host "`n📋 VERIFIQUE:" -ForegroundColor Yellow
Write-Host "  - Menu lateral completo (9 seções)" -ForegroundColor Gray
Write-Host "  - Favicon personalizado (ícone 'A' verde)" -ForegroundColor Gray
Write-Host "  - Recursos financeiros e marketing" -ForegroundColor Gray
