# 🏗️ Arquitetura SaaS Profissional - 7 Pilares Críticos

## 📊 Status Atual vs. Necessário

### ✅ O que JÁ TEMOS (Base Sólida)
- Planos e preços definidos (FREE, BASIC, PRO, PREMIUM)
- Trial por plano (30 dias)
- MRR agregado básico
- Assinaturas por plano
- Churn básico
- Painel de empresas e usuários
- RBAC (Super Admin SaaS)
- Infraestrutura separada (multi-tenant)

**Posição:** Acima de 70% dos "SaaS de agência"

### 🎯 O que FALTA (Crítico para Escala)

---

## PILAR 1 - Billing REAL (Ciclo de Faturamento Completo)

### 1.1 Estados do Ciclo de Vida da Assinatura

#### Modelo de Dados Atual
```python
# backend/app/models/company_subscription.py
class CompanySubscription(Base):
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    plan_type = Column(String)  # FREE, BASIC, PRO, PREMIUM
    is_active = Column(Boolean)  # ❌ Muito simples
    trial_end_date = Column(DateTime)
    created_at = Column(DateTime)
```

#### Modelo Necessário
```python
from enum import Enum

class SubscriptionStatus(str, Enum):
    """Estados do ciclo de vida da assinatura"""
    TRIALING = "trialing"           # Em período de trial
    ACTIVE = "active"               # Ativa e pagando
    PAST_DUE = "past_due"          # Pagamento falhou, em grace period
    SUSPENDED = "suspended"         # Suspensa por inadimplência
    CANCELED = "canceled"           # Cancelada pelo cliente
    GRACE_PERIOD = "grace_period"   # Período de graça antes de suspender
    EXPIRED = "expired"             # Trial expirado sem conversão

class CompanySubscription(Base):
    __tablename__ = "company_subscriptions"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    # Plano e Status
    plan_type = Column(String(20), nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.TRIALING)
    
    # Datas do Ciclo
    trial_start_date = Column(DateTime)
    trial_end_date = Column(DateTime)
    activated_at = Column(DateTime)  # Quando virou paga
    suspended_at = Column(DateTime)
    canceled_at = Column(DateTime)
    expires_at = Column(DateTime)
    
    # Billing
    billing_cycle = Column(String(20), default="monthly")  # monthly, yearly
    next_billing_date = Column(DateTime)
    last_billing_date = Column(DateTime)
    billing_day = Column(Integer)  # Dia do mês para cobrar
    
    # Financeiro
    mrr = Column(Numeric(10, 2), default=0)  # MRR desta assinatura
    currency = Column(String(3), default="BRL")
    
    # Controle
    auto_renew = Column(Boolean, default=True)
    payment_method_id = Column(String)  # Referência ao método de pagamento
    
    # Cancelamento
    cancellation_reason = Column(String)  # OBRIGATÓRIO ao cancelar
    cancellation_feedback = Column(Text)
    canceled_by_user_id = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

#### Máquina de Estados
```python
# backend/app/core/subscription_lifecycle.py

class SubscriptionLifecycle:
    """
    Gerencia transições de estado da assinatura.
    Garante que mudanças de estado sejam válidas e auditadas.
    """
    
    VALID_TRANSITIONS = {
        SubscriptionStatus.TRIALING: [
            SubscriptionStatus.ACTIVE,      # Trial converteu
            SubscriptionStatus.EXPIRED,     # Trial expirou
            SubscriptionStatus.CANCELED     # Cancelou durante trial
        ],
        SubscriptionStatus.ACTIVE: [
            SubscriptionStatus.PAST_DUE,    # Pagamento falhou
            SubscriptionStatus.SUSPENDED,   # Suspensa manualmente
            SubscriptionStatus.CANCELED     # Cliente cancelou
        ],
        SubscriptionStatus.PAST_DUE: [
            SubscriptionStatus.ACTIVE,      # Pagamento recuperado
            SubscriptionStatus.GRACE_PERIOD,# Entrou em grace period
            SubscriptionStatus.SUSPENDED    # Não pagou
        ],
        SubscriptionStatus.GRACE_PERIOD: [
            SubscriptionStatus.ACTIVE,      # Pagamento recuperado
            SubscriptionStatus.SUSPENDED    # Grace period expirou
        ],
        SubscriptionStatus.SUSPENDED: [
            SubscriptionStatus.ACTIVE,      # Reativada
            SubscriptionStatus.CANCELED     # Cancelada definitivamente
        ],
        SubscriptionStatus.CANCELED: [],    # Estado final
        SubscriptionStatus.EXPIRED: [
            SubscriptionStatus.ACTIVE       # Reativou após expiração
        ]
    }
    
    @staticmethod
    def can_transition(from_status: SubscriptionStatus, to_status: SubscriptionStatus) -> bool:
        """Verifica se transição é válida"""
        return to_status in SubscriptionLifecycle.VALID_TRANSITIONS.get(from_status, [])
    
    @staticmethod
    def transition(
        subscription: CompanySubscription,
        new_status: SubscriptionStatus,
        reason: str,
        db: Session,
        user_context: CurrentUserContext
    ) -> bool:
        """
        Executa transição de estado com validação e auditoria.
        """
        if not SubscriptionLifecycle.can_transition(subscription.status, new_status):
            raise ValueError(
                f"Transição inválida: {subscription.status} -> {new_status}"
            )
        
        old_status = subscription.status
        subscription.status = new_status
        
        # Atualizar timestamps específicos
        now = datetime.utcnow()
        if new_status == SubscriptionStatus.ACTIVE:
            subscription.activated_at = now
        elif new_status == SubscriptionStatus.SUSPENDED:
            subscription.suspended_at = now
        elif new_status == SubscriptionStatus.CANCELED:
            subscription.canceled_at = now
        
        # Registrar no timeline
        timeline_event = SubscriptionTimeline(
            subscription_id=subscription.id,
            event_type="status_change",
            old_value=old_status.value,
            new_value=new_status.value,
            reason=reason,
            created_by_user_id=user_context.user_id
        )
        db.add(timeline_event)
        
        db.commit()
        return True
