# Script de Deploy via SCP/TAR para VPS
# Uso: .\deploy-scp-vps.ps1

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$LOCAL_PATH = "C:\PROJETOS\agendamento_SAAS (1)\agendamento_SAAS"
$VPS_PATH = "/opt/saas/atendo"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOY SCP PARA VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Criar arquivo tar.gz com os arquivos necessários
Write-Host "Criando pacote de deploy..." -ForegroundColor Yellow
$tempDir = "$env:TEMP\landing-deploy"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Copiar estrutura da landing page
Copy-Item -Path "$LOCAL_PATH\frontend\src\app\landing" -Destination "$tempDir\src\app\landing" -Recurse -Force
Copy-Item -Path "$LOCAL_PATH\frontend\src\app\page.tsx" -Destination "$tempDir\src\app\page.tsx" -Force
Copy-Item -Path "$LOCAL_PATH\frontend\public\landing" -Destination "$tempDir\public\landing" -Recurse -Force

# Criar tar.gz
$tarFile = "$env:TEMP\landing-deploy.tar.gz"
Remove-Item $tarFile -ErrorAction SilentlyContinue
tar -czf $tarFile -C $tempDir .

Write-Host "Pacote criado: $tarFile" -ForegroundColor Green
Write-Host "Tamanho: $([math]::Round((Get-Item $tarFile).Length / 1MB, 2)) MB" -ForegroundColor Green
Write-Host ""

# Enviar para VPS via SCP
Write-Host "Enviando pacote para VPS..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no $tarFile "$VPS_USER@${VPS_IP}:/tmp/landing-deploy.tar.gz"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao enviar pacote via SCP"
    exit 1
}

Write-Host "Pacote enviado com sucesso!" -ForegroundColor Green
Write-Host ""

# Executar comandos na VPS para extrair e rebuildar
Write-Host "Extraindo e rebuildando na VPS..." -ForegroundColor Yellow

$remoteScript = @"
# Verificar se diretório existe
if [ ! -d "$VPS_PATH/frontend" ]; then
    echo "ERRO: Diretório frontend não encontrado em $VPS_PATH"
    echo "Verifique se o projeto está configurado na VPS"
    exit 1
fi

# Criar backup do page.tsx atual
cd $VPS_PATH/frontend
if [ -f src/app/page.tsx ]; then
    cp src/app/page.tsx src/app/page.tsx.bak.$(date +%Y%m%d%H%M%S)
fi

# Extrair arquivos
cd $VPS_PATH/frontend
tar -xzf /tmp/landing-deploy.tar.gz

# Verificar extração
echo "Verificando arquivos extraídos:"
ls -la src/app/landing/ 2>/dev/null || echo "AVISO: landing não encontrado"
ls -la public/landing/ 2>/dev/null || echo "AVISO: public/landing não encontrado"

# Rebuildar frontend
echo ""
echo "Rebuildando frontend..."
cd $VPS_PATH
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend

# Verificar status
echo ""
echo "Status dos containers:"
docker-compose -f docker-compose.prod.yml ps | grep frontend

echo ""
echo "Logs do frontend (últimas 20 linhas):"
docker-compose -f docker-compose.prod.yml logs --tail=20 frontend
"@

ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" $remoteScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Acesse: http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para commitar no GitHub:" -ForegroundColor Yellow
Write-Host "  git add frontend/src/app/landing frontend/src/app/page.tsx frontend/public/landing" -ForegroundColor Gray
Write-Host "  git commit -m \"feat: integra landing page do atendo\"" -ForegroundColor Gray
Write-Host "  git push" -ForegroundColor Gray
