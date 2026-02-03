#!/bin/bash
# ========================================================================
# COMANDOS RÁPIDOS - FASE 1: SISTEMA DE PLANOS
# ========================================================================
# Este script contém todos os comandos necessários para implementar
# a Fase 1 do sistema ATENDO.
#
# NÃO execute tudo de uma vez! Leia e execute passo a passo.
# ========================================================================

# ========================================================================
# 1. PREPARAÇÃO
# ========================================================================

echo "=== FASE 1.1: PREPARAÇÃO ==="

# Criar branch
git checkout -b feature/phase-1-plans-system

# Verificar status
git status

# ========================================================================
# 2. BACKEND - CRIAR ESTRUTURA
# ========================================================================

echo "=== FASE 1.2: BACKEND - ESTRUTURA ==="

# Criar diretórios necessários
mkdir -p backend/app/services
mkdir -p backend/app/schemas

# Criar arquivos de modelos
touch backend/app/models/plan.py

# Criar arquivos de schemas
touch backend/app/schemas/plan.py
touch backend/app/schemas/subscription.py

# Criar arquivos de serviços
touch backend/app/services/plan_service.py
touch backend/app/services/limit_validator.py
touch backend/app/services/subscription_service.py

# Criar arquivo de middleware
touch backend/app/core/plan_middleware.py

# Criar arquivo de endpoints
touch backend/app/api/v1/endpoints/plans.py

echo "✅ Estrutura de backend criada"

# ========================================================================
# 3. COPIAR CÓDIGO DOS ARQUIVOS
# ========================================================================

echo "=== FASE 1.3: COPIAR CÓDIGO ==="
echo "📝 Agora você precisa:"
echo "1. Abrir PLANO_IMPLEMENTACAO_FASE_1_PLANOS.md"
echo "2. Copiar o código de cada arquivo para os arquivos criados"
echo "3. Voltar aqui quando terminar"
echo ""
read -p "Pressione ENTER quando terminar de copiar o código..."

# ========================================================================
# 4. CRIAR MIGRATIONS
# ========================================================================

echo "=== FASE 1.4: MIGRATIONS ==="

cd backend

# Criar migration para tabela plans
alembic revision -m "create_plans_table"
echo "✅ Migration create_plans_table criada"
echo "📝 Edite o arquivo em backend/alembic/versions/ e cole o código do plano"
echo ""
read -p "Pressione ENTER quando terminar de editar a migration..."

# Criar migration para atualizar companies
alembic revision -m "update_companies_plans"
echo "✅ Migration update_companies_plans criada"
echo "📝 Edite o arquivo em backend/alembic/versions/ e cole o código do plano"
echo ""
read -p "Pressione ENTER quando terminar de editar a migration..."

# Aplicar migrations
echo "Aplicando migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migrations aplicadas com sucesso!"
else
    echo "❌ Erro ao aplicar migrations. Corrija antes de continuar."
    exit 1
fi

cd ..

# ========================================================================
# 5. REGISTRAR ROUTERS
# ========================================================================

echo "=== FASE 1.5: REGISTRAR ROUTERS ==="
echo "📝 Adicione o router de plans em backend/app/api/v1/api.py:"
echo ""
echo "from app.api.v1.endpoints import plans"
echo "api_router.include_router(plans.router, prefix='/plans', tags=['plans'])"
echo ""
read -p "Pressione ENTER quando terminar..."

# ========================================================================
# 6. ATUALIZAR __init__.py DOS MODELOS
# ========================================================================

echo "=== FASE 1.6: ATUALIZAR __init__.py ==="
echo "📝 Adicione em backend/app/models/__init__.py:"
echo ""
echo "from app.models.plan import Plan"
echo ""
read -p "Pressione ENTER quando terminar..."

# ========================================================================
# 7. TESTAR BACKEND
# ========================================================================

echo "=== FASE 1.7: TESTAR BACKEND ==="

cd backend

# Instalar dependências (se necessário)
# pip install -r requirements.txt

# Iniciar servidor (em outro terminal)
echo "📝 Em outro terminal, execute:"
echo "cd backend"
echo "uvicorn app.main:app --reload --port 8000"
echo ""
read -p "Pressione ENTER quando o servidor estiver rodando..."