```

---

### 1.2 Timeline da Assinatura (Histórico Completo)

#### Modelo de Timeline
```python
# backend/app/models/subscription_timeline.py

class SubscriptionEventType(str, Enum):
    """Tipos de eventos no ciclo de vida"""
    CREATED = "created"
    TRIAL_STARTED = "trial_started"
    TRIAL_ENDED = "trial_ended"
    ACTIVATED = "activated"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    UPGRADED = "upgraded"
    DOWNGRADED = "downgraded"
    SUSPENDED = "suspended"
    REACTIVATED = "reactivated"
    CANCELED = "canceled"
    REFUNDED = "refunded"
    ADDON_ADDED = "addon_added"
    ADDON_REMOVED = "addon_removed"

class SubscriptionTimeline(Base):
    """
    Histórico completo de eventos da assinatura.
    Cada mudança gera um registro aqui.
    """
    __tablename__ = "subscription_timeline"
    
    id = Column(Integer, primary_key=True)
    subscription_id = Column(Integer, ForeignKey("company_subscriptions.id"))
    
    # Evento
    event_type = Column(Enum(SubscriptionEventType), nullable=False)
    event_date = Column(DateTime, default=datetime.utcnow)
    
    # Mudança
    old_value = Column(String)
    new_value = Column(String)
    
    # Contexto
    reason = Column(Text)
    metadata = Column(JSON)  # Dados adicionais do evento
    
    # Quem fez
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    created_by_admin = Column(Boolean, default=False)  # Foi admin SaaS?
    
    # Financeiro (se aplicável)
    amount = Column(Numeric(10, 2))
    currency = Column(String(3))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    subscription = relationship("CompanySubscription", backref="timeline")
    created_by = relationship("User")
```

#### Endpoint para Timeline
```python
# backend/app/api/v1/endpoints/saas_admin.py

@router.get("/companies/{company_id}/subscription/timeline")
async def get_subscription_timeline(
    company_id: int,
    context: CurrentUserContext = Depends(require_saas_admin),
    db: Session = Depends(get_db)
):
    """
    Retorna timeline completa da assinatura.
    
    Mostra:
    - Criação
    - Trial (início/fim)
    - Pagamentos (sucesso/falha)
    - Upgrades/Downgrades
    - Suspensões/Reativações
    - Cancelamento
    """
    subscription = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    timeline = db.query(SubscriptionTimeline).filter(
        SubscriptionTimeline.subscription_id == subscription.id
    ).order_by(SubscriptionTimeline.event_date.desc()).all()
    
    return {
        "subscription_id": subscription.id,
        "current_status": subscription.status,
        "events": [
            {
                "id": event.id,
                "type": event.event_type,
                "date": event.event_date,
                "old_value": event.old_value,
                "new_value": event.new_value,
                "reason": event.reason,
                "amount": float(event.amount) if event.amount else None,
                "created_by": event.created_by.full_name if event.created_by else "System",
                "is_admin_action": event.created_by_admin
            }
            for event in timeline
        ]
    }
```

---

### 1.3 MRR Correto (Não Só Soma de Planos)

#### Modelo de MRR
```python
# backend/app/models/mrr_snapshot.py

class MRRSnapshot(Base):
    """
    Snapshot diário de MRR para análise histórica.
    Calculado todo dia às 00:00 UTC.
    """
    __tablename__ = "mrr_snapshots"
    
    id = Column(Integer, primary_key=True)
    snapshot_date = Column(Date, nullable=False, unique=True, index=True)
    
    # MRR Bruto
    mrr_gross = Column(Numeric(10, 2), default=0)  # Soma de todos os planos
    
    # MRR Líquido
    mrr_net = Column(Numeric(10, 2), default=0)  # Descontando trials e inadimplência
    
    # Breakdown
    mrr_from_trials = Column(Numeric(10, 2), default=0)  # MRR em trial (não conta)
    mrr_from_active = Column(Numeric(10, 2), default=0)  # MRR ativo
    mrr_from_past_due = Column(Numeric(10, 2), default=0)  # MRR inadimplente
    
    # Por Plano
    mrr_free = Column(Numeric(10, 2), default=0)
    mrr_basic = Column(Numeric(10, 2), default=0)
    mrr_pro = Column(Numeric(10, 2), default=0)
    mrr_premium = Column(Numeric(10, 2), default=0)
    
    # Movimentação (vs. dia anterior)
    new_mrr = Column(Numeric(10, 2), default=0)  # Novas assinaturas
    expansion_mrr = Column(Numeric(10, 2), default=0)  # Upgrades
    contraction_mrr = Column(Numeric(10, 2), default=0)  # Downgrades
    churned_mrr = Column(Numeric(10, 2), default=0)  # Cancelamentos
    
    # Contadores
    total_subscriptions = Column(Integer, default=0)
    active_subscriptions = Column(Integer, default=0)
    trialing_subscriptions = Column(Integer, default=0)
    past_due_subscriptions = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### Cálculo de MRR
