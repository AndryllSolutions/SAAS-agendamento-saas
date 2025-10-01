# 🚀 Guia de Deploy - Agendamento SaaS

## Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado (para produção)
- Certificado SSL (Let's Encrypt recomendado)

## Deploy com Docker Compose

### 1. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL=postgresql://agendamento:SENHA_SEGURA@db:5432/agendamento_db

# Security
SECRET_KEY=GERE_UMA_CHAVE_SECRETA_AQUI

# OAuth2
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Pagamentos
MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago
STRIPE_SECRET_KEY=seu-stripe-secret-key

# Notificações
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
TWILIO_ACCOUNT_SID=seu-twilio-sid
TWILIO_AUTH_TOKEN=seu-twilio-token
WHATSAPP_API_URL=sua-whatsapp-api-url
WHATSAPP_API_TOKEN=seu-whatsapp-token
```

### 2. Iniciar os Serviços

```bash
docker-compose up -d
```

### 3. Executar Migrações do Banco de Dados

```bash
docker-compose exec backend alembic upgrade head
```

### 4. Criar Usuário Admin

```bash
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.core.security import get_password_hash

db = SessionLocal()

# Criar empresa
company = Company(
    name='Minha Empresa',
    slug='minha-empresa',
    email='contato@minhaempresa.com'
)
db.add(company)
db.commit()

# Criar admin
admin = User(
    email='admin@minhaempresa.com',
    password_hash=get_password_hash('admin123'),
    full_name='Administrador',
    role='admin',
    company_id=company.id,
    is_active=True,
    is_verified=True
)
db.add(admin)
db.commit()
print('Admin criado com sucesso!')
"
```

### 5. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## Deploy em Produção (VPS)

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Clonar o Repositório

```bash
cd /opt
sudo git clone <seu-repositorio> agendamento_saas
cd agendamento_saas
```

### 3. Configurar SSL com Let's Encrypt

```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 4. Configurar Nginx como Reverse Proxy

Edite `/etc/nginx/sites-available/agendamento`:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configurar Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 6. Iniciar Aplicação

```bash
cd /opt/agendamento_saas
sudo docker-compose up -d
```

### 7. Configurar Auto-restart

Criar arquivo `/etc/systemd/system/agendamento.service`:

```ini
[Unit]
Description=Agendamento SaaS
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/agendamento_saas
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl enable agendamento
sudo systemctl start agendamento
```

## Backup e Manutenção

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec db pg_dump -U agendamento agendamento_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T db psql -U agendamento agendamento_db < backup_20240101.sql
```

### Monitoramento de Logs

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do celery
docker-compose logs -f celery_worker

# Ver todos os logs
docker-compose logs -f
```

### Atualização da Aplicação

```bash
cd /opt/agendamento_saas
sudo git pull
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d
sudo docker-compose exec backend alembic upgrade head
```

## Otimizações de Performance

### 1. Configurar Redis para Cache

Já configurado no docker-compose.yml

### 2. Configurar CDN (Opcional)

Use Cloudflare ou AWS CloudFront para servir assets estáticos.

### 3. Configurar Monitoramento

Instale Sentry para tracking de erros (já configurado no backend).

### 4. Configurar Backup Automático

Crie um cron job:

```bash
sudo crontab -e
```

Adicione:

```cron
0 2 * * * cd /opt/agendamento_saas && docker-compose exec db pg_dump -U agendamento agendamento_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Problema: Containers não iniciam

```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### Problema: Erro de conexão com banco de dados

Verifique se o PostgreSQL está rodando:

```bash
docker-compose ps
docker-compose logs db
```

### Problema: Frontend não carrega

Verifique se a variável `NEXT_PUBLIC_API_URL` está correta no `.env`

### Problema: Notificações não funcionam

Verifique as credenciais de SMTP, Twilio e WhatsApp no `.env`

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
