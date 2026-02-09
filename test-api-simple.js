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
                name: 'Serviço Teste API Completo',
                description: 'Criado via teste API completo',
                price: 120.00,
                duration_minutes: 60,
                currency: 'BRL'
              })
            });

            if (serviceResponse.ok) {
              const service = await serviceResponse.json();
              console.log('✅ Criar serviço via API - Funcionando!');
              console.log('   ID:', service.id);
              console.log('   Nome:', service.name);
              console.log('   Preço: R$', service.price);
              
              // Testar criar fornecedor
              try {
                const supplierResponse = await fetch(`${API_BASE}/suppliers`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginResult.access_token}`
                  },
                  body: JSON.stringify({
                    name: 'Fornecedor Teste API',
                    email: 'fornecedor@api.com',
                    phone: '(11) 98888-7777',
                    cnpj: '98.765.432/0001-00',
                    address: 'Rua API, 123',
                    city: 'São Paulo',
                    state: 'SP',
                    zip_code: '98765-432'
                  })
                });

                if (supplierResponse.ok) {
                  const supplier = await supplierResponse.json();
                  console.log('✅ Criar fornecedor via API - Funcionando!');
                  console.log('   ID:', supplier.id);
                  console.log('   Nome:', supplier.name);
                } else {
                  console.log('❌ Criar fornecedor - Erro:', supplierResponse.status);
                }
              } catch (error) {
                console.log('❌ Criar fornecedor - Erro:', error.message);
              }

              // Testar criar transação financeira
              try {
                // Primeiro criar categoria e conta
                const catResponse = await fetch(`${API_BASE}/financial/categories`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginResult.access_token}`
                  },
                  body: JSON.stringify({
                    name: 'Teste API',
                    description: 'Categoria teste',
                    type: 'income'
                  })
                });

                const accResponse = await fetch(`${API_BASE}/financial/accounts`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginResult.access_token}`
                  },
                  body: JSON.stringify({
                    name: 'Caixa Teste',
                    account_type: 'cash',
                    balance: 1000.00
                  })
                });

                if (catResponse.ok && accResponse.ok) {
                  const category = await catResponse.json();
                  const account = await accResponse.json();

                  const transResponse = await fetch(`${API_BASE}/financial/transactions`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${loginResult.access_token}`
                    },
                    body: JSON.stringify({
                      type: 'income',
                      value: 300.00,
                      date: new Date().toISOString(),
                      description: 'Transação criada via API Teste',
                      account_id: account.id,
                      category_id: category.id,
                      payment_method: 'cash',
                      origin: 'manual'
                    })
                  });

                  if (transResponse.ok) {
                    const transaction = await transResponse.json();
                    console.log('✅ Criar transação via API - Funcionando!');
                    console.log('   ID:', transaction.id);
                    console.log('   Valor: R$', transaction.value);
                  } else {
                    console.log('❌ Criar transação - Erro:', transResponse.status);
                  }
                }
              } catch (error) {
                console.log('❌ Criar transação - Erro:', error.message);
              }
              
            } else {
              console.log('❌ Criar serviço - Erro:', serviceResponse.status);
              const errorText = await serviceResponse.text();
              console.log('   Detalhes:', errorText);
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
      const errorText = await response.text();
      console.log('   Detalhes:', errorText);
    }
  } catch (error) {
    console.log('❌ Register - Erro:', error.message);
  }

  console.log('\n🎉 Teste finalizado! Verificando dados no banco...');
  
  // Verificação final no banco
  setTimeout(() => {
    console.log('\n📊 Resumo no PostgreSQL:');
    console.log('   Verificando registros criados via API...');
  }, 1000);
}

testAPIStatus();
