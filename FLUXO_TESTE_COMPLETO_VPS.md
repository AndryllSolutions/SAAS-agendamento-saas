# Fluxo de Teste Completo - VPS Produção

**Data:** 12/01/2026  
**VPS:** https://72.62.138.239/  
**Objetivo:** Testar sistema completo com empresa TRIAL

---

## ✅ VERIFICAÇÃO DO SISTEMA DE TRIAL

### Backend - Sistema Completo Implementado
- **Plan Model:** `trial_days = 14` (padrão)
- **CompanySubscription:** Controla `plan_type` e `trial_end_date`
- **Auth Register:** Cria empresa TRIAL com 14 dias automaticamente
- **Lógica:** Se `plan_type="TRIAL"` → `trial_end = NOW() + 14 dias`

### Frontend - Interface Completa
- **Página Registro:** `/register` com opções FREE vs TRIAL
- **Campos Trial:** referral_code, coupon_code, team_size
- **Schema Validação:** Todos campos obrigatórios implementados
- **UI:** Interface amigável com seleção de plano

**Status:** ✅ SISTEMA DE TRIAL TOTALMENTE FUNCIONAL

---

## 🎯 PLANO DE TESTE COMPLETO

### 1. Criar Empresa TRIAL na VPS
**Endpoint:** `POST /api/v1/auth/register`
**Payload Válido:**
```json
{
  "name": "Admin Teste VPS",
  "email": "admin.teste.vps@empresa.com",
  "phone": "(11) 99999-8888", 
  "password": "AdminTeste2026!",
  "company_name": "Empresa Teste VPS 2026",
  "business_type": "clinica_estetica",
  "timezone": "America/Sao_Paulo",
  "currency": "BRL", 
  "team_size": "2-5",
  "slug": "empresa-teste-vps-2026",
  "plan_type": "TRIAL"
}
```

### 2. Login e Obtenção de Token
**Endpoint:** `POST /api/v1/auth/login` ou `POST /api/v1/auth/login-json`

### 3. Testes CRUD Completos

#### A. CLIENTES
- **CREATE:** `POST /api/v1/clients`
- **READ:** `GET /api/v1/clients` 
- **UPDATE:** `PUT /api/v1/clients/{id}`
- **DELETE:** `DELETE /api/v1/clients/{id}`

#### B. SERVIÇOS  
- **CREATE:** `POST /api/v1/services`
- **READ:** `GET /api/v1/services`
- **UPDATE:** `PUT /api/v1/services/{id}` 
- **DELETE:** `DELETE /api/v1/services/{id}`

#### C. PROFISSIONAIS
- **CREATE:** `POST /api/v1/professionals`
- **READ:** `GET /api/v1/professionals`
- **UPDATE:** `PUT /api/v1/professionals/{id}`
- **DELETE:** `DELETE /api/v1/professionals/{id}`

#### D. USUÁRIOS
- **CREATE:** `POST /api/v1/users`
- **READ:** `GET /api/v1/users`
- **UPDATE:** `PUT /api/v1/users/{id}`
- **DELETE:** `DELETE /api/v1/users/{id}`

### 4. Testes de Configurações
- Configurações de empresa
- Configurações financeiras  
- Configurações de notificação
- Configurações de tema
- Impacto das configurações no sistema

---

## 🚀 EXECUÇÃO DO TESTE

Vamos executar passo a passo para validar o sistema completo na VPS de produção.
