# Migração SAAS para VPS - Guia Completo e Organizado

## 🎯 Objetivo

Migrar o projeto `agendamento_SAAS` da máquina local para uma VPS de forma organizada, mantendo estrutura clara e facilitando manutenção futura.

## 📁 Estrutura Criada na VPS

```
/opt/agendamento-saas/
├── 📂 app/                    # Aplicação principal
│   ├── 📂 backend/            # Código FastAPI
│   ├── 📂 frontend/           # Código Next.js
│   ├── 📂 docker/             # Configurações Docker
│   ├── 📂 scripts/            # Scripts de deploy
│   └── 📄 .env.production     # Variáveis produção
├── 📂 config/                 # Configurações globais
│   ├── 📂 nginx/              # Config Nginx
│   ├── 📂 ssl/                # Certificados SSL
│   └── 📂 env/                # Templates ambiente
├── 📂 data/                   # Dados persistentes
│   ├── 📂 postgres/           # Dados PostgreSQL
│   ├── 📂 redis/              # Dados Redis
│   ├── 📂 rabbitmq/           # Dados RabbitMQ
│   └── 📂 uploads/            # Uploads usuários
├── 📂 logs/                   # Logs centralizados
├── 📂 backups/                # Backups automatizados
├── 📂 ssl/                    # SSL Certbot
├── 📂 monitoring/             # Monitoramento
├── 📂 scripts/                # Scripts manutenção
├── 📂 temp/                   # Arquivos temporários
└── 📂 docs/                   # Documentação
```

## 🚀 Scripts Disponíveis

### 1. Script Principal de Migração

#### Bash (Linux/macOS)
```bash
# Uso: ./migrate-to-vps.sh [usuario-vps] [ip-vps] [caminho-chave-ssh]
./migrate-to-vps.sh root 192.168.1.100 ~/.ssh/id_rsa
```

#### PowerShell (Windows)
```powershell
# Uso: .\migrate-to-vps.ps1 -VpsUser root -VpsIp 192.168.1.100
.\migrate-to-vps.ps1 -VpsUser root -VpsIp 192.168.1.100 -SshKey "$env:USERPROFILE\.ssh\id_rsa"
```

### 2. Script de Sincronização

```bash
# Sincronização completa
./sync-to-vps.sh full root 192.168.1.100 ~/.ssh/id_rsa

# Sincronização incremental
./sync-to-vps.sh incremental root 192.168.1.100 ~/.ssh/id_rsa

# Apenas configurações
./sync-to-vps.sh config root 192.168.1.100 ~/.ssh/id_rsa

# Apenas backend
./sync-to-vps.sh backend root 192.168.1.100 ~/.ssh/id_rsa

# Apenas frontend
./sync-to-vps.sh frontend root 192.168.1.100 ~/.ssh/id_rsa
```

## 📋 Tipos de Sincronização

| Tipo | Descrição | Quando Usar |
|------|-----------|------------|
| `full` | Sincronização completa com delete | Primeira migração, reset completo |
| `incremental` | Sincronização incremental | Updates diários, desenvolvimento |
| `config` | Apenas configurações | Mudanças de ambiente |
| `docker` | Apenas arquivos Docker | Updates de containers |
| `backend` | Apenas backend | Mudanças no backend |
| `frontend` | Apenas frontend | Mudanças no frontend |
| `scripts` | Apenas scripts | Updates de deploy |
| `docs` | Apenas documentação | Updates de docs |

## 🔧 Processo de Migração

### Fase 1: Preparação Local

1. **Verificar estrutura local**
   ```bash
   # Verificar se está tudo no lugar
   ls -la e:/agendamento_SAAS/
   ```

2. **Testar conexão SSH**
   ```bash
   # Testar acesso à VPS
   ssh -i ~/.ssh/id_rsa root@SEU_IP_VPS
   ```

3. **Backup local**
   ```bash
   # Backup de segurança
   cp -r e:/agendamento_SAAS e:/agendamento_SAAS_backup_$(date +%Y%m%d)
   ```

### Fase 2: Migração Inicial

1. **Executar script principal**
   ```bash
   # Linux/macOS
   ./migrate-to-vps.sh root SEU_IP_VPS ~/.ssh/id_rsa
   
   # Windows PowerShell
   .\migrate-to-vps.ps1 -VpsUser root -VpsIp SEU_IP_VPS
   ```

2. **Verificar estrutura na VPS**
   ```bash
   ssh root@SEU_IP_VPS
   ls -la /opt/agendamento-saas/
   ```

### Fase 3: Configuração na VPS

1. **Acessar VPS**
   ```bash
   ssh -i ~/.ssh/id_rsa root@SEU_IP_VPS
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cd /opt/agendamento-saas/app
   nano .env.production
   ```

3. **Executar setup inicial**
   ```bash
   cd /opt/agendamento-saas
   ./scripts/deploy/setup-vps.sh seu-dominio.com admin@seu-dominio.com
   ```

### Fase 4: Deploy Inicial

1. **Executar deploy**
   ```bash
   cd /opt/agendamento-saas/app
   ./scripts/deploy.sh main
   ```

2. **Verificar status**
   ```bash
   docker-compose ps
   ./scripts/health-check.sh
   ```

## 🔄 Sincronização Contínua

### Workflow de Desenvolvimento

1. **Fazer mudanças local**
2. **Testar localmente**
3. **Sincronizar para VPS**
   ```bash
   ./sync-to-vps.sh incremental root SEU_IP_VPS ~/.ssh/id_rsa
   ```