```python
# backend/app/services/mrr_calculator.py

class MRRCalculator:
    """
    Calcula MRR corretamente considerando todos os estados.
    """
    
    PLAN_PRICES = {
        "FREE": 0.00,
        "BASIC": 49.90,
        "PRO": 99.90,
        "PREMIUM": 199.90
    }
    
    @staticmethod
    def calculate_current_mrr(db: Session) -> dict:
        """
        Calcula MRR atual (tempo real).
        """
        subscriptions = db.query(CompanySubscription).all()
        
        mrr_gross = 0
        mrr_net = 0
        mrr_by_status = {
            "trialing": 0,
            "active": 0,
            "past_due": 0
        }
        mrr_by_plan = {
            "FREE": 0,
            "BASIC": 0,
            "PRO": 0,
            "PREMIUM": 0
        }
        
        for sub in subscriptions:
            plan_price = MRRCalculator.PLAN_PRICES.get(sub.plan_type, 0)
            
            # MRR Bruto (todos os planos, exceto FREE)
            if sub.plan_type != "FREE":
                mrr_gross += plan_price
                mrr_by_plan[sub.plan_type] += plan_price
            
            # MRR Líquido (apenas ACTIVE)
            if sub.status == SubscriptionStatus.ACTIVE:
                mrr_net += plan_price
                mrr_by_status["active"] += plan_price
            elif sub.status == SubscriptionStatus.TRIALING:
                mrr_by_status["trialing"] += plan_price
            elif sub.status == SubscriptionStatus.PAST_DUE:
                mrr_by_status["past_due"] += plan_price
        
        return {
            "mrr_gross": float(mrr_gross),
            "mrr_net": float(mrr_net),
            "mrr_by_status": mrr_by_status,
            "mrr_by_plan": mrr_by_plan,
            "calculated_at": datetime.utcnow()
        }
    
    @staticmethod
    def create_daily_snapshot(db: Session):
        """
        Cria snapshot diário de MRR.
        Deve rodar todo dia às 00:00 UTC (Celery task).
        """
        today = date.today()
        
        # Verificar se já existe snapshot de hoje
        existing = db.query(MRRSnapshot).filter(
            MRRSnapshot.snapshot_date == today
        ).first()
        
        if existing:
            return existing
        
        # Calcular MRR atual
        mrr_data = MRRCalculator.calculate_current_mrr(db)
        
        # Contar assinaturas por status
        status_counts = db.query(
            CompanySubscription.status,
            func.count(CompanySubscription.id)
        ).group_by(CompanySubscription.status).all()
        
        total_subs = sum(count for _, count in status_counts)
        active_subs = next((count for status, count in status_counts if status == SubscriptionStatus.ACTIVE), 0)
        trialing_subs = next((count for status, count in status_counts if status == SubscriptionStatus.TRIALING), 0)
        past_due_subs = next((count for status, count in status_counts if status == SubscriptionStatus.PAST_DUE), 0)
        
        # Criar snapshot
        snapshot = MRRSnapshot(
            snapshot_date=today,
            mrr_gross=mrr_data["mrr_gross"],
            mrr_net=mrr_data["mrr_net"],
            mrr_from_active=mrr_data["mrr_by_status"]["active"],
            mrr_from_trials=mrr_data["mrr_by_status"]["trialing"],
            mrr_from_past_due=mrr_data["mrr_by_status"]["past_due"],
            mrr_free=mrr_data["mrr_by_plan"]["FREE"],
            mrr_basic=mrr_data["mrr_by_plan"]["BASIC"],
            mrr_pro=mrr_data["mrr_by_plan"]["PRO"],
            mrr_premium=mrr_data["mrr_by_plan"]["PREMIUM"],
            total_subscriptions=total_subs,
            active_subscriptions=active_subs,
            trialing_subscriptions=trialing_subs,
            past_due_subscriptions=past_due_subs
        )
        
        # Calcular movimentação (vs. ontem)
        yesterday = today - timedelta(days=1)
        yesterday_snapshot = db.query(MRRSnapshot).filter(
            MRRSnapshot.snapshot_date == yesterday
        ).first()
        
        if yesterday_snapshot:
            snapshot.new_mrr = max(0, snapshot.mrr_net - yesterday_snapshot.mrr_net)
            # TODO: Calcular expansion, contraction, churn detalhadamente
        
        db.add(snapshot)
        db.commit()
        
        return snapshot
```

---

## PILAR 2 - Métricas SaaS de Verdade

### 2.1 ARPU (Average Revenue Per User)

