// Teste específico para o endpoint de profissionais
const API_BASE = 'http://localhost:8000/api/v1';

async function testProfessionalsEndpoint() {
  console.log('🔍 Testando endpoint de profissionais...\n');

  try {
    // Testar GET /professionals (sem autenticação)
    console.log('📡 Testing GET /professionals...');
    const response = await fetch(`${API_BASE}/professionals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Endpoint requer autenticação (401) - Normal para endpoints protegidos');
    } else if (response.status === 404) {
      console.log('❌ Endpoint não encontrado (404) - Problema!');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funcionando!');
      console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log(`❌ Erro ${response.status}:`, text);
    }

    // Testar outros endpoints relacionados
    const relatedEndpoints = [
      '/professionals/1',
      '/professionals/1/statistics',
      '/professionals/1/schedule-overrides',
      '/professionals/1/vouchers'
    ];

    console.log('\n🔍 Testando endpoints relacionados...');
    for (const endpoint of relatedEndpoints) {
      try {
        console.log(`📡 Testing ${endpoint}...`);
        const resp = await fetch(`${API_BASE}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (resp.status === 401) {
          console.log(`✅ ${endpoint} - Requer autenticação (401)`);
        } else if (resp.status === 404) {
          console.log(`❌ ${endpoint} - Não encontrado (404)`);
        } else {
          console.log(`✅ ${endpoint} - Status ${resp.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Erro: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Erro ao conectar com o backend:', error.message);
    console.log('💡 Verifique se o backend está rodando em localhost:8000');
  }
}

testProfessionalsEndpoint();
