# Correção: Erros 422 (Validação de Schema)

**Data**: 2026-01-13  
**Prioridade**: Média  
**Status**: 🟡 EM ANDAMENTO

---

## ❌ PROBLEMA IDENTIFICADO

### Sintomas
- Erro 422 (Unprocessable Content) ao criar:
  - Clientes
  - Comandas
  - Pacotes
  - Metas
  - Compras

### Causa Raiz
Frontend estava enviando `company_id` no payload, mas:
1. Backend espera que `company_id` seja preenchido automaticamente via `current_user.company_id`
2. Schemas exigiam `company_id` no payload, causando conflito
3. Validação Pydantic rejeitava payloads sem `company_id`

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Schemas Públicos Criados (Backend)

Criados schemas públicos **sem `company_id`** para uso via API:

#### Command
```python
class CommandCreatePublic(CommandBase):
    """Schema for creating a command via API (company_id auto-filled from auth)"""
    items: List[CommandItemCreate] = []
```

#### Package
```python
class PredefinedPackageCreatePublic(PredefinedPackageBase):
    """Schema for creating a predefined package via API (company_id auto-filled from auth)"""
    pass

class PackageCreatePublic(PackageBase):
    """Schema for creating a package via API (company_id auto-filled from auth)"""
    paid_value: Decimal = Field(..., gt=0)
```

#### Goal
```python
class GoalCreatePublic(GoalBase):
    """Schema for creating a goal via API (company_id auto-filled from auth)"""
    professional_id: Optional[int] = None
```

#### Purchase
```python
class PurchaseCreatePublic(PurchaseBase):
    """Schema for creating a purchase via API (company_id auto-filled from auth)"""
    items: List[PurchaseItemCreate] = Field(..., min_items=1)
```

---

### 2. Endpoints Atualizados (Backend)

Todos os endpoints de criação agora usam schemas públicos:

#### Commands
```python
@router.post("", response_model=CommandResponse)
async def create_command(
    command_data: CommandCreatePublic,  # ✅ Schema público
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new command (company_id auto-filled from auth)"""
    # company_id preenchido automaticamente do current_user
```

#### Packages
```python
@router.post("/predefined", response_model=PredefinedPackageResponse)
async def create_predefined_package(
    package_data: PredefinedPackageCreatePublic,  # ✅ Schema público
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new predefined package (company_id auto-filled from auth)"""
    package = PredefinedPackage(**package_data.model_dump(), company_id=current_user.company_id)
```

#### Goals
```python
@router.post("", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreatePublic,  # ✅ Schema público
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new goal (company_id auto-filled from auth)"""
    goal = Goal(**goal_data.model_dump(), company_id=current_user.company_id)
```

#### Purchases
```python
@router.post("", response_model=PurchaseResponse)
async def create_purchase(
    purchase_data: PurchaseCreatePublic,  # ✅ Schema público
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new purchase (company_id auto-filled from auth)"""
    purchase = Purchase(company_id=current_user.company_id, ...)
```

---

### 3. Frontend Atualizado

#### Clientes
```typescript
// ❌ ANTES
await clientService.create({ ...formData, company_id: companyId })

// ✅ DEPOIS
await clientService.create(formData)  // Backend preenche company_id
```

---

## 📦 ARQUIVOS MODIFICADOS

### Backend
| Arquivo | Mudança | Status |
|---------|---------|--------|
| `backend/app/schemas/command.py` | Adicionado `CommandCreatePublic` | ✅ |
| `backend/app/schemas/package.py` | Adicionado `PredefinedPackageCreatePublic`, `PackageCreatePublic` | ✅ |
| `backend/app/schemas/goal.py` | Adicionado `GoalCreatePublic` | ✅ |
| `backend/app/schemas/purchase.py` | Adicionado `PurchaseCreatePublic` | ✅ |
| `backend/app/api/v1/endpoints/commands.py` | Usa `CommandCreatePublic` | ✅ |
| `backend/app/api/v1/endpoints/packages.py` | Usa schemas públicos | ✅ |
| `backend/app/api/v1/endpoints/goals.py` | Usa `GoalCreatePublic` | ✅ |
| `backend/app/api/v1/endpoints/purchases.py` | Usa `PurchaseCreatePublic` | ✅ |

### Frontend
| Arquivo | Mudança | Status |
|---------|---------|--------|
| `frontend/src/app/clients/page.tsx` | Removido `company_id` do payload | ✅ |
| `frontend/src/components/CommandForm.tsx` | Remover `company_id` | ⏳ Pendente |
| `frontend/src/components/PackageForm.tsx` | Remover `company_id` | ⏳ Pendente |
| `frontend/src/components/GoalForm.tsx` | Remover `company_id` | ⏳ Pendente |
| `frontend/src/components/PurchaseForm.tsx` | Remover `company_id` | ⏳ Pendente |

---

## 🚀 PRÓXIMOS PASSOS

### 1. Deploy Backend ⏳
```bash
# Sincronizar schemas e endpoints
scp backend/app/schemas/* root@72.62.138.239:/opt/saas/atendo/backend/app/schemas/
scp backend/app/api/v1/endpoints/* root@72.62.138.239:/opt/saas/atendo/backend/app/api/v1/endpoints/

# Restart backend
docker restart agendamento_backend_prod
```

### 2. Atualizar Formulários Frontend ⏳
- CommandForm.tsx
- PackageForm.tsx (predefined e regular)
- GoalForm.tsx
- PurchaseForm.tsx

### 3. Deploy Frontend ⏳
```bash
# Build sem cache
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 4. Validação ⏳
Testar criação de:
- ✅ Clientes
- ⏳ Comandas
- ⏳ Pacotes
- ⏳ Metas
- ⏳ Compras

---

## 📝 PADRÃO ESTABELECIDO

Para **todos os endpoints de criação**:

1. **Schema Interno** (`*Create`) - Com `company_id` obrigatório
   - Usado internamente no código
   - Mantém validação completa

2. **Schema Público** (`*CreatePublic`) - Sem `company_id`
   - Usado nos endpoints da API
   - `company_id` preenchido automaticamente do `current_user`

3. **Endpoint** - Usa schema público
   ```python
   async def create_resource(
       data: ResourceCreatePublic,  # ✅ Schema público
       current_user: User = Depends(get_current_active_user),
       db: Session = Depends(get_db)
   ):
       resource = Resource(**data.model_dump(), company_id=current_user.company_id)
   ```

4. **Frontend** - Não envia `company_id`
   ```typescript
   await resourceService.create(formData)  // Sem company_id
   ```

---

## ✅ BENEFÍCIOS

1. **Segurança** - Frontend não pode manipular `company_id`
2. **Simplicidade** - Frontend não precisa gerenciar `company_id`
3. **Consistência** - Padrão uniforme em todos os endpoints
4. **Validação** - Pydantic valida corretamente os payloads

---

## 🎯 RESULTADO ESPERADO

Após deploy completo:
- ✅ Criar cliente → 201 Created
- ✅ Criar comanda → 201 Created
- ✅ Criar pacote → 201 Created
- ✅ Criar meta → 201 Created
- ✅ Criar compra → 201 Created

**Zero erros 422 em operações de criação.**