```python
# backend/app/services/saas_metrics.py

class SaaSMetrics:
    """
    Calcula métricas SaaS profissionais.
    """
    
    @staticmethod
    def calculate_arpu(db: Session, period_days: int = 30) -> dict:
        """
        ARPU = MRR / Total de Empresas Ativas
        """
        mrr_data = MRRCalculator.calculate_current_mrr(db)
        
        active_companies = db.query(CompanySubscription).filter(
            CompanySubscription.status == SubscriptionStatus.ACTIVE
        ).count()
        
        arpu = mrr_data["mrr_net"] / active_companies if active_companies > 0 else 0
        
        return {
            "arpu": round(arpu, 2),
            "mrr_net": mrr_data["mrr_net"],
            "active_companies": active_companies,
            "period_days": period_days
        }
```

### 2.2 LTV (Lifetime Value)

```python
@staticmethod
def calculate_ltv(db: Session) -> dict:
    """
    LTV = ARPU * Tempo Médio de Vida do Cliente (em meses)
    
    Simplificado: LTV = ARPU * (1 / Churn Rate Mensal)
    """
    arpu_data = SaaSMetrics.calculate_arpu(db)
    churn_data = SaaSMetrics.calculate_churn_rate(db, period_days=30)
    
    monthly_churn = churn_data["churn_rate"] / 100  # Converter para decimal
    
    if monthly_churn > 0:
        avg_lifetime_months = 1 / monthly_churn
        ltv = arpu_data["arpu"] * avg_lifetime_months
    else:
        ltv = 0  # Sem churn ainda
    
    return {
        "ltv": round(ltv, 2),
        "arpu": arpu_data["arpu"],
        "monthly_churn_rate": round(monthly_churn * 100, 2),
        "avg_lifetime_months": round(avg_lifetime_months, 1) if monthly_churn > 0 else 0
    }
```

### 2.3 Retenção por Plano

```python
@staticmethod
def calculate_retention_by_plan(db: Session, period_days: int = 30) -> dict:
    """
    Retenção = % de empresas que continuam ativas após X dias.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=period_days)
    
    retention_by_plan = {}
    
    for plan in ["BASIC", "PRO", "PREMIUM"]:
        # Empresas que começaram neste plano há X dias
        started = db.query(CompanySubscription).filter(
            CompanySubscription.plan_type == plan,
            CompanySubscription.created_at <= cutoff_date
        ).count()
        
        # Empresas que ainda estão ativas neste plano
        still_active = db.query(CompanySubscription).filter(
            CompanySubscription.plan_type == plan,
            CompanySubscription.created_at <= cutoff_date,
            CompanySubscription.status == SubscriptionStatus.ACTIVE
        ).count()
        
        retention_rate = (still_active / started * 100) if started > 0 else 0
        
        retention_by_plan[plan] = {
            "started": started,
            "still_active": still_active,
            "retention_rate": round(retention_rate, 2)
        }
    
    return {
        "period_days": period_days,
        "retention_by_plan": retention_by_plan
    }
```

### 2.4 Conversão Trial → Pago

```python
@staticmethod
def calculate_trial_conversion(db: Session) -> dict:
    """
    Conversão = % de trials que viraram assinaturas pagas.
    """
    # Trials que terminaram (trial_end_date < hoje)
    trials_ended = db.query(CompanySubscription).filter(
        CompanySubscription.trial_end_date < datetime.utcnow()
    ).count()
    
    # Trials que converteram (status = ACTIVE após trial)
    trials_converted = db.query(CompanySubscription).filter(
        CompanySubscription.trial_end_date < datetime.utcnow(),
        CompanySubscription.status == SubscriptionStatus.ACTIVE
    ).count()
    
    conversion_rate = (trials_converted / trials_ended * 100) if trials_ended > 0 else 0
    
    return {
        "trials_ended": trials_ended,
        "trials_converted": trials_converted,
        "conversion_rate": round(conversion_rate, 2)
    }
```

---

## PILAR 3 - Enforcement de Limites (Bloquear ao Exceder)

### 3.1 Modelo de Limites por Plano

```python
# backend/app/core/plan_limits.py

class PlanLimits:
    """
    Define limites hard-coded por plano.
    Em produção, isso viria do banco (tabela plans).
    """
    
    LIMITS = {
        "FREE": {
            "max_users": 2,
            "max_professionals": 2,
            "max_appointments_per_month": 100,
            "max_clients": 50,
            "features": {
                "financial_module": False,
                "whatsapp_marketing": False,
                "advanced_reports": False,
                "api_access": False,
                "custom_domain": False
            }
        },
        "BASIC": {
            "max_users": 5,
            "max_professionals": 5,
            "max_appointments_per_month": 500,
            "max_clients": 200,
            "features": {
                "financial_module": True,
                "whatsapp_marketing": False,
                "advanced_reports": False,
                "api_access": False,
                "custom_domain": False
            }
        },
        "PRO": {
            "max_users": 15,
            "max_professionals": 15,
            "max_appointments_per_month": -1,  # Ilimitado
            "max_clients": 1000,
            "features": {
                "financial_module": True,
                "whatsapp_marketing": True,
                "advanced_reports": True,
                "api_access": False,
                "custom_domain": False
            }
        },
        "PREMIUM": {
            "max_users": -1,  # Ilimitado
            "max_professionals": -1,  # Ilimitado
            "max_appointments_per_month": -1,  # Ilimitado
            "max_clients": -1,  # Ilimitado
            "features": {
                "financial_module": True,
                "whatsapp_marketing": True,
                "advanced_reports": True,
                "api_access": True,
                "custom_domain": True
            }
        }
    }
    
    @staticmethod
    def get_limit(plan_type: str, limit_key: str) -> int:
        """Retorna limite específico do plano"""
        return PlanLimits.LIMITS.get(plan_type, {}).get(limit_key, 0)
    
    @staticmethod
    def has_feature(plan_type: str, feature_key: str) -> bool:
        """Verifica se plano tem feature"""
        features = PlanLimits.LIMITS.get(plan_type, {}).get("features", {})
        return features.get(feature_key, False)
```

