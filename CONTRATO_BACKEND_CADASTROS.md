# Contrato Real do Backend - Módulo de Cadastros

**Data**: 2026-01-13  
**Ambiente**: Produção (VPS 72.62.138.239)  
**Base URL**: `https://72.62.138.239/api/v1`

## Status: CRUD Completo ✅

Todos os endpoints abaixo estão **funcionando em produção** e seguem o princípio **backend-driven**.

---

## 1. Clientes (`/clients`)

### Endpoints
- `GET /api/v1/clients` - Listar clientes (paginado, com busca)
- `GET /api/v1/clients/{id}` - Buscar cliente por ID
- `POST /api/v1/clients` - Criar cliente
- `PUT /api/v1/clients/{id}` - Atualizar cliente
- `DELETE /api/v1/clients/{id}` - Deletar cliente

### Schema (ClientCreate/ClientUpdate)
```typescript
{
  full_name: string;           // obrigatório (min 3, max 255)
  nickname?: string;            // opcional (max 100)
  email?: string;               // opcional (EmailStr)
  phone?: string;               // opcional
  cellphone?: string;           // opcional
  date_of_birth?: date;         // opcional
  cpf?: string;                 // opcional
  cnpj?: string;                // opcional
  address?: string;             // opcional
  address_number?: string;      // opcional
  address_complement?: string;  // opcional
  neighborhood?: string;        // opcional
  city?: string;                // opcional
  state?: string;               // opcional (2 letras - sigla)
  zip_code?: string;            // opcional
  marketing_whatsapp?: boolean; // opcional (default: false)
  marketing_email?: boolean;    // opcional (default: false)
  notes?: string;               // opcional
}
```

---

## 2. Serviços (`/services`)

### Endpoints
- `GET /api/v1/services` - Listar serviços
- `GET /api/v1/services/{id}` - Buscar serviço por ID
- `POST /api/v1/services` - Criar serviço
- `PUT /api/v1/services/{id}` - Atualizar serviço
- `DELETE /api/v1/services/{id}` - Deletar serviço (soft delete: is_active=false)

### Schema (ServiceCreate/ServiceUpdate)
```typescript
{
  name: string;                 // obrigatório (min 3, max 255)
  description?: string;         // opcional
  price: Decimal;               // obrigatório (min: 5.0)
  duration: number;             // obrigatório (5-480 minutos)
  category_id?: number;         // opcional (FK para ServiceCategory)
  currency?: string;            // opcional (default: "BRL")
  requires_professional?: boolean; // opcional (default: true)
  commission_rate?: number;     // opcional (0-100, default: 0)
}
```

---

## 3. Categorias de Serviço (`/services/categories`) ✅ CRUD COMPLETO

### Endpoints
- `GET /api/v1/services/categories` - Listar categorias
- `GET /api/v1/services/categories/{id}` - Buscar categoria por ID ✅ NOVO
- `POST /api/v1/services/categories` - Criar categoria
- `PUT /api/v1/services/categories/{id}` - Atualizar categoria
- `DELETE /api/v1/services/categories/{id}` - Deletar categoria ✅ NOVO

### Schema (ServiceCategoryCreate/ServiceCategoryUpdate)
```typescript
{
  name: string;          // obrigatório (min 2, max 100)
  description?: string;  // opcional
  icon?: string;         // opcional
  color?: string;        // opcional (default: "#3B82F6")
}
```

---

## 4. Produtos (`/products`)

### Endpoints
- `GET /api/v1/products` - Listar produtos
- `GET /api/v1/products/{id}` - Buscar produto por ID
- `POST /api/v1/products` - Criar produto
- `PUT /api/v1/products/{id}` - Atualizar produto
- `DELETE /api/v1/products/{id}` - Deletar produto

### Schema (ProductCreate/ProductUpdate)
```typescript
{
  name: string;                  // obrigatório (min 1, max 255)
  description?: string;          // opcional
  stock_current: number;         // obrigatório (>= 0) - alias: "stock"
  stock_minimum?: number;        // opcional (default: 0)
  unit?: string;                 // opcional (default: "UN")
  cost_price: Decimal;           // obrigatório (> 0) - alias: "cost"
  sale_price: Decimal;           // obrigatório (> 0) - alias: "price"
  commission_percentage?: number; // opcional (0-100, default: 0)
  barcode?: string;              // opcional
  brand_id?: number;             // opcional (FK para Brand)
  category_id?: number;          // opcional (FK para ProductCategory)
  images?: string[];             // opcional (lista de URLs)
  image_url?: string;            // opcional (URL principal)
}
```

