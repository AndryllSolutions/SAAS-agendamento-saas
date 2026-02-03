/**
 * EXEMPLOS DE USO DO FEATUREWRAPPER
 * 
 * Este arquivo contém exemplos práticos de como usar o FeatureWrapper
 * em diferentes cenários. NÃO IMPORTAR ESTE ARQUIVO NO CÓDIGO REAL.
 */

import { FeatureWrapper } from '@/components/features'
import { useFeatureGuard } from '@/hooks/useFeatureGuard'

// ============================================
// EXEMPLO 1: Proteger uma seção inteira (Modal)
// ============================================
function FinancialReportsPage() {
  return (
    <div className="container">
      <h1>Relatórios Financeiros</h1>
      
      {/* Se não tiver acesso, mostra modal de upgrade */}
      <FeatureWrapper feature="financial_complete">
        <FinancialReportsContent />
      </FeatureWrapper>
    </div>
  )
}

// ============================================
// EXEMPLO 2: Proteger com card inline (não modal)
// ============================================
function InvoicesSection() {
  return (
    <div className="space-y-4">
      <h2>Notas Fiscais</h2>
      
      {/* Mostra card inline ao invés de modal */}
      <FeatureWrapper feature="invoices" blockMode="card">
        <InvoicesList />
      </FeatureWrapper>
    </div>
  )
}

// ============================================
// EXEMPLO 3: Esconder completamente (hide)
// ============================================
function NavigationMenu() {
  return (
    <nav>
      <MenuItem href="/dashboard">Dashboard</MenuItem>
      <MenuItem href="/appointments">Agendamentos</MenuItem>
      
      {/* Esconde menu se não tiver acesso */}
      <FeatureWrapper feature="advanced_reports" blockMode="hide">
        <MenuItem href="/advanced-reports">Relatórios Avançados</MenuItem>
      </FeatureWrapper>
      
      <FeatureWrapper feature="crm_advanced" blockMode="hide">
        <MenuItem href="/crm">CRM Avançado</MenuItem>
      </FeatureWrapper>
    </nav>
  )
}

// ============================================
// EXEMPLO 4: Fallback customizado
// ============================================
function PricingIntelligence() {
  return (
    <FeatureWrapper 
      feature="pricing_intelligence"
      blockMode="custom"
      fallback={
        <div className="text-center p-8 border rounded">
          <h3>Precificação Inteligente</h3>
          <p>Descubra o preço ideal para seus serviços com IA</p>
          <button>Testar Grátis por 7 dias</button>
        </div>
      }
    >
      <PricingIntelligenceContent />
    </FeatureWrapper>
  )
}

// ============================================
// EXEMPLO 5: Loading compacto
// ============================================
function SmallFeatureButton() {
  return (
    <FeatureWrapper 
      feature="whatsapp_marketing" 
      blockMode="hide"
      compactLoading={true}
    >
      <button>Enviar WhatsApp</button>
    </FeatureWrapper>
  )
}

// ============================================
// EXEMPLO 6: Proteger página inteira com hook
// ============================================
function ProtectedCRMPage() {
  const { hasAccess, loading } = useFeatureGuard('crm_advanced', '/plans')
  
  if (loading) {
    return <div>Carregando...</div>
  }
  
  if (!hasAccess) {
    return null // Já foi redirecionado
  }
  
  return (
    <div>
      <h1>CRM Avançado</h1>
      {/* Conteúdo da página */}
    </div>
  )
}

// ============================================
// EXEMPLO 7: Página protegida com FeatureWrapper
// ============================================
function AutomatedCampaignsPage() {
  return (
    <FeatureWrapper feature="automatic_campaigns">
      <div>
        <h1>Campanhas Automáticas</h1>
        {/* Conteúdo */}
      </div>
    </FeatureWrapper>
  )
}

// ============================================
// EXEMPLO 8: Múltiplas features aninhadas
// ============================================
function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Card sempre visível */}
      <AppointmentsCard />
      
      {/* Card condicional - esconde se não tiver */}
      <FeatureWrapper feature="goals" blockMode="hide">
        <GoalsCard />
      </FeatureWrapper>
      
      {/* Card condicional - mostra upgrade inline */}
      <FeatureWrapper feature="cashback" blockMode="card">
        <CashbackCard />
      </FeatureWrapper>
      
      {/* Card condicional - esconde */}
      <FeatureWrapper feature="crm_advanced" blockMode="hide">
        <CRMCard />
      </FeatureWrapper>
    </div>
  )
}

// ============================================
// EXEMPLO 9: Título e descrição customizados
// ============================================
function OnlineBookingSection() {
  return (
    <FeatureWrapper 
      feature="online_booking"
      title="Agendamento Online 24/7"
      description="Deixe seus clientes agendarem direto pelo site, sem precisar ligar!"
    >
      <OnlineBookingConfig />
    </FeatureWrapper>
  )
}

// ============================================
// EXEMPLO 10: Com callback ao bloquear
// ============================================
function ReportsWithAnalytics() {
  const { hasAccess } = useFeatureGuard(
    'advanced_reports',
    '/plans',
    (requiredPlan) => {
      // Enviar analytics
      console.log(`Feature blocked: advanced_reports, required: ${requiredPlan}`)
      // analytics.track('feature_blocked', { feature: 'advanced_reports', requiredPlan })
    }
  )
  
  if (!hasAccess) return null
  
  return <AdvancedReports />
}

// Components fictícios para exemplos
const FinancialReportsContent = () => <div>Financial Reports</div>
const InvoicesList = () => <div>Invoices</div>
const MenuItem = ({ children, href }: any) => <a href={href}>{children}</a>
const PricingIntelligenceContent = () => <div>Pricing</div>
const AppointmentsCard = () => <div>Appointments</div>
const GoalsCard = () => <div>Goals</div>
const CashbackCard = () => <div>Cashback</div>
const CRMCard = () => <div>CRM</div>
const OnlineBookingConfig = () => <div>Online Booking</div>
const AdvancedReports = () => <div>Advanced Reports</div>
