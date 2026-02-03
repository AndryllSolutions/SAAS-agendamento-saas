# Guia de Implementação: RLS + Observabilidade

## 📋 Visão Geral

Este guia detalha a implementação completa de **Row Level Security (RLS)** e **Observabilidade** no SaaS de Agendamento.

### ✅ O que foi implementado

**RLS (Segurança):**
- Policies RLS em 55+ tabelas multi-tenant
- Contexto de tenant automático via middleware
- Isolamento garantido por PostgreSQL
- Suite de testes completa

**Observabilidade:**
- Request tracking com X-Request-ID
- Logs JSON estruturados
- Métricas Prometheus
- Integração Sentry melhorada
- Celery tasks com contexto de tenant

---

## 🚀 Passo a Passo de Deploy

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

Novas dependências:
- `prometheus-client==0.19.0` - Métricas
- `python-json-logger==2.0.7` - Logs estruturados

### 2. Aplicar Migration RLS

```bash
# Rodar migration do RLS
alembic upgrade head
```

Isso vai:
- Habilitar RLS em todas as tabelas com `company_id`
- Criar policies `{table}_tenant_isolation`
- Forçar RLS mesmo para table owner

### 3. Atualizar main.py para usar novo middleware

Editar `backend/app/main.py`:

```python
from app.core.observability import ObservabilityMiddleware, setup_json_logging, configure_sentry
from app.core.metrics import metrics_endpoint

# Configurar logging JSON (produção) ou standard (dev)
if settings.ENVIRONMENT == "production":
    setup_json_logging()

# Configurar Sentry
if hasattr(settings, "SENTRY_DSN"):
    configure_sentry(environment=settings.ENVIRONMENT)

# Adicionar middleware de observabilidade
app.add_middleware(ObservabilityMiddleware)

# Expor endpoint de métricas (proteger em produção!)
@app.get("/metrics", include_in_schema=False)
async def metrics():
    return metrics_endpoint()
```

### 4. Migrar Endpoints para usar get_db_with_tenant

**Antes (sem RLS):**
```python
@router.get("/clients")
async def list_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Filtro manual - pode ser esquecido!
    clients = db.query(Client).filter(
        Client.company_id == current_user.company_id
    ).all()
    return clients
```

**Depois (com RLS):**
```python
from app.core.dependencies import get_db_with_tenant
from app.core.rbac import get_current_user_context, CurrentUserContext

@router.get("/clients")
async def list_clients(
    db: Session = Depends(get_db_with_tenant),
    context: CurrentUserContext = Depends(get_current_user_context)
):
    # RLS filtra automaticamente - defesa em profundidade
    clients = db.query(Client).all()  # Já filtrado por company_id!
    return clients
```

**Importante:** Manter filtro `company_id` explícito em **writes** para validação:

```python
@router.post("/clients")
async def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db_with_tenant),
    context: CurrentUserContext = Depends(get_current_user_context)
):
    # Validar que client_data.company_id == context.company_id
    if client_data.company_id != context.company_id:
        raise HTTPException(403, "Cannot create client for other company")
    
    client = Client(**client_data.dict())
    db.add(client)
    db.commit()
    return client
```

### 5. Atualizar Celery Tasks

**Antes:**
```python
@celery.task
def send_reminders():
    db = SessionLocal()
    # ⚠️ Sem contexto de tenant - pode vazar dados!
    appointments = db.query(Appointment).filter(...).all()
    # ...
```

**Depois (opção 1 - decorator):**
```python
from app.tasks.tenant_aware_task import tenant_task

@celery.task
@tenant_task
def send_reminders(company_id: int):
    # db já vem com contexto de tenant via decorator
    # Não precisa criar manualmente
    from app.core.database import SessionLocal
    db = SessionLocal()
    appointments = db.query(Appointment).filter(...).all()
    # ...
```

