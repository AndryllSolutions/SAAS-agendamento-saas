# Sistema de Autenticação - Atendo SaaS

## 📋 Visão Geral

O sistema Atendo SaaS utiliza autenticação baseada em JWT (JSON Web Tokens) com OAuth2 para login. A autenticação é feita via API REST e suporta múltiplos formatos de requisição.

## 🔐 Endpoints de Autenticação

### 1. Login Principal (Recomendado)

```http
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=usuario@email.com&password=senha123
```

### 2. Login JSON (Alternativo)

```http
POST /api/v1/auth/login-json
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

## 👥 Usuários Existentes no Sistema

### Usuários Cadastrados

1. **Andre Kaidellisola** (Empresa: Clínica Saúde Teste)
   - Email: `andrekaidellisola@gmail.com`
   - Senha: `owner123`
   - Role: `ADMIN`
   - Status: ✅ Ativo e Verificado

2. **Roni Silva** (Empresa: Clínica Saúde Teste)
   - Email: `rony.xp@hotmail.com`
   - Senha: (não informada)
   - Role: (não definida)
   - Status: ✅ Ativo

3. **ANDRE KAIQUE DELL ISOLA** (Empresa: Clínica Saúde Teste)
   - Email: `andrekaique1998@gmail.com`
   - Senha: (não informada)
   - Role: (não definida)
   - Status: ✅ Ativo

4. **Dr. João Silva** (Empresa: Clínica Saúde Teste)
   - Email: `dr.joao@clinicasaudeteste.com.br`
   - Senha: (não informada)
   - Role: (não definida)
   - Status: ✅ Ativo e Verificado

5. **Super Admin SaaS**
   - Email: `admin@Expectropatrono.com.br`
   - Senha: (não informada)
   - Role: (não definida)
   - Status: ✅ Ativo e Verificado

## 🏢 Estrutura de Empresas

### Clínica Saúde Teste

- **Slug**: `clinica-saude-teste`
- **Proprietário**: Andre Kaidellisola
- **Profissionais**: Dr. João Silva, ANDRE KAIQUE DELL ISOLA, Roni Silva

## 🔧 Formatos de Autenticação

### Form Data (OAuth2 Padrão)

```bash
curl -k -X POST https://atendo.website/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=andrekaidellisola@gmail.com&password=owner123'
```

### JSON Format

```bash
curl -k -X POST https://atendo.website/api/v1/auth/login-json \
  -H 'Content-Type: application/json' \
  -d '{"email":"andrekaidellisola@gmail.com","password":"owner123"}'
```

## 📝 Resposta de Login Sucesso

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

## 🔄 Fluxo de Autenticação

1. **Login**: Usuário envia credenciais
2. **Validação**: Sistema verifica email e senha
3. **Geração de Tokens**: Access token (15min) + Refresh token (7 dias)
4. **Resposta**: Tokens retornados para cliente
5. **Acesso**: Client usa access token em requisições subsequentes

## 🛠️ Configurações Técnicas

### Bibliotecas Necessárias

- `argon2_cffi` - Para hash de senhas
- `PyJWT` - Para manipulação de tokens
- `passlib` - Para verificação de senhas

### Variáveis de Ambiente

```bash
SECRET_KEY=chave-secreta-super-forte
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## 🚨 Problemas Comuns e Soluções

### 1. Role Inválido

**Erro**: `'OWNER' is not among the defined enum values`
**Solução**: Atualizar role para valores válidos: `ADMIN`, `MANAGER`, `PROFESSIONAL`, `CLIENT`

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'usuario@email.com';
```

### 2. Biblioteca Argon2 Faltando

**Erro**: `argon2: no backends available`
**Solução**: Instalar biblioteca no container

```bash
docker exec agendamento_backend_prod pip install argon2_cffi
docker restart agendamento_backend_prod
```

### 3. Endpoint Não Encontrado

**Erro**: `Not Found`
**Solução**: Usar endpoints corretos:
- `/api/v1/auth/login` (form data)
- `/api/v1/auth/login-json` (JSON)

## 🧪 Testes de Autenticação

### Teste Login com Form Data

```bash
curl -k -X POST https://atendo.website/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=andrekaidellisola@gmail.com&password=owner123' \
  | jq .
```

### Teste Login com JSON

```bash
curl -k -X POST https://atendo.website/api/v1/auth/login-json \
  -H 'Content-Type: application/json' \
  -d '{"email":"andrekaidellisola@gmail.com","password":"owner123"}' \
  | jq .
```

## 📊 Roles e Permissões

### Níveis de Acesso

1. **ADMIN**: Acesso completo ao sistema
2. **MANAGER**: Gerenciamento da empresa
3. **PROFESSIONAL**: Profissional de saúde
4. **CLIENT**: Cliente final

### Permissões por Role

- **ADMIN**: Todas as funcionalidades
- **MANAGER**: Gestão de usuários, agendamentos, relatórios
- **PROFESSIONAL**: Visualizar e gerenciar próprios agendamentos
- **CLIENT**: Agendar horários, visualizar próprios dados

## 🔐 Segurança

### Hash de Senhas

- Utiliza Argon2 para hash de senhas
- Migração automática de bcrypt para Argon2
- Salt único por senha

### Tokens JWT

- Access token: 15 minutos de validade
- Refresh token: 7 dias de validade
- Assinatura com algoritmo HS256

### CORS

- Origens permitidas configuradas
- Suporte a credenciais
- Headers de segurança configurados

## 📱 Integração com Frontend

### Exemplo de Login (JavaScript)

```javascript
const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};
```

### Uso do Token

```javascript
const apiCall = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/api/v1/appointments', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## 🚀 Próximos Passos

1. **Implementar refresh token automático**
2. **Adicionar autenticação de dois fatores**
3. **Implementar login via redes sociais**
4. **Adicionar recuperação de senha**
5. **Implementar SSO para enterprise**

---

**Última Atualização**: 02/02/2026  
**Status**: ✅ Sistema funcional e testado
