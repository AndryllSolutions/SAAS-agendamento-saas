#!/bin/bash
# Deploy DrawerStack Frontend - SCP Commands
# Execute estes comandos individualmente no Git Bash ou terminal

VPS_IP="72.62.138.239"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo "=== Subindo Frontend - DrawerStack ==="

# Componentes DrawerStack
echo "1. Subindo DrawerStackManager.tsx..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/DrawerStackManager.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "2. Subindo SubDrawer.tsx..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/SubDrawer.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "3. Subindo NovaPersonalizacaoDrawer.tsx..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/NovaPersonalizacaoDrawer.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "4. Subindo NovoValeDrawer.tsx..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/NovoValeDrawer.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "5. Subindo ProfessionalsTable.tsx..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/ProfessionalsTable.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "6. Subindo EmployeeDrawer.tsx (atualizado)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/EmployeeDrawer.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/

echo "7. Subindo ExpedienteSection.tsx (atualizado)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/sections/ExpedienteSection.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/sections/

echo "8. Subindo ValesSection.tsx (atualizado)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/sections/ValesSection.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/components/professionals/sections/

echo "9. Subindo useDrawerRestore.ts..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/hooks/useDrawerRestore.ts" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/hooks/

echo "10. Subindo professionalService.ts..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/services/professionalService.ts" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/services/

echo "11. Subindo página professionals (nova versão)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/app/professionals/page-fixed.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/frontend/src/app/professionals/

echo "=== Frontend DrawerStack concluído! ==="
