# 🌐 Configuração Ngrok - Acesso Público

## 🎯 O Que Vamos Fazer

Expor o sistema para acesso público via Ngrok com usuários demo para testes.

---

## 📋 Pré-requisitos

1. **Ngrok** instalado
2. **Backend e Frontend** rodando localmente

---

## 🚀 PASSO A PASSO

### 1️⃣ Instalar Ngrok

#### Windows:
```bash
# Via Chocolatey
choco install ngrok

# OU baixar manualmente
# https://ngrok.com/download
```

#### Verificar instalação:
```bash
ngrok version
```

### 2️⃣ Criar Conta no Ngrok (Grátis)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita
3. Copie seu **authtoken**

### 3️⃣ Configurar Authtoken

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### 4️⃣ Criar Usuários Demo

```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
python scripts/create_demo_users.py
```

**Resultado:**
```
✅ Criado: Admin Demo (admin@demo.com) - Role: admin
✅ Criado: Gerente Demo (gerente@demo.com) - Role: manager
✅ Criado: Profissional Demo (profissional@demo.com) - Role: professional
✅ Criado: Cliente Demo (cliente@demo.com) - Role: client
...

🎉 8 usuários demo criados com sucesso!
```

### 5️⃣ Iniciar Backend

```bash
cd d:\agendamento_SAAS\backend
.\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 6️⃣ Iniciar Frontend

```bash
cd d:\agendamento_SAAS\frontend
npm run dev
```

### 7️⃣ Expor Backend com Ngrok

**Abra um NOVO terminal:**

```bash
ngrok http 8000
```

**Você verá algo assim:**
```
ngrok

Session Status                online
Account                       Seu Nome (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copie a URL:** `https://abc123.ngrok.io`

### 8️⃣ Expor Frontend com Ngrok

**Abra OUTRO terminal:**

```bash
ngrok http 3000
```

**Copie a URL do frontend:** `https://xyz789.ngrok.io`

### 9️⃣ Atualizar Configurações do Frontend

Edite: `d:\agendamento_SAAS\frontend\.env.local`

```env
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

**Reinicie o frontend** (Ctrl+C e `npm run dev` novamente)

---

## 📱 Compartilhar Acesso

### URL para Compartilhar:
```
https://xyz789.ngrok.io
```

### Credenciais Demo:

#### 🔴 ADMIN (Acesso Total):
```
Email: admin@demo.com
Senha: demo123
```

#### 🔵 GERENTE (Gestão):
```
Email: gerente@demo.com
Senha: demo123
```

#### 🟢 PROFISSIONAL (Agenda e Atendimentos):
```
Email: profissional@demo.com
Senha: demo123
```

#### 🟣 CLIENTE (Agendamentos):
```
Email: cliente@demo.com
Senha: demo123
```

#### 💡 Outros Usuários:
```
joao@demo.com (Cliente)
maria@demo.com (Profissional - Manicure)
pedro@demo.com (Profissional - Massagem)
ana@demo.com (Cliente)

Senha para todos: demo123
```

---

## 📊 O Que Cada Usuário Pode Fazer

### 🔴 Admin (admin@demo.com):
- ✅ Dashboard completo
- ✅ Gerenciar usuários
- ✅ Gerenciar profissionais
- ✅ Gerenciar serviços
- ✅ Ver relatórios financeiros
- ✅ Configurar sistema
- ✅ Tudo!

### 🔵 Gerente (gerente@demo.com):
- ✅ Dashboard
- ✅ Gerenciar profissionais
- ✅ Gerenciar serviços
- ✅ Ver relatórios
- ✅ Gerenciar agendamentos

### 🟢 Profissional (profissional@demo.com):
- ✅ Ver seus agendamentos
- ✅ Ver agenda
- ✅ Atualizar perfil
- ✅ Ver avaliações

### 🟣 Cliente (cliente@demo.com):
- ✅ Fazer agendamentos
- ✅ Ver histórico
- ✅ Avaliar serviços
- ✅ Atualizar perfil

---

## 🎨 Página Pública de Agendamento

**URL sem login:**
```
https://xyz789.ngrok.io/book
```

Qualquer pessoa pode:
- Ver serviços disponíveis
- Ver profissionais
- Fazer agendamento
- Receber confirmação por email

---

## 🔧 Comandos Úteis

### Ver Logs do Ngrok:
Acesse: http://127.0.0.1:4040

### Parar Ngrok:
```bash
Ctrl + C no terminal do ngrok
```

### Reiniciar com Nova URL:
```bash
ngrok http 8000
# Nova URL será gerada
```

### Ngrok com Domínio Fixo (Pago):
```bash
ngrok http 8000 --domain=seu-dominio.ngrok.io
```

---

## 📋 Checklist de Compartilhamento

Antes de compartilhar, verifique:

- [ ] Backend rodando (`http://localhost:8000/docs`)
- [ ] Frontend rodando (`http://localhost:3000`)
- [ ] Ngrok backend ativo
- [ ] Ngrok frontend ativo
- [ ] `.env.local` atualizado com URL do Ngrok
- [ ] Usuários demo criados
- [ ] Testou login com cada tipo de usuário

---

## 🎯 Exemplo de Mensagem para Compartilhar

```
🎉 Sistema de Agendamento - Demo Online!

🌐 Acesse: https://xyz789.ngrok.io

📋 Credenciais de Teste:

🔴 Admin (Acesso Total):
   Email: admin@demo.com
   Senha: demo123

🟢 Profissional:
   Email: profissional@demo.com
   Senha: demo123

🟣 Cliente:
   Email: cliente@demo.com
   Senha: demo123

💡 Ou faça agendamento sem login:
   https://xyz789.ngrok.io/book

✨ Funcionalidades:
- Dashboard interativo
- Agendamentos online
- Relatórios financeiros
- Gestão de profissionais
- Notificações por email
- E muito mais!
```

---

## ⚠️ Limitações do Plano Gratuito

- ✅ URL muda a cada reinício
- ✅ Máximo 40 conexões/minuto
- ✅ Sessão expira após 2 horas de inatividade
- ✅ 1 túnel simultâneo

### Plano Pago ($8/mês):
- ✅ URL fixa
- ✅ Múltiplos túneis
- ✅ Sem limite de tempo
- ✅ Domínio customizado

---

## 🚀 Alternativas ao Ngrok

### 1. **Cloudflare Tunnel** (Grátis)
```bash
cloudflared tunnel --url http://localhost:3000
```

### 2. **LocalTunnel** (Grátis)
```bash
npx localtunnel --port 3000
```

### 3. **Serveo** (Grátis)
```bash
ssh -R 80:localhost:3000 serveo.net
```

---

## 🎊 SISTEMA PÚBLICO E ACESSÍVEL!

**Agora você pode:**
- ✅ Compartilhar sistema com qualquer pessoa
- ✅ Demonstrar funcionalidades
- ✅ Receber feedback
- ✅ Fazer testes remotos
- ✅ Mostrar para clientes

**URLs geradas são válidas por 2 horas!** ⏰

---

## 📝 Próximos Passos

Após validação:
1. Deploy em servidor real (AWS, Heroku, Vercel)
2. Domínio próprio
3. SSL/HTTPS
4. Banco de dados em nuvem
5. CDN para assets
6. Monitoramento

**Por enquanto, Ngrok é perfeito para demos!** 🚀✨
