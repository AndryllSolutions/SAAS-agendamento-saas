# Script para sincronizar alterações do backend para VPS
# Execute: ./sync-to-vps.sh

echo "🔄 Iniciando sincronização para VPS..."

# Verificar se está no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script da pasta raiz do projeto (onde está a pasta 'backend')"
    exit 1
fi

# Sincronizar backend para VPS
echo "📦 Sincronizando backend para VPS..."
scp -r backend/ root@72.62.138.239:/opt/saas/atendo/

if [ $? -eq 0 ]; then
    echo "✅ Backend sincronizado com sucesso!"
    
    echo "🔨 Construindo imagem Docker..."
    ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml build"
    
    if [ $? -eq 0 ]; then
        echo "✅ Build concluído com sucesso!"
        
        echo "🔄 Reiniciando containers..."
        ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml restart"
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deploy concluído com sucesso!"
            echo "📊 Verificando status dos containers..."
            ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose -f docker-compose.prod.yml ps"
        else
            echo "❌ Erro ao reiniciar containers"
            exit 1
        fi
    else
        echo "❌ Erro no build da imagem Docker"
        exit 1
    fi
else
    echo "❌ Erro ao sincronizar backend para VPS"
    exit 1
fi

echo "✅ Deploy finalizado!"
