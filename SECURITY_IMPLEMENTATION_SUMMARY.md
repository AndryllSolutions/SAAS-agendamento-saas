# 🔒 Resumo de Implementações de Segurança - Painel SaaS Admin

## ✅ Implementações Concluídas

### 1. **Modelo de Audit Log**
**Arquivo:** `backend/app/models/audit_log.py`

**Funcionalidades:**
- ✅ Rastreamento completo de ações administrativas
- ✅ Registro de quem, o quê, quando e de onde
- ✅ Campos para IP, User-Agent, Request ID
- ✅ Status da ação (success/failed/partial)
- ✅ Detalhes em JSON para flexibilidade
- ✅ Relacionamento com User (com SET NULL para preservar logs)

**Ações Críticas Rastreadas:**
- Deleção de empresas
- Atualização de empresas
- Ativação/Desativação de empresas
- **Impersonação de empresas** (CRÍTICO)
- Promoção de usuários a SaaS Admin
- Deleção de usuários
- Alteração de assinaturas
- Alteração de configurações globais

---

### 2. **Helpers de Audit**
**Arquivo:** `backend/app/core/audit.py`

**Funções Disponíveis:**
- `log_action()` - Função genérica para qualquer ação
- `log_impersonation()` - Específica para impersonação
- `log_company_deletion()` - Salva snapshot completo antes de deletar
- `log_user_promotion()` - Rastreia mudanças de permissão
- `log_subscription_change()` - Rastreia mudanças de plano
- `log_company_status_change()` - Rastreia ativação/desativação

**Uso:**
```python
from app.core.audit import log_impersonation

# Em qualquer endpoint
log_impersonation(
    db=db,
    context=context,
    request=request,
    company_id=company_id,
    company_name=company.name
)
```

---

### 3. **Documentação de Segurança**
**Arquivo:** `SECURITY_AUDIT_SAAS_ADMIN.md`

**Conteúdo:**
- ✅ 10 vulnerabilidades identificadas e classificadas (Crítica/Média/Baixa)
- ✅ Correções detalhadas com código de exemplo
- ✅ Proteções já implementadas
- ✅ Score de segurança atual: 5.25/10
- ✅ Plano de ação em 3 fases
- ✅ Checklist de correções prioritárias

---

## 🚧 Próximos Passos (Ordem de Prioridade)

### Fase 1 - CRÍTICO (Implementar Esta Semana)

#### 1. **Criar Migration para Audit Logs**
```bash
cd backend
alembic revision -m "add_audit_logs_table"
# Editar arquivo de migration gerado
alembic upgrade head
```

#### 2. **Adicionar Audit Logging nos Endpoints**

**Endpoints Prioritários:**
- ✅ `POST /saas-admin/impersonate/{company_id}` - CRÍTICO
- ✅ `DELETE /saas-admin/companies/{company_id}` - CRÍTICO
- ✅ `POST /saas-admin/users/{user_id}/promote-saas` - CRÍTICO
- ✅ `POST /saas-admin/companies/{company_id}/toggle-status` - IMPORTANTE
- ✅ `PUT /saas-admin/companies/{company_id}/subscription` - IMPORTANTE

**Exemplo de Implementação:**
```python
from fastapi import Request
from app.core.audit import log_impersonation

@router.post("/impersonate/{company_id}")
async def impersonate_company(
    company_id: int,
    request: Request,  # ADICIONAR
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # ADICIONAR: Registrar impersonação
    log_impersonation(
        db=db,
        context=context,
        request=request,
        company_id=company_id,
        company_name=company.name
    )
    
    # ... resto do código
```

#### 3. **Implementar Rate Limiting**
```bash
pip install slowapi
```

```python
# Em main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Em saas_admin.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/companies")
@limiter.limit("100/minute")  # Máximo 100 req/min
async def list_all_companies(...):
    ...
```

---

### Fase 2 - IMPORTANTE (Próximas 2 Semanas)

#### 4. **Schema Pydantic para update_company**
```python
# Em schemas/company.py
class CompanyUpdateAdmin(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    logo_url: Optional[HttpUrl] = None
    
    @validator('name')
    def validate_name(cls, v):
        if v and len(v) < 3:
            raise ValueError('Nome deve ter pelo menos 3 caracteres')
        return v

# Usar no endpoint
@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    company_data: CompanyUpdateAdmin,  # ✅ Validado
    ...
):
```

#### 5. **Reduzir Limite de Paginação**
```python
# ANTES
limit: int = Query(100, ge=1, le=1000)  # ❌ Muito alto

# DEPOIS
limit: int = Query(100, ge=1, le=100)  # ✅ Seguro
```

#### 6. **Usar Enum para Roles**
```python
from enum import Enum

class SaaSRoleEnum(str, Enum):
    SAAS_OWNER = "SAAS_OWNER"
    SAAS_STAFF = "SAAS_STAFF"

@router.post("/users/{user_id}/promote-saas")
async def promote_user_to_saas(
    user_id: int,
    saas_role: SaaSRoleEnum = Query(...),  # ✅ Validado
    ...
):
```

---

### Fase 3 - MELHORIAS (Próximo Mês)

