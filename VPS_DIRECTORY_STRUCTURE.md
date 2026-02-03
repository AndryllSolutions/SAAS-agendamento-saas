# Estrutura de Diretórios na VPS - Documentação Completa

## 📁 Estrutura Principal

```
/opt/agendamento-saas/
├── 📂 app/                          # Aplicação principal
│   ├── 📂 backend/                  # Código FastAPI
│   │   ├── 📁 app/                  # Aplicação Python
│   │   ├── 📄 requirements.txt      # Dependências Python
│   │   ├── 📄 Dockerfile            # Build Docker
│   │   ├── 📄 alembic.ini           # Config Alembic
│   │   └── 📂 alembic/              # Migrações DB
│   ├── 📂 frontend/                 # Código Next.js
│   │   ├── 📁 src/                  # Código fonte
│   │   ├── 📄 package.json          # Dependências Node
│   │   ├── 📄 Dockerfile            # Build Docker
│   │   └── 📄 next.config.js        # Config Next.js
│   ├── 📂 docker/                   # Configurações Docker
│   │   ├── 📄 docker-compose.yml    # Orquestração
│   │   ├── 📄 docker-compose.prod.yml # Produção
│   │   └── 📂 nginx/                # Config Nginx
│   ├── 📂 scripts/                  # Scripts de deploy
│   │   ├── 📄 deploy.sh             # Deploy principal
│   │   ├── 📄 health-check.sh       # Verificação saúde
│   │   ├── 📄 backup.sh             # Backup
│   │   └── 📄 restore.sh            # Restore
│   ├── 📄 .env.production           # Variáveis produção
│   └── 📄 .env                      # Variáveis Docker
├── 📂 config/                       # Configurações globais
│   ├── 📂 nginx/                    # Config Nginx
│   │   ├── 📄 nginx.conf            # Config principal
│   │   ├── 📄 ssl.conf              # Config SSL
│   │   └── 📄 sites-available/      # Sites disponíveis
│   ├── 📂 ssl/                      # Certificados SSL
│   │   ├── 📂 certbot/              # Certbot
│   │   └── 📂 certificates/         # Certificados
│   └── 📂 env/                      # Templates ambiente
│       ├── 📄 .env.example          # Exemplo
│       └── 📄 .env.production.example # Produção
├── 📂 data/                         # Dados persistentes
│   ├── 📂 postgres/                 # Dados PostgreSQL
│   │   ├── 📁 base/                 # Base de dados
│   │   └── 📁 backups/              # Backups DB
│   ├── 📂 redis/                    # Dados Redis
│   │   ├── 📁 dump.rdb              # Dump Redis
│   │   └── 📁 appendonly.aof        # AOF Redis
│   ├── 📂 rabbitmq/                 # Dados RabbitMQ
│   │   ├── 📁 mnesia/               # Base RabbitMQ
│   │   └── 📁 definitions/          # Definições
│   ├── 📂 uploads/                  # Uploads usuários
│   │   ├── 📁 images/               # Imagens
│   │   ├── 📁 documents/            # Documentos
│   │   └── 📁 temp/                 # Temp uploads
│   └── 📂 static/                   # Arquivos estáticos
│       ├── 📁 css/                  # CSS custom
│       ├── 📁 js/                   # JS custom
│       └── 📁 assets/               # Assets gerais
├── 📂 logs/                         # Logs centralizados
│   ├── 📂 nginx/                    # Logs Nginx
│   │   ├── 📄 access.log            # Acessos
│   │   ├── 📄 error.log             # Erros
│   │   └── 📄 ssl.log               # SSL
│   ├── 📂 backend/                  # Logs Backend
│   │   ├── 📄 app.log               # Aplicação
│   │   ├── 📄 celery.log            # Celery
│   │   └── 📄 db.log                # Banco dados
│   ├── 📂 frontend/                 # Logs Frontend
│   │   ├── 📄 next.log              # Next.js
│   │   └── 📄 build.log             # Build
│   ├── 📂 celery/                   # Logs Celery
│   │   ├── 📄 worker.log            # Worker
│   │   ├── 📄 beat.log              # Scheduler
│   │   └── 📄 flower.log            # Monitor
│   ├── 📂 system/                   # Logs Sistema
│   │   ├── 📄 docker.log            # Docker
│   │   ├── 📄 system.log            # Sistema
│   │   └── 📄 security.log          # Segurança
│   └── 📂 deploy/                   # Logs Deploy
│       ├── 📄 deploy.log            # Deploy
│       └── 📄 migration.log         # Migrações
├── 📂 backups/                      # Backups automatizados
│   ├── 📂 database/                 # Backups DB
│   │   ├── 📄 db-20240101.sql       # Diários
│   │   ├── 📄 weekly-20240101.sql   # Semanais
│   │   └── 📄 monthly-20240101.sql  # Mensais
│   ├── 📂 files/                    # Backups Arquivos
│   │   ├── 📄 uploads-20240101.tar.gz
│   │   └── 📄 static-20240101.tar.gz
│   ├── 📂 config/                   # Backups Config
│   │   ├── 📄 env-20240101.tar.gz
│   │   └── 📄 nginx-20240101.tar.gz
│   └── 📂 full/                     # Backups Completos
│       └── 📄 full-20240101.tar.gz
├── 📂 ssl/                          # SSL Certbot
│   ├── 📂 certbot/                  # Config Certbot
│   │   ├── 📁 conf/                 # Configurações
│   │   └── 📁 logs/                 # Logs
│   └── 📂 certificates/             # Certificados
│       ├── 📄 fullchain.pem          # Certificado completo
│       ├── 📄 privkey.pem            # Chave privada
│       └── 📄 chain.pem              # Chain
├── 📂 monitoring/                   # Monitoramento
│   ├── 📂 prometheus/               # Prometheus
│   │   ├── 📄 prometheus.yml        # Config
│   │   └── 📁 data/                 # Dados
│   ├── 📂 grafana/                  # Grafana
│   │   ├── 📄 grafana.ini           # Config
│   │   └── 📁 data/                 # Dashboards
│   └── 📂 alerts/                   # Alertas
│       ├── 📄 rules.yml             # Regras
│       └── 📄 notifications.yml    # Notificações
├── 📂 scripts/                      # Scripts manutenção
│   ├── 📂 deploy/                   # Scripts deploy
│   │   ├── 📄 deploy.sh             # Deploy principal
│   │   ├── 📄 rollback.sh            # Rollback
│   │   └── 📄 update.sh             # Atualização
│   ├── 📂 backup/                   # Scripts backup
│   │   ├── 📄 backup.sh             # Backup
│   │   ├── 📄 restore.sh            # Restore
│   │   └── 📄 verify.sh             # Verificação
│   ├── 📂 maintenance/              # Manutenção
│   │   ├── 📄 cleanup.sh            # Limpeza
│   │   ├── 📄 update-system.sh      # Update sistema
│   │   └── 📄 security.sh           # Segurança
│   └── 📂 monitoring/               # Monitoramento
│       ├── 📄 health-check.sh        # Saúde
│       ├── 📄 monitor.sh            # Monitor
│       └── 📄 alerts.sh             # Alertas
├── 📂 temp/                         # Arquivos temporários
│   ├── 📂 builds/                   # Builds temporários
│   │   ├── 📁 frontend/             # Build frontend
│   │   └── 📁 backend/              # Build backend
│   ├── 📂 cache/                    # Cache temporário
│   │   ├── 📁 docker/               # Cache Docker
│   │   └── 📁 npm/                  # Cache NPM
│   └── 📂 uploads/                  # Uploads temporários
│       └── 📁 processing/           # Em processamento
└── 📂 docs/                         # Documentação
    ├── 📄 MIGRATION_INFO.txt        # Info migração
    ├── 📄 README.md                 # Readme projeto
    ├── 📄 DEPLOYMENT.md             # Deploy guide
    ├── 📄 BACKUP.md                 # Backup guide
    └── 📄 TROUBLESHOOTING.md        # Troubleshooting
```

