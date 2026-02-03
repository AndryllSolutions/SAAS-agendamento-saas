# Deploy Agenda Completo - PowerShell (Windows Local)
# Execute este script na sua máquina local, não na VPS

# Configurações
$VPS_IP = "SEU_IP_VPS"  # Substitua pelo IP da sua VPS
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

Write-Host "🚀 Iniciando deploy da agenda para VPS..." -ForegroundColor Green

# 1. Comprimir arquivos localmente
Write-Host "📦 Comprimindo backend, frontend e configurações..." -ForegroundColor Blue
Set-Location "C:\PROJETOS\agendamento_SAAS (1)\agendamento_SAAS"

# Criar arquivo deploy.tar.gz
$tarCommand = "tar -czf deploy.tar.gz backend/ frontend/ docker-compose.prod.yml .env.production"
Write-Host "Executando: $tarCommand"
Invoke-Expression $tarCommand

# Verificar se arquivo foi criado
if (Test-Path "deploy.tar.gz") {
    Write-Host "✅ Arquivo deploy.tar.gz criado com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao criar deploy.tar.gz" -ForegroundColor Red
    exit 1
}

# 2. Enviar para VPS
Write-Host "📤 Enviando arquivo para VPS..." -ForegroundColor Blue
$scpCommand = "scp deploy.tar.gz ${VPS_USER}@${VPS_IP}:${VPS_PATH}/"
Write-Host "Executando: $scpCommand"
Invoke-Expression $scpCommand

# 3. Executar comandos na VPS
Write-Host "🔧 Descompactando e rebuildando na VPS..." -ForegroundColor Blue
$sshCommands = @"
cd $VPS_PATH
tar -xzf deploy.tar.gz
mv .env.production .env
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
echo "✅ Deploy concluído!"
docker-compose -f docker-compose.prod.yml ps
"@

$sshCommand = "ssh ${VPS_USER}@${VPS_IP} '$sshCommands'"
Write-Host "Executando comandos na VPS..."
Invoke-Expression $sshCommand

# 4. Limpar arquivo local
Write-Host "🧹 Limpando arquivo local..." -ForegroundColor Blue
Remove-Item "deploy.tar.gz" -Force

Write-Host "✅ Deploy finalizado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://seu-dominio.com/agenda" -ForegroundColor Cyan
