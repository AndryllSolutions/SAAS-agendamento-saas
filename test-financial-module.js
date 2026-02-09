// Teste específico para o módulo financeiro
const API_BASE = 'http://localhost:8000/api/v1';

async function testFinancialModule() {
  console.log('🔍 Testando módulo financeiro...\n');

  const financialEndpoints = [
    '/financial/accounts',
    '/financial/payment-forms', 
    '/financial/categories',
    '/financial/transactions',
    '/financial/transactions/totals',
    '/financial/cash-registers',
    '/financial/dashboard'
  ];

  for (const endpoint of financialEndpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        console.log(`❌ ${endpoint} - Not Found (404)`);
      } else if (response.status === 401) {
        console.log(`✅ ${endpoint} - Requer autenticação (401)`);
      } else if (response.status === 405) {
        console.log(`✅ ${endpoint} - Método não permitido (405)`);
      } else if (response.ok) {
        console.log(`✅ ${endpoint} - Funcionando (${response.status})`);
        const data = await response.json();
        console.log(`   Dados: ${JSON.stringify(data).slice(0, 100)}...`);
      } else {
        console.log(`⚠️ ${endpoint} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erro: ${error.message}`);
    }
  }

  console.log('\n🔍 Testando outros endpoints de cadastro...');
  
  const otherEndpoints = [
    '/suppliers',
    '/services',
    '/appointments',
    '/clients'
  ];

  for (const endpoint of otherEndpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log(`✅ ${endpoint} - Requer autenticação (401)`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} - Not Found (404)`);
      } else {
        console.log(`✅ ${endpoint} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erro: ${error.message}`);
    }
  }
}

testFinancialModule();