## 🔗 Links Simbólicos Úteis

Para facilitar o acesso, são criados links simbólicos:

```bash
/opt/agendamento-saas/current → /opt/agendamento-saas/app
/opt/agendamento-saas/logs → /opt/agendamento-saas/logs
/opt/agendamento-saas/data → /opt/agendamento-saas/data
/opt/agendamento-saas/config → /opt/agendamento-saas/config
/opt/agendamento-saas/scripts → /opt/agendamento-saas/scripts
```

## 📊 Estrutura por Finalidade

### 🚀 Aplicação (app/)
- **backend/**: Código FastAPI, dependências, Dockerfile
- **frontend/**: Código Next.js, dependências, Dockerfile
- **docker/**: Configurações Docker, orquestração
- **scripts/**: Scripts de deploy e manutenção

### ⚙️ Configurações (config/)
- **nginx/**: Configurações do servidor web
- **ssl/**: Certificados SSL/TLS
- **env/**: Templates de variáveis de ambiente

### 💾 Dados (data/)
- **postgres/**: Dados persistentes do PostgreSQL
- **redis/**: Dados do Redis cache
- **rabbitmq/**: Dados do message broker
- **uploads/**: Arquivos enviados pelos usuários
- **static/**: Assets estáticos da aplicação

### 📝 Logs (logs/)
- **nginx/**: Logs do servidor web
- **backend/**: Logs da API FastAPI
- **frontend/**: Logs do Next.js
- **celery/**: Logs dos workers Celery
- **system/**: Logs do sistema e Docker
- **deploy/**: Logs de deploy e migrações

### 💾 Backups (backups/)
- **database/**: Backups do banco de dados
- **files/**: Backups de arquivos
- **config/**: Backups de configurações
- **full/**: Backups completos do sistema

### 🔐 SSL (ssl/)
- **certbot/**: Configurações do Certbot
- **certificates/**: Certificados SSL/TLS

### 📊 Monitoramento (monitoring/)
- **prometheus/**: Métricas e alertas
- **grafana/**: Dashboards de visualização
- **alerts/**: Configurações de alertas

### 🔧 Scripts (scripts/)
- **deploy/**: Scripts de deploy e rollback
- **backup/**: Scripts de backup e restore
- **maintenance/**: Scripts de manutenção
- **monitoring/**: Scripts de monitoramento

### 🗂️ Temporários (temp/)
- **builds/**: Arquivos de build temporários
- **cache/**: Cache temporário
- **uploads/**: Uploads em processamento

### 📚 Documentação (docs/)
- **MIGRATION_INFO.txt**: Informações da migração
- **README.md**: Documentação do projeto
- **DEPLOYMENT.md**: Guia de deploy
- **BACKUP.md**: Guia de backup
- **TROUBLESHOOTING.md**: Solução de problemas

## 🎯 Permissões Recomendadas

```bash
# Diretórios principais
chmod 755 /opt/agendamento-saas
chmod 755 /opt/agendamento-saas/app
chmod 755 /opt/agendamento-saas/data
chmod 755 /opt/agendamento-saas/logs
chmod 755 /opt/agendamento-saas/backups

# Configurações (mais restrito)
chmod 700 /opt/agendamento-saas/config
chmod 700 /opt/agendamento-saas/ssl

# Scripts executáveis
chmod +x /opt/agendamento-saas/scripts/**/*.sh

