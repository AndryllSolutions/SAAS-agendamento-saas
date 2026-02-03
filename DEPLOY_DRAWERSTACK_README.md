# Deploy DrawerStack - SCP Manual

## 📋 Arquivos Criados

### Frontend
- `DrawerStackManager.tsx` - Gerenciador de drawers empilhados
- `SubDrawer.tsx` - Componente base para sub-drawers
- `NovaPersonalizacaoDrawer.tsx` - Sub-drawer para personalizações
- `NovoValeDrawer.tsx` - Sub-drawer para vales
- `ProfessionalsTable.tsx` - Tabela com drag & drop
- `EmployeeDrawer.tsx` - Atualizado com URL state
- `ExpedienteSection.tsx` - Atualizado com sub-drawer
- `ValesSection.tsx` - Atualizado com sub-drawer
- `useDrawerRestore.ts` - Hook para restaurar URL state
- `professionalService.ts` - Serviço completo com reorder
- `page-fixed.tsx` - Página com drag & drop funcional

### Backend
- `professional_schedule_override.py` - Models para schedule overrides
- `professional_voucher.py` - Models para vouchers
- `professional_schedule_override.py` - Schemas para overrides
- `professional_voucher.py` - Schemas para vouchers
- `professional_schedule_overrides.py` - Endpoints para overrides
- `professional_vouchers.py` - Endpoints para vouchers
- `professionals.py` - Atualizado com endpoint reorder
- `api.py` - Atualizado com novos routers

## 🚀 Deploy via SCP

### 1. Subir Frontend
Execute os comandos do arquivo `deploy-drawerstack-frontend.sh` individualmente:

```bash
# Exemplo:
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/frontend/src/components/professionals/DrawerStackManager.tsx" root@72.62.138.239:/opt/saas/atendo/frontend/src/components/professionals/
```

### 2. Subir Backend
Execute os comandos do arquivo `deploy-drawerstack-backend.sh` individualmente:

```bash
# Exemplo:
scp "c:/PROJETOS/agendamento_SAAS (1)/agendamento_SAAS/backend/app/models/professional_schedule_override.py" root@72.62.138.239:/opt/saas/atendo/backend/app/models/
```

### 3. Executar na VPS
Conecte via SSH e execute os comandos do arquivo `deploy-drawerstack-commands.sh`:

```bash
ssh root@72.62.138.239
cd /opt/saas/atendo
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Verificação

Após o deploy, verifique:

1. **Frontend**: Acesse `/professionals` e teste:
   - Abrir drawer do profissional
   - Navegar entre seções (URL deve mudar)
   - Abrir "Nova Personalização" (sub-drawer)
   - Abrir "Novo Vale" (sub-drawer)
   - ESC fecha apenas drawer do topo
   - Drag & drop para reordenar

2. **Backend**: Verifique endpoints:
   - `GET /professionals/reorder`
   - `GET /professionals/{id}/schedule-overrides`
   - `GET /professionals/{id}/vouchers`

## 📝 Importante

- **NUNCA** usar `docker-compose down -v` (apaga banco de dados)
- **SEMPRE** usar `docker-compose.prod.yml`
- **CAMINHO** correto: `/opt/saas/atendo`
- **BACKUP**: O script faz backup automático do `.env`

## ✅ Test Checklist

- [ ] Drawer principal abre
- [ ] URL reflete seção ativa
- [ ] Sub-drawers empilham corretamente
- [ ] ESC fecha drawer do topo
- [ ] Drag & drop reordena
- [ ] Backend endpoints funcionam
- [ ] Sem erros no console
