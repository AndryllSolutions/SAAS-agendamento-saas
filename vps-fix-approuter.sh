#!/bin/bash

echo "🔧 Corrigindo App Router na VPS..."

# 1) Parar containers stateless (NÃO parar banco!)
echo "⏹️ Parando frontend e backend..."
docker stop agendamento_frontend_prod agendamento_backend_prod || true
docker stop agendamento_celery_worker_prod agendamento_celery_beat_prod || true

# 2) Corrigir jsconfig.json (encoding UTF-8 puro)
echo "📝 Corrigindo jsconfig.json..."
cat > /opt/saas/atendo/frontend/jsconfig.json << 'EOF'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
EOF

# 3) Instalar dependências faltantes
echo "📦 Instalando dependências..."
cd /opt/saas/atendo/frontend
npm install @radix-ui/react-switch framer-motion

# 4) Criar componente textarea ausente
echo "🧩 Criando textarea.tsx..."
mkdir -p /opt/saas/atendo/frontend/src/components/ui
cat > /opt/saas/atendo/frontend/src/components/ui/textarea.tsx << 'EOF'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
EOF

# 5) Adicionar dynamic = 'force-dynamic' no layout (se não tiver)
echo "⚡ Verificando layout.tsx..."
if ! grep -q "export const dynamic" /opt/saas/atendo/frontend/src/app/layout.tsx; then
  sed -i '/export const runtime/a\export const dynamic = "force-dynamic"' /opt/saas/atendo/frontend/src/app/layout.tsx
fi

# 6) Corrigir senha do PostgreSQL (se necessário)
echo "🔐 Verificando senha do PostgreSQL..."
# Testar conexão com senha atual
if docker exec agendamento_db_prod psql -U agendamento_app -d agendamento -c "SELECT 1;" >/dev/null 2>&1; then
  echo "✅ Senha do PostgreSQL OK"
else
  echo "🔧 Corrigindo senha do PostgreSQL..."
  docker exec agendamento_db_prod psql -U agendamento_app -d agendamento -c "ALTER USER agendamento_app PASSWORD 'Ag3nd2026P0stgr3sS3cur3K3y';"
fi

# 7) Rebuildar imagem frontend
echo "🏗️ Rebuildando frontend..."
cd /opt/saas/atendo/frontend
docker build -t agendamento_saas-frontend:latest -f Dockerfile.prod .

# 8) Subir containers
echo "🚀 Subindo containers..."
cd /opt/saas/atendo
docker-compose -f docker-compose.prod.yml up -d

# 9) Verificar status
echo "📊 Verificando status..."
sleep 10
docker ps | grep agendamento

# 10) Testar rotas principais
echo "🧪 Testando rotas..."
docker exec agendamento_frontend_prod curl -s -o /dev/null -w "Status /: %{http_code}\n" http://localhost:3000/
docker exec agendamento_frontend_prod curl -s -o /dev/null -w "Status /login/: %{http_code}\n" http://localhost:3000/login/
docker exec agendamento_frontend_prod curl -s -o /dev/null -w "Status /saas-admin/: %{http_code}\n" http://localhost:3000/saas-admin/

echo "✅ App Router corrigido na VPS!"
echo "🌐 Acesse: http://72.62.138.239/login/"