### 3.2 Enforcement Middleware

```python
# backend/app/core/enforcement.py

class LimitEnforcement:
    """
    Verifica e bloqueia ações que excedem limites do plano.
    """
    
    @staticmethod
    def check_user_limit(company_id: int, db: Session) -> bool:
        """
        Verifica se empresa pode adicionar mais usuários.
        Retorna True se pode, False se excedeu.
        """
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company_id
        ).first()
        
        if not subscription:
            return False
        
        max_users = PlanLimits.get_limit(subscription.plan_type, "max_users")
        
        # -1 = ilimitado
        if max_users == -1:
            return True
        
        current_users = db.query(User).filter(
            User.company_id == company_id,
            User.is_active == True
        ).count()
        
        return current_users < max_users
    
    @staticmethod
    def check_professional_limit(company_id: int, db: Session) -> bool:
        """Verifica limite de profissionais"""
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company_id
        ).first()
        
        if not subscription:
            return False
        
        max_professionals = PlanLimits.get_limit(subscription.plan_type, "max_professionals")
        
        if max_professionals == -1:
            return True
        
        current_professionals = db.query(Professional).filter(
            Professional.company_id == company_id,
            Professional.is_active == True
        ).count()
        
        return current_professionals < max_professionals
    
    @staticmethod
    def check_feature_access(company_id: int, feature_key: str, db: Session) -> bool:
        """
        Verifica se empresa tem acesso a feature.
        Usado em endpoints específicos.
        """
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company_id
        ).first()
        
        if not subscription:
            return False
        
        return PlanLimits.has_feature(subscription.plan_type, feature_key)
```

### 3.3 Uso nos Endpoints

```python
# backend/app/api/v1/endpoints/users.py

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db)
):
    """
    Criar usuário - COM ENFORCEMENT DE LIMITE
    """
    # ✅ VERIFICAR LIMITE ANTES DE CRIAR
    if not LimitEnforcement.check_user_limit(context.company_id, db):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "user_limit_exceeded",
                "message": "Você atingiu o limite de usuários do seu plano",
                "action": "upgrade_required",
                "upgrade_url": "/settings/billing"
            }
        )
    
    # Criar usuário normalmente
    new_user = User(**user_data.dict())
    db.add(new_user)
    db.commit()
    
    return new_user
```

```python
# backend/app/api/v1/endpoints/financial.py

@router.get("/financial/transactions")
async def list_transactions(
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db)
):
    """
    Listar transações financeiras - COM ENFORCEMENT DE FEATURE
    """
    # ✅ VERIFICAR SE PLANO TEM MÓDULO FINANCEIRO
    if not LimitEnforcement.check_feature_access(
        context.company_id, 
        "financial_module", 
        db
    ):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "feature_not_available",
                "message": "Módulo Financeiro não disponível no seu plano",
                "required_plan": "BASIC",
                "upgrade_url": "/settings/billing"
            }
        )
    
    # Retornar transações normalmente
    transactions = db.query(FinancialTransaction).filter(
        FinancialTransaction.company_id == context.company_id
    ).all()
    
    return transactions
```

---

## PILAR 4 - Upgrade, Downgrade e Add-ons

### 4.1 Modelo de Mudança de Plano

```python
# backend/app/models/plan_change.py

class PlanChangeType(str, Enum):
    UPGRADE = "upgrade"
    DOWNGRADE = "downgrade"

class PlanChange(Base):
    """
    Registro de mudanças de plano (upgrade/downgrade).
    """
    __tablename__ = "plan_changes"
    
    id = Column(Integer, primary_key=True)
    subscription_id = Column(Integer, ForeignKey("company_subscriptions.id"))
    
    # Mudança
    change_type = Column(Enum(PlanChangeType))
    from_plan = Column(String(20))
    to_plan = Column(String(20))
    
    # Financeiro
    old_price = Column(Numeric(10, 2))
    new_price = Column(Numeric(10, 2))
    prorated_amount = Column(Numeric(10, 2))  # Valor prorateado
    
    # Timing
    requested_at = Column(DateTime, default=datetime.utcnow)
    effective_date = Column(DateTime)  # Quando entra em vigor
    is_immediate = Column(Boolean, default=False)
    
    # Status
    status = Column(String(20), default="pending")  # pending, completed, failed
    
    # Quem solicitou
    requested_by_user_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
```

### 4.2 Lógica de Upgrade/Downgrade

