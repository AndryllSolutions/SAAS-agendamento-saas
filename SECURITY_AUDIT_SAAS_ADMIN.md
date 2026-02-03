# 🔒 Auditoria de Segurança - Painel SaaS Admin

## ⚠️ Vulnerabilidades Identificadas e Correções

### 🔴 CRÍTICAS (Prioridade Alta)

#### 1. **SQL Injection via Search Parameter**
**Localização:** `saas_admin.py:64-68`

**Vulnerabilidade:**
```python
# VULNERÁVEL - Usando ilike com string interpolation
query = query.filter(
    (Company.name.ilike(f"%{search}%")) |
    (Company.email.ilike(f"%{search}%")) |
    (Company.slug.ilike(f"%{search}%"))
)
```

**Status:** ✅ **SEGURO** - SQLAlchemy ORM escapa automaticamente os parâmetros
- O uso de `ilike()` com f-strings é seguro porque SQLAlchemy usa prepared statements
- Não há risco de SQL injection

---

#### 2. **Falta de Rate Limiting**
**Localização:** Todos os endpoints

**Vulnerabilidade:**
- Sem proteção contra brute force
- Sem limite de requisições por IP/usuário
- Possível DDoS

**Correção Necessária:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/companies")
@limiter.limit("100/minute")  # Máximo 100 requisições por minuto
async def list_all_companies(...):
    ...
```

**Status:** 🔴 **VULNERÁVEL** - Implementar rate limiting

---

#### 3. **Falta de Audit Logs**
**Localização:** Ações críticas (delete, update, promote)

**Vulnerabilidade:**
- Sem rastreamento de ações administrativas
- Impossível auditar quem fez o quê
- Sem compliance com LGPD

**Correção Necessária:**
```python
# Criar modelo AuditLog
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)  # "delete_company", "promote_user"
    resource_type = Column(String)  # "company", "user"
    resource_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Usar em ações críticas
async def delete_company(...):
    # ... deletar empresa ...
    
    # Registrar no audit log
    audit = AuditLog(
        user_id=context.user_id,
        action="delete_company",
        resource_type="company",
        resource_id=company_id,
        details={"company_name": company.name},
        ip_address=request.client.host
    )
    db.add(audit)
    db.commit()
```

**Status:** 🔴 **VULNERÁVEL** - Implementar audit logs

---

#### 4. **Impersonação sem Registro**
**Localização:** `saas_admin.py:229` - `impersonate_company()`

**Vulnerabilidade:**
- Impersonação não é registrada
- Sem rastreamento de quem acessou qual empresa
- Possível abuso de privilégios

**Correção Necessária:**
```python
@router.post("/impersonate/{company_id}")
async def impersonate_company(
    company_id: int,
    request: Request,  # Adicionar Request para pegar IP
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    # ... código existente ...
    
    # ADICIONAR: Registrar impersonação
    audit = AuditLog(
        user_id=context.user_id,
        action="impersonate_company",
        resource_type="company",
        resource_id=company_id,
        details={
            "company_name": company.name,
            "admin_email": context.email
        },
        ip_address=request.client.host
    )
    db.add(audit)
    db.commit()
    
    return {...}
```

**Status:** 🔴 **VULNERÁVEL** - Adicionar logging de impersonação

---

### 🟡 MÉDIAS (Prioridade Média)

#### 5. **Falta de Validação de Input em update_company**
**Localização:** `saas_admin.py:413` - `update_company()`

**Vulnerabilidade:**
```python
@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    company_data: dict,  # ❌ Aceita qualquer dict
    ...
):
```

**Correção:**
```python
from pydantic import BaseModel, EmailStr, validator

class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    # ... outros campos permitidos
    
    @validator('name')
    def validate_name(cls, v):
        if v and len(v) < 3:
            raise ValueError('Nome deve ter pelo menos 3 caracteres')
        return v

@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    company_data: CompanyUpdateRequest,  # ✅ Schema validado
    ...
):
```

**Status:** 🟡 **VULNERÁVEL** - Adicionar schema Pydantic

---

#### 6. **Exposição de Informações Sensíveis**
**Localização:** `saas_admin.py:349` - `list_all_users()`

**Vulnerabilidade:**
- Retorna `password_hash` no UserResponse (se não filtrado)
- Possível exposição de dados sensíveis

**Verificação Necessária:**
```python
# Verificar se UserResponse exclui campos sensíveis
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    # password_hash: NÃO DEVE ESTAR AQUI
    
    class Config:
        from_attributes = True
```

**Status:** ✅ **SEGURO** (se UserResponse não inclui password_hash)

---

#### 7. **Falta de Proteção CSRF**
**Localização:** Todos os endpoints POST/PUT/DELETE

**Vulnerabilidade:**
- Sem tokens CSRF
- Possível Cross-Site Request Forgery

**Correção:**
```python
from fastapi_csrf_protect import CsrfProtect

@router.post("/companies/{company_id}/toggle-status")
async def toggle_company_status(
    company_id: int,
    csrf_protect: CsrfProtect = Depends(),
    ...
):
    await csrf_protect.validate_csrf(request)
    # ... resto do código
