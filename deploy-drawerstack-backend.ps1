# Deploy DrawerStack Backend - PowerShell Script
# Execute: .\deploy-drawerstack-backend.ps1

Write-Host "=== Subindo Backend - DrawerStack ===" -ForegroundColor Green

$VPS_IP = "72.62.138.239"
$VPS_USER = "root"
$VPS_PATH = "/opt/saas/atendo"

# Models
Write-Host "1. Subindo professional_schedule_override.py..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/models/professional_schedule_override.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/models/

Write-Host "2. Subindo professional_voucher.py..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/models/professional_voucher.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/models/

# Schemas
Write-Host "3. Subindo professional_schedule_override.py (schemas)..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/schemas/professional_schedule_override.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/schemas/

Write-Host "4. Subindo professional_voucher.py (schemas)..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/schemas/professional_voucher.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/schemas/

# Endpoints
Write-Host "5. Subindo professional_schedule_overrides.py..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professional_schedule_overrides.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

Write-Host "6. Subindo professional_vouchers.py..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professional_vouchers.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

Write-Host "7. Subindo professionals.py (atualizado com reorder)..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professionals.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

Write-Host "8. Subindo api.py (atualizado com novos routers)..." -ForegroundColor Yellow
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/api.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/

Write-Host "=== Backend DrawerStack concluído! ===" -ForegroundColor Green
Write-Host "Agora conecte via SSH e execute os comandos Docker:" -ForegroundColor Cyan
Write-Host "ssh root@72.62.138.239" -ForegroundColor White
Write-Host "cd /opt/saas/atendo" -ForegroundColor White
Write-Host "docker-compose -f docker-compose.prod.yml down" -ForegroundColor White
Write-Host "docker-compose -f docker-compose.prod.yml build --no-cache" -ForegroundColor White
Write-Host "docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