```python
# backend/app/services/plan_change_service.py

class PlanChangeService:
    """
    Gerencia mudanças de plano com prorrata.
    """
    
    @staticmethod
    def calculate_proration(
        subscription: CompanySubscription,
        new_plan: str,
        db: Session
    ) -> dict:
        """
        Calcula valor prorateado para mudança de plano.
        
        Upgrade: Cobra diferença proporcional imediatamente
        Downgrade: Crédito aplicado no próximo ciclo
        """
        old_price = PlanLimits.LIMITS[subscription.plan_type].get("price", 0)
        new_price = PlanLimits.LIMITS[new_plan].get("price", 0)
        
        # Calcular dias restantes no ciclo atual
        today = datetime.utcnow()
        next_billing = subscription.next_billing_date
        days_remaining = (next_billing - today).days
        days_in_cycle = 30  # Simplificado
        
        # Prorrata
        old_daily_rate = old_price / days_in_cycle
        new_daily_rate = new_price / days_in_cycle
        
        prorated_amount = (new_daily_rate - old_daily_rate) * days_remaining
        
        return {
            "old_price": float(old_price),
            "new_price": float(new_price),
            "days_remaining": days_remaining,
            "prorated_amount": round(prorated_amount, 2),
            "is_upgrade": new_price > old_price,
            "effective_date": today if new_price > old_price else next_billing
        }
    
    @staticmethod
    def execute_plan_change(
        subscription_id: int,
        new_plan: str,
        immediate: bool,
        user_context: CurrentUserContext,
        db: Session
    ) -> PlanChange:
        """
        Executa mudança de plano.
        """
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.id == subscription_id
        ).first()
        
        if not subscription:
            raise ValueError("Subscription not found")
        
        # Calcular prorrata
        proration = PlanChangeService.calculate_proration(
            subscription, new_plan, db
        )
        
        # Criar registro de mudança
        plan_change = PlanChange(
            subscription_id=subscription_id,
            change_type=PlanChangeType.UPGRADE if proration["is_upgrade"] else PlanChangeType.DOWNGRADE,
            from_plan=subscription.plan_type,
            to_plan=new_plan,
            old_price=proration["old_price"],
            new_price=proration["new_price"],
            prorated_amount=proration["prorated_amount"],
            effective_date=proration["effective_date"],
            is_immediate=immediate,
            requested_by_user_id=user_context.user_id,
            status="pending"
        )
        db.add(plan_change)
        
        # Se for upgrade imediato, aplicar agora
        if proration["is_upgrade"] and immediate:
            subscription.plan_type = new_plan
            subscription.mrr = proration["new_price"]
            plan_change.status = "completed"
            
            # Registrar no timeline
            timeline_event = SubscriptionTimeline(
                subscription_id=subscription_id,
                event_type=SubscriptionEventType.UPGRADED,
                old_value=plan_change.from_plan,
                new_value=new_plan,
                amount=proration["prorated_amount"],
                created_by_user_id=user_context.user_id
            )
            db.add(timeline_event)
        
        db.commit()
        return plan_change
```

### 4.3 Endpoint de Upgrade/Downgrade

```python
# backend/app/api/v1/endpoints/billing.py

@router.post("/billing/change-plan")
async def change_plan(
    new_plan: str = Query(..., regex="^(BASIC|PRO|PREMIUM)$"),
    immediate: bool = Query(True),
    context: CurrentUserContext = Depends(get_current_user_context),
    db: Session = Depends(get_db)
):
    """
    Mudar plano da empresa.
    
    - Upgrade: Aplicado imediatamente com prorrata
    - Downgrade: Aplicado no próximo ciclo (ou imediato se solicitado)
    """
    subscription = db.query(CompanySubscription).filter(
        CompanySubscription.company_id == context.company_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    if subscription.plan_type == new_plan:
        raise HTTPException(status_code=400, detail="Already on this plan")
    
    # Calcular prorrata
    proration = PlanChangeService.calculate_proration(subscription, new_plan, db)
    
    # Executar mudança
    plan_change = PlanChangeService.execute_plan_change(
        subscription.id,
        new_plan,
        immediate,
        context,
        db
    )
    
    return {
        "success": True,
        "plan_change_id": plan_change.id,
        "from_plan": plan_change.from_plan,
        "to_plan": plan_change.to_plan,
        "prorated_amount": float(plan_change.prorated_amount),
        "effective_date": plan_change.effective_date,
        "is_immediate": plan_change.is_immediate,
        "message": "Upgrade aplicado imediatamente" if proration["is_upgrade"] 
                   else "Downgrade será aplicado no próximo ciclo"
    }
```

---

## PILAR 5 - Add-ons Desacoplados

### 5.1 Modelo de Add-ons

```python
# backend/app/models/addon.py

class AddOn(Base):
    """
    Add-ons disponíveis para compra.
    """
    __tablename__ = "addons"
    
    id = Column(Integer, primary_key=True)
    
    # Identificação
    slug = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Preço
    price_monthly = Column(Numeric(10, 2), nullable=False)
    price_yearly = Column(Numeric(10, 2))
    
    # Disponibilidade
    is_active = Column(Boolean, default=True)
    available_for_plans = Column(JSON)  # ["BASIC", "PRO", "PREMIUM"]
    
    # Metadata
    icon = Column(String)
    category = Column(String(50))  # "marketing", "features", "capacity"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

class CompanyAddOn(Base):
    """
    Add-ons contratados por empresa.
    """
    __tablename__ = "company_addons"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    addon_id = Column(Integer, ForeignKey("addons.id"))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Billing
    billing_cycle = Column(String(20), default="monthly")
    price = Column(Numeric(10, 2))
    next_billing_date = Column(DateTime)
    
    # Datas
    activated_at = Column(DateTime, default=datetime.utcnow)
    canceled_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", backref="addons")
    addon = relationship("AddOn")
```

