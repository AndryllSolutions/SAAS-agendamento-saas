# ✅ Checklist de Teste - Frontend

## 🌐 Páginas Públicas

### 1. Home (`/`)
- [ ] Página carrega
- [ ] Design responsivo
- [ ] Links funcionam
- [ ] Botão "Agendar" funciona

### 2. Login (`/login`)
- [ ] Página carrega
- [ ] Formulário aparece
- [ ] Cards de usuários demo aparecem
- [ ] Clique nos cards preenche email/senha
- [ ] Login funciona
- [ ] Redireciona para `/dashboard`
- [ ] Mensagem de erro aparece (senha errada)

### 3. Registro (`/register`)
- [ ] Página carrega
- [ ] Formulário aparece
- [ ] Validação funciona
- [ ] Registro funciona

### 4. Agendamento Público (`/book`)
- [ ] Página carrega
- [ ] **Passo 1** - Selecionar serviço
  - [ ] Lista de serviços aparece
  - [ ] Cards clicáveis
  - [ ] Botão "Próximo" funciona
- [ ] **Passo 2** - Selecionar profissional
  - [ ] Lista de profissionais aparece
  - [ ] Filtro por especialidade funciona
  - [ ] Botão "Próximo" funciona
- [ ] **Passo 3** - Selecionar data e hora
  - [ ] Calendário aparece
  - [ ] Horários disponíveis aparecem
  - [ ] Seleção funciona
  - [ ] Botão "Próximo" funciona
- [ ] **Passo 4** - Dados do cliente
  - [ ] Formulário aparece
  - [ ] Validação funciona
  - [ ] Botão "Próximo" funciona
- [ ] **Passo 5** - Confirmação
  - [ ] Resumo aparece
  - [ ] Botão "Confirmar" funciona
  - [ ] Mensagem de sucesso aparece

---

## 🔐 Páginas Autenticadas (Admin)

### 5. Dashboard (`/dashboard`)
- [ ] Página carrega
- [ ] Cards de métricas aparecem
- [ ] Gráficos aparecem
- [ ] Dados corretos
- [ ] Filtros funcionam

### 6. Meus Agendamentos (`/appointments`)
- [ ] Página carrega
- [ ] Lista de agendamentos aparece
- [ ] Filtros funcionam (status, data, busca)
- [ ] Botões de ação funcionam
- [ ] Modal de detalhes abre
- [ ] Cancelar agendamento funciona

### 7. Calendário (`/calendar`)
- [ ] Página carrega
- [ ] Calendário aparece
- [ ] Agendamentos aparecem
- [ ] Clique em agendamento abre detalhes

### 8. Serviços (`/services`)
- [ ] Página carrega
- [ ] Lista de serviços aparece
- [ ] Botão "Novo Serviço" funciona
- [ ] Modal de criação abre
- [ ] Criar serviço funciona
- [ ] Editar serviço funciona
- [ ] Deletar serviço funciona
- [ ] Busca funciona

### 9. Profissionais (`/professionals`)
- [ ] Página carrega
- [ ] Lista de profissionais aparece
- [ ] Cards com informações corretas
- [ ] Filtros funcionam
- [ ] Detalhes do profissional abrem

### 10. Usuários (`/users`)
- [ ] Página carrega
- [ ] Lista de usuários aparece
- [ ] Filtros funcionam
- [ ] Criar usuário funciona
- [ ] Editar usuário funciona
- [ ] Deletar usuário funciona

### 11. Pagamentos (`/payments`)
- [ ] Página carrega
- [ ] Lista de pagamentos aparece
- [ ] Filtros funcionam
- [ ] Detalhes aparecem

### 12. Relatórios Financeiros (`/reports`)
- [ ] Página carrega
- [ ] Cards de métricas aparecem
- [ ] Top serviços aparece
- [ ] Top profissionais aparece
- [ ] Filtro de período funciona
- [ ] Botão "Exportar CSV" funciona
- [ ] CSV é baixado corretamente

### 13. Avaliações (`/reviews`)
- [ ] Página carrega
- [ ] Lista de avaliações aparece
- [ ] Filtros funcionam
- [ ] Estrelas aparecem corretamente

### 14. Notificações (`/notifications`)
- [ ] Página carrega
- [ ] Lista de notificações aparece
- [ ] Marcar como lida funciona
- [ ] Badge de contador atualiza

### 15. Configurações (`/settings`)
- [ ] Página carrega
- [ ] **Tab Perfil**
  - [ ] Dados do usuário aparecem
  - [ ] Foto de perfil aparece
  - [ ] Clique em câmera abre seletor
  - [ ] Preview da foto funciona
  - [ ] Alerta de foto nova aparece
  - [ ] Botão "Cancelar Foto" funciona
  - [ ] Salvar alterações funciona
  - [ ] Foto é salva
- [ ] **Tab Segurança**
  - [ ] Formulário de senha aparece
  - [ ] Validação funciona
  - [ ] Alterar senha funciona
- [ ] **Tab Notificações**
  - [ ] Opções aparecem
  - [ ] Checkboxes funcionam

---

## 🎭 Testes por Role

### Admin
- [ ] Acessa todas as páginas
- [ ] Vê todos os dados
- [ ] Pode criar/editar/deletar tudo

### Gerente
- [ ] Acessa dashboard
- [ ] Acessa relatórios
- [ ] Acessa gestão de profissionais
- [ ] NÃO acessa gestão de usuários

### Profissional
- [ ] Acessa seus agendamentos
- [ ] Acessa calendário
- [ ] Acessa configurações
- [ ] NÃO acessa relatórios
- [ ] NÃO acessa gestão

### Cliente
- [ ] Acessa seus agendamentos
- [ ] Acessa configurações
- [ ] Pode fazer agendamento em `/book`
- [ ] NÃO acessa dashboard
- [ ] NÃO acessa gestão

---

## 🎨 Testes de UI/UX

### Design
- [ ] Cores consistentes
- [ ] Fontes legíveis
- [ ] Espaçamentos corretos
- [ ] Ícones aparecem
- [ ] Gradientes funcionam

### Responsividade
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Navegação
- [ ] Sidebar funciona
- [ ] Links funcionam
- [ ] Breadcrumbs aparecem
- [ ] Voltar funciona

### Feedback
- [ ] Toasts aparecem
- [ ] Loading states aparecem
- [ ] Mensagens de erro claras
- [ ] Confirmações funcionam

---

## 🚀 COMO TESTAR

### 1. Inicie o Frontend
```bash
cd d:\agendamento_SAAS\frontend
npm run dev
```

### 2. Acesse cada página
```
http://localhost:3000/[rota]
```

### 3. Teste com diferentes usuários
- admin@demo.com
- gerente@demo.com
- profissional@demo.com
- cliente@demo.com

Senha: demo123

### 4. Marque os checkboxes
- ✅ Funciona
- ❌ Não funciona (anotar o erro)

---

## 📊 RESULTADO ESPERADO

**Taxa de sucesso:**
- 🟢 90-100% - Excelente
- 🟡 70-89% - Bom
- 🔴 <70% - Precisa melhorar

---

## 🐛 BUGS ENCONTRADOS

Liste aqui os bugs encontrados:

1. 
2. 
3. 

---

**Boa sorte nos testes!** 🧪✨
