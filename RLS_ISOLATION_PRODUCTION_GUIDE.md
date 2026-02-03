# Guia operacional de RLS em produção

## 1. Objetivo

Este documento descreve como transformar a configuração de Row Level Security (RLS)
em isolamento **comprovado** em produção, evitando o uso de superusers e garantindo
que cada tenant veja apenas seus próprios dados.

---

## 2. Requisito fundamental: parar de usar superuser na aplicação

Em desenvolvimento inicial o backend usava um usuário com `SUPERUSER`, o que
faz o Postgres **ignorar RLS** (inclusive com `FORCE ROW LEVEL SECURITY`).

Em produção, isso é inaceitável. O backend **deve** usar um usuário de banco:

- Sem `SUPERUSER`
- Sem `BYPASSRLS`
- Com permissões mínimas necessárias

---

## 3. Criar o usuário de aplicação (via Docker)

Executar no host (PowerShell), sempre via Docker:

```powershell
docker-compose exec db psql -U agendamento_user -d agendamento -c "CREATE ROLE agendamento_app LOGIN PASSWORD 'agendamento_app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
docker-compose exec db psql -U agendamento_user -d agendamento -c "ALTER ROLE agendamento_app NOBYPASSRLS;"
```

### 3.1 Conceder permissões mínimas

```powershell
docker-compose exec db psql -U agendamento_user -d agendamento -c "GRANT CONNECT ON DATABASE agendamento TO agendamento_app;"
docker-compose exec db psql -U agendamento_user -d agendamento -c "GRANT USAGE ON SCHEMA public TO agendamento_app;"

docker-compose exec db psql -U agendamento_user -d agendamento -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agendamento_app;"
docker-compose exec db psql -U agendamento_user -d agendamento -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agendamento_app;"

docker-compose exec db psql -U agendamento_user -d agendamento -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO agendamento_app;"
docker-compose exec db psql -U agendamento_user -d agendamento -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO agendamento_app;"
```

---

## 4. Trocar o usuário do backend

No arquivo de configuração do backend (`.env`, `docker-compose.yml` ou equivalente),
substituir:

```env
DATABASE_USER=agendamento_app
DATABASE_PASSWORD=agendamento_app_password
```

Reiniciar os serviços:

```powershell
docker-compose down
docker-compose up -d --build
```

> Nunca usar `postgres` ou qualquer usuário com `SUPERUSER` em produção.

---

## 5. Teste de isolamento direto no banco

Conectar como `agendamento_app`:

```powershell
docker-compose exec db psql -U agendamento_app -d agendamento
```

E executar:

```sql
-- Tenant 1
SET app.current_company_id = '1';
SELECT company_id, count(*) FROM clients GROUP BY company_id ORDER BY company_id;

-- Tenant inexistente
SET app.current_company_id = '999';
SELECT company_id, count(*) FROM clients GROUP BY company_id ORDER BY company_id;

-- Sem tenant
RESET app.current_company_id;
SELECT company_id, count(*) FROM clients GROUP BY company_id ORDER BY company_id;
```

Critérios de aprovação:

- Para `'1'`: apenas `company_id = 1`.
- Para `'999'`: nenhuma linha.
- Sem tenant (`RESET`): nenhuma linha.

Se isso for verdade, o RLS está **efetivamente** funcionando para o usuário de aplicação.

---

## 6. Teste via API (endpoints RLS-aware)

Com o backend já usando `agendamento_app` e endpoints migrados para:

- `get_db_with_tenant`
- `get_current_user_context`

Testar:

1. **Leitura por tenant**

   - Token A (`company_id = 1`):

     ```http
     GET /api/v1/clients
     ```

     → Apenas clientes da empresa 1.

   - Token B (`company_id = 2`):

     ```http
     GET /api/v1/clients
     ```

     → Apenas clientes da empresa 2.

2. **Operações cruzadas (devem falhar por RLS)**

   - Update em ID de cliente de outra empresa.
   - Delete em ID de cliente de outra empresa.
   - Qualquer bulk que atinja registros de outro tenant.

   Esperado: 0 linhas afetadas (RLS bloqueia silenciosamente).

---

## 7. Próximo nível: auditoria de falhas de tenant

Depois de consolidar o RLS:

- Logar em cada request:
  - `company_id`
  - `user_id`
  - endpoint
  - `rowcount` de operações sensíveis

- Criar alertas para:
  - `rowcount > 0` quando `company_id` não estiver definido.
  - Chamadas onde `SET app.current_company_id` não foi executado (ou falhou).

Isso transforma RLS em **controle ativo**, não apenas passivo, ajudando a
detectar regressões de multi-tenant antes que virem incidentes.
