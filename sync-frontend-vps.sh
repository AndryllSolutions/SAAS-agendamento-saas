# Script para sincronizar alterações do frontend para VPS
# Execute: ./sync-frontend-vps.sh

echo "🔄 Iniciando sincronização do frontend para VPS..."

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script da pasta raiz do projeto (onde está a pasta 'frontend')"
    exit 1
fi

# Sincronizar frontend para VPS
echo "📦 Sincronizando frontend para VPS..."
scp -r frontend/ root@72.62.138.239:/opt/saas/atendo/

if [ $? -eq 0 ]; then
    echo "✅ Frontend sincronizado com sucesso!"
    
    echo "🔨 Construindo imagem Docker do frontend..."
    ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose build frontend"
    
    if [ $? -eq 0 ]; then
        echo "✅ Build do frontend concluído com sucesso!"
        
        echo "🔄 Reiniciando container do frontend..."
        ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose restart frontend"
        
        if [ $? -eq 0 ]; then
            echo "🎉 Deploy do frontend concluído com sucesso!"
            echo "📊 Verificando status dos containers..."
            ssh root@72.62.138.239 "cd /opt/saas/atendo && docker compose ps"
        else
            echo "❌ Erro ao reiniciar container do frontend"
            exit 1
        fi
    else
        echo "❌ Erro no build da imagem Docker do frontend"
        exit 1
    fi
else
    echo "❌ Erro ao sincronizar frontend para VPS"
    exit 1
fi

echo "✅ Deploy do frontend finalizado!"
