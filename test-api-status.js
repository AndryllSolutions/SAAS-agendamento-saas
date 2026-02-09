// Teste simples para verificar se as APIs estão funcionando
const API_BASE = 'http://localhost:8000/api/v1';

async function testAPIStatus() {
  console.log('🔍 Verificando status das APIs...\n');

  const endpoints = [
    '/services',
    '/professionals', 
    '/suppliers',
    '/financial/transactions',
    '/clients'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log(`✅ ${endpoint} - Requer autenticação (401) - API funcionando`);
      } else if (response.ok) {
        console.log(`✅ ${endpoint} - Funcionando (${response.status})`);
      } else {
        console.log(`❌ ${endpoint} - Erro ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erro: ${error.message}`);
    }
  }

  console.log('\n🔑 Testando endpoints de autenticação...');
  
  // Testar register
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testapi@exemplo.com',
        password: 'Senha123@',
        name: 'Teste API',
        company_name: 'Empresa Teste API',
        business_type: 'salao_beleza',
        team_size: '2-5',
        slug: 'empresa-teste-api-' + Date.now(),
        plan_type: 'ESSENCIAL'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Register - Funcionando');
      console.log('   Usuário criado:', result.email);
      
      // Testar login com o usuário criado
      try {
        const loginResponse = await fetch(`${API_BASE}/auth/login-json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.email,
            password: 'Senha123@'
          })
        });

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          console.log('✅ Login - Funcionando');
          console.log('   Token obtido');
          
          // Agora testar criar um serviço com autenticação
          try {
            const serviceResponse = await fetch(`${API_BASE}/services`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.access_token}`
              },
              body: JSON.stringify({
                name: 'Serviço Teste API',
                description: 'Criado via teste API',
                price: 100.00,
                duration_minutes: 60,
                currency: 'BRL'
              })
            });

            if (serviceResponse.ok) {
              const service = await serviceResponse.json();
              console.log('✅ Criar serviço - Funcionando!');
              console.log('   ID:', service.id);
              console.log('   Nome:', service.name);
              console.log('   Preço: R$', service.price);
              
              // Verificar no banco
              console.log('\n🔍 Verificando no banco de dados...');
              const { exec } = require('child_process');
              
              exec('docker exec agendamento_dev_db psql -U agendamento -d agendamento_db -c "SELECT name, price FROM services WHERE name LIKE \\'%Teste API%\\';"', (error, stdout, stderr) => {
                if (!error && stdout) {
                  console.log('   ✅ Registro encontrado no banco:');
                  console.log('   ', stdout.trim());
                } else {
                  console.log('   ❌ Erro ao verificar no banco');
                }
              });
              
            } else {
              console.log('❌ Criar serviço - Erro:', serviceResponse.status);
            }
          } catch (error) {
            console.log('❌ Criar serviço - Erro:', error.message);
          }
          
        } else {
          console.log('❌ Login - Erro:', loginResponse.status);
        }
      } catch (error) {
        console.log('❌ Login - Erro:', error.message);
      }
      
    } else {
      console.log('❌ Register - Erro:', response.status);
    }
  } catch (error) {
    console.log('❌ Register - Erro:', error.message);
  }
}

testAPIStatus();
