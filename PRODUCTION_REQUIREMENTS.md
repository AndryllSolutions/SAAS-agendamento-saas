# 🚀 O QUE PRECISA PARA PRODUÇÃO - SAAS

## 📋 CHECKLIST COMPLETO

### 🔧 1. Dockerfiles Otimizados para Produção

#### ❌ PROBLEMAS ATUAIS:

**Backend Dockerfile:**
- ✅ Python 3.12.8 (OK)
- ✅ Dependências sistema (OK)
- ❌ **Falta health check**
- ❌ **Falta usuário não-root**
- ❌ **Falta multi-stage build**
- ❌ **Falta otimização de camadas**

**Frontend Dockerfile:**
- ❌ **É para desenvolvimento, não produção**
- ❌ **Usa npm run dev** (deve ser build + start)
- ❌ **Não tem build otimizado**
- ❌ **Falta health check**
- ❌ **Falta usuário não-root**

---

## 🐳 Dockerfiles para Produção

### Backend otimizado:
```dockerfile
# Multi-stage build para produção
FROM python:3.12.8-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.12.8-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    redis-tools \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appuser /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PATH=/home/appuser/.local/bin:$PATH

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend otimizado:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create non-root user and set permissions
USER nextjs

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
```

---

## ⚙️ 2. Variáveis de Ambiente Produção

### ❌ PROBLEMAS ATUAIS:
- URLs apontam para ngrok
- Senhas padrão
- DEBUG ativo
- CORS permitindo localhost

### ✅ .env.production:
```bash
# ===========================================
# BANCO DE DADOS - SENHAS FORTES
# ===========================================
POSTGRES_USER=agendamento_prod
POSTGRES_PASSWORD=SENHA_FORTE_AQUI_MUDAR_123!
POSTGRES_DB=agendamento_prod
DATABASE_URL=postgresql+psycopg2://agendamento_prod:SENHA_FORTE_AQUI_MUDAR_123!@db:5432/agendamento_prod

# ===========================================
# SEGURANÇA - CHAVES FORTES
# ===========================================
SECRET_KEY=CHAVE_SECRETA_MUITO_FORTE_GERAR_NOVA_32_CHARS_EXATOS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
SETTINGS_ENCRYPTION_KEY=CHAVE_ENCRYPT_32_CHARS_EXATA_AQUI

# ===========================================
# URLs - DOMÍNIO REAL
# ===========================================
PUBLIC_URL=https://seu-dominio.com
API_URL=https://seu-dominio.com
FRONTEND_URL=https://seu-dominio.com
CORS_ORIGIN=https://seu-dominio.com,https://www.seu-dominio.com
NEXT_PUBLIC_API_URL=https://seu-dominio.com

# ===========================================
# CACHE E FILAS - SENHAS FORTES
# ===========================================
REDIS_URL=redis://:REDIS_PASSWORD_FORTE_AQUI@redis:6379/0
REDIS_PASSWORD=REDIS_PASSWORD_FORTE_AQUI
RABBITMQ_URL=amqp://admin:RABBITMQ_PASSWORD_FORTE_AQUI@rabbitmq:5672/
CELERY_BROKER_URL=amqp://admin:RABBITMQ_PASSWORD_FORTE_AQUI@rabbitmq:5672/
CELERY_RESULT_BACKEND=redis://:REDIS_PASSWORD_FORTE_AQUI@redis:6379/0

# ===========================================
# CONFIGURAÇÕES DE PRODUÇÃO
# ===========================================
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
CORS_ALLOW_ALL=false

# ===========================================
# MONITORAMENTO (Opcional)
# ===========================================
SENTRY_DSN=SEU_SENTRY_DSN_AQUI
PROMETHEUS_ENABLED=true
```

---

## 🌐 3. Configuração Nginx para Produção

### nginx.prod.conf:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name seu-dominio.com www.seu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name seu-dominio.com www.seu-dominio.com;

        # SSL configuration
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/private/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login (rate limiting mais restrito)
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend/auth/login;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 🔒 4. Segurança

### Senhas fortes obrigatórias:
```bash
# Gerar senhas fortes
openssl rand -base64 32  # Para SECRET_KEY
openssl rand -base64 16  # Para outras senhas
```

### Firewall:
```bash
# UFW configurado
ufw allow ssh
ufw allow 80
ufw allow 443
ufw deny 5433  # PostgreSQL apenas localhost
ufw deny 6379  # Redis apenas localhost
ufw deny 5672  # RabbitMQ apenas localhost
```

---

## 📊 5. Monitoramento e Logs

### docker-compose.prod.yml (modificações):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔄 6. Deploy Automatizado

### deploy.sh:
```bash
#!/bin/bash
set -e

echo "🚀 Iniciando deploy produção..."

# Backup
./backup.sh before-deploy

# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Build com --no-cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar saúde
sleep 30
./health-check.sh

echo "✅ Deploy concluído!"
```

---

## 📋 7. Checklist Final de Produção

### 🔧 Antes do Deploy:
- [ ] **Dockerfiles otimizados para produção**
- [ ] **Variáveis de ambiente configuradas**
- [ ] **Senhas fortes geradas**
- [ ] **SSL certificado configurado**
- [ ] **Nginx configurado**
- [ ] **Firewall ativo**
- [ ] **Backup automatizado**
- [ ] **Monitoramento configurado**

### 🚀 Durante o Deploy:
- [ ] **Build sem cache**
- [ ] **Health checks ativos**
- [ ] **Logs configurados**
- [ ] **Restart automático**

### 📊 Pós-Deploy:
- [ ] **Verificar todas as URLs**
- [ ] **Testar login e funcionalidades**
- [ ] **Verificar logs de erros**
- [ ] **Testar backup**
- [ ] **Configurar alertas**

---

## 🎯 O QUE FAZER AGORA:

1. **IMEDIATO:**
   - Atualizar Dockerfiles para produção
   - Configurar .env.production
   - Gerar senhas fortes

2. **APÓS MIGRAÇÃO:**
   - Configurar SSL/Nginx
   - Setup monitoramento
   - Testar tudo

3. **MANUTENÇÃO:**
   - Backups diários
   - Monitoramento 24/7
   - Updates de segurança

Quer que eu crie os arquivos de produção otimizados para você?
