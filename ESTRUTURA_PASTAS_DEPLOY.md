# Estrutura de Pastas - Deploy VPS via SCP

## 📁 Estrutura Atual do Projeto

```
agendamento_SAAS/
├── backend/                          # Backend FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── appointments.py
│   │   │       │   ├── calendar.py          # ✅ NOVO
│   │   │       │   ├── client_notes.py      # ✅ NOVO
│   │   │       │   ├── clients.py
│   │   │       │   ├── professionals.py
│   │   │       │   └── ...
│   │   │       └── api.py                   # ✅ ATUALIZADO (rotas calendar e client_notes)
│   │   ├── models/
│   │   ├── schemas/
│   │   │   └── appointment.py               # ✅ ATUALIZADO (novos schemas)
│   │   ├── services/
│   │   └── core/
│   ├── alembic/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/                         # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx                 # ✅ ATUALIZADO (drag&drop, drawers)
│   │   │   ├── agenda-new/                  # ⚠️ PODE DELETAR (não usado)
│   │   │   │   └── page.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── agenda/
│   │   │   │   ├── CalendarGrid.tsx         # ✅ ATUALIZADO (drag&drop)
│   │   │   │   ├── EventCard.tsx            # ✅ ATUALIZADO (draggable)
│   │   │   │   └── ...
│   │   │   ├── calendar-grid/               # ✅ NOVOS COMPONENTES
│   │   │   │   ├── TimeGridCalendar.tsx
│   │   │   │   ├── AppointmentBlock.tsx
│   │   │   │   ├── BusyBlockCard.tsx
│   │   │   │   ├── ProfessionalHeader.tsx
│   │   │   │   ├── MoveConfirmModal.tsx
│   │   │   │   ├── AppointmentDrawer.tsx
│   │   │   │   └── ClientSidebar.tsx
│   │   │   ├── professionals/
│   │   │   │   ├── EmployeeDrawer.tsx       # Reutilizado
│   │   │   │   └── DrawerStackManager.tsx   # Reutilizado
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── agendaAdapter.ts
│   │   │   └── calendarService.ts           # ✅ NOVO
│   │   ├── types/
│   │   │   └── calendar.ts                  # ✅ NOVO
│   │   ├── lib/
│   │   │   └── utils.ts                     # ✅ NOVO
│   │   └── store/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.prod.yml           # Docker production
├── .env.production                   # Variáveis de ambiente
└── nginx/                            # Configuração Nginx (se houver)
```

---

## 🚀 Comandos SCP para Deploy na VPS

### **Caminho Correto na VPS**
```bash
VPS_PATH=/opt/saas/atendo
```

### **1. Deploy Backend**
```bash
# Comprimir backend localmente
cd c:/PROJETOS/agendamento_SAAS\ \(1\)/agendamento_SAAS
tar -czf backend_deploy.tar.gz backend/

# Enviar para VPS
scp backend_deploy.tar.gz root@SEU_IP_VPS:/opt/saas/atendo/

# Na VPS, descompactar
ssh root@SEU_IP_VPS
cd /opt/saas/atendo
tar -xzf backend_deploy.tar.gz
rm backend_deploy.tar.gz
```

### **2. Deploy Frontend**
```bash
# Comprimir frontend localmente
cd c:/PROJETOS/agendamento_SAAS\ \(1\)/agendamento_SAAS
tar -czf frontend_deploy.tar.gz frontend/

# Enviar para VPS
scp frontend_deploy.tar.gz root@SEU_IP_VPS:/opt/saas/atendo/

# Na VPS, descompactar
ssh root@SEU_IP_VPS
cd /opt/saas/atendo
tar -xzf frontend_deploy.tar.gz
rm frontend_deploy.tar.gz
```

### **3. Deploy Arquivos de Configuração**
```bash
# Enviar docker-compose e .env
scp docker-compose.prod.yml root@SEU_IP_VPS:/opt/saas/atendo/
scp .env.production root@SEU_IP_VPS:/opt/saas/atendo/.env
```

