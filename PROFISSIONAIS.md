# 👥 Sistema de Gestão de Profissionais

## 🎯 O Que Foi Criado

### 1. **Script de Criação de Profissionais Mock**
Arquivo: `backend/scripts/create_professionals.py`

#### 8 Profissionais Criados:
1. **Maria Silva** - Corte Feminino, Coloração, Escova (40% comissão)
2. **João Santos** - Corte Masculino, Barba, Sobrancelha (35% comissão)
3. **Ana Costa** - Manicure, Pedicure, Unhas Decoradas (45% comissão)
4. **Pedro Oliveira** - Massagem, Drenagem Linfática (50% comissão)
5. **Carla Mendes** - Depilação, Limpeza de Pele (40% comissão)
6. **Lucas Ferreira** - Personal Trainer, Musculação (55% comissão)
7. **Juliana Rocha** - Maquiagem, Design de Sobrancelhas (45% comissão)
8. **Rafael Lima** - Tatuagem, Piercing (60% comissão)

#### Dados de Cada Profissional:
- ✅ Nome completo
- ✅ Email (@belezatotal.com)
- ✅ Telefone
- ✅ Especialidades (array)
- ✅ Bio profissional
- ✅ Taxa de comissão
- ✅ Horários de trabalho (seg-sex 9h-18h, sáb 9h-14h)
- ✅ Senha padrão: `senha123`

---

### 2. **Página de Gestão de Profissionais** (`/professionals`)
Interface completa para Admin/Manager gerenciar a equipe.

#### Funcionalidades:

##### 📊 Dashboard com Cards:
- **Total de Profissionais** - Contador
- **Profissionais Ativos** - Status verde
- **Comissão Média** - Cálculo automático

##### 🎨 Grid de Profissionais:
Cada card mostra:
- **Avatar** com inicial do nome (gradiente)
- **Nome** e status (Ativo/Inativo)
- **Email** e telefone
- **Especialidades** (até 3 + contador)
- **Bio** (2 linhas com ellipsis)
- **Taxa de comissão** em destaque
- **Botões** de Editar e Excluir

##### ➕ Modal de Criar/Editar:
Formulário completo com:
- Nome completo *
- Email *
- Telefone
- Senha * (só na criação)
- Comissão (%)
- Especialidades (separadas por vírgula)
- Bio (textarea)

##### 🔐 Controle de Acesso:
- Só Admin e Manager podem acessar
- Mensagem de erro para outros roles

---

## 🚀 Como Usar

### 1. Criar Profissionais Mock

```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
python scripts/create_professionals.py
```

**Resultado:**
```
🚀 Criando profissionais mock...

✅ Criado: Maria Silva - maria.silva@belezatotal.com
✅ Criado: João Santos - joao.santos@belezatotal.com
✅ Criado: Ana Costa - ana.costa@belezatotal.com
✅ Criado: Pedro Oliveira - pedro.oliveira@belezatotal.com
✅ Criado: Carla Mendes - carla.mendes@belezatotal.com
✅ Criado: Lucas Ferreira - lucas.ferreira@belezatotal.com
✅ Criado: Juliana Rocha - juliana.rocha@belezatotal.com
✅ Criado: Rafael Lima - rafael.lima@belezatotal.com

🎉 8 profissionais criados com sucesso!

📝 Credenciais de acesso:
Email: [email do profissional]
Senha: senha123
```

### 2. Acessar Gestão de Profissionais

```
URL: http://localhost:3000/professionals
```

**Requisitos:**
- Estar logado como Admin ou Manager
- Backend rodando

### 3. Testar Login como Profissional

```
Email: maria.silva@belezatotal.com
Senha: senha123
```

**O que o profissional vê:**
- Dashboard com suas métricas
- Seus agendamentos
- Sua agenda
- Avaliações recebidas
- Notificações
- Configurações

---

## 📋 Funcionalidades da Página

### Criar Novo Profissional
1. Clique em "Novo Profissional"
2. Preencha o formulário
3. Especialidades: digite separadas por vírgula
   - Ex: `Corte, Barba, Coloração`
4. Clique em "Criar"

### Editar Profissional
1. Clique em "Editar" no card
2. Modifique os dados
3. Clique em "Atualizar"

### Excluir Profissional
1. Clique no ícone de lixeira
2. Confirme a exclusão

---

## 🎨 Design

### Cards de Profissionais:
- **Avatar circular** com gradiente roxo/rosa
- **Badge de status** (verde = ativo, cinza = inativo)
- **Ícones** para email, telefone, especialidades
- **Tags coloridas** para especialidades
- **Comissão** em destaque
- **Hover effect** com sombra

### Modal:
- **Header fixo** com título
- **Formulário** em grid responsivo
- **Validação** em campos obrigatórios
- **Botões** de ação coloridos

---

## 📊 Dados dos Profissionais

### Estrutura:
```json
{
  "id": 1,
  "full_name": "Maria Silva",
  "email": "maria.silva@belezatotal.com",
  "phone": "(11) 98765-4321",
  "role": "professional",
  "specialties": ["Corte Feminino", "Coloração", "Escova"],
  "bio": "Especialista em cortes femininos com 10 anos de experiência",
  "commission_rate": 40,
  "is_active": true,
  "working_hours": {
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"},
    ...
  }
}
```

---

## 🔗 Integração

### Menu Lateral:
- ✅ Link "Profissionais" adicionado
- ✅ Só aparece para Admin/Manager
- ✅ Ícone de usuários

### API Endpoints Usados:
- `GET /api/v1/users/professionals/available` - Listar profissionais
- `POST /api/v1/users` - Criar profissional
- `PUT /api/v1/users/{id}` - Atualizar profissional
- `DELETE /api/v1/users/{id}` - Excluir profissional

---

## 🎯 Casos de Uso

### Admin:
1. Cria novos profissionais
2. Define comissões
3. Ativa/desativa profissionais
4. Atualiza especialidades
5. Gerencia horários

### Manager:
1. Visualiza equipe
2. Edita informações
3. Atribui especialidades

### Profissional:
1. Faz login no sistema
2. Vê seus agendamentos
3. Gerencia sua agenda
4. Recebe notificações

---

## 📈 Métricas Exibidas

### Dashboard de Profissionais:
- **Total** - Quantidade total de profissionais
- **Ativos** - Quantos estão ativos
- **Comissão Média** - Média das comissões da equipe

---

## 🎊 SISTEMA COMPLETO!

**Agora você pode:**
- ✅ Criar profissionais mock com 1 comando
- ✅ Gerenciar equipe via interface linda
- ✅ Profissionais podem fazer login
- ✅ Atribuir especialidades e comissões
- ✅ Visualizar métricas da equipe

**Tudo pronto para gerenciar sua equipe!** 👥✨