4. **Deploy na VPS**
   ```bash
   ssh root@SEU_IP_VPS
   cd /opt/agendamento-saas/app
   ./scripts/deploy.sh main
   ```

### Automatização com Cron

```bash
# Adicionar ao crontab local (se Linux/macOS)
# Sincronizar a cada 30 minutos durante trabalho
*/30 9-18 * * 1-5 cd /path/to/agendamento_SAAS && ./sync-to-vps.sh incremental root SEU_IP_VPS ~/.ssh/id_rsa
```

## 📊 Estrutura Detalhada

### Diretório `app/`
- **backend/**: Código FastAPI, Python, requirements
- **frontend/**: Código Next.js, JavaScript/TypeScript
- **docker/**: Dockerfiles, docker-compose
- **scripts/**: Scripts de deploy e manutenção

### Diretório `config/`
- **nginx/**: Configurações do servidor web
- **ssl/**: Certificados e chaves SSL
- **env/**: Templates de variáveis de ambiente

### Diretório `data/`
- **postgres/**: Dados persistentes PostgreSQL
- **redis/**: Cache e dados Redis
- **rabbitmq/**: Message broker dados
- **uploads/**: Arquivos dos usuários

### Diretório `logs/`
- **nginx/**: Logs do servidor web
- **backend/**: Logs da API
- **frontend/**: Logs do Next.js
- **celery/**: Logs dos workers

### Diretório `backups/`
- **database/**: Backups do banco
- **files/**: Backups de arquivos
- **config/**: Backups de configurações
- **full/**: Backups completos

## 🔐 Segurança

### Permissões Recomendadas

```bash
# Diretórios principais
chmod 755 /opt/agendamento-saas
chmod 755 /opt/agendamento-saas/app
chmod 755 /opt/agendamento-saas/data
chmod 755 /opt/agendamento-saas/logs

# Configurações (mais restrito)
chmod 700 /opt/agendamento-saas/config
chmod 700 /opt/agendamento-saas/ssl

# Scripts executáveis
chmod +x /opt/agendamento-saas/scripts/**/*.sh
```

### Boas Práticas

1. **Não usar root para deploy**
   ```bash
   # Criar usuário deploy
   useradd -m -s /bin/bash deploy
   usermod -aG sudo deploy
   ```

2. **Chaves SSH separadas**
   ```bash
   # Chave específica para deploy
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key
   ```

3. **Backup antes de mudanças**
   ```bash
   # Script de backup automático
   ./scripts/backup.sh before-deploy
   ```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Conexão SSH falha**
   ```bash
   # Verificar configuração SSH
   ssh -v -i ~/.ssh/id_rsa root@SEU_IP_VPS
   
   # Verificar firewall
   ssh root@SEU_IP_VPS "ufw status"
   ```

2. **Permissões negadas**
   ```bash
   # Corrigir permissões
   ssh root@SEU_IP_VPS "chmod +x /opt/agendamento-saas/scripts/*.sh"
   ```

3. **Rsync falha**
   ```bash
   # Verificar caminhos
   rsync -avz --dry-run -e "ssh -i ~/.ssh/id_rsa" \
       --exclude='.git' \
       e:/agendamento_SAAS/backend/ root@SEU_IP_VPS:/opt/agendamento-saas/app/backend/
   ```

4. **Docker não inicia**
   ```bash
   # Verificar logs
   ssh root@SEU_IP_VPS
   cd /opt/agendamento-saas/app
   docker-compose logs backend
   ```

### Logs Úteis

```bash
# Logs de migração
cat /tmp/migrate-to-vps-*.log

# Logs de sincronização
cat /tmp/sync-to-vps-*.log

# Logs de deploy
ssh root@SEU_IP_VPS "tail -f /opt/agendamento-saas/logs/deploy/deploy.log"
```

## 📈 Monitoramento

### Verificação de Saúde

```bash
# Health check completo
ssh root@SEU_IP_VPS
cd /opt/agendamento-saas/app
./scripts/health-check.sh

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats
htop
df -h
```

### Backup Automatizado

```bash
# Backup diário
ssh root@SEU_IP_VPS
cd /opt/agendamento-saas
./scripts/backup.sh daily

# Verificar backups
ls -la /opt/agendamento-saas/backups/database/
```

## 🎯 Próximos Passos

1. **Configurar domínio e SSL**
2. **Migrar banco de dados**
3. **Configurar monitoramento**
4. **Implementar CI/CD**
5. **Configurar backup cloud**

## 📞 Comandos Úteis

```bash
# Acesso rápido à VPS
alias vps="ssh -i ~/.ssh/id_rsa root@SEU_IP_VPS"

# Deploy rápido
alias deploy="cd /opt/agendamento-saas/app && ./scripts/deploy.sh main"

# Backup rápido
alias backup="cd /opt/agendamento-saas && ./scripts/backup.sh daily"

# Logs rápido
alias logs="cd /opt/agendamento-saas && tail -f logs/backend/app.log"
```

---

## 📝 Resumo

Esta estrutura organizada permite:

- ✅ **Manutenção facilitada**: Diretórios bem definidos
- ✅ **Backup eficiente**: Separação clara de dados
- ✅ **Monitoramento centralizado**: Logs organizados
- ✅ **Deploy automatizado**: Scripts específicos
- ✅ **Segurança**: Permissões bem definidas
- ✅ **Escalabilidade**: Estrutura preparada para crescimento

A migração está pronta para ser executada de forma segura e organizada!
