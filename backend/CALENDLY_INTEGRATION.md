# 📅 Integração Calendly - Sistema Completo

## Resumo

Integração completa com **Calendly API v2** para sincronização bidirecional de agendamentos. Permite que profissionais conectem suas contas Calendly e recebam automaticamente os agendamentos feitos através da plataforma.

---

## Funcionalidades Implementadas

- **OAuth 2.0**: Autenticação segura com Calendly
- **Sincronização automática**: Eventos do Calendly viram agendamentos
- **Webhooks**: Recebe notificações em tempo real
- **Mapeamento de serviços**: Tipos de evento → Serviços locais
- **Criação automática de clientes**: Novos invitees viram clientes
- **Cancelamento sincronizado**: Cancelamentos refletidos no sistema

---

## Arquitetura

### Modelos de Dados

**`CalendlyIntegration`** - Configurações OAuth por usuário

```python
user_id: int                    # Usuário do sistema
calendly_user_uri: str          # URI do usuário no Calendly
scheduling_url: str             # URL pública de agendamento
sync_enabled: bool              # Sincronização ativa
webhook_uri: str                # URI do webhook configurado
```

**`CalendlyEventType`** - Mapeamento de tipos de evento

```python
calendly_event_type_uri: str    # URI do tipo no Calendly
service_id: int                 # Serviço local mapeado
auto_create_appointment: bool   # Criar agendamento automaticamente
```

**`CalendlySyncLog`** - Histórico de sincronizações

**`CalendlyWebhookEvent`** - Eventos de webhook recebidos

---

## API Endpoints

### Autenticação

```
GET  /api/v1/calendly/auth-url           # URL de autorização OAuth
POST /api/v1/calendly/oauth-callback     # Processar callback OAuth
```

### Gerenciamento

```
GET  /api/v1/calendly/status             # Status da integração
GET  /api/v1/calendly/integration        # Detalhes da integração
PUT  /api/v1/calendly/integration/toggle # Ativar/desativar
PUT  /api/v1/calendly/integration/sync-settings  # Configurações
DELETE /api/v1/calendly/integration      # Desconectar
```

### Sincronização

```
POST /api/v1/calendly/sync/manual        # Sincronização manual
GET  /api/v1/calendly/sync-logs          # Logs de sincronização
```

### Tipos de Evento

```
GET  /api/v1/calendly/event-types        # Listar tipos de evento
PUT  /api/v1/calendly/event-types/{id}/mapping  # Mapear para serviço
POST /api/v1/calendly/event-types/refresh       # Atualizar lista
```

### Webhook

```
POST /api/v1/calendly/webhook            # Receber eventos do Calendly
```

---

## Configuração

### Variáveis de Ambiente

```env
CALENDLY_CLIENT_ID=your_client_id
CALENDLY_CLIENT_SECRET=your_client_secret
BACKEND_URL=https://your-api-domain.com
```

### Configurações de Sincronização

```json
{
  "sync_past_days": 7,
  "sync_future_days": 60,
  "auto_confirm_bookings": true,
  "create_client_if_not_exists": true,
  "default_service_id": null,
  "notification_on_booking": true
}
```

---

## Fluxo de Integração

### 1. Conexão OAuth

```
Usuario → GET /auth-url → Calendly OAuth → Callback → Tokens salvos
```

### 2. Webhook Automático

Quando um cliente agenda no Calendly:

```
Calendly → POST /webhook (invitee.created) → Criar Appointment
```

Quando um cliente cancela:

```
Calendly → POST /webhook (invitee.canceled) → Cancelar Appointment
```

### 3. Sincronização Manual

```
Usuario → POST /sync/manual → Buscar eventos → Criar/Atualizar Appointments
```

---

## Mapeamento de Serviços

Cada tipo de evento do Calendly pode ser mapeado para um serviço local:

```python
# Exemplo: Mapear "Consulta 30min" do Calendly para serviço ID 5
PUT /api/v1/calendly/event-types/123/mapping
{
  "service_id": 5,
  "is_active": true,
  "auto_create_appointment": true
}
```

---

## Webhooks Suportados

| Evento | Ação |
|--------|------|
| `invitee.created` | Cria novo agendamento |
| `invitee.canceled` | Cancela agendamento existente |
| `routing_form_submission.created` | Log para análise |

---

## Como Usar

### Para Desenvolvedores

1. **Configurar OAuth no Calendly**
   - Criar app em [Calendly Developer Portal](https://developer.calendly.com/)
   - Configurar redirect URIs
   - Obter Client ID e Secret

2. **Configurar variáveis de ambiente**

3. **Executar migration**
   ```bash
   alembic upgrade head
   ```

4. **Instalar dependência**
   ```bash
   pip install httpx
   ```

### Para Usuários

1. Ir para configurações do perfil
2. Clicar em "Conectar Calendly"
3. Autorizar acesso
4. Mapear tipos de evento para serviços
5. Agendamentos sincronizam automaticamente

---

## Dependências

```
httpx>=0.25.0
```

---

## Comparação: Google Calendar vs Calendly

| Feature | Google Calendar | Calendly |
|---------|-----------------|----------|
| Direção | Bidirecional | Calendly → Sistema |
| Uso principal | Sincronizar agenda | Receber agendamentos externos |
| Webhooks | Não | Sim |
| Criação de clientes | Não | Sim |
| Mapeamento de serviços | Não | Sim |

**Recomendação**: Use ambos! Google Calendar para sincronizar sua agenda pessoal, Calendly para receber agendamentos de clientes externos.

---

## Status

✅ **IMPLEMENTADO E OPERACIONAL**

- Modelos de dados criados
- Serviço de integração completo
- API endpoints funcionais
- Webhooks configurados
- Migration pronta
- Documentação completa