#### 7. **Dashboard de Audit Logs**
Criar página `/saas-admin/audit-logs` para visualizar:
- Últimas ações administrativas
- Filtros por usuário, ação, data
- Alertas de ações suspeitas
- Exportar relatórios

#### 8. **Alertas de Segurança**
```python
# Alertar quando:
- Múltiplas impersonações em curto período
- Deleção de múltiplas empresas
- Promoção de usuários a SAAS_OWNER
- Tentativas de acesso negado repetidas
```

#### 9. **IP Whitelist (Opcional)**
```python
ALLOWED_IPS = ["192.168.1.100", "10.0.0.50"]

@router.get("/companies")
async def list_all_companies(
    request: Request,
    ...
):
    if request.client.host not in ALLOWED_IPS:
        raise HTTPException(status_code=403, detail="IP não autorizado")
```

---

## 📊 Status de Segurança

### Antes das Implementações
| Categoria | Score |
|-----------|-------|
| Audit Logs | 0/10 🔴 |
| Rate Limiting | 0/10 🔴 |
| Input Validation | 6/10 🟡 |
| **TOTAL** | **5.25/10** 🟡 |

### Após Fase 1 (Estimado)
| Categoria | Score |
|-----------|-------|
| Audit Logs | 9/10 ✅ |
| Rate Limiting | 8/10 ✅ |
| Input Validation | 6/10 🟡 |
| **TOTAL** | **7.5/10** ✅ |

### Após Fase 2 (Estimado)
| Categoria | Score |
|-----------|-------|
| Audit Logs | 9/10 ✅ |
| Rate Limiting | 8/10 ✅ |
| Input Validation | 9/10 ✅ |
| **TOTAL** | **8.5/10** ✅ |

---

## 🎯 Comandos Rápidos

### Criar Migration
```bash
cd /opt/saas/atendo/backend
docker exec -it agendamento_backend_prod alembic revision -m "add_audit_logs_table"
```

### Aplicar Migration
```bash
docker exec -it agendamento_backend_prod alembic upgrade head
```

### Ver Audit Logs
```sql
SELECT 
    al.created_at,
    al.user_email,
    al.action,
    al.resource_type,
    al.resource_name,
    al.ip_address
FROM audit_logs al
ORDER BY al.created_at DESC
LIMIT 50;
```

### Verificar Impersonações
```sql
SELECT 
    al.created_at,
    al.user_email,
    al.resource_name as company_name,
    al.ip_address
FROM audit_logs al
WHERE al.action = 'impersonate_company'
ORDER BY al.created_at DESC;
```

---

## ⚠️ Avisos Importantes

### 1. **Não Deletar Audit Logs**
- Audit logs devem ser mantidos por **no mínimo 5 anos** (LGPD)
- Nunca deletar, apenas arquivar em tabela separada se necessário

### 2. **Backup Antes de Mudanças Críticas**
```bash
# Backup antes de implementar
pg_dump -h localhost -U postgres atendo > backup_pre_audit_$(date +%Y%m%d).sql
```

### 3. **Testar em Ambiente de Dev Primeiro**
- Não aplicar direto em produção
- Testar migration localmente
- Verificar performance de queries com audit logs

### 4. **Monitorar Performance**
- Audit logs podem crescer rapidamente
- Criar índices apropriados (já incluídos no modelo)
- Considerar particionamento por data após 1 milhão de registros

---

## 📝 Checklist de Implementação

### Fase 1 - Crítico
- [ ] Criar migration para audit_logs
- [ ] Aplicar migration em produção
- [ ] Adicionar logging em impersonate_company
- [ ] Adicionar logging em delete_company
- [ ] Adicionar logging em promote_user_saas
- [ ] Adicionar logging em toggle_company_status
- [ ] Adicionar logging em update_subscription
- [ ] Instalar e configurar slowapi
- [ ] Adicionar rate limiting em endpoints críticos
- [ ] Testar audit logs funcionando
- [ ] Verificar performance

### Fase 2 - Importante
- [ ] Criar schema CompanyUpdateAdmin
- [ ] Atualizar endpoint update_company
- [ ] Reduzir limites de paginação
- [ ] Criar enum SaaSRoleEnum
- [ ] Atualizar endpoint promote_user
- [ ] Adicionar testes de validação

### Fase 3 - Melhorias
- [ ] Criar página de audit logs no frontend
- [ ] Implementar alertas de segurança
- [ ] Configurar IP whitelist (opcional)
- [ ] Implementar 2FA para Super Admin
- [ ] Criar dashboard de segurança

---

## 🚨 Em Caso de Incidente

1. **Verificar audit logs imediatamente:**
```sql
SELECT * FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

2. **Desativar painel admin temporariamente:**
```bash
# Bloquear acesso ao painel
docker exec -it agendamento_backend_prod python -c "
from app.models.user import User
from app.core.database import SessionLocal
db = SessionLocal()
# Desativar todos SaaS admins exceto owner principal
"
```

3. **Backup emergencial:**
```bash
pg_dump -h localhost -U postgres atendo > backup_incident_$(date +%Y%m%d_%H%M%S).sql
```

4. **Notificar equipe e investigar**

---

**Última Atualização:** 24/01/2026  
**Responsável:** Sistema de Segurança  
**Próxima Revisão:** Após implementação da Fase 1
