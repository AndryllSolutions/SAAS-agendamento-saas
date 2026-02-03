#!/bin/bash

# Script para deploy das correções de profissionais e imagens
echo "🚀 Iniciando deploy das correções..."

# 1. Fazer upload dos arquivos corrigidos para o VPS
echo "📤 Enviando arquivos corrigidos..."

scp frontend/src/components/ProfessionalForm.tsx root@72.62.138.239:/opt/agendamento/frontend/src/components/
scp frontend/src/components/ui/ImageUpload.tsx root@72.62.138.239:/opt/agendamento/frontend/src/components/ui/
scp backend/app/main.py root@72.62.138.239:/opt/agendamento/backend/app/

# 2. Reiniciar containers
echo "🔄 Reiniciando containers..."

ssh root@72.62.138.239 << 'EOF'
cd /opt/agendamento

# Reiniciar backend
docker-compose restart backend

# Aguardar 5 segundos
sleep 5

# Reiniciar frontend
docker-compose restart frontend

echo "✅ Deploy concluído!"
EOF

echo "🎉 Correções aplicadas com sucesso!"
