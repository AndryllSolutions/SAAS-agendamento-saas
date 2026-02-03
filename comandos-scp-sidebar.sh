#!/bin/bash
# Comandos SCP para corrigir sidebar - MODO MANUAL SEGURO

# ============================================
# PASSO 1: Enviar arquivo modificado via SCP
# ============================================
# Execute no Git Bash (na pasta do projeto):

scp frontend/src/hooks/useCompanyTheme.ts root@72.62.138.239:/opt/agendamento-saas/app/frontend/src/hooks/

# ============================================
# PASSO 2: Rebuildar frontend na VPS
# ============================================
# Acesse a VPS e execute:

ssh root@72.62.138.239
cd /opt/agendamento-saas/app

# Parar apenas o frontend (banco fica intacto)
docker-compose -f docker-compose.prod.yml stop frontend

# Remover container antigo
docker-compose -f docker-compose.prod.yml rm -f frontend

# Build sem cache (pega o arquivo novo)
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Subir novo container
docker-compose -f docker-compose.prod.yml up -d frontend

# Verificar logs
docker-compose -f docker-compose.prod.yml logs --tail 30 frontend

# Sair da VPS
exit

# ============================================
# PRONTO! Acesse: https://72.62.138.239
# Faça Ctrl+F5 para limpar cache
# ============================================
