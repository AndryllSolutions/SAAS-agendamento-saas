# 🚀 Roadmap Executivo - SaaS Profissional

## 📊 Situação Atual

### ✅ Base Sólida (70% dos SaaS de agência)
- Planos definidos (FREE, BASIC, PRO, PREMIUM)
- Trial básico
- MRR agregado simples
- Painel admin funcional
- RBAC implementado
- Multi-tenant funcionando

### ❌ Gaps Críticos (Impedem Escala)
- Sem ciclo de vida de assinatura
- Sem enforcement real de limites
- Sem histórico de mudanças
- Sem métricas SaaS profissionais
- Sem sistema de add-ons
- Sem financeiro SaaS
- Sem previsão de churn

---

## 🎯 Roadmap em 4 Sprints (8 Semanas)

### **SPRINT 1 - Fundação Billing** (Semanas 1-2) 🔴 CRÍTICO

#### Objetivo
Transformar billing de "on/off" para ciclo de vida completo.

#### Entregas
1. **Estados de Assinatura** (3 dias)
   - Implementar 7 estados: `trialing`, `active`, `past_due`, `suspended`, `canceled`, `grace_period`, `expired`
   - Máquina de estados com transições válidas
   - Migration: adicionar campo `status` em `company_subscriptions`

2. **Timeline de Assinatura** (2 dias)
   - Criar tabela `subscription_timeline`
   - Registrar todos os eventos (criação, trial, pagamentos, mudanças)
   - Endpoint GET `/companies/{id}/subscription/timeline`

3. **Enforcement de Limites** (3 dias)
   - Implementar `LimitEnforcement` middleware
   - Bloquear criação de usuários ao exceder
   - Bloquear criação de profissionais ao exceder
   - Bloquear features por plano (módulo financeiro, WhatsApp, etc)
   - Adicionar verificação em TODOS os endpoints relevantes

4. **MRR Correto** (2 dias)
   - Criar tabela `mrr_snapshots`
   - Implementar `MRRCalculator` com MRR bruto, líquido, por status
   - Celery task diária para snapshot
   - Dashboard mostrando MRR real

#### Critérios de Sucesso
- ✅ Empresa em trial não pode virar "active" manualmente
- ✅ Empresa FREE não consegue adicionar 3º usuário
- ✅ Empresa BASIC não acessa módulo WhatsApp
- ✅ Dashboard mostra MRR líquido correto
- ✅ Timeline mostra histórico completo de uma assinatura

#### Impacto
- **Redução de fraude de plano**: 100%
- **Redução de tickets de suporte**: 40%
- **Precisão de MRR**: 95%+

---

### **SPRINT 2 - Métricas e Governança** (Semanas 3-4) 🟡 IMPORTANTE

#### Objetivo
Adicionar visibilidade comercial e auditoria.

#### Entregas
1. **Upgrade/Downgrade** (3 dias)
   - Criar tabela `plan_changes`
   - Implementar cálculo de prorrata
   - Endpoint POST `/billing/change-plan`
   - Upgrade imediato, downgrade no próximo ciclo
   - Registrar no timeline

2. **Métricas SaaS** (4 dias)
   - ARPU (Average Revenue Per User)
   - LTV (Lifetime Value)
   - Retenção por plano (30d, 90d)
   - Conversão Trial → Pago
   - Upgrade Rate / Downgrade Rate
   - Dashboard de métricas

3. **Auditoria Admin** (3 dias)
   - Completar implementação de `audit_logs`
   - Adicionar logging em todos os endpoints críticos
   - Dashboard de audit logs no SaaS Admin
   - Filtros por usuário, ação, data

#### Critérios de Sucesso
- ✅ Cliente pode fazer upgrade PRO → PREMIUM e pagar prorrata
- ✅ Dashboard mostra ARPU, LTV, Retenção
- ✅ Conversão trial → pago visível
- ✅ Toda ação de admin é auditada

#### Impacto
- **Visibilidade comercial**: Total
- **Compliance LGPD**: 100%
- **Flexibilidade de planos**: Completa

---

