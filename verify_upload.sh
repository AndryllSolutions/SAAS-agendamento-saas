#!/bin/bash

echo "🔧 VERIFICANDO ARQUIVOS RECEBIDOS..."

ls -la /opt/saas/atendo/frontend/src/utils/apiUrl.ts
ls -la /opt/saas/atendo/fix_api_step_by_step.sh
ls -la /opt/saas/atendo/comandos_vps.txt

echo ""
echo "📄 CONTEÚDO DO apiUrl.ts (primeiras 10 linhas):"
head -10 /opt/saas/atendo/frontend/src/utils/apiUrl.ts

echo ""
echo "🔍 VERIFICANDO SE A CORREÇÃO FOI APLICADA:"
grep -n "72.62.138.239" /opt/saas/atendo/frontend/src/utils/apiUrl.ts

echo ""
echo "✅ ARQUIVOS RECEBIDOS COM SUCESSO!"
echo "🚀 EXECUTAR O SCRIPT DE CORREÇÃO:"
echo "   cd /opt/saas/atendo && chmod +x fix_api_step_by_step.sh && ./fix_api_step_by_step.sh"