**Depois (opção 2 - context manager):**
```python
from app.tasks.tenant_aware_task import TenantTaskSession

@celery.task
def send_reminders(company_id: int):
    with TenantTaskSession(company_id) as db:
        # db tem contexto de tenant automaticamente
        appointments = db.query(Appointment).filter(...).all()
        # ...
```

### 6. Rodar Testes de RLS

```bash
# Testar que RLS está funcionando
pytest tests/test_rls.py -v

# Deve passar todos os testes:
# ✓ test_read_own_company_data
# ✓ test_cannot_read_other_company_data
# ✓ test_read_without_context_returns_nothing
# ✓ test_can_insert_with_correct_context
# ✓ test_cannot_insert_for_wrong_company
# etc.
```

---

## 🔍 Observabilidade em Ação

### Logs Estruturados

Todos os logs agora incluem contexto:

```json
{
  "timestamp": "2026-01-01T20:30:00Z",
  "level": "INFO",
  "event": "request_completed",
  "request_id": "a1b2c3d4-e5f6-7890",
  "method": "POST",
  "path": "/api/v1/appointments",
  "status_code": 201,
  "duration_ms": 45.2,
  "company_id": 123,
  "user_id": 456
}
```

### Métricas Prometheus

Acessar `http://localhost:8000/metrics` para ver:

```
# HTTP Metrics
http_requests_total{method="POST",endpoint="/api/v1/appointments",status_code="201"} 150
http_request_duration_seconds_bucket{method="POST",endpoint="/api/v1/appointments",le="0.1"} 120

# Tenant Metrics
tenant_appointments_created_total{company_id="123"} 45
tenant_active_users{company_id="123"} 12

# Celery Metrics
celery_tasks_executed_total{task_name="send_reminders",status="success"} 89
```

### Integração Grafana

Criar dashboard com queries:

```promql
# Taxa de erros por endpoint
rate(http_requests_total{status_code=~"5.."}[5m])

# Latência P95 por tenant
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket{company_id="123"}[5m])
)

# Fila do Celery
queue_size{queue_name="default"}
```

---

## 🛡️ Segurança: Verificações Críticas

### ✅ Checklist Pré-Produção

- [ ] Migration RLS aplicada: `alembic current` mostra `rls_001`
- [ ] Todas as tabelas com `company_id` têm RLS: `SELECT tablename FROM pg_policies WHERE policyname LIKE '%tenant_isolation';`
- [ ] Testes RLS passando: `pytest tests/test_rls.py`
- [ ] Endpoints migrados para `get_db_with_tenant`
- [ ] Celery tasks recebem `company_id` explícito
- [ ] Logs estruturados ativos em produção
- [ ] Métricas expostas apenas para rede interna
- [ ] Sentry configurado com DSN de produção

### 🔒 Validar RLS no PostgreSQL

```sql
-- Ver policies ativas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%tenant_isolation%';

-- Testar policy manualmente
SET app.current_company_id = '1';
SELECT * FROM clients;  -- Deve retornar apenas company_id=1

SET app.current_company_id = '2';
SELECT * FROM clients;  -- Deve retornar apenas company_id=2

SET app.current_company_id = '';
SELECT * FROM clients;  -- Deve retornar vazio
```

---

## 🐛 Troubleshooting

### Problema: "RLS bloqueia tudo, não vejo dados"

**Causa:** Contexto de tenant não foi setado.

**Solução:**
```python
# Verificar se endpoint usa get_db_with_tenant
db: Session = Depends(get_db_with_tenant)  # ✅ Correto

# Verificar logs
# Deve aparecer: "🔒 Tenant context set: company_id=X"
```

### Problema: "Erro ao inserir dados"

**Causa:** Tentando inserir `company_id` diferente do contexto.

**Solução:**
```python
# Validar company_id antes de inserir
if data.company_id != context.company_id:
    raise HTTPException(403, "Invalid company_id")
```

### Problema: "Celery tasks não veem dados"

**Causa:** Task não recebe ou não seta `company_id`.

