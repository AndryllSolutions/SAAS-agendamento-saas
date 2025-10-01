# 🚀 Guia Rápido - Agendamento SaaS

## Início Rápido (5 minutos)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac) ou Docker + Docker Compose (Linux)
- Git

### 2. Clone o Repositório

```bash
git clone <seu-repositorio>
cd agendamento_SAAS
```

### 3. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
copy .env.example .env

# No Windows PowerShell:
# Copy-Item .env.example .env
```

**Importante**: Edite o `.env` e altere pelo menos:
- `SECRET_KEY` - Gere uma chave secreta única
- `DATABASE_URL` - Senha do banco de dados

### 4. Inicie os Serviços

```bash
docker-compose up -d
```

Aguarde alguns segundos para os serviços iniciarem.

### 5. Inicialize o Banco de Dados

```bash
docker-compose exec backend python scripts/init_db.py
```

### 6. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

### 7. Faça Login

Use uma das credenciais criadas:

**Administrador**
- Email: `admin@belezatotal.com`
- Senha: `admin123`

**Gerente**
- Email: `gerente@belezatotal.com`
- Senha: `gerente123`

**Profissional**
- Email: `joao@belezatotal.com`
- Senha: `prof123`

**Cliente**
- Email: `cliente@example.com`
- Senha: `cliente123`

## 🎉 Pronto!

Você já pode começar a usar o sistema!

## 📱 Funcionalidades Disponíveis

### Como Administrador/Gerente
1. Acesse o **Dashboard** para ver métricas
2. Vá em **Serviços** para gerenciar serviços
3. Acesse **Usuários** para gerenciar equipe
4. Veja **Agendamentos** para gerenciar agenda
5. Confira **Relatórios** para análises

### Como Profissional
1. Veja seus **Agendamentos** do dia
2. Faça **Check-in** de clientes via QR Code
3. Adicione **Notas** sobre atendimentos
4. Responda **Avaliações** de clientes

### Como Cliente
1. **Agende** um serviço
2. Veja seu **Histórico** de agendamentos
3. **Avalie** profissionais
4. Gerencie seu **Perfil**

## 🛠️ Comandos Úteis

### Ver Logs
```bash
docker-compose logs -f
```

### Parar Serviços
```bash
docker-compose down
```

### Reiniciar Serviços
```bash
docker-compose restart
```

### Acessar Container do Backend
```bash
docker-compose exec backend bash
```

### Criar Backup do Banco
```bash
docker-compose exec db pg_dump -U agendamento agendamento_db > backup.sql
```

## 🐛 Problemas Comuns

### Porta já em uso
Se a porta 3000, 8000 ou 5432 já estiver em uso, edite o `docker-compose.yml` para usar outras portas.

### Containers não iniciam
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### Erro de conexão com banco de dados
Aguarde alguns segundos após `docker-compose up` para o PostgreSQL inicializar completamente.

### Frontend não carrega
Verifique se a variável `NEXT_PUBLIC_API_URL` no `.env` está correta.

## 📚 Próximos Passos

1. Leia o [README.md](README.md) completo
2. Confira [FEATURES.md](FEATURES.md) para ver todas as funcionalidades
3. Veja [DEPLOYMENT.md](DEPLOYMENT.md) para deploy em produção
4. Explore a [Documentação da API](http://localhost:8000/docs)

## 💬 Suporte

- Abra uma issue no GitHub
- Consulte a documentação completa
- Entre em contato com a equipe

## 🎓 Tutorial Básico

### Criar um Novo Agendamento

1. Faça login como **gerente** ou **admin**
2. Vá para **Agendamentos** → **Novo**
3. Selecione:
   - Cliente
   - Serviço
   - Profissional
   - Data e hora
4. Clique em **Criar Agendamento**
5. O cliente receberá uma notificação automática!

### Adicionar um Novo Serviço

1. Faça login como **gerente** ou **admin**
2. Vá para **Serviços** → **Novo Serviço**
3. Preencha:
   - Nome do serviço
   - Descrição
   - Preço
   - Duração
   - Categoria
4. Clique em **Salvar**

### Configurar Notificações

1. Edite o arquivo `.env`
2. Configure suas credenciais:
   ```env
   # Email
   SMTP_USER=seu-email@gmail.com
   SMTP_PASSWORD=sua-senha-app
   
   # SMS (Twilio)
   TWILIO_ACCOUNT_SID=seu-sid
   TWILIO_AUTH_TOKEN=seu-token
   
   # WhatsApp
   WHATSAPP_API_URL=sua-api-url
   WHATSAPP_API_TOKEN=seu-token
   ```
3. Reinicie os serviços:
   ```bash
   docker-compose restart
   ```

## 🔐 Segurança

**IMPORTANTE**: Antes de usar em produção:

1. ✅ Altere todas as senhas padrão
2. ✅ Gere uma `SECRET_KEY` única
3. ✅ Configure HTTPS
4. ✅ Use senhas fortes no banco de dados
5. ✅ Configure firewall
6. ✅ Ative backups automáticos

## 📊 Monitoramento

### Ver Status dos Serviços
```bash
docker-compose ps
```

### Ver Uso de Recursos
```bash
docker stats
```

### Acessar RabbitMQ Management
http://localhost:15672
- Usuário: `guest`
- Senha: `guest`

---

**Divirta-se usando o Agendamento SaaS! 🎉**