### **4. Rebuild e Restart no Docker**
```bash
# Na VPS
ssh root@SEU_IP_VPS
cd /opt/saas/atendo

# Rebuild containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Arquivos Novos/Modificados para Deploy

### **Backend** (enviar via SCP)
- ✅ `backend/app/api/v1/endpoints/calendar.py` (NOVO)
- ✅ `backend/app/api/v1/endpoints/client_notes.py` (NOVO)
- ✅ `backend/app/api/v1/endpoints/appointments.py` (ATUALIZADO - endpoint /move)
- ✅ `backend/app/api/v1/api.py` (ATUALIZADO - rotas calendar e client_notes)
- ✅ `backend/app/schemas/appointment.py` (ATUALIZADO - novos schemas)

### **Frontend** (enviar via SCP)
- ✅ `frontend/src/app/agenda/page.tsx` (ATUALIZADO)
- ✅ `frontend/src/components/agenda/CalendarGrid.tsx` (ATUALIZADO)
- ✅ `frontend/src/components/agenda/EventCard.tsx` (ATUALIZADO)
- ✅ `frontend/src/components/calendar-grid/*` (NOVOS - 7 arquivos)
- ✅ `frontend/src/services/calendarService.ts` (NOVO)
- ✅ `frontend/src/types/calendar.ts` (NOVO)
- ✅ `frontend/src/lib/utils.ts` (NOVO)

### **Arquivos que PODEM SER DELETADOS** (não usados)
- ⚠️ `frontend/src/app/agenda-new/` (pasta inteira - não é usada)

---

## 🔧 Script Automatizado de Deploy

Crie este script para facilitar:

```bash
# deploy-agenda-vps.sh
#!/bin/bash

VPS_IP="SEU_IP_VPS"
VPS_USER="root"
VPS_PATH="/opt/saas/atendo"

echo "🚀 Iniciando deploy da agenda para VPS..."

# 1. Comprimir arquivos
echo "📦 Comprimindo backend..."
tar -czf backend_deploy.tar.gz backend/

echo "📦 Comprimindo frontend..."
tar -czf frontend_deploy.tar.gz frontend/

# 2. Enviar para VPS
echo "📤 Enviando backend..."
scp backend_deploy.tar.gz $VPS_USER@$VPS_IP:$VPS_PATH/

echo "📤 Enviando frontend..."
scp frontend_deploy.tar.gz $VPS_USER@$VPS_IP:$VPS_PATH/

echo "📤 Enviando configurações..."
scp docker-compose.prod.yml $VPS_USER@$VPS_IP:$VPS_PATH/
scp .env.production $VPS_USER@$VPS_IP:$VPS_PATH/.env

# 3. Descompactar e rebuild na VPS
echo "🔧 Descompactando e rebuilding na VPS..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /opt/saas/atendo
tar -xzf backend_deploy.tar.gz
tar -xzf frontend_deploy.tar.gz
rm backend_deploy.tar.gz frontend_deploy.tar.gz

docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deploy concluído!"
docker-compose -f docker-compose.prod.yml ps
EOF

# 4. Limpar arquivos locais
rm backend_deploy.tar.gz frontend_deploy.tar.gz

echo "✅ Deploy finalizado com sucesso!"
```

---

## 📋 Checklist Pré-Deploy

- [ ] Testar localmente com `docker-compose up`
- [ ] Verificar se `.env.production` está atualizado
- [ ] Backup do banco de dados da VPS
- [ ] Verificar se o caminho `/opt/saas/atendo` existe na VPS
- [ ] Confirmar que `docker-compose.prod.yml` está correto
- [ ] Deletar pasta `frontend/src/app/agenda-new/` (não usada)

---

## 🐳 Estrutura Docker na VPS

```
/opt/saas/atendo/
├── backend/
├── frontend/
├── docker-compose.prod.yml
├── .env
└── nginx/  (se houver)
```

---

## ⚠️ Observações Importantes

1. **Caminho VPS**: SEMPRE usar `/opt/saas/atendo` (NÃO `/opt/agendamento-saas/app`)
2. **Docker-first**: Tudo roda no Docker, não há execução separada
3. **Backup**: Sempre fazer backup antes do deploy
4. **Logs**: Monitorar logs após deploy: `docker-compose -f docker-compose.prod.yml logs -f`
5. **Nginx**: Se houver nginx, reiniciar: `docker-compose -f docker-compose.prod.yml restart nginx`

---

## 🎯 Resultado Final

Após o deploy, a agenda `/agenda` terá:
- ✅ Endpoint único `/calendar/day`
- ✅ Drag & drop de appointments
- ✅ Modal de confirmação de movimento
- ✅ Drawer de appointment com ClientSidebar
- ✅ CRUD de notas do cliente
- ✅ Clique no profissional abre EmployeeDrawer
- ✅ Busy blocks renderizados

**Acesse**: `https://seu-dominio.com/agenda`