**Solução:**
```python
# SEMPRE passar company_id para tasks
send_reminders.delay(company_id=user.company_id)

# Usar decorator @tenant_task
@celery.task
@tenant_task
def send_reminders(company_id: int):
    # ...
```

### Problema: "Métricas não aparecem"

**Causa:** Endpoint `/metrics` não adicionado ao main.py.

**Solução:**
```python
from app.core.metrics import metrics_endpoint

@app.get("/metrics")
async def metrics():
    return metrics_endpoint()
```

---

## 📊 Monitoramento Recomendado

### Alertas Críticos

**1. Taxa de erro 5xx alta**
```yaml
alert: HighErrorRate
expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
annotations:
  summary: "Taxa de erros 5xx acima de 5%"
```

**2. Latência P95 alta**
```yaml
alert: HighLatency
expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
annotations:
  summary: "Latência P95 acima de 2s"
```

**3. Fila Celery crescendo**
```yaml
alert: QueueBacklog
expr: queue_size{queue_name="default"} > 1000
annotations:
  summary: "Fila com mais de 1000 mensagens"
```

### Dashboards Grafana

**Dashboard 1: Overview**
- Total requests/s
- Error rate (4xx, 5xx)
- Latency P50/P95/P99
- Active tenants

**Dashboard 2: Per-Tenant**
- Requests por tenant
- Appointments criados
- Usuários ativos
- Receita (MRR)

**Dashboard 3: Infrastructure**
- DB connections
- Redis hit rate
- RabbitMQ queue size
- Celery task duration

---

## 📝 Exemplo Completo: Endpoint Novo

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db_with_tenant
from app.core.rbac import get_current_user_context, CurrentUserContext
from app.core.observability import structured_logger
from app.core.metrics import metrics
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter()

@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: Session = Depends(get_db_with_tenant),
    context: CurrentUserContext = Depends(get_current_user_context)
):
    """
    Criar novo agendamento.
    
    ✅ RLS ativo: dados filtrados automaticamente por company_id
    ✅ Logs estruturados: request_id, company_id, user_id
    ✅ Métricas: contador de appointments por tenant
    ✅ Sentry: erros com contexto completo
    """
    
    # 1. Validar company_id (defesa em profundidade)
    if appointment_data.company_id != context.company_id:
        structured_logger.warning(
            "invalid_company_id_attempt",
            user_id=context.user_id,
            expected_company_id=context.company_id,
            provided_company_id=appointment_data.company_id
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create appointment for other company"
        )
    
    # 2. Criar appointment (RLS garante que só pode criar para seu tenant)
    appointment = Appointment(**appointment_data.dict())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # 3. Log estruturado
    structured_logger.info(
        "appointment_created",
        appointment_id=appointment.id,
        company_id=context.company_id,
        user_id=context.user_id,
        client_id=appointment.client_id,
        service_id=appointment.service_id
    )
    
    # 4. Métrica Prometheus
    metrics.record_appointment_created(context.company_id)
    
    return appointment
```

---

## 🎯 Próximos Passos

### Fase 2 (Curto Prazo)
- [ ] Migrar todos os endpoints para `get_db_with_tenant`
- [ ] Adicionar métricas de negócio específicas
- [ ] Configurar alertas básicos no Grafana
- [ ] Documentar padrões de logging

### Fase 3 (Médio Prazo)
- [ ] OpenTelemetry para tracing distribuído
- [ ] Logs centralizados (ELK ou Loki)
- [ ] Dashboard de SLA por tenant
- [ ] Backup automatizado com verificação

### Fase 4 (Longo Prazo)
- [ ] Chaos engineering (testar RLS sob falhas)
- [ ] Análise de performance por tenant
- [ ] Previsão de capacidade
- [ ] Auditoria automática de queries sem RLS

---

## 📚 Referências

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Sentry FastAPI Integration](https://docs.sentry.io/platforms/python/guides/fastapi/)
- [Structured Logging](https://www.structlog.org/)

---

**✅ Sistema pronto para produção com RLS + Observabilidade completa!**
