# Backend Architecture - Agendamento SaaS Multi-Tenant

## Overview
Sistema completo de agendamento online multi-tenant construído com FastAPI, SQLAlchemy e arquitetura limpa. Suporta planos, add-ons, autenticação JWT, RBAC e processamento assíncrono.

## Stack Tecnológico

### Core Framework
- **FastAPI**: Framework web moderno com validação automática via Pydantic
- **Python 3.12**: Linguagem principal
- **SQLAlchemy 2.0**: ORM com suporte a async
- **Alembic**: Sistema de migrations
- **Pydantic V2**: Validação e serialização

### Banco de Dados
- **PostgreSQL 15**: Banco principal
- **Redis 7**: Cache e sessões
- **RabbitMQ**: Message broker para tarefas assíncronas

### Autenticação & Segurança
- **JWT (Bearer Tokens)**: Access token (8h) + Refresh token (30 dias)
- **bcrypt**: Hash de senhas
- **RBAC**: Role-Based Access Control
- **CORS**: Configuração multi-ambiente
- **Rate Limiting**: Limite de requisições por IP

### Background Tasks
- **Celery**: Worker para tarefas assíncronas
- **Celery Beat**: Scheduler para jobs recorrentes
- **Flower**: Monitoramento (opcional)

## Estrutura de Diretórios

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py          # Dependências comuns (DB, auth)
│   │   └── v1/
│   │       ├── endpoints/   # Endpoints REST
│   │       │   ├── auth.py
│   │       │   ├── users.py
│   │       │   ├── companies.py
│   │       │   ├── clients.py
│   │       │   ├── services.py
│   │       │   ├── products.py
│   │       │   ├── commands.py
│   │       │   ├── packages.py
│   │       │   ├── schedules.py
│   │       │   ├── notifications.py
│   │       │   ├── plans.py
│   │       │   └── addons.py
│   │       └── api.py        # Router principal
│   ├── core/
│   │   ├── config.py        # Configurações (Settings)
│   │   ├── security.py      # JWT, password hash
│   │   ├── database.py      # Conexão DB
│   │   ├── roles.py         # Definições de papéis
│   │   ├── rbac.py          # Sistema de permissões
│   │   ├── plans.py         # Configurações de planos/features
│   │   └── notifications.py # Templates de notificação
│   ├── models/
│   │   ├── base.py          # Modelo base com campos comuns
│   │   ├── user.py          # Usuários e roles
│   │   ├── company.py       # Empresas (tenants)
│   │   ├── company_user.py  # Relação usuário-empresa
│   │   ├── company_subscription.py # Assinaturas
│   │   ├── client.py        # Clientes das empresas
│   │   ├── service.py       # Serviços oferecidos
│   │   ├── product.py       # Produtos para venda
│   │   ├── command.py       # Pedidos/comandas
│   │   ├── command_item.py  # Itens dos pedidos
│   │   ├── package.py       # Pacotes de serviços
│   │   ├── client_package.py # Pacotes dos clientes
│   │   ├── schedule.py      # Agendamentos
│   │   ├── notification.py  # Notificações
│   │   ├── plan.py          # Planos de assinatura
│   │   ├── addon.py         # Add-ons disponíveis
│   │   └── company_addon.py # Add-ons contratados
│   ├── schemas/
│   │   ├── base.py          # Schema base
│   │   ├── user.py          # Schemas de usuário
│   │   ├── company.py       # Schemas de empresa
│   │   ├── client.py        # Schemas de cliente
│   │   ├── service.py       # Schemas de serviço
│   │   ├── product.py       # Schemas de produto
│   │   ├── command.py       # Schemas de pedido
│   │   ├── package.py       # Schemas de pacote
│   │   ├── schedule.py      # Schemas de agendamento
│   │   ├── notification.py  # Schemas de notificação
│   │   ├── plan.py          # Schemas de plano
│   │   └── addon.py         # Schemas de add-on
│   ├── services/
│   │   ├── auth_service.py  # Lógica de autenticação
│   │   ├── user_service.py  # Gestão de usuários
│   │   ├── company_service.py # Gestão de empresas
│   │   ├── client_service.py # Gestão de clientes
│   │   ├── schedule_service.py # Gestão de agendamentos
│   │   ├── notification_service.py # Envio de notificações
│   │   ├── plan_service.py  # Validação de planos/features
│   │   └── limit_validator.py # Validação de limites
│   ├── tasks/
│   │   ├── celery_app.py    # Configuração do Celery
│   │   ├── notifications.py # Tarefas de notificação
│   │   └── subscriptions.py # Renovação de assinaturas
│   └── utils/
│       ├── email.py         # Envio de e-mails
│       ├── whatsapp.py      # Integração WhatsApp
│       └── helpers.py       # Funções utilitárias
├── alembic/
│   ├── versions/            # Migrations do DB
│   ├── env.py              # Configuração Alembic
│   └── alembic.ini         # Configurações
├── tests/
│   ├── conftest.py         # Configuração de testes
│   ├── test_auth.py        # Testes de autenticação
│   └── test_api.py         # Testes de endpoints
├── Dockerfile
├── requirements.txt
└── .env                    # Variáveis de ambiente
```

## Arquitetura de Software

### 1. Camada de Apresentação (API Layer)
- **FastAPI Endpoints**: Operações CRUD e lógica de negócio
- **Pydantic Schemas**: Validação de entrada/saída
- **Dependency Injection**: DB, auth, permissões

### 2. Camada de Negócio (Business Layer)
- **Services**: Lógica de negócio complexa
- **RBAC**: Verificação de permissões por escopo
- **Plan Service**: Validação de features e limites

### 3. Camada de Acesso a Dados (Data Layer)
- **SQLAlchemy Models**: Mapeamento ORM
- **Repository Pattern**: Abstração do DB
- **Alembic Migrations**: Controle de schema

### 4. Camada de Infraestrutura
- **PostgreSQL**: Persistência principal
- **Redis**: Cache e sessões
- **RabbitMQ + Celery**: Processamento assíncrono

## Multi-Tenancy

### Isolamento de Dados
- **Company-based**: Cada empresa é um tenant
- **Row Level Security**: Filtros automáticos por company_id
- **Middleware**: Injeção automática do tenant

### Escopo de Permissões (RBAC)
```python
class Scope(str, Enum):
    # SaaS Admin
    SAAS_ADMIN_READ = "saas:admin:read"
    SAAS_ADMIN_WRITE = "saas:admin:write"
    
    # Company Management
    COMPANY_READ = "company:read"
    COMPANY_WRITE = "company:write"
    
    # User Management
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    
    # Client Management
    CLIENT_READ = "client:read"
    CLIENT_WRITE = "client:write"
    
    # Schedule Management
    SCHEDULE_READ = "schedule:read"
    SCHEDULE_WRITE = "schedule:write"
    
    # Financial
    FINANCIAL_READ = "financial:read"
    FINANCIAL_WRITE = "financial:write"