### **SPRINT 3 - Monetização Avançada** (Semanas 5-6) 🟢 EXPANSÃO

#### Objetivo
Desbloquear receita adicional via add-ons e cupons.

#### Entregas
1. **Sistema de Add-ons** (4 dias)
   - Criar tabelas `addons` e `company_addons`
   - 6 add-ons padrão:
     - WhatsApp Marketing (R$ 29,90/mês)
     - Profissional Extra (R$ 19,90/mês)
     - Unidade Extra (R$ 49,90/mês)
     - Relatórios Avançados (R$ 39,90/mês)
     - Acesso API (R$ 99,90/mês)
     - Domínio Personalizado (R$ 19,90/mês)
   - Endpoint GET `/addons` (lista disponíveis)
   - Endpoint POST `/billing/addons/{addon_id}/subscribe`
   - Endpoint DELETE `/billing/addons/{addon_id}/unsubscribe`

2. **Financeiro SaaS** (3 dias)
   - Criar tabela `saas_ledger`
   - Registrar todas as transações (assinaturas, add-ons, upgrades)
   - Suporte a reembolsos e chargebacks
   - Dashboard financeiro

3. **Cupons e Descontos** (3 dias)
   - Criar tabela `coupons`
   - Tipos: percentual, valor fixo, trial estendido
   - Validação de cupom no checkout
   - Rastreamento de uso

#### Critérios de Sucesso
- ✅ Cliente pode adicionar "WhatsApp Marketing" ao plano BASIC
- ✅ MRR inclui add-ons
- ✅ Cupom "PROMO30" dá 30% de desconto
- ✅ Ledger registra todas as transações

#### Impacto
- **Aumento de receita**: 20-30%
- **ARPU**: +R$ 30-50
- **Flexibilidade comercial**: Total

---

### **SPRINT 4 - Inteligência Comercial** (Semanas 7-8) 🔵 CRESCIMENTO

#### Objetivo
Prever churn e identificar oportunidades de upsell.

#### Entregas
1. **Health Score** (3 dias)
   - Criar tabela `company_health`
   - Implementar `HealthScoreCalculator`
   - 4 componentes:
     - Usage Score (uso da plataforma)
     - Engagement Score (usuários ativos)
     - Payment Score (histórico de pagamentos)
     - Support Score (tickets abertos)
   - Score 0-100
   - Celery task diária

2. **Churn Prediction** (2 dias)
   - Calcular probabilidade de churn (0-100%)
   - Classificar risco: low, medium, high, critical
   - Alertas automáticos para empresas em risco

3. **Painel Comercial** (3 dias)
   - Dashboard "Empresas em Risco"
   - Lista "Trial Expirando em 7 dias"
   - Recomendações de upsell
   - Health score por empresa
   - Ações sugeridas (contatar, upsell, monitorar)

4. **Automações** (2 dias)
   - Email automático: trial expirando
   - Email automático: empresa em risco
   - Email automático: sugestão de upgrade

#### Critérios de Sucesso
- ✅ Empresa com health score < 30 aparece em "Risco Crítico"
- ✅ Dashboard mostra 5 empresas com maior probabilidade de churn
- ✅ Recomendação de upgrade aparece para empresa usando 90% do limite
- ✅ Email automático enviado 3 dias antes do trial expirar

#### Impacto
- **Redução de churn**: 15-25%
- **Aumento de upgrades**: 30-40%
- **Proatividade comercial**: Total

---

## 📈 Impacto Esperado (8 Semanas)

### Financeiro
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| MRR | R$ 0 | R$ 5.000+ | - |
| ARPU | - | R$ 80-120 | - |
| Receita Add-ons | R$ 0 | R$ 1.500+ | +30% MRR |
| Churn Rate | ? | < 5% | Controlado |

### Operacional
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Tickets Suporte | Alto | -60% | Menos dúvidas |
| Fraude de Plano | Possível | 0% | Bloqueado |
| Tempo de Resposta | Manual | Automático | -80% |
| Visibilidade | Baixa | Total | 100% |

