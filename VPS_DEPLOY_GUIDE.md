# GUIA DE DEPLOY - VPS LINUX PRODUÇÃO

## PRÉ-REQUISITOS

### 1. Sistema Operacional
```bash
# Ubuntu 22.04 LTS ou Debian 12
sudo apt update && sudo apt upgrade -y
```

### 2. Docker & Docker Compose
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 3. Nginx no Host
```bash
# Instalar Nginx
sudo apt install nginx -y

# Habilitar e iniciar
sudo systemctl enable nginx
sudo systemctl start nginx
```

## PREPARAÇÃO DO AMBIENTE

### 1. Criar Diretório do Projeto
```bash
# Criar diretório base
sudo mkdir -p /opt/saas-agendamento
cd /opt/saas-agendamento

# Criar subdiretórios
sudo mkdir -p {backups,logs,ssl}
sudo chown -R $USER:$USER /opt/saas-agendamento
```

### 2. Transferir Arquivos para VPS
```bash
# No seu Windows (usando scp)
scp -r /e/agendamento_SAAS/* usuario@SUA_VPS:/opt/saas-agendamento/

# Ou usando rsync (mais eficiente)
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='__pycache__' /e/agendamento_SAAS/ usuario@SUA_VPS:/opt/saas-agendamento/
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar e configurar .env.production
cp .env.example .env.production
nano .env.production
```

**Variáveis obrigatórias em `.env.production`:**
```bash
# Database
POSTGRES_USER=saas_user
POSTGRES_PASSWORD=SENHA_FORTE_DB
POSTGRES_DB=saas_production

# Redis
REDIS_PASSWORD=SENHA_FORTE_REDIS

# RabbitMQ
RABBITMQ_PASSWORD=SENHA_FORTE_RABBITMQ

# Backend
SECRET_KEY=CHAVE_SECRETA_SUPER_FORTE
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_API_URL=https://SEU_DOMINIO.COM
```

## DEPLOY PRODUÇÃO

### 1. Build das Imagens
```bash
cd /opt/saas-agendamento

# Build todas as imagens
docker compose -f docker-compose.prod.yml build --no-cache
```

### 2. Executar Migrations (IMPORTANTE)
```bash
# Iniciar apenas banco de dados
docker compose -f docker-compose.prod.yml up -d db

# Aguardar PostgreSQL ficar ready
sleep 30

# Executar migrations
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Criar usuário admin inicial (opcional)
docker compose -f docker-compose.prod.yml run --rm backend python scripts/create_admin.py
```

### 3. Iniciar Todos os Serviços
```bash
# Iniciar todos os containers
docker compose -f docker-compose.prod.yml up -d

# Verificar status
docker compose -f docker-compose.prod.yml ps

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f
```

## CONFIGURAÇÃO DO NGINX (HOST)

### 1. Criar Configuração
```bash
sudo nano /etc/nginx/sites-available/saas-agendamento
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.COM www.SEU_DOMINIO.COM;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name SEU_DOMINIO.COM www.SEU_DOMINIO.COM;
    
    # SSL Configuration
    ssl_certificate /opt/saas-agendamento/ssl/cert.pem;
    ssl_certificate_key /opt/saas-agendamento/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health checks
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }
    
    # Arquivos estáticos (cache)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Ativar Site
```bash
# Criar symlink
sudo ln -s /etc/nginx/sites-available/saas-agendamento /etc/nginx/sites-enabled/

# Remover default
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 3. Configurar SSL (Let's Encrypt)
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d SEU_DOMINIO.COM -d www.SEU_DOMINIO.COM

# Auto-renovação
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## MONITORAMENTO E MANUTENÇÃO

### 1. Scripts Úteis
```bash
# Verificar saúde dos containers
docker compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar serviço específico
docker compose -f docker-compose.prod.yml restart backend

# Backup do banco
docker compose -f docker-compose.prod.yml exec db pg_dump -U saas_user saas_production > backup_$(date +%Y%m%d).sql

# Atualizar sistema
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Monitoramento com Healthchecks
```bash
# Verificar health checks
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:3000

# Status dos containers
docker compose -f docker-compose.prod.yml exec backend curl -f http://localhost:8000/health
```

### 3. Logs e Troubleshooting
```bash
# Logs específicos
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs celery_worker
docker compose -f docker-compose.prod.yml logs db

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## SEGURANÇA

### 1. Firewall
```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Backup Automático
```bash
# Criar script de backup
nano /opt/saas-agendamento/backup.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/saas-agendamento/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U saas_user saas_production > $BACKUP_DIR/postgres_$DATE.sql

# Backup volumes
docker run --rm -v saas_postgres_data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/postgres_volume_$DATE.tar.gz -C /data .
docker run --rm -v saas_redis_data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/redis_volume_$DATE.tar.gz -C /data .

# Limpar backups antigos (7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Tornar executável
chmod +x /opt/saas-agendamento/backup.sh

# Agendar no crontab (diário às 2h)
crontab -e
# Adicionar: 0 2 * * * /opt/saas-agendamento/backup.sh
```

## COMANDOS DE EMERGÊNCIA

### 1. Parada Total
```bash
# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Parar e remover volumes (CUIDADO - PERDE DADOS)
docker compose -f docker-compose.prod.yml down -v
```

### 2. Recuperação
```bash
# Restaurar backup
docker compose -f docker-compose.prod.yml up -d db
sleep 30
docker compose -f docker-compose.prod.yml exec -T db psql -U saas_user -d saas_production < backup_20241201.sql
```

## VERIFICAÇÃO FINAL

```bash
# Testar acesso
curl -I https://SEU_DOMINIO.COM
curl -I https://SEU_DOMINIO.COM/api/health

# Verificar SSL
openssl s_client -connect SEU_DOMINIO.COM:443
```

Seu SaaS estará rodando em produção com todas as boas práticas de engenharia!
