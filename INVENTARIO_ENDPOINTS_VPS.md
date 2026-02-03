# 📊 Inventário Completo de Endpoints - Sistema VPS

**Data da Análise:** 12 de Janeiro de 2026  
**VPS:** http://72.62.138.239  
**Status:** ✅ Documentação analisada com sucesso

---

## 🎯 Resumo Executivo

O sistema VPS possui atualmente:

- **240 endpoints** (paths únicos)
- **325 operações HTTP** totais
- **36 categorias** de recursos
- **8 endpoints** de autenticação
- **13 operações** de administração SaaS

---

## 📈 Distribuição por Método HTTP

| Método | Quantidade | Percentual |
|--------|------------|------------|
| **GET** | 130 | 40.0% |
| **POST** | 97 | 29.8% |
| **PUT** | 10 | 3.1% |
| **DELETE** | 4 | 1.2% |
| **Outros** | 84 | 25.9% |
| **TOTAL** | **325** | **100%** |

---

## 🏆 Top 15 Categorias com Mais Endpoints

| # | Categoria | Operações | Paths Únicos |
|---|-----------|-----------|--------------|
| 1 | **financial** | 25 | 17 |
| 2 | **appointments** | 16 | 14 |
| 3 | **whatsapp** | 16 | 10 |
| 4 | **saas-admin** | 15 | 13 |
| 5 | **clients** | 13 | 11 |
| 6 | **products** | 13 | 7 |
| 7 | **online-booking** | 12 | 8 |
| 8 | **payments** | 12 | 8 |
| 9 | **plans** | 12 | 11 |
| 10 | **subscription-sales** | 12 | 9 |
| 11 | **documents** | 11 | 7 |
| 12 | **settings** | 11 | 6 |
| 13 | **commissions** | 9 | 7 |
| 14 | **expenses** | 9 | 5 |
| 15 | **packages** | 9 | 5 |

---

## 🔐 Endpoints de Autenticação (8 operações)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login com form data (OAuth2) |
| POST | `/api/v1/auth/login-json` | Login com JSON |
| POST | `/api/v1/auth/login/json` | Login com JSON (alternativo) |
| POST | `/api/v1/auth/mobile/login` | Login mobile |
| POST | `/api/v1/auth/register` | Registro de novo usuário |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/refresh/json` | Refresh token (JSON) |
| POST | `/api/v1/auth/change-password` | Alterar senha |

---

## 👑 Endpoints SaaS Admin (13 operações)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/saas-admin/companies` | Listar empresas |
| GET, PUT | `/api/v1/saas-admin/companies/{company_id}` | Gerenciar empresa |
| GET, PUT | `/api/v1/saas-admin/companies/{company_id}/subscription` | Gerenciar assinatura |
| POST | `/api/v1/saas-admin/companies/{company_id}/toggle-status` | Ativar/desativar empresa |
| POST | `/api/v1/saas-admin/impersonate/{company_id}` | Impersonar empresa |
| GET | `/api/v1/saas-admin/users` | Listar usuários |
| POST | `/api/v1/saas-admin/users/{user_id}/promote-saas` | Promover usuário |
| GET | `/api/v1/saas-admin/plans` | Listar planos |
| GET | `/api/v1/saas-admin/plans/{plan_id}` | Detalhes do plano |
| GET | `/api/v1/saas-admin/metrics/overview` | Métricas gerais |
| GET | `/api/v1/saas-admin/analytics/growth` | Análise de crescimento |
| GET | `/api/v1/saas-admin/analytics/revenue` | Análise de receita |
| GET | `/api/v1/saas-admin/addons/stats` | Estatísticas de addons |

---

## 📦 Principais Recursos CRUD

### 💰 Financeiro (28 operações)
- **Métodos:** GET: 11, POST: 8, PUT: 4, DELETE: 5
- **Recursos:** Transações, Categorias, Formas de Pagamento, Fluxo de Caixa

### 📅 Agendamentos (17 operações)
- **Métodos:** GET: 7, POST: 8, PUT: 1, DELETE: 1
- **Recursos:** CRUD completo, Calendário, Estatísticas, Disponibilidade

### 👥 Clientes (14 operações)
- **Métodos:** GET: 9, POST: 3, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Histórico, Estatísticas, Aniversários, Import/Export

### 🏢 Empresas (14 operações)
- **Métodos:** GET: 7, POST: 3, PUT: 2, DELETE: 2
- **Recursos:** CRUD, Estatísticas, Toggle Status

### 📦 Produtos (14 operações)
- **Métodos:** GET: 5, POST: 3, PUT: 3, DELETE: 3
- **Recursos:** CRUD, Categorias, Marcas, Ajuste de Estoque

### 🛎️ Serviços (15 operações)
- **Métodos:** GET: 8, POST: 2, PUT: 2, DELETE: 3
- **Recursos:** CRUD, Categorias, Serviços Públicos

### 💳 Pagamentos (13 operações)
- **Métodos:** GET: 4, POST: 4, PUT: 1, DELETE: 4
- **Recursos:** CRUD, Planos, Assinaturas, Webhooks, Reembolsos

### 📄 Documentos (13 operações)
- **Métodos:** GET: 3, POST: 6, PUT: 2, DELETE: 2
- **Recursos:** CRUD, Templates, Busca, Envio

### 💬 WhatsApp (22 operações)
- **Métodos:** GET: 8, POST: 6, PUT: 1, DELETE: 7
- **Recursos:** Campanhas, Providers, Templates, Marketing Automatizado

### 👨‍⚕️ Profissionais (9 operações)
- **Métodos:** GET: 5, POST: 2, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Agenda, Estatísticas, Profissionais Públicos