```

**Status:** 🟡 **VULNERÁVEL** - Implementar CSRF protection

---

#### 8. **Sem Timeout em Operações de Banco**
**Localização:** Todas as queries

**Vulnerabilidade:**
- Queries podem travar indefinidamente
- Possível DoS via queries lentas

**Correção:**
```python
# No database.py
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "connect_timeout": 10,  # Timeout de conexão
        "command_timeout": 30   # Timeout de query
    }
)
```

**Status:** 🟡 **VULNERÁVEL** - Adicionar timeouts

---

### 🟢 BAIXAS (Prioridade Baixa)

#### 9. **Falta de Paginação Obrigatória**
**Localização:** `list_all_companies()`, `list_all_users()`

**Vulnerabilidade:**
- Limite máximo de 1000 registros
- Possível sobrecarga de memória

**Correção:**
```python
@router.get("/companies")
async def list_all_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),  # ✅ Máximo 100 (não 1000)
    ...
):
```

**Status:** 🟢 **BAIXO RISCO** - Reduzir limite máximo

---

#### 10. **Falta de Validação de Roles em promote_user**
**Localização:** `saas_admin.py:376` - `promote_user_to_saas()`

**Vulnerabilidade:**
```python
saas_role: str = Query(..., description="SAAS_OWNER or SAAS_STAFF")
# ❌ Não valida se o valor é válido
```

**Correção:**
```python
from enum import Enum

class SaaSRoleEnum(str, Enum):
    SAAS_OWNER = "SAAS_OWNER"
    SAAS_STAFF = "SAAS_STAFF"

@router.post("/users/{user_id}/promote-saas")
async def promote_user_to_saas(
    user_id: int,
    saas_role: SaaSRoleEnum = Query(...),  # ✅ Enum validado
    ...
):
```

**Status:** 🟢 **BAIXO RISCO** - Usar Enum

---

## 🛡️ Proteções Já Implementadas (✅ Seguro)

### 1. **Autenticação JWT**
- ✅ Tokens JWT com expiração
- ✅ Verificação de assinatura
- ✅ Refresh tokens

### 2. **Autorização RBAC**
- ✅ `require_saas_admin` em todos os endpoints
- ✅ `require_saas_owner` em operações críticas (delete)
- ✅ Verificação de `saas_role` no token

### 3. **Validação de Tipos**
- ✅ Pydantic schemas em responses
- ✅ Type hints em parâmetros
- ✅ Query parameters com validação (ge, le)

### 4. **Proteção SQL Injection**
- ✅ SQLAlchemy ORM com prepared statements
- ✅ Sem queries raw SQL

### 5. **HTTPS**
- ✅ Nginx com SSL/TLS
- ✅ Certificado válido

### 6. **CORS Configurado**
- ✅ Apenas origens permitidas
- ✅ Credentials habilitados

---

## 📋 Checklist de Correções Prioritárias

### 🔴 Críticas (Implementar Imediatamente)
- [ ] Implementar Rate Limiting (slowapi ou fastapi-limiter)
- [ ] Criar modelo AuditLog e registrar ações críticas
- [ ] Adicionar logging de impersonação
- [ ] Implementar monitoramento de ações suspeitas

### 🟡 Médias (Implementar em 1-2 semanas)
- [ ] Adicionar schema Pydantic para update_company
- [ ] Implementar CSRF protection
- [ ] Adicionar timeouts em queries
- [ ] Verificar UserResponse não expõe password_hash

### 🟢 Baixas (Implementar quando possível)
- [ ] Reduzir limite máximo de paginação para 100
- [ ] Usar Enum para validação de roles
- [ ] Adicionar testes de segurança automatizados
- [ ] Implementar 2FA para Super Admin

---

## 🚨 Recomendações Adicionais

### 1. **Monitoramento e Alertas**
```python
# Alertar quando:
- Múltiplas tentativas de acesso negado
- Impersonação frequente
- Deleção de múltiplas empresas
- Promoção de usuários a SAAS_OWNER
```

### 2. **Backup e Recuperação**
- Backup automático antes de operações destrutivas
- Soft delete ao invés de hard delete
- Possibilidade de rollback

### 3. **Compliance LGPD**
- Registrar consentimento de dados
- Permitir exportação de dados
- Permitir exclusão de dados (direito ao esquecimento)
- Audit logs por 5 anos

### 4. **Segurança de Rede**
- IP Whitelist para painel admin
- VPN obrigatória para acesso admin
- Geolocalização de acessos suspeitos

### 5. **Testes de Segurança**
```bash
# Executar regularmente:
- OWASP ZAP scan
- SQL injection tests
- XSS tests
- CSRF tests
- Rate limiting tests
```

---

## 📊 Score de Segurança Atual

| Categoria | Score | Status |
|-----------|-------|--------|
| Autenticação | 9/10 | ✅ Excelente |
| Autorização | 9/10 | ✅ Excelente |
| Validação de Input | 6/10 | 🟡 Médio |
| Rate Limiting | 0/10 | 🔴 Crítico |
| Audit Logs | 0/10 | 🔴 Crítico |
| CSRF Protection | 0/10 | 🔴 Crítico |
| SQL Injection | 10/10 | ✅ Excelente |
| XSS Protection | 8/10 | ✅ Bom |

**Score Geral: 5.25/10** 🟡

---

## 🎯 Plano de Ação

### Fase 1 - Emergencial (Esta Semana)
1. Implementar Rate Limiting
2. Criar modelo AuditLog
3. Adicionar logging em ações críticas

### Fase 2 - Importante (Próximas 2 Semanas)
4. Implementar CSRF protection
5. Adicionar schemas Pydantic completos
6. Configurar timeouts

### Fase 3 - Melhorias (Próximo Mês)
7. Implementar 2FA
8. Adicionar IP whitelist
9. Criar dashboard de segurança
10. Testes automatizados de segurança

---

## 📞 Contato em Caso de Incidente

1. **Desativar painel admin:** `docker stop agendamento_backend_prod`
2. **Verificar logs:** `docker logs agendamento_backend_prod | grep ERROR`
3. **Backup emergencial:** `pg_dump > backup_emergency.sql`
4. **Notificar equipe de segurança**

---

**Última Atualização:** 24/01/2026  
**Próxima Revisão:** 31/01/2026
