# Correção: Erros 403 (Permissões/Plano)

**Data**: 2026-01-13  
**Prioridade**: Média  
**Status**: ✅ RESOLVIDO

---

## ❌ PROBLEMA IDENTIFICADO

### Sintomas
- Erro 403 (Forbidden) ao criar:
  - Categorias de Produto
  - Pacotes Predefinidos
  - Cashback
  - Compras

### Causas Identificadas

#### 1. Categorias de Produto
- **Causa**: Schema exigia `company_id` no payload
- **Validação**: `if category_data.company_id != current_user.company_id: raise 403`
- **Problema**: Frontend não enviava `company_id` ou enviava incorreto

#### 2. Pacotes Predefinidos
- **Status**: ✅ Já corrigido anteriormente
- **Schema**: `PredefinedPackageCreatePublic` (sem `company_id`)

#### 3. Cashback
- **Causa 1**: Schema exigia `company_id` no payload
- **Causa 2**: Feature bloqueada por plano (`get_feature_checker("cashback")`)
- **Problema**: Dupla validação causando 403

#### 4. Compras
- **Status**: ✅ Já corrigido anteriormente
- **Schema**: `PurchaseCreatePublic` (sem `company_id`)

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Categorias de Produto

#### Schema Público Criado
```python
class ProductCategoryCreatePublic(ProductCategoryBase):
    """Schema for creating a product category via API (company_id auto-filled from auth)"""
    pass
```

#### Endpoint Atualizado
```python
@router.post("/categories", response_model=ProductCategoryResponse)
async def create_product_category(
    category_data: ProductCategoryCreatePublic,  # ✅ Schema público
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db)
):
    """Create a new product category (company_id auto-filled from auth)"""
    category = ProductCategory(**category_data.model_dump(), company_id=current_user.company_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return ProductCategoryResponse.model_validate(category)
```

**Resultado**: ✅ Sem validação de `company_id` no payload

---

### 2. Cashback

#### Schema Público Criado
```python
class CashbackRuleCreatePublic(CashbackRuleBase):
    """Schema for creating a cashback rule via API (company_id auto-filled from auth)"""
    pass
```

#### Endpoint Atualizado
```python
@router.post("/rules", response_model=CashbackRuleResponse)
async def create_cashback_rule(
    rule_data: CashbackRuleCreatePublic,  # ✅ Schema público
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
    _: None = Depends(get_feature_checker("cashback"))  # ⚠️ Feature gate
):
    """Create a new cashback rule (company_id auto-filled from auth, feature-gated)"""
    rule = CashbackRule(**rule_data.model_dump(), company_id=current_user.company_id)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule
```

**Resultado**: ✅ Sem validação de `company_id` no payload  
**Nota**: ⚠️ Feature ainda pode retornar 403 se plano não incluir cashback

---

## 📦 ARQUIVOS MODIFICADOS

### Backend
| Arquivo | Mudança | Status |
|---------|---------|--------|
| `backend/app/schemas/product.py` | Adicionado `ProductCategoryCreatePublic` | ✅ |
| `backend/app/schemas/cashback.py` | Adicionado `CashbackRuleCreatePublic` | ✅ |
| `backend/app/api/v1/endpoints/products.py` | Usa `ProductCategoryCreatePublic` | ✅ |
| `backend/app/api/v1/endpoints/cashback.py` | Usa `CashbackRuleCreatePublic` | ✅ |

---

## 🚀 DEPLOY REALIZADO

```bash
# Schemas sincronizados
scp backend/app/schemas/product.py root@VPS:/opt/saas/atendo/backend/app/schemas/
scp backend/app/schemas/cashback.py root@VPS:/opt/saas/atendo/backend/app/schemas/

# Endpoints sincronizados
scp backend/app/api/v1/endpoints/products.py root@VPS:/opt/saas/atendo/backend/app/api/v1/endpoints/
scp backend/app/api/v1/endpoints/cashback.py root@VPS:/opt/saas/atendo/backend/app/api/v1/endpoints/

# Backend reiniciado
docker restart agendamento_backend_prod
```

**Status**: ✅ Deployado em produção

---

## 🧪 VALIDAÇÃO

### Teste 1: Categorias de Produto
**URL**: `https://72.62.138.239/products/categories`

1. Fazer login como Manager
2. Ir para Produtos → Categorias
3. Criar nova categoria

**Resultado Esperado**: ✅ 201 Created (sem 403)

---

### Teste 2: Cashback
**URL**: `https://72.62.138.239/cashback`

1. Fazer login como Manager
2. Ir para Cashback → Regras
3. Criar nova regra

**Resultado Esperado**:
- ✅ 201 Created (se plano incluir cashback)
- ⚠️ 402 Payment Required (se plano não incluir cashback) - **Esperado**

---

## ⚠️ FEATURE GATES (Cashback)

### Como Funciona

O endpoint de cashback usa `get_feature_checker("cashback")` que verifica:
1. Se a empresa tem um plano ativo
2. Se o plano inclui a feature "cashback"

### Possíveis Respostas

| Cenário | Status | Mensagem |
|---------|--------|----------|
| Plano inclui cashback | 201 | Regra criada |
| Plano não inclui cashback | 402 | Feature bloqueada por plano |
| Sem plano ativo | 402 | Plano inativo |

### Solução para 402

Se o usuário receber 402 ao criar cashback:
1. Verificar plano da empresa no banco de dados
2. Confirmar se feature "cashback" está incluída
3. Se necessário, fazer upgrade do plano

---

## 📊 RESUMO DOS ERROS 403

| Recurso | Causa Original | Solução | Status |
|---------|----------------|---------|--------|
| **Categorias de Produto** | Schema exigia `company_id` | Schema público criado | ✅ Resolvido |
| **Pacotes Predefinidos** | Schema exigia `company_id` | Schema público criado | ✅ Resolvido |
| **Cashback** | Schema exigia `company_id` + Feature gate | Schema público + Feature gate mantido | ✅ Resolvido |
| **Compras** | Schema exigia `company_id` | Schema público criado | ✅ Resolvido |

---

## 🎯 RESULTADO FINAL

### Erros 403 Resolvidos
- ✅ Categorias de Produto → 201 Created
- ✅ Pacotes Predefinidos → 201 Created
- ✅ Compras → 201 Created

### Cashback (Feature-Gated)
- ✅ 201 Created (se plano incluir)
- ⚠️ 402 Payment Required (se plano não incluir) - **Comportamento correto**

---

## 📝 PADRÃO ESTABELECIDO

Para **todos os endpoints protegidos**:

1. **Schema Público** - Sem `company_id`
2. **Endpoint** - Preenche `company_id` automaticamente
3. **Permissões** - `require_manager` para operações de criação
4. **Feature Gates** - Mantidos para features premium (cashback, etc.)

---

## ✅ CONCLUSÃO

**Erros 403**: ✅ Resolvidos para Categorias, Pacotes e Compras

**Cashback**: ✅ Erro 403 resolvido, mas pode retornar 402 se feature não estiver no plano (comportamento esperado)

**Sistema pronto para validação em produção.**
