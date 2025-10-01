# 🚀 Setup Local (Sem Docker)

## ✅ Passo a Passo para Rodar Localmente

### 1️⃣ Instalar Dependências

#### PostgreSQL
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com as configurações:
   - Usuário: `postgres`
   - Senha: `postgres`
   - Porta: `5432`

3. Abra **pgAdmin** ou **psql** e execute:
```sql
CREATE DATABASE agendamento_db;
CREATE USER agendamento WITH PASSWORD 'agendamento123';
GRANT ALL PRIVILEGES ON DATABASE agendamento_db TO agendamento;
```

#### Python 3.11+
1. Baixe: https://www.python.org/downloads/
2. Durante instalação, marque "Add Python to PATH"

#### Node.js 18+
1. Baixe: https://nodejs.org/
2. Instale a versão LTS

#### Redis (Opcional - para cache)
1. Baixe: https://github.com/microsoftarchive/redis/releases
2. Ou use: https://memurai.com/ (Redis para Windows)

---

### 2️⃣ Configurar Backend

```bash
# Navegar para pasta backend
cd d:\agendamento_SAAS\backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

#### Criar arquivo `.env` no backend:

Crie o arquivo `d:\agendamento_SAAS\backend\.env` com:

```env
# Database
DATABASE_URL=postgresql://agendamento:agendamento123@localhost:5432/agendamento_db

# Redis (opcional - comente se não tiver)
REDIS_URL=redis://localhost:6379/0

# RabbitMQ (opcional - comente se não tiver)
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# Security
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Email (configure com suas credenciais)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
SMTP_FROM=noreply@agendamento.com

# Desabilitar Celery para desenvolvimento local
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=

# Sentry (opcional)
SENTRY_DSN=

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Debug
DEBUG=True
ENVIRONMENT=development
```

#### Inicializar banco de dados:

```bash
# Ainda com venv ativado
python scripts/init_db.py
```

#### Rodar backend:

```bash
# Desenvolvimento com reload automático
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend rodando em: http://localhost:8000
✅ Docs API: http://localhost:8000/docs

---

### 3️⃣ Configurar Frontend

Abra um **NOVO terminal** (deixe o backend rodando):

```bash
# Navegar para pasta frontend
cd d:\agendamento_SAAS\frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
```

Crie o arquivo `d:\agendamento_SAAS\frontend\.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Rodar frontend:

```bash
npm run dev
```

✅ Frontend rodando em: http://localhost:3000

---

### 4️⃣ Acessar o Sistema

1. Abra o navegador: http://localhost:3000
2. Faça login com:
   - Email: `admin@belezatotal.com`
   - Senha: `admin123`

---

## 🔧 Comandos Úteis

### Backend
```bash
# Ativar ambiente virtual
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate

# Rodar servidor
uvicorn app.main:app --reload

# Rodar testes
pytest

# Criar migração
alembic revision --autogenerate -m "descrição"

# Aplicar migrações
alembic upgrade head
```

### Frontend
```bash
cd d:\agendamento_SAAS\frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start

# Lint
npm run lint
```

---

## 🐛 Problemas Comuns

### Erro: "ModuleNotFoundError"
```bash
# Certifique-se que o venv está ativado
.\venv\Scripts\activate

# Reinstale as dependências
pip install -r requirements.txt
```

### Erro: "Connection refused" no banco
- Verifique se PostgreSQL está rodando
- Verifique usuário/senha no .env
- Teste conexão: `psql -U agendamento -d agendamento_db`

### Erro: "Port already in use"
```bash
# Backend (porta 8000)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (porta 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend não conecta no backend
- Verifique se backend está rodando: http://localhost:8000/health
- Verifique CORS no backend/.env
- Verifique NEXT_PUBLIC_API_URL no frontend/.env.local

---

## 📝 Funcionalidades Limitadas sem Docker

**SEM Redis/RabbitMQ/Celery:**
- ❌ Lembretes automáticos (tarefas agendadas)
- ❌ Processamento de fila de espera
- ❌ Cache de queries
- ✅ Todas as outras funcionalidades funcionam normalmente!

**Para habilitar tudo:**
- Instale Redis: https://memurai.com/
- Instale RabbitMQ: https://www.rabbitmq.com/install-windows.html
- Configure as URLs no .env
- Rode Celery: `celery -A app.tasks.celery_app worker --loglevel=info`

---

## 🎯 Desenvolvimento Recomendado

### Terminal 1 - Backend
```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd d:\agendamento_SAAS\frontend
npm run dev
```

### Terminal 3 - Celery (Opcional)
```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
celery -A app.tasks.celery_app worker --loglevel=info
```

---

## ✅ Checklist de Setup

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `agendamento_db` criado
- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] Backend: venv criado e dependências instaladas
- [ ] Backend: arquivo .env configurado
- [ ] Backend: banco inicializado (`python scripts/init_db.py`)
- [ ] Backend: servidor rodando (porta 8000)
- [ ] Frontend: dependências instaladas (`npm install`)
- [ ] Frontend: arquivo .env.local configurado
- [ ] Frontend: servidor rodando (porta 3000)
- [ ] Login funcionando no navegador

---

## 🚀 Próximos Passos

Após tudo funcionando:
1. Explore o sistema em http://localhost:3000
2. Teste as APIs em http://localhost:8000/docs
3. Customize serviços e configurações
4. Adicione suas próprias funcionalidades

**Dica**: Use VS Code com as extensões:
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense
