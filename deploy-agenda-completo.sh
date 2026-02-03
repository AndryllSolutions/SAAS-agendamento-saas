#!/bin/bash
# Deploy Agenda Completo - Bash (Git Bash/MINGW64)
# Execute este script no Git Bash, não na VPS

# Configurações - SUBSTITUA PELO IP REAL
VPS_IP="SEU_IP_VPS"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo "Iniciando deploy da agenda para VPS..."

# 1. Comprimir arquivos localmente
echo "Comprimindo backend, frontend e configurações..."
cd "C:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS"

# Criar arquivo deploy.tar.gz
echo "Executando: tar -czf deploy.tar.gz backend/ frontend/ docker-compose.prod.yml .env.production"
tar -czf deploy.tar.gz backend/ frontend/ docker-compose.prod.yml .env.production

# Verificar se arquivo foi criado
if [ -f "deploy.tar.gz" ]; then
    echo "Arquivo deploy.tar.gz criado com sucesso"
else
    echo "Erro ao criar deploy.tar.gz"
    exit 1
fi

# 2. Enviar para VPS
echo "Enviando arquivo para VPS..."
echo "Executando: scp deploy.tar.gz ${VPS_USER}@${VPS_IP}:${VPS_PATH}/"
scp deploy.tar.gz ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# 3. Executar comandos na VPS
echo "Descompactando e rebuildando na VPS..."
ssh ${VPS_USER}@${VPS_IP} << EOF
cd ${VPS_PATH}
tar -xzf deploy.tar.gz
mv .env.production .env
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
echo "Deploy concluído!"
docker-compose -f docker-compose.prod.yml ps
EOF

# 4. Limpar arquivo local
echo "Limpando arquivo local..."
rm deploy.tar.gz

echo "Deploy finalizado com sucesso!"
echo "Acesse: https://seu-dominio.com/agenda"
