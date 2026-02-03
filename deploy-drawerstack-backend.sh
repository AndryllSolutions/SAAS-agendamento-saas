#!/bin/bash
# Deploy DrawerStack Backend - SCP Commands
# Execute estes comandos individualmente no Git Bash ou terminal

VPS_IP="72.62.138.239"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo "=== Subindo Backend - DrawerStack ==="

# Models
echo "1. Subindo professional_schedule_override.py..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/models/professional_schedule_override.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/models/

echo "2. Subindo professional_voucher.py..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/models/professional_voucher.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/models/

# Schemas
echo "3. Subindo professional_schedule_override.py (schemas)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/schemas/professional_schedule_override.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/schemas/

echo "4. Subindo professional_voucher.py (schemas)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/schemas/professional_voucher.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/schemas/

# Endpoints
echo "5. Subindo professional_schedule_overrides.py..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professional_schedule_overrides.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

echo "6. Subindo professional_vouchers.py..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professional_vouchers.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

echo "7. Subindo professionals.py (atualizado com reorder)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/endpoints/professionals.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/endpoints/

echo "8. Subindo api.py (atualizado com novos routers)..."
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/api/v1/api.py" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/backend/app/api/v1/

echo "=== Backend DrawerStack concluído! ==="
