#!/bin/bash

echo "🔧 TRANSFERÊNCIA SEGURA - apiUrl.ts"

echo "📁 1. Verificando arquivo atual:"
ls -la /opt/saas/atendo/frontend/src/utils/apiUrl.ts*

echo ""
echo "📄 2. Conteúdo do novo arquivo (linhas 50-55):"
sed -n '50,55p' /opt/saas/atendo/frontend/src/utils/apiUrl.ts.new

echo ""
echo "🔄 3. Backup e substituição:"
cd /opt/saas/atendo/frontend/src/utils/
cp apiUrl.ts apiUrl.ts.backup.$(date +%Y%m%d_%H%M%S)
mv apiUrl.ts.new apiUrl.ts

echo ""
echo "✅ 4. Verificando substituição:"
grep -n "72.62.138.239" apiUrl.ts

echo ""
echo "🚀 5. Pronto para rebuild!"
echo "   docker compose build --no-cache frontend && docker compose up -d frontend"