# Logs (acesso leitura)
chmod 644 /opt/agendamento-saas/logs/**/*.log

# Donos
chown -R root:root /opt/agendamento-saas
```

## 🔄 Backup da Estrutura

A estrutura é projetada para facilitar backups:

```bash
# Backup completo
tar -czf /opt/backups/agendamento-saas-full-$(date +%Y%m%d).tar.gz /opt/agendamento-saas

# Backup apenas dados
tar -czf /opt/backups/agendamento-saas-data-$(date +%Y%m%d).tar.gz /opt/agendamento-saas/data

# Backup apenas configurações
tar -czf /opt/backups/agendamento-saas-config-$(date +%Y%m%d).tar.gz /opt/agendamento-saas/config
```

## 📈 Monitoramento da Estrutura

```bash
# Verificar uso de espaço
du -sh /opt/agendamento-saas/*
du -sh /opt/agendamento-saas/data/*
du -sh /opt/agendamento-saas/logs/*

# Verificar crescimento de logs
find /opt/agendamento-saas/logs -name "*.log" -mtime +7 -size +100M

# Limpar arquivos antigos
find /opt/agendamento-saas/temp -type f -mtime +7 -delete
find /opt/agendamento-saas/logs -name "*.log" -mtime +30 -delete
```

## 🚀 Acesso Rápido

Comandos úteis para navegação rápida:

```bash
# Ir para diretório principal
cd /opt/agendamento-saas

# Verificar logs
cd /opt/agendamento-saas/logs && tail -f nginx/access.log

# Verificar status dos serviços
cd /opt/agendamento-saas/app && docker-compose ps

# Fazer backup
cd /opt/agendamento-saas && ./scripts/backup/backup.sh daily

# Deploy
cd /opt/agendamento-saas/app && ./scripts/deploy/deploy.sh main
```

Esta estrutura organizada facilita a manutenção, backup, monitoramento e escalabilidade do sistema na VPS.