### 5.2 Add-ons Padrão

```python
# backend/app/core/default_addons.py

DEFAULT_ADDONS = [
    {
        "slug": "whatsapp-marketing",
        "name": "WhatsApp Marketing",
        "description": "Envio de campanhas de marketing via WhatsApp",
        "price_monthly": 29.90,
        "price_yearly": 299.00,
        "available_for_plans": ["BASIC", "PRO", "PREMIUM"],
        "category": "marketing",
        "icon": "whatsapp"
    },
    {
        "slug": "extra-professional",
        "name": "Profissional Extra",
        "description": "Adicione mais 1 profissional ao seu plano",
        "price_monthly": 19.90,
        "price_yearly": 199.00,
        "available_for_plans": ["BASIC", "PRO"],
        "category": "capacity",
        "icon": "user-plus"
    },
    {
        "slug": "extra-unit",
        "name": "Unidade Extra",
        "description": "Adicione mais 1 unidade/filial",
        "price_monthly": 49.90,
        "price_yearly": 499.00,
        "available_for_plans": ["PRO", "PREMIUM"],
        "category": "capacity",
        "icon": "building"
    },
    {
        "slug": "advanced-reports",
        "name": "Relatórios Avançados",
        "description": "Relatórios personalizados e exportação avançada",
        "price_monthly": 39.90,
        "price_yearly": 399.00,
        "available_for_plans": ["BASIC", "PRO"],
        "category": "features",
        "icon": "chart-bar"
    },
    {
        "slug": "api-access",
        "name": "Acesso à API",
        "description": "Integre com sistemas externos via API REST",
        "price_monthly": 99.90,
        "price_yearly": 999.00,
        "available_for_plans": ["PRO", "PREMIUM"],
        "category": "features",
        "icon": "code"
    },
    {
        "slug": "custom-domain",
        "name": "Domínio Personalizado",
        "description": "Use seu próprio domínio (ex: agenda.suaempresa.com)",
        "price_monthly": 19.90,
        "price_yearly": 199.00,
        "available_for_plans": ["PRO", "PREMIUM"],
        "category": "features",
        "icon": "globe"
    }
]
```

---

## PILAR 6 - Financeiro SaaS (Ledger)

### 6.1 Modelo de Ledger

```python
# backend/app/models/saas_ledger.py

class SaaSTransactionType(str, Enum):
    SUBSCRIPTION_CHARGE = "subscription_charge"
    ADDON_CHARGE = "addon_charge"
    UPGRADE_CHARGE = "upgrade_charge"
    REFUND = "refund"
    CHARGEBACK = "chargeback"
    DISCOUNT = "discount"
    CREDIT = "credit"

class SaaSLedger(Base):
    """
    Ledger financeiro do SaaS.
    Registra todas as transações financeiras.
    """
    __tablename__ = "saas_ledger"
    
    id = Column(Integer, primary_key=True)
    
    # Empresa
    company_id = Column(Integer, ForeignKey("companies.id"))
    subscription_id = Column(Integer, ForeignKey("company_subscriptions.id"))
    
    # Transação
    transaction_type = Column(Enum(SaaSTransactionType))
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="BRL")
    
    # Descrição
    description = Column(Text)
    reference_id = Column(String)  # ID externo (gateway de pagamento)
    
    # Status
    status = Column(String(20), default="pending")  # pending, completed, failed, refunded
    
    # Datas
    transaction_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    paid_at = Column(DateTime)
    
    # Metadata
    metadata = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company")
    subscription = relationship("CompanySubscription")
```

---

## PILAR 7 - Health Score e Churn Prediction

### 7.1 Modelo de Health Score

```python
# backend/app/models/company_health.py

class CompanyHealth(Base):
    """
    Health Score da empresa.
    Calculado diariamente para prever churn.
    """
    __tablename__ = "company_health"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), unique=True)
    
    # Score (0-100)
    health_score = Column(Integer, default=50)
    
    # Componentes do Score
    usage_score = Column(Integer)  # Uso da plataforma
    engagement_score = Column(Integer)  # Engajamento dos usuários
    payment_score = Column(Integer)  # Histórico de pagamentos
    support_score = Column(Integer)  # Tickets de suporte
    
    # Risco de Churn
    churn_risk = Column(String(20))  # low, medium, high, critical
    churn_probability = Column(Numeric(5, 2))  # 0-100%
    
    # Recomendações
    recommended_action = Column(String)  # "contact", "upsell", "monitor"
    recommended_plan = Column(String)
    
    # Última atualização
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", backref="health")
```

### 7.2 Cálculo de Health Score

