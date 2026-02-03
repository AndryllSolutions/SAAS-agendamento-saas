# Verificar Upload - PowerShell Script
# Execute via SSH: ssh root@72.62.138.239

Write-Host "=== Verificando Upload dos Arquivos ===" -ForegroundColor Green

Write-Host "Conecte via SSH primeiro:" -ForegroundColor Cyan
Write-Host "ssh root@72.62.138.239" -ForegroundColor White

Write-Host ""
Write-Host "Depois execute os comandos abaixo para verificar:" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== VERIFICAR FRONTEND ===" -ForegroundColor Green
Write-Host "ls -la /opt/saas/atendo/frontend/src/components/professionals/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/frontend/src/components/professionals/sections/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/frontend/src/hooks/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/frontend/src/services/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/frontend/src/app/professionals/" -ForegroundColor White

Write-Host ""
Write-Host "=== VERIFICAR BACKEND ===" -ForegroundColor Green
Write-Host "ls -la /opt/saas/atendo/backend/app/models/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/backend/app/schemas/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/backend/app/api/v1/endpoints/" -ForegroundColor White
Write-Host "ls -la /opt/saas/atendo/backend/app/api/v1/" -ForegroundColor White

Write-Host ""
Write-Host "=== VERIFICAR ARQUIVOS ESPECÍFICOS ===" -ForegroundColor Green

Write-Host ""
Write-Host "Frontend - DrawerStack:" -ForegroundColor Yellow
Write-Host "test -f /opt/saas/atendo/frontend/src/components/professionals/DrawerStackManager.tsx && echo '✅ DrawerStackManager.tsx' || echo '❌ DrawerStackManager.tsx'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/components/professionals/SubDrawer.tsx && echo '✅ SubDrawer.tsx' || echo '❌ SubDrawer.tsx'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/components/professionals/NovaPersonalizacaoDrawer.tsx && echo '✅ NovaPersonalizacaoDrawer.tsx' || echo '❌ NovaPersonalizacaoDrawer.tsx'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/components/professionals/NovoValeDrawer.tsx && echo '✅ NovoValeDrawer.tsx' || echo '❌ NovoValeDrawer.tsx'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/components/professionals/ProfessionalsTable.tsx && echo '✅ ProfessionalsTable.tsx' || echo '❌ ProfessionalsTable.tsx'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/hooks/useDrawerRestore.ts && echo '✅ useDrawerRestore.ts' || echo '❌ useDrawerRestore.ts'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/frontend/src/services/professionalService.ts && echo '✅ professionalService.ts' || echo '❌ professionalService.ts'" -ForegroundColor White

Write-Host ""
Write-Host "Backend - Models:" -ForegroundColor Yellow
Write-Host "test -f /opt/saas/atendo/backend/app/models/professional_schedule_override.py && echo '✅ professional_schedule_override.py (model)' || echo '❌ professional_schedule_override.py (model)'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/backend/app/models/professional_voucher.py && echo '✅ professional_voucher.py (model)' || echo '❌ professional_voucher.py (model)'" -ForegroundColor White

Write-Host ""
Write-Host "Backend - Schemas:" -ForegroundColor Yellow
Write-Host "test -f /opt/saas/atendo/backend/app/schemas/professional_schedule_override.py && echo '✅ professional_schedule_override.py (schema)' || echo '❌ professional_schedule_override.py (schema)'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/backend/app/schemas/professional_voucher.py && echo '✅ professional_voucher.py (schema)' || echo '❌ professional_voucher.py (schema)'" -ForegroundColor White

Write-Host ""
Write-Host "Backend - Endpoints:" -ForegroundColor Yellow
Write-Host "test -f /opt/saas/atendo/backend/app/api/v1/endpoints/professional_schedule_overrides.py && echo '✅ professional_schedule_overrides.py' || echo '❌ professional_schedule_overrides.py'" -ForegroundColor White
Write-Host "test -f /opt/saas/atendo/backend/app/api/v1/endpoints/professional_vouchers.py && echo '✅ professional_vouchers.py' || echo '❌ professional_vouchers.py'" -ForegroundColor White

Write-Host ""
Write-Host "=== CONTAGEM DE ARQUIVOS ===" -ForegroundColor Green
Write-Host "echo 'Frontend professionals:' && ls /opt/saas/atendo/frontend/src/components/professionals/ | wc -l" -ForegroundColor White
Write-Host "echo 'Backend models:' && ls /opt/saas/atendo/backend/app/models/ | grep professional | wc -l" -ForegroundColor White
Write-Host "echo 'Backend schemas:' && ls /opt/saas/atendo/backend/app/schemas/ | grep professional | wc -l" -ForegroundColor White
Write-Host "echo 'Backend endpoints:' && ls /opt/saas/atendo/backend/app/api/v1/endpoints/ | grep professional | wc -l" -ForegroundColor White

Write-Host ""
Write-Host "=== VERIFICAÇÃO FINAL ===" -ForegroundColor Green
Write-Host "echo 'Todos os arquivos do DrawerStack foram verificados!'" -ForegroundColor Cyan
