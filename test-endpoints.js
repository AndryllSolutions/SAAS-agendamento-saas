// Teste simplificado para verificar endpoints disponíveis
const API_BASE = 'http://localhost:8000/api/v1';

async function testEndpoints() {
  console.log('🔍 Verificando endpoints disponíveis...\n');

  const endpoints = [
    '/auth/register',
    '/companies',
    '/services', 
    '/appointments',
    '/clients',
    '/commands',
    '/dashboard/overview'
  ];

  for (const endpoint of endpoints) {
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
      } else {
        console.log(`✅ ${endpoint} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erro: ${error.message}`);
    }
  }

  // Testar POST em auth/register para confirmar que backend está funcionando
  try {
    console.log('\n📡 Testando POST /auth/register...');
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Senha123@',
        full_name: 'Test User',
        name: 'Test User',
        company_name: 'Test Company',
        business_type: 'salao_beleza',
        team_size: '2-5',
        slug: 'test-company',
        plan_type: 'ESSENCIAL'
      })
    });
    
    const data = await response.json();
    console.log('✅ POST /auth/register funcionou:', response.status);
    console.log('   Response:', data);
  } catch (error) {
    console.log('❌ POST /auth/register falhou:', error.message);
  }
}

testEndpoints();
