# 🗓️ Sistema de Agendamento SaaS

Sistema completo de agendamento online multi-tenant com gestão de usuários, pagamentos integrados, notificações automáticas e dashboards analíticos.

## 🚀 Funcionalidades

### Agendamento
- ✅ Agenda visual (diária, semanal, mensal)
- ✅ Cadastro de serviços com categorias
- ✅ Escolha de profissional e horário
- ✅ Cancelamento/reagendamento com regras
- ✅ Lembretes automáticos (WhatsApp, SMS, Email)
- ✅ Fila de espera inteligente

### Gestão de Usuários
- ✅ Multi-tenant (multiempresa)
- ✅ 4 níveis de acesso: Admin, Gestor, Profissional, Cliente
- ✅ Autenticação JWT + OAuth2 (Google, Facebook)
- ✅ Permissões granulares por role

### Pagamentos
- ✅ Integração Mercado Pago, Stripe, PayPal
- ✅ Pix, Cartão, Boleto
- ✅ Controle de comissões
- ✅ Planos e pacotes
- ✅ Relatórios financeiros

### Administração
- ✅ Cadastro de clientes com histórico
- ✅ Gestão de profissionais
- ✅ Controle de recursos físicos
- ✅ Multiunidade (filiais)

### Extras
- ✅ Dashboard com métricas em tempo real
- ✅ Campanhas promocionais
- ✅ Avaliações de clientes
- ✅ Integração Google Calendar/Outlook
- ✅ PWA responsivo
- ✅ Check-in via QR Code

## 🛠️ Stack Tecnológica

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Queue**: Celery + RabbitMQ
- **Auth**: JWT + OAuth2

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

### Infraestrutura
- **Container**: Docker + Docker Compose
- **Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Deploy**: VPS/AWS/GCP

## 📦 Instalação

### Pré-requisitos
- Docker & Docker Compose
- Node.js 18+ (para desenvolvimento frontend)
- Python 3.11+ (para desenvolvimento backend)

### Configuração Rápida

```bash
# Clone o repositório
git clone <repo-url>
cd agendamento_SAAS

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie com Docker
docker-compose up -d

# Acesse:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs API: http://localhost:8000/docs
```

### Desenvolvimento Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentação da API

Acesse `/docs` para documentação interativa Swagger ou `/redoc` para ReDoc.

### Endpoints Principais

#### Autenticação
- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/oauth/{provider}` - OAuth login

#### Agendamentos
- `GET /api/v1/appointments` - Listar agendamentos
- `POST /api/v1/appointments` - Criar agendamento
- `PUT /api/v1/appointments/{id}` - Atualizar agendamento
- `DELETE /api/v1/appointments/{id}` - Cancelar agendamento

#### Serviços
- `GET /api/v1/services` - Listar serviços
- `POST /api/v1/services` - Criar serviço
- `PUT /api/v1/services/{id}` - Atualizar serviço

#### Pagamentos
- `POST /api/v1/payments/create` - Criar pagamento
- `POST /api/v1/payments/webhook` - Webhook de pagamento
- `GET /api/v1/payments/{id}` - Status do pagamento

## 🔐 Segurança

- ✅ Proteção contra SQL Injection (ORM)
- ✅ Proteção XSS (sanitização de inputs)
- ✅ Proteção CSRF (tokens)
- ✅ Rate limiting
- ✅ HTTPS obrigatório em produção
- ✅ Senhas com bcrypt
- ✅ Tokens JWT com expiração

## 🧪 Testes

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📊 Arquitetura

```
agendamento_SAAS/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints da API
│   │   ├── core/         # Configurações e segurança
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── services/     # Lógica de negócio
│   │   ├── tasks/        # Tarefas Celery
│   │   └── utils/        # Utilitários
│   ├── alembic/          # Migrações
│   └── tests/            # Testes
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API calls
│   │   ├── store/        # State management
│   │   └── utils/        # Utilitários
│   └── public/
├── docker/               # Dockerfiles
└── docker-compose.yml
```

## 🌐 Deploy

### Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agendamento
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Pagamentos
MERCADOPAGO_ACCESS_TOKEN=your-mp-token
STRIPE_SECRET_KEY=your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-id

# Notificações
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
WHATSAPP_API_URL=your-whatsapp-api-url
```

## 📝 Licença

MIT License

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.

## 📧 Suporte

Para suporte, envie um email para suporte@agendamento.com
