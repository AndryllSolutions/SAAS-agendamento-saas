# Script de Deploy para VPS - Landing Page
# Execute: .\deploy-landing-vps.ps1

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_rsa"
$LOCAL_PATH = "C:\PROJETOS\agendamento_SAAS (1)\agendamento_SAAS"
$VPS_PATH = "/opt/agendamento-saas/app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY LANDING PAGE PARA VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VPS: $VPS_USER@$VPS_IP" -ForegroundColor Yellow
Write-Host "Origem: $LOCAL_PATH" -ForegroundColor Yellow
Write-Host "Destino: $VPS_PATH" -ForegroundColor Yellow
Write-Host ""

# Verificar se SSH key existe
if (-not (Test-Path $SSH_KEY)) {
    Write-Error "Chave SSH não encontrada: $SSH_KEY"
    exit 1
}

# Testar conexão SSH
Write-Host "Testando conexão SSH..." -ForegroundColor Green
$testResult = ssh -i $SSH_KEY -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "echo 'OK'" 2>$null
if ($testResult -ne "OK") {
    Write-Error "Não foi possível conectar à VPS. Verifique a chave SSH e o IP."
    exit 1
}
Write-Host "Conexão SSH OK!" -ForegroundColor Green
Write-Host ""

# Sincronizar Frontend (apenas landing page e arquivos necessários)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SINCRONIZANDO FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Criar lista de arquivos para excluir
$excludeArgs = @(
    "--exclude=.git",
    "--exclude=node_modules",
    "--exclude=.next",
    "--exclude=out",
    "--exclude=build",
    "--exclude=dist",
    "--exclude=logs",
    "--exclude=*.log"
)

# Sincronizar frontend
$frontendSource = "$LOCAL_PATH/frontend/"
$frontendDest = "$VPS_USER@${VPS_IP}:$VPS_PATH/frontend/"

Write-Host "Sincronizando frontend..." -ForegroundColor Yellow
rsync -avz --progress -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" `
    $excludeArgs `
    $frontendSource `
    $frontendDest

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha na sincronização do frontend"
    exit 1
}

Write-Host "Frontend sincronizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Sincronizar docker-compose e configs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SINCRONIZANDO CONFIGURAÇÕES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# docker-compose.prod.yml
$composeSource = "$LOCAL_PATH/docker-compose.prod.yml"
$composeDest = "$VPS_USER@${VPS_IP}:$VPS_PATH/"

Write-Host "Sincronizando docker-compose.prod.yml..." -ForegroundColor Yellow
scp -i $SSH_KEY -o StrictHostKeyChecking=no $composeSource "$composeDest"

# .env.production
$envSource = "$LOCAL_PATH/.env.production"
$envDest = "$VPS_USER@${VPS_IP}:$VPS_PATH/"

Write-Host "Sincronizando .env.production..." -ForegroundColor Yellow
scp -i $SSH_KEY -o StrictHostKeyChecking=no $envSource "$envDest"

Write-Host "Configurações sincronizadas!" -ForegroundColor Green
Write-Host ""

# Executar deploy na VPS
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EXECUTANDO DEPLOY NA VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$deployScript = @"
cd $VPS_PATH

# Verificar estrutura
echo "Verificando arquivos sincronizados..."
ls -la frontend/src/app/landing/ 2>/dev/null || echo "AVISO: Pasta landing não encontrada"
ls -la frontend/public/landing/ 2>/dev/null || echo "AVISO: Pasta public/landing não encontrada"

# Pull das imagens mais recentes
echo "Atualizando imagens Docker..."
docker-compose -f docker-compose.prod.yml pull

# Rebuild do frontend (para incluir landing page)
echo "Reconstruindo frontend..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Reiniciar containers
echo "Reiniciando containers..."
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# Verificar status
echo ""
echo "Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Deploy concluído!"
echo "Acesse: http://$VPS_IP"
"@

Write-Host "Conectando à VPS para executar deploy..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $deployScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Acesse a landing page em:" -ForegroundColor Yellow
Write-Host "http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifique os logs:" -ForegroundColor Yellow
Write-Host "ssh -i $SSH_KEY $VPS_USER@$VPS_IP 'docker-compose -f $VPS_PATH/docker-compose.prod.yml logs -f frontend'" -ForegroundColor Gray