```

## Sistema de Planos e Features

### Planos Disponíveis
1. **Essencial** (Free): 1 profissional, 50 clientes
2. **Pro** (R$ 197/mês): 3 profissionais, 200 clientes
3. **Premium** (R$ 397/mês): 10 profissionais, 500 clientes
4. **Scale** (R$ 399-499/mês): Ilimitado

### Features por Plano
```python
FEATURE_PLANS = {
    # Core Features
    "basic_scheduling": "essencial",
    "client_management": "essencial",
    "service_catalog": "essencial",
    
    # Pro Features
    "online_booking": "pro",
    "email_notifications": "pro",
    "basic_reports": "pro",
    
    # Premium Features
    "whatsapp_integration": "premium",
    "advanced_reports": "premium",
    "api_access": "premium",
    
    # Scale Features
    "multi_unit": "scale",
    "white_label": "scale",
    "priority_support": "scale",
}
```

### Sistema de Add-ons
Add-ons opcionais que desbloqueiam features específicas:
- **Precificação Inteligente** (R$ 49/mês)
- **Relatórios Avançados** (R$ 39/mês)
- **Metas & Bonificação** (R$ 39/mês)
- **Marketing WhatsApp** (R$ 59/mês)
- **Unidade Extra** (R$ 69/mês)
- **Assinatura Digital** (R$ 19/mês)
- **Anamnese Inteligente** (R$ 29/mês)
- **Cashback & Fidelização** (R$ 29/mês)
- **Fiscal Pro** (R$ 69/mês)

## Autenticação e Autorização

### Fluxo de Login
1. **POST /auth/login**: Email + password → JWT tokens
2. **Access Token**: 8 horas de validade
3. **Refresh Token**: 30 dias, pode ser renovado
4. **Bearer Token**: Header `Authorization: Bearer <token>`

### Roles do Sistema
- **SaaS Owner**: Administrador do sistema
- **Company Owner**: Dono da empresa
- **Manager**: Gerente da empresa
- **Professional**: Profissional que atende
- **Staff**: Equipe de apoio
- **Client**: Cliente final (via portal)

### Middleware de Autenticação
```python
# Verificação automática de token
get_current_user = dependency(get_user_from_token)

# Verificação de permissão
require_permission = dependency(check_permission)

# Verificação de tenant
get_current_company = dependency(get_user_company)
```

## Validação de Limites

### Limit Validator Service
Verifica limites baseados no plano/add-ons antes de operações:
- **Profissionais**: Número máximo por plano
- **Clientes**: Limite por plano
- **Unidades**: Multi-unit via add-on
- **Features**: Acesso baseado em plano + add-ons

### HTTP 402 - Payment Required
Quando um limite é excedido:
```python
if not plan_service.check_feature_access(db, company, feature):
    raise HTTPException(
        status_code=402,
        detail={
            "error": "limit_exceeded",
            "feature": feature,
            "required_plan": get_required_plan(feature),
            "message": "Esta funcionalidade requer um plano superior"
        }
    )