### 👤 Usuários (9 operações)
- **Métodos:** GET: 5, POST: 1, PUT: 2, DELETE: 1
- **Recursos:** CRUD, Perfil (/me), Profissionais Disponíveis

### 💸 Despesas (10 operações)
- **Métodos:** GET: 4, POST: 2, PUT: 2, DELETE: 2
- **Recursos:** CRUD, Categorias, Relatórios

### 💰 Comissões (10 operações)
- **Métodos:** GET: 5, POST: 3, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Cálculo, Pagamento, Relatórios

### 📦 Pacotes (10 operações)
- **Métodos:** GET: 3, POST: 3, PUT: 2, DELETE: 2
- **Recursos:** CRUD, Pacotes Predefinidos, Uso de Sessões

### 🎁 Promoções (7 operações)
- **Métodos:** GET: 1, POST: 4, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Ativar/Desativar, Aplicar

### ⭐ Avaliações (8 operações)
- **Métodos:** GET: 1, POST: 4, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Aprovar/Rejeitar, Responder, Estatísticas

### 🔔 Notificações (8 operações)
- **Métodos:** GET: 3, PUT: 2, DELETE: 2
- **Recursos:** Listar, Marcar como Lida, Deletar, Contador

### 📊 Relatórios (8 operações)
- **Métodos:** GET: 8
- **Recursos:** Por Cliente, Por Profissional, Por Serviço, Comissões, Consolidado, Despesas, Resultados Financeiros, Previsão de Receita

### 🔔 Push Notifications (9 operações)
- **Métodos:** GET: 4, POST: 4, DELETE: 1
- **Recursos:** Enviar, Inscrever, Logs, Estatísticas, VAPID Key

### 🎯 Metas (5 operações)
- **Métodos:** GET: 2, POST: 1, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Progresso

### 💎 Fidelidade (7 operações)
- **Métodos:** GET: 3, POST: 2, PUT: 1, DELETE: 1
- **Recursos:** CRUD, Pontos por Cliente, Resgatar, Relatórios

### 📦 Estoque (4 operações)
- **Métodos:** GET: 1, POST: 1, PUT: 1, DELETE: 1
- **Recursos:** Movimentações

---

## 🌐 Endpoints Especiais

### 🏥 Health Check
- `GET /health` - Status do sistema

### 📚 Documentação
- `GET /docs` - Swagger UI
- `GET /openapi.json` - Especificação OpenAPI

### 🌍 Agendamento Online (12 operações)
- Configuração
- Galeria de Imagens
- Links Públicos
- Disponibilidade
- Serviços Disponíveis/Indisponíveis

### ⚙️ Configurações (11 operações)
- Admin Settings
- Financial Settings
- Notification Settings
- Theme Settings
- Company Details
- All Settings

### 📋 Planos e Assinaturas (12 operações)
- Listar Planos
- Assinatura Atual
- Upgrade/Downgrade
- Limites e Uso
- Verificar Features
- Adicionar Profissional

### 📤 Uploads (8 operações)
- Avatar de Cliente
- Avatar de Profissional
- Imagem de Produto
- Imagem de Serviço
- Documentos
- Templates
- Imagens Gerais
- Deletar Arquivo

---

## 📊 Análise por Complexidade

### Recursos Simples (< 5 operações)
- Health Check (1)
- Estoque (4)

### Recursos Médios (5-10 operações)
- Metas (5)
- Promoções (7)
- Fidelidade (7)
- Avaliações (8)
- Notificações (8)
- Relatórios (8)
- Profissionais (9)
- Usuários (9)
- Push Notifications (9)
- Comissões (10)
- Despesas (10)
- Pacotes (10)

### Recursos Complexos (> 10 operações)
- Online Booking (12)
- Pagamentos (12)
- Planos (12)
- Subscription Sales (12)
- Documentos (13)
- Clientes (13)
- Produtos (13)
- Empresas (14)
- Serviços (15)
- SaaS Admin (15)
- Appointments (16)
- WhatsApp (16)
- WhatsApp Marketing (6)
- Financeiro (25)

---

## 🎯 Conclusões

### Pontos Fortes
1. **Sistema Completo:** 240 endpoints cobrem todas as necessidades de um sistema SaaS de agendamento
2. **Bem Estruturado:** Organização clara por categorias e recursos
3. **CRUD Completo:** Maioria dos recursos possui operações completas (Create, Read, Update, Delete)
4. **Recursos Avançados:** WhatsApp, Push Notifications, Fidelidade, Comissões
5. **Multi-tenant:** Suporte completo para SaaS Admin

### Áreas de Destaque
1. **Financeiro:** Módulo mais robusto com 28 operações
2. **WhatsApp:** 22 operações para marketing e comunicação
3. **Agendamentos:** Core business com 17 operações
4. **SaaS Admin:** 15 operações para gestão multi-tenant

### Distribuição Equilibrada
- **40% GET** - Leitura de dados
- **30% POST** - Criação e ações
- **3% PUT** - Atualizações
- **1% DELETE** - Remoções
- **26% Outros** - Operações mistas

---

## 📝 Observações

1. **Autenticação:** 8 endpoints diferentes para login/registro, incluindo mobile
2. **Relatórios:** 8 tipos diferentes de relatórios disponíveis
3. **Integrações:** WhatsApp, Push Notifications, Pagamentos
4. **Gestão Completa:** Desde agendamentos até controle financeiro
5. **Multi-canal:** Web, Mobile, API pública

---

**Última Atualização:** 12 de Janeiro de 2026  
**Fonte:** Documentação OpenAPI do VPS (http://72.62.138.239/openapi.json)