```python
# backend/app/services/health_score_calculator.py

class HealthScoreCalculator:
    """
    Calcula Health Score da empresa.
    """
    
    @staticmethod
    def calculate(company_id: int, db: Session) -> dict:
        """
        Calcula health score baseado em múltiplos fatores.
        """
        # 1. Usage Score (0-25 pontos)
        usage_score = HealthScoreCalculator._calculate_usage_score(company_id, db)
        
        # 2. Engagement Score (0-25 pontos)
        engagement_score = HealthScoreCalculator._calculate_engagement_score(company_id, db)
        
        # 3. Payment Score (0-25 pontos)
        payment_score = HealthScoreCalculator._calculate_payment_score(company_id, db)
        
        # 4. Support Score (0-25 pontos)
        support_score = HealthScoreCalculator._calculate_support_score(company_id, db)
        
        # Health Score Total
        health_score = usage_score + engagement_score + payment_score + support_score
        
        # Churn Risk
        if health_score >= 75:
            churn_risk = "low"
            churn_probability = 10
        elif health_score >= 50:
            churn_risk = "medium"
            churn_probability = 30
        elif health_score >= 25:
            churn_risk = "high"
            churn_probability = 60
        else:
            churn_risk = "critical"
            churn_probability = 90
        
        return {
            "health_score": health_score,
            "usage_score": usage_score,
            "engagement_score": engagement_score,
            "payment_score": payment_score,
            "support_score": support_score,
            "churn_risk": churn_risk,
            "churn_probability": churn_probability
        }
    
    @staticmethod
    def _calculate_usage_score(company_id: int, db: Session) -> int:
        """
        Score baseado em uso da plataforma (últimos 30 dias).
        """
        # Contar agendamentos criados
        appointments_count = db.query(Appointment).filter(
            Appointment.company_id == company_id,
            Appointment.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        # Normalizar (0-25)
        if appointments_count >= 100:
            return 25
        elif appointments_count >= 50:
            return 20
        elif appointments_count >= 20:
            return 15
        elif appointments_count >= 5:
            return 10
        else:
            return 5
    
    @staticmethod
    def _calculate_engagement_score(company_id: int, db: Session) -> int:
        """
        Score baseado em engajamento dos usuários.
        """
        # Usuários ativos (logaram nos últimos 7 dias)
        active_users = db.query(User).filter(
            User.company_id == company_id,
            User.last_login >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        total_users = db.query(User).filter(
            User.company_id == company_id
        ).count()
        
        if total_users == 0:
            return 0
        
        engagement_rate = (active_users / total_users) * 100
        
        # Normalizar (0-25)
        if engagement_rate >= 80:
            return 25
        elif engagement_rate >= 60:
            return 20
        elif engagement_rate >= 40:
            return 15
        elif engagement_rate >= 20:
            return 10
        else:
            return 5
    
    @staticmethod
    def _calculate_payment_score(company_id: int, db: Session) -> int:
        """
        Score baseado em histórico de pagamentos.
        """
        subscription = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == company_id
        ).first()
        
        if not subscription:
            return 0
        
        # Verificar status
        if subscription.status == SubscriptionStatus.ACTIVE:
            return 25
        elif subscription.status == SubscriptionStatus.TRIALING:
            return 20
        elif subscription.status == SubscriptionStatus.PAST_DUE:
            return 10
        else:
            return 0
    
    @staticmethod
    def _calculate_support_score(company_id: int, db: Session) -> int:
        """
        Score baseado em tickets de suporte.
        Muitos tickets = problema = score baixo
        """
        # Contar tickets abertos nos últimos 30 dias
        open_tickets = db.query(SupportTicket).filter(
            SupportTicket.company_id == company_id,
            SupportTicket.status == "open",
            SupportTicket.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        # Normalizar invertido (menos tickets = melhor)
        if open_tickets == 0:
            return 25
        elif open_tickets <= 2:
            return 20
        elif open_tickets <= 5:
            return 15
        elif open_tickets <= 10:
            return 10
        else:
            return 5
```

---

## 📋 Resumo de Implementação

### Sprint 1 (Obrigatório) - 2 semanas
1. ✅ Ciclo de vida da assinatura (7 estados)
2. ✅ Timeline da assinatura (histórico completo)
3. ✅ Enforcement de limites (bloquear ao exceder)
4. ✅ MRR correto (bruto, líquido, por status)

### Sprint 2 - 2 semanas
5. ✅ Upgrade/Downgrade com prorrata
6. ✅ Métricas SaaS (ARPU, LTV, Retenção, Conversão)
7. ✅ Auditoria admin (já iniciado)

### Sprint 3 - 2 semanas
8. ✅ Add-ons desacoplados
9. ✅ Financeiro SaaS (Ledger)
10. ✅ Cupons e descontos

### Sprint 4 - 2 semanas
11. ✅ Health Score
12. ✅ Churn Prediction
13. ✅ Painel comercial

---

## 🎯 Próximos Passos

1. **Revisar arquitetura proposta**
2. **Priorizar sprints**
3. **Criar migrations**
4. **Implementar modelos**
5. **Implementar serviços**
6. **Implementar endpoints**
7. **Criar frontend**
8. **Testar**

---

**Última Atualização:** 24/01/2026  
**Tipo:** Arquitetura de Produto SaaS Profissional  
**Status:** Proposta para Revisão