```

## Processamento Assíncrono

### Celery Tasks
- **Notificações**: E-mail, WhatsApp, SMS
- **Renovação**: Assinaturas mensais
- **Relatórios**: Geração assíncrona
- **Backup**: Exportação de dados

### Configuração
```python
# celery_app.py
CELERY_BROKER_URL = "amqp://admin:password@rabbitmq:5672/"
CELERY_RESULT_BACKEND = "redis://:password@redis:6379/0"

# Tasks
@celery_app.task
def send_notification_email(user_id: int, template: str, data: dict):
    """Envia e-mail de notificação"""
    pass

@celery_app.task
def process_subscription_renewal():
    """Processa renovações mensais"""
    pass
```

## API RESTful

### Padrão de Endpoints
```
GET    /api/v1/{resource}     # Listar
POST   /api/v1/{resource}     # Criar
GET    /api/v1/{resource}/{id} # Detalhes
PUT    /api/v1/{resource}/{id} # Atualizar
DELETE /api/v1/{resource}/{id} # Remover
```

### Endpoints Principais
- **Auth**: `/auth/login`, `/auth/refresh`, `/auth/register`
- **Users**: `/users`, `/users/me`
- **Companies**: `/companies`, `/companies/{id}/users`
- **Clients**: `/clients`, `/clients/{id}/history`
- **Services**: `/services`, `/services/categories`
- **Schedules**: `/schedules`, `/schedules/availability`
- **Plans**: `/plans`, `/plans/subscription/check-feature/{feature}`
- **Add-ons**: `/addons`, `/addons/activate`, `/addons/deactivate/{slug}`

## Documentação

### OpenAPI/Swagger
- **URL**: `/docs` (Swagger UI)
- **OpenAPI**: `/openapi.json`
- **ReDoc**: `/redoc`

### Autenticação na API
```python
# Bearer Token
Authorization: Bearer <access_token>

# Exemplo
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
     https://api.example.com/api/v1/users/me
```

## Configuração

### Variáveis de Ambiente (.env)
```bash
# Database
DATABASE_URL=postgresql+psycopg2://user:pass@localhost/db

# Redis
REDIS_URL=redis://:password@localhost:6379/0

# RabbitMQ
RABBITMQ_URL=amqp://user:pass@localhost:5672/

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=480
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
FRONTEND_URL=http://localhost:3000

# Features
DEBUG=True
ENVIRONMENT=development
```

## Deploy

### Docker
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
    depends_on:
      - db
      - redis
```

## Monitoramento e Logging

### Estrutura de Logs
```python
import logging

logger = logging.getLogger(__name__)

logger.info("User login successful", extra={
    "user_id": user.id,
    "company_id": company.id,
    "ip": request.client.host
})
```

### Health Checks
- **Database**: `GET /health`
- **Redis**: Ping
- **RabbitMQ**: Verificação de conexão

## Performance

### Otimizações
- **Connection Pooling**: SQLAlchemy pool
- **Redis Cache**: Cache de consultas frequentes
- **Background Tasks**: Processamento assíncrono
- **Rate Limiting**: Proteção contra abuse

### Índices do Banco
```sql
-- Performance
CREATE INDEX idx_company_id ON users(company_id);
CREATE INDEX idx_schedule_date ON schedules(date, company_id);
CREATE INDEX idx_client_email ON clients(email, company_id);
```

## Segurança

### Best Practices
- **JWT com expiração curta**: 8 horas access token
- **Password Hashing**: bcrypt com salt
- **HTTPS**: Obrigatório em produção
- **CORS**: Restrito a domínios conhecidos
- **Rate Limiting**: Por IP e endpoint
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM

### Headers de Segurança
```python
# main.py
app.add_middleware(
    SecurityHeadersMiddleware,
    headers={
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
    }
)
```

## Testes

### Estrutura de Testes
```python
# conftest.py
@pytest.fixture
def db_session():
    """Sessão de teste do banco"""
    pass

@pytest.fixture
def test_user():
    """Usuário de teste"""
    pass

# test_auth.py
def test_login_success(db_session, test_user):
    """Testa login com sucesso"""
    pass
```

### Comandos
```bash
# Rodar testes
pytest tests/

# Coverage
pytest --cov=app tests/

# Testes específicos
pytest tests/test_auth.py -v
```

## Troubleshooting

### Issues Comuns
1. **CORS**: Verificar `CORS_ORIGIN` no .env
2. **Database**: Migration pendente (`alembic upgrade head`)
3. **Redis**: Conexão falhando (verificar senha)
4. **Celery**: Worker não rodando (`celery -A app.tasks.celery_app worker`)

### Debug Mode
```python
# .env
DEBUG=True
LOG_LEVEL=DEBUG

# Ver logs
docker logs agendamento_backend
```

## Próximos Passos

### Roadmap
1. **Microserviços**: Separação por domínio
2. **Event Sourcing**: Audit trail completo
3. **GraphQL**: API mais flexível
4. **WebSockets**: Tempo real
5. **Machine Learning**: Previsão de agendamentos

### Escalabilidade
- **Horizontal Scaling**: Múltiplas instâncias
- **Database Sharding**: Por tenant
- **CDN**: Assets estáticos
- **Load Balancer**: Nginx + múltiplos backends