### Comercial
| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Conversão Trial | ? | Visível | Otimizável |
| Upgrade Rate | ? | 20-30% | Rastreado |
| Churn Previsto | Não | Sim | Proativo |
| Upsell | Manual | Automático | Escalável |

---

## 🛠️ Stack Técnica

### Backend
- **Novos Modelos**: 10 tabelas
  - `subscription_timeline`
  - `mrr_snapshots`
  - `plan_changes`
  - `addons`
  - `company_addons`
  - `saas_ledger`
  - `coupons`
  - `coupon_usage`
  - `company_health`
  - `audit_logs` (já iniciado)

- **Novos Serviços**: 6 classes
  - `SubscriptionLifecycle`
  - `MRRCalculator`
  - `LimitEnforcement`
  - `PlanChangeService`
  - `HealthScoreCalculator`
  - `ChurnPredictor`

- **Novos Endpoints**: ~20 endpoints
  - Timeline, Métricas, Upgrade/Downgrade, Add-ons, Cupons, Health Score

- **Celery Tasks**: 3 tasks
  - Daily MRR snapshot
  - Daily health score calculation
  - Trial expiration emails

### Frontend
- **Novas Páginas**: 5 páginas
  - `/saas-admin/metrics` - Métricas SaaS
  - `/saas-admin/health` - Health Score
  - `/saas-admin/audit-logs` - Auditoria
  - `/saas-admin/addons` - Gerenciar Add-ons
  - `/saas-admin/financial` - Ledger SaaS

- **Componentes**: 10+ componentes
  - Timeline de assinatura
  - Gráficos de métricas
  - Health score badge
  - Add-on card
  - Upgrade modal

---

## 🚫 O que NÃO Fazer (Evitar Desperdício)

### ❌ Não Priorizar Agora
1. **Mais planos** - 4 planos são suficientes
2. **Mais telas bonitas** - Foco em funcionalidade
3. **Mais módulos para cliente** - Foco em SaaS Admin
4. **Internacionalização** - Só BR por enquanto
5. **Marketplace** - Muito cedo
6. **White label** - Não é prioridade
7. **Mobile app** - Web responsivo é suficiente

### ✅ Priorizar Sempre
1. **Robustez** sobre features
2. **Métricas** sobre dashboards bonitos
3. **Enforcement** sobre confiança
4. **Auditoria** sobre velocidade
5. **Previsibilidade** sobre crescimento rápido

---

## 📋 Checklist de Implementação

### Sprint 1 - Fundação Billing
- [ ] Migration: adicionar `status` em `company_subscriptions`
- [ ] Implementar enum `SubscriptionStatus`
- [ ] Implementar `SubscriptionLifecycle`
- [ ] Criar tabela `subscription_timeline`
- [ ] Implementar registro automático de eventos
- [ ] Criar `LimitEnforcement` middleware
- [ ] Adicionar enforcement em endpoints de usuários
- [ ] Adicionar enforcement em endpoints de profissionais
- [ ] Adicionar enforcement em features (financeiro, WhatsApp)
- [ ] Criar tabela `mrr_snapshots`
- [ ] Implementar `MRRCalculator`
- [ ] Criar Celery task para snapshot diário
- [ ] Atualizar dashboard com MRR correto
- [ ] Endpoint GET `/companies/{id}/subscription/timeline`
- [ ] Testar transições de estado
- [ ] Testar bloqueio de limites
- [ ] Testar cálculo de MRR

### Sprint 2 - Métricas e Governança
- [ ] Criar tabela `plan_changes`
- [ ] Implementar `PlanChangeService`
- [ ] Implementar cálculo de prorrata
- [ ] Endpoint POST `/billing/change-plan`
- [ ] Implementar `SaaSMetrics.calculate_arpu()`
- [ ] Implementar `SaaSMetrics.calculate_ltv()`
- [ ] Implementar `SaaSMetrics.calculate_retention_by_plan()`
- [ ] Implementar `SaaSMetrics.calculate_trial_conversion()`
- [ ] Endpoint GET `/saas-admin/metrics/overview`
- [ ] Criar página `/saas-admin/metrics`
- [ ] Completar migrations de `audit_logs`
- [ ] Adicionar logging em todos os endpoints críticos
- [ ] Criar página `/saas-admin/audit-logs`
- [ ] Testar upgrade com prorrata
- [ ] Testar downgrade no próximo ciclo
- [ ] Validar métricas SaaS

