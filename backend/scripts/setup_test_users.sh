#!/bin/bash
# Script para criar usuários de teste necessários

echo "🚀 Criando usuários de teste..."

# Criar admin principal
python scripts/create_admin.py

# Criar usuários demo
python scripts/create_demo_users.py

echo "✅ Usuários de teste criados!"
echo ""
echo "📋 Credenciais disponíveis:"
echo "   admin@demo.com / demo123"
echo "   admin@belezalatino.com / admin123"
echo "   gerente@demo.com / demo123"

