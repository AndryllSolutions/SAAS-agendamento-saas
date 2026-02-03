#!/bin/bash
# Deploy VPS Commands - Execute na VPS após enviar o arquivo
# Execute este script NA VPS, não na sua máquina local

VPS_PATH="/opt/saas/atendo"

echo "🔧 Descompactando e rebuildando na VPS..."
echo "Caminho: $VPS_PATH"

# Ir para o diretório correto
cd $VPS_PATH

# Verificar se o arquivo deploy.tar.gz existe
if [ ! -f "deploy.tar.gz" ]; then
    echo "❌ Arquivo deploy.tar.gz não encontrado em $VPS_PATH"
    echo "📤 Execute na sua máquina local:"
    echo "   cd 'C:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS'"
    echo "   tar -czf deploy.tar.gz backend/ frontend/ docker-compose.prod.yml .env.production"
    echo "   scp deploy.tar.gz root@SEU_IP:$VPS_PATH/"
    exit 1
fi

# Descompactar
echo "📦 Descompactando arquivos..."
tar -xzf deploy.tar.gz

# Configurar environment
echo "⚙️ Configurando environment..."
mv .env.production .env

# Rebuild containers (sem remover volumes de dados)
echo "🐳 Rebuildando containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Limpar arquivo de deploy
echo "🧹 Limpando arquivo de deploy..."
rm deploy.tar.gz

# Verificar status
echo "✅ Deploy concluído!"
echo "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo "🌐 Acesse: https://seu-dominio.com/agenda"
echo "📋 Logs: docker-compose -f docker-compose.prod.yml logs -f"