# Testar endpoint
echo "Testando GET /plans..."
curl http://localhost:8000/api/v1/plans

if [ $? -eq 0 ]; then
    echo "✅ Backend funcionando!"
else
    echo "❌ Erro no backend. Verifique os logs."
    exit 1
fi

cd ..

# ========================================================================
# 8. FRONTEND - CRIAR ESTRUTURA
# ========================================================================

echo "=== FASE 1.8: FRONTEND - ESTRUTURA ==="

cd frontend

# Criar diretórios
mkdir -p src/app/plans
mkdir -p src/components

# Criar arquivos
touch src/app/plans/page.tsx
touch src/components/UsageLimits.tsx

echo "✅ Estrutura de frontend criada"
echo "📝 Copie o código do plano para:"
echo "1. src/app/plans/page.tsx"
echo "2. src/components/UsageLimits.tsx"
echo ""
read -p "Pressione ENTER quando terminar..."

cd ..

# ========================================================================
# 9. TESTAR FRONTEND
# ========================================================================

echo "=== FASE 1.9: TESTAR FRONTEND ==="

cd frontend

echo "📝 Em outro terminal, execute:"
echo "cd frontend"
echo "npm run dev"
echo ""
read -p "Pressione ENTER quando o frontend estiver rodando..."

echo "Acesse: http://localhost:3000/plans"
echo "Verifique se a página carrega corretamente"
echo ""
read -p "Pressione ENTER quando verificar..."

cd ..

# ========================================================================
# 10. APLICAR DECORATOR NOS ENDPOINTS
# ========================================================================

echo "=== FASE 1.10: APLICAR DECORATORS ==="
echo "📝 Aplique @check_plan_limit nos endpoints:"
echo ""
echo "Em backend/app/api/v1/endpoints/professionals.py:"
echo ""
echo "from app.core.plan_middleware import check_plan_limit"
echo ""
echo "@router.post('/')"
echo "@check_plan_limit('professionals')"
echo "async def create_professional(...):"
echo ""
read -p "Pressione ENTER quando terminar..."

# ========================================================================
# 11. TESTES
# ========================================================================

echo "=== FASE 1.11: TESTES ==="

cd backend

# Executar testes
echo "Executando testes..."
pytest tests/ -v

if [ $? -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
else
    echo "❌ Alguns testes falharam. Corrija antes de continuar."
    exit 1
fi

cd ..

# ========================================================================
# 12. COMMIT E PUSH
# ========================================================================

echo "=== FASE 1.12: COMMIT ==="

git add .
git status

echo ""
echo "Arquivos a serem commitados:"
git diff --staged --name-only
echo ""
read -p "Confirma commit? (s/n): " confirm

if [ "$confirm" = "s" ]; then
    git commit -m "feat: implement phase 1 - plans and limits system

- Create Plan model and migrations
- Implement PlanService, LimitValidator, SubscriptionService
- Create plans API endpoints
- Add plan middleware and decorators
- Create plans page and usage limits component
- Update companies and subscriptions models
- Migrate BASIC to ESSENCIAL plan
- Add plan limit validation to professionals endpoint"

    echo "✅ Commit realizado!"
    
    read -p "Fazer push? (s/n): " push_confirm
    
    if [ "$push_confirm" = "s" ]; then
        git push origin feature/phase-1-plans-system
        echo "✅ Push realizado!"
    fi
else
    echo "❌ Commit cancelado"
fi

# ========================================================================
# 13. FINALIZAÇÃO
# ========================================================================

echo ""
echo "=========================================================================="
echo "✅ FASE 1 IMPLEMENTADA COM SUCESSO!"
echo "=========================================================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Abrir Pull Request no GitHub/GitLab"
echo "2. Solicitar code review"
echo "3. Fazer testes em staging"
echo "4. Deploy em produção"
echo ""
echo "📚 Documentação:"
echo "- PLANO_IMPLEMENTACAO_FASE_1_PLANOS.md"
echo "- PLANO_FASES_2_A_7_RESUMIDO.md"
echo ""
echo "🎯 Próxima fase: Fase 2 - Sistema de Add-ons (12 dias)"
echo ""
echo "=========================================================================="