---

## 5. Marcas (`/products/brands`)

### Endpoints
- `GET /api/v1/products/brands` - Listar marcas
- `GET /api/v1/products/brands/{id}` - Buscar marca por ID
- `POST /api/v1/products/brands` - Criar marca
- `PUT /api/v1/products/brands/{id}` - Atualizar marca
- `DELETE /api/v1/products/brands/{id}` - Deletar marca

### Schema (BrandCreate/BrandUpdate)
```typescript
{
  name: string;   // obrigatório (min 1, max 255)
  notes?: string; // opcional
}
```

---

## 6. Categorias de Produto (`/products/categories`)

### Endpoints
- `GET /api/v1/products/categories` - Listar categorias
- `GET /api/v1/products/categories/{id}` - Buscar categoria por ID
- `POST /api/v1/products/categories` - Criar categoria
- `PUT /api/v1/products/categories/{id}` - Atualizar categoria
- `DELETE /api/v1/products/categories/{id}` - Deletar categoria

### Schema (ProductCategoryCreate/ProductCategoryUpdate)
```typescript
{
  name: string;          // obrigatório (min 1, max 100)
  description?: string;  // opcional
  is_active?: boolean;   // opcional (default: true)
}
```

---

## 7. Profissionais (`/professionals`)

### Endpoints
- `GET /api/v1/professionals` - Listar profissionais
- `GET /api/v1/professionals/{id}` - Buscar profissional por ID
- `POST /api/v1/professionals` - Criar profissional
- `PUT /api/v1/professionals/{id}` - Atualizar profissional
- `DELETE /api/v1/professionals/{id}` - Deletar profissional (soft delete: is_active=false)

### Schema (ProfessionalCreate)
```typescript
{
  email: string;                      // obrigatório (EmailStr)
  password?: string;                  // opcional (auto-gerado se não fornecido)
  full_name: string;                  // obrigatório (min 3, max 255)
  phone?: string;                     // opcional
  avatar_url?: string;                // opcional
  bio?: string;                       // opcional
  date_of_birth?: string;             // opcional
  gender?: string;                    // opcional
  address?: string;                   // opcional
  city?: string;                      // opcional
  state?: string;                     // opcional
  postal_code?: string;               // opcional
  specialties?: string[];             // opcional
  working_hours?: object;             // opcional
  notification_preferences?: object;  // opcional
  commission_rate?: number;           // opcional (0-100)
  send_invite_email?: boolean;        // opcional (default: true)
}
```

---

## 8. Fornecedores (`/suppliers`) ✅ NOVO

### Endpoints
- `GET /api/v1/suppliers` - Listar fornecedores
- `GET /api/v1/suppliers/{id}` - Buscar fornecedor por ID
- `POST /api/v1/suppliers` - Criar fornecedor
- `PUT /api/v1/suppliers/{id}` - Atualizar fornecedor
- `DELETE /api/v1/suppliers/{id}` - Deletar fornecedor

### Schema (SupplierCreate/SupplierUpdate)
```typescript
{
  name: string;                 // obrigatório (min 1, max 255)
  email?: string;               // opcional (EmailStr)
  phone?: string;               // opcional
  cellphone?: string;           // opcional
  cpf?: string;                 // opcional
  cnpj?: string;                // opcional
  address?: string;             // opcional
  address_number?: string;      // opcional
  address_complement?: string;  // opcional
  neighborhood?: string;        // opcional
  city?: string;                // opcional
  state?: string;               // opcional (2 letras)
  zip_code?: string;            // opcional
  notes?: string;               // opcional
}
```

---

## Autenticação

Todos os endpoints (exceto `/public`) requerem:
- **Header**: `Authorization: Bearer {access_token}`
- **Permissões**: 
  - `GET` - Qualquer usuário autenticado
  - `POST/PUT/DELETE` - Manager ou Admin

---

## Próximos Passos

1. ✅ Backend ajustado (Service Categories + Suppliers)
2. ✅ Deploy em produção (VPS)
3. ⏳ Gerar tipos TypeScript do OpenAPI
4. ⏳ Implementar telas CRUD no frontend (sem mocks)
5. ⏳ Validar end-to-end em produção

---

## Notas Importantes

- **Nenhum campo foi inventado** - todos vêm dos schemas Pydantic existentes
- **Nenhum mock** - todos os endpoints estão funcionando em produção
- **Frontend deve consumir exclusivamente este contrato**
- **Se algo não está aqui, não existe no backend**