### Sprint 3 - Monetização Avançada
- [ ] Criar tabelas `addons` e `company_addons`
- [ ] Seed: inserir 6 add-ons padrão
- [ ] Endpoint GET `/addons`
- [ ] Endpoint POST `/billing/addons/{id}/subscribe`
- [ ] Endpoint DELETE `/billing/addons/{id}/unsubscribe`
- [ ] Criar tabela `saas_ledger`
- [ ] Registrar transações de assinatura
- [ ] Registrar transações de add-ons
- [ ] Suporte a reembolsos
- [ ] Criar tabela `coupons`
- [ ] Endpoint POST `/billing/validate-coupon`
- [ ] Aplicar desconto no checkout
- [ ] Criar página `/saas-admin/addons`
- [ ] Criar página `/saas-admin/financial`
- [ ] Testar compra de add-on
- [ ] Testar aplicação de cupom
- [ ] Validar ledger completo

### Sprint 4 - Inteligência Comercial
- [ ] Criar tabela `company_health`
- [ ] Implementar `HealthScoreCalculator`
- [ ] Implementar cálculo de usage_score
- [ ] Implementar cálculo de engagement_score
- [ ] Implementar cálculo de payment_score
- [ ] Implementar cálculo de support_score
- [ ] Implementar classificação de churn risk
- [ ] Celery task diária para health score
- [ ] Endpoint GET `/saas-admin/companies/{id}/health`
- [ ] Endpoint GET `/saas-admin/health/at-risk`
- [ ] Criar página `/saas-admin/health`
- [ ] Dashboard "Empresas em Risco"
- [ ] Lista "Trial Expirando"
- [ ] Recomendações de upsell
- [ ] Email automático: trial expirando
- [ ] Email automático: empresa em risco
- [ ] Testar cálculo de health score
- [ ] Testar previsão de churn
- [ ] Validar automações

---

## 🎯 KPIs de Sucesso

### Após Sprint 1
- [ ] 0 fraudes de plano detectadas
- [ ] MRR calculado com precisão de 95%+
- [ ] 100% das transições de estado auditadas
- [ ] Redução de 40% em tickets de suporte sobre limites

### Após Sprint 2
- [ ] ARPU calculado e visível
- [ ] LTV estimado disponível
- [ ] Taxa de conversão trial → pago rastreada
- [ ] 100% das ações admin auditadas

### Após Sprint 3
- [ ] Pelo menos 1 add-on vendido
- [ ] MRR de add-ons > R$ 500
- [ ] Ledger com 100% das transações
- [ ] Pelo menos 1 cupom usado

### Após Sprint 4
- [ ] Health score calculado para 100% das empresas
- [ ] Pelo menos 3 empresas identificadas em risco
- [ ] Pelo menos 1 upsell recomendado
- [ ] Email de trial expirando enviado automaticamente

---

## 💰 Investimento vs. Retorno

### Investimento
- **Tempo**: 8 semanas (2 meses)
- **Esforço**: 1 dev full-time
- **Custo**: ~R$ 20.000 (se terceirizado)

### Retorno Esperado (12 meses)
- **MRR Ano 1**: R$ 60.000+
- **Receita Add-ons**: R$ 18.000+
- **Redução Churn**: R$ 15.000+ (receita salva)
- **Total**: R$ 93.000+

**ROI**: 365% em 12 meses

---

## 🚀 Próximos Passos Imediatos

1. **Revisar e aprovar roadmap** (1 dia)
2. **Priorizar sprints** (se necessário ajustar)
3. **Iniciar Sprint 1** (segunda-feira)
4. **Daily standups** (15min/dia)
5. **Review semanal** (sexta-feira)

---

**Criado em:** 24/01/2026  
**Tipo:** Roadmap Executivo  
**Status:** Proposta para Aprovação  
**Próxima Revisão:** Após Sprint 1
