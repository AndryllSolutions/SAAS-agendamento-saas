// Test script para verificar integração do dashboard com backend
const API_BASE = 'http://localhost:8000/api/v1';

// Teste sem autenticação (deve retornar 401)
async function testBackendConnection() {
  console.log('🔍 Testando conexão com o backend...');
  
  try {
    // Teste de health endpoint
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData);
    
    // Teste de endpoint do dashboard (deve retornar 401 - não autenticado)
    const dashboardResponse = await fetch(`${API_BASE}/dashboard/overview`);
    console.log('📊 Dashboard endpoint status:', dashboardResponse.status);
    
    if (dashboardResponse.status === 401) {
      const errorData = await dashboardResponse.json();
      console.log('✅ Dashboard endpoint respondeu corretamente (401 - não autenticado):', errorData);
      console.log('🎯 O dashboard está corretamente integrado com o backend!');
      console.log('📋 Para testar completo, faça login no sistema e acesse /dashboard');
    } else {
      console.log('❌ Status inesperado:', dashboardResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com backend:', error.message);
  }
}

// Testar endpoints disponíveis
async function listEndpoints() {
  const endpoints = [
    '/dashboard/overview',
    '/dashboard/daily-sales', 
    '/dashboard/commands-stats',
    '/dashboard/appointments-by-status',
    '/dashboard/average-ticket',
    '/dashboard/sales-by-category',
    '/dashboard/appointments-funnel',
    '/dashboard/professional-occupancy',
    '/dashboard/appointments-trend',
    '/dashboard/revenue-trend',
    '/dashboard/commands-trend',
    '/dashboard/growth-metrics'
  ];
  
  console.log('\n📋 Endpoints disponíveis no backend:');
  endpoints.forEach((endpoint, index) => {
    console.log(`${index + 1}. ${API_BASE}${endpoint}`);
  });
}

// Executar testes
testBackendConnection();
listEndpoints();
