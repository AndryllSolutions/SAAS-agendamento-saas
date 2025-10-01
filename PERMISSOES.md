# 🔐 Sistema de Permissões por Role

## 👥 Tipos de Usuários

### 1. 🔴 Admin (Administrador)
**Acesso Total ao Sistema**

#### Pode Ver/Fazer:
- ✅ Dashboard completo com todas as métricas
- ✅ Gerenciar todos os agendamentos
- ✅ Visualizar agenda (calendário)
- ✅ Criar, editar e deletar serviços
- ✅ Gerenciar usuários (criar, editar, deletar)
- ✅ Visualizar e gerenciar pagamentos
- ✅ Ver e responder avaliações
- ✅ Gerenciar notificações
- ✅ Configurações completas do sistema

#### Menu Lateral:
- Dashboard
- Meus Agendamentos
- Agenda
- Serviços
- Usuários
- Pagamentos
- Avaliações
- Notificações
- Configurações

---

### 2. 🔵 Manager (Gerente)
**Gestão Operacional**

#### Pode Ver/Fazer:
- ✅ Dashboard com métricas operacionais
- ✅ Gerenciar agendamentos
- ✅ Visualizar agenda (calendário)
- ✅ Criar e editar serviços
- ✅ Gerenciar usuários
- ✅ Visualizar pagamentos
- ✅ Ver e responder avaliações
- ✅ Gerenciar notificações
- ✅ Configurações pessoais

#### Menu Lateral:
- Dashboard
- Meus Agendamentos
- Agenda
- Serviços
- Usuários
- Pagamentos
- Avaliações
- Notificações
- Configurações

---

### 3. 🟢 Professional (Profissional)
**Gestão de Atendimentos**

#### Pode Ver/Fazer:
- ✅ Dashboard com suas métricas pessoais
- ✅ Ver e gerenciar seus agendamentos
- ✅ Visualizar sua agenda (calendário)
- ✅ Ver avaliações recebidas
- ✅ Responder avaliações
- ✅ Gerenciar notificações
- ✅ Configurações pessoais

#### Menu Lateral:
- Dashboard
- Meus Agendamentos
- Agenda
- Avaliações
- Notificações
- Configurações

#### ❌ NÃO Pode:
- Gerenciar serviços
- Gerenciar usuários
- Ver pagamentos de outros
- Acessar configurações do sistema

---

### 4. 🟣 Client (Cliente)
**Área do Cliente**

#### Pode Ver/Fazer:
- ✅ Ver seus próprios agendamentos
- ✅ Criar novos agendamentos
- ✅ Cancelar seus agendamentos
- ✅ Ver notificações
- ✅ Configurações pessoais
- ✅ Avaliar serviços recebidos

#### Menu Lateral:
- Meus Agendamentos
- Notificações
- Configurações

#### ❌ NÃO Pode:
- Ver dashboard
- Ver agenda completa
- Gerenciar serviços
- Gerenciar usuários
- Ver pagamentos
- Ver agendamentos de outros

---

## 🎨 Identificação Visual

Cada tipo de usuário tem uma badge colorida no menu lateral:

- 🔴 **Admin** - Badge vermelha
- 🔵 **Gerente** - Badge azul
- 🟢 **Profissional** - Badge verde
- 🟣 **Cliente** - Badge roxa

---

## 🔒 Proteção de Rotas

### Rotas Públicas (Sem Login)
- `/login` - Página de login
- `/register` - Cadastro de novos usuários

### Rotas Protegidas

#### Admin + Manager + Professional
- `/dashboard` - Dashboard com métricas

#### Admin + Manager
- `/services` - Gestão de serviços
- `/users` - Gestão de usuários
- `/payments` - Gestão de pagamentos

#### Admin + Manager + Professional
- `/calendar` - Agenda visual
- `/reviews` - Avaliações

#### Todos os Usuários Autenticados
- `/appointments` - Meus agendamentos
- `/notifications` - Notificações
- `/settings` - Configurações

---

## 🛡️ Como Funciona

### 1. Hook de Permissões
```typescript
const permissions = usePermissions()

// Verificar permissões
if (permissions.canManageServices()) {
  // Mostrar opção de gerenciar serviços
}
```

### 2. Componente de Proteção
```typescript
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <ServicesPage />
</ProtectedRoute>
```

### 3. Menu Lateral Dinâmico
O menu lateral mostra apenas as opções que o usuário tem permissão para acessar.

### 4. Página de Acesso Negado
Se o usuário tentar acessar uma rota sem permissão, é redirecionado para `/unauthorized`.

---

## 🧪 Como Testar

### 1. Login como Admin
```
Email: admin@belezatotal.com
Senha: admin123
```
**Resultado:** Vê todas as opções do menu

### 2. Criar Usuário Professional
Cadastre um novo usuário com role "professional" e faça login.
**Resultado:** Vê apenas Dashboard, Agendamentos, Agenda, Avaliações

### 3. Criar Usuário Client
Cadastre um novo usuário com role "client" e faça login.
**Resultado:** Vê apenas Agendamentos, Notificações e Configurações

---

## 📊 Matriz de Permissões

| Funcionalidade | Admin | Manager | Professional | Client |
|----------------|-------|---------|--------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ❌ |
| Agendamentos | ✅ | ✅ | ✅ | ✅ |
| Agenda | ✅ | ✅ | ✅ | ❌ |
| Serviços | ✅ | ✅ | ❌ | ❌ |
| Usuários | ✅ | ✅ | ❌ | ❌ |
| Pagamentos | ✅ | ✅ | ❌ | ❌ |
| Avaliações | ✅ | ✅ | ✅ | ❌ |
| Notificações | ✅ | ✅ | ✅ | ✅ |
| Configurações | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Benefícios

1. **Segurança** - Cada usuário vê apenas o que pode acessar
2. **UX Melhor** - Menu limpo sem opções desnecessárias
3. **Organização** - Separação clara de responsabilidades
4. **Escalável** - Fácil adicionar novos roles ou permissões

---

## 🚀 Implementado!

✅ Hook de permissões (`usePermissions`)
✅ Componente de proteção (`ProtectedRoute`)
✅ Menu lateral dinâmico com badges
✅ Página de acesso negado
✅ Controle granular por funcionalidade

**Sistema de permissões 100% funcional!** 🎊
