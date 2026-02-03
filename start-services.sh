#!/bin/bash
# Script para iniciar serviços com verificação de configuração

echo "🚀 Iniciando serviços SaaS com verificação de configuração"
echo "=================================================="

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar arquivo .env
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Copiando do .env.example..."
    cp .env.example .env
    echo "📝 Por favor, edite o arquivo .env com suas configurações antes de continuar."
    echo "   - Altere as senhas padrão"
    echo "   - Configure suas chaves de API"
    echo "   - Ajuste as URLs para seu ambiente"
    read -p "Pressione Enter para continuar ou Ctrl+C para cancelar..."
fi

# Parar serviços existentes
echo "🛑 Parando serviços existentes..."
docker-compose down -v

# Limpar volumes (opcional, descomente se necessário)
# echo "🧹 Limpando volumes..."
# docker volume prune -f

# Construir imagens
echo "🔨 Construindo imagens Docker..."
docker-compose build --no-cache

# Iniciar serviços na ordem correta
echo "📦 Iniciando serviços na ordem correta..."

# 1. Banco de dados e cache
echo "   1. Iniciando PostgreSQL, Redis e RabbitMQ..."
docker-compose up -d db redis rabbitmq

# Aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 30

# Verificar saúde dos serviços
echo "🔍 Verificando saúde dos serviços..."
docker-compose ps

# 2. Backend API
echo "   2. Iniciando Backend API..."
docker-compose up -d backend

# Aguardar backend
sleep 15

# 3. Workers Celery
echo "   3. Iniciando Workers Celery..."
docker-compose up -d celery_worker celery_beat

# 4. Frontend
echo "   4. Iniciando Frontend..."
docker-compose up -d frontend

# 5. Nginx (opcional, para produção)
echo "   5. Iniciando Nginx..."
docker-compose up -d nginx

# Aguardar todos os serviços
echo "⏳ Aguardando todos os serviços estarem prontos..."
sleep 20

# Verificar status final
echo "📊 Status final dos serviços:"
docker-compose ps

# Verificar configuração do Celery
echo "🔧 Verificando configuração do Celery..."
docker-compose exec backend python scripts/check_celery_config.py

# Mostrar URLs de acesso
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:8001"
echo "   RabbitMQ Management: http://localhost:15672 (admin/rabbitmq_secure_password_change_me)"
echo "   Nginx (produção): http://localhost:80"
echo ""
echo "📝 Logs úteis:"
echo "   Verificar logs do Celery: docker-compose logs -f celery_worker"
echo "   Verificar logs do RabbitMQ: docker-compose logs -f rabbitmq"
echo "   Verificar logs do Redis: docker-compose logs -f redis"
echo ""
echo "🎉 Serviços iniciados com sucesso!"
echo "   Use 'docker-compose logs -f [serviço]' para acompanhar os logs"
echo "   Use 'docker-compose down' para parar todos os serviços"
