// Teste completo de criação via API como se fosse do frontend (CORRIGIDO)
const API_BASE = 'http://localhost:8000/api/v1';

let authToken = null;
let companyId = null;

// Função para fazer requisições com autenticação
async function apiRequest(endpoint, method = 'GET', data = null, useAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (useAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function testFrontendCreation() {
  console.log('🚀 Testando criação de registros via API (simulando frontend)...\n');

  try {
    // 1. Tentar fazer login com o endpoint correto
    console.log('🔑 Tentando fazer login...');
    try {
      const loginResponse = await apiRequest('/auth/login-json', 'POST', {
        email: 'admin@empresa-teste.com',
        password: 'admin123'
      }, false);

      authToken = loginResponse.access_token;
      console.log('✅ Login realizado com sucesso!');
      console.log('   Token obtido:', authToken.substring(0, 20) + '...');
      
      // Extrair company_id do token ou buscar do usuário
      if (loginResponse.user?.company_id) {
        companyId = loginResponse.user.company_id;
      }
    } catch (error) {
      console.log('❌ Erro no login:', error.message);
      
      // Se login falhar, tentar criar usuário
      console.log('\n📝 Tentando criar usuário...');
      try {
        const registerResponse = await apiRequest('/auth/register', 'POST', {
          email: 'testefrontend@exemplo.com',
          password: 'Senha123@',
          name: 'Teste Frontend',
          company_name: 'Empresa Teste Frontend',
          business_type: 'salao_beleza',
          team_size: '2-5',
          slug: 'empresa-teste-frontend-' + Date.now(),
          plan_type: 'ESSENCIAL'
        }, false);

        console.log('✅ Usuário criado:', registerResponse.email);
        
        // Tentar login novamente
        const loginResponse = await apiRequest('/auth/login-json', 'POST', {
          email: 'testefrontend@exemplo.com',
          password: 'Senha123@'
        }, false);

        authToken = loginResponse.access_token;
        companyId = loginResponse.user?.company_id;
        console.log('✅ Login realizado com sucesso!');
      } catch (registerError) {
        console.log('❌ Erro ao criar usuário:', registerError.message);
        return;
      }
    }

    // 2. Criar serviço via API
    console.log('\n💇 Criando serviço via API...');
    try {
      const serviceResponse = await apiRequest('/services', 'POST', {
        name: 'Corte Teste Frontend API',
        description: 'Serviço criado via API simulando frontend',
        price: 85.50,
        duration_minutes: 45,
        currency: 'BRL'
      });

      console.log('✅ Serviço criado via API!');
      console.log('   ID:', serviceResponse.id);
      console.log('   Nome:', serviceResponse.name);
      console.log('   Preço: R$', serviceResponse.price);
    } catch (error) {
      console.log('❌ Erro ao criar serviço:', error.message);
    }

    // 3. Criar profissional via API
    console.log('\n👨‍💼 Criando profissional via API...');
    try {
      const profResponse = await apiRequest('/professionals', 'POST', {
        email: 'profissional.api@teste.com',
        password: 'Prof123@',
        full_name: 'Profissional API Teste',
        phone: '(11) 97777-6666',
        cpf_cnpj: '123.456.789-00',
        bio: 'Profissional criado via API',
        specialties: ['Corte', 'Barba'],
        commission_rate: 15,
        working_hours: {
          monday: { enabled: true, start: '09:00', end: '18:00' },
          tuesday: { enabled: true, start: '09:00', end: '18:00' },
          wednesday: { enabled: true, start: '09:00', end: '18:00' },
          thursday: { enabled: true, start: '09:00', end: '18:00' },
          friday: { enabled: true, start: '09:00', end: '18:00' },
          saturday: { enabled: false, start: '09:00', end: '18:00' },
          sunday: { enabled: false, start: '09:00', end: '18:00' }
        }
      });

      console.log('✅ Profissional criado via API!');
      console.log('   ID:', profResponse.id);
      console.log('   Nome:', profResponse.full_name);
      console.log('   Email:', profResponse.email);
    } catch (error) {
      console.log('❌ Erro ao criar profissional:', error.message);
    }

    // 4. Criar fornecedor via API
    console.log('\n🏭 Criando fornecedor via API...');
    try {
      const supplierResponse = await apiRequest('/suppliers', 'POST', {
        name: 'Fornecedor API Teste',
        email: 'fornecedor.api@teste.com',
        phone: '(11) 98888-7777',
        cnpj: '98.765.432/0001-00',
        address: 'Rua da API, 456',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '98765-432',
        notes: 'Fornecedor criado via API simulando frontend'
      });

      console.log('✅ Fornecedor criado via API!');
      console.log('   ID:', supplierResponse.id);
      console.log('   Nome:', supplierResponse.name);
      console.log('   CNPJ:', supplierResponse.cnpj);
    } catch (error) {
      console.log('❌ Erro ao criar fornecedor:', error.message);
    }

    // 5. Criar transação financeira via API
    console.log('\n💰 Criando transação financeira via API...');
    try {
      // Primeiro verificar se existem categorias e contas
      const categoriesResponse = await apiRequest('/financial/categories');
      const accountsResponse = await apiRequest('/financial/accounts');

      if (categoriesResponse.data.length === 0) {
        // Criar categoria se não existir
        await apiRequest('/financial/categories', 'POST', {
          name: 'Receitas API',
          description: 'Categoria criada via API',
          type: 'income'
        });
        console.log('✅ Categoria financeira criada');
      }

      if (accountsResponse.data.length === 0) {
        // Criar conta se não existir
        await apiRequest('/financial/accounts', 'POST', {
          name: 'Caixa API',
          account_type: 'cash',
          balance: 1000.00
        });
        console.log('✅ Conta financeira criada');
      }

      // Buscar novamente para obter IDs
      const categories = await apiRequest('/financial/categories');
      const accounts = await apiRequest('/financial/accounts');

      const transactionResponse = await apiRequest('/financial/transactions', 'POST', {
        type: 'income',
        value: 250.00,
        date: new Date().toISOString(),
        description: 'Receita criada via API Frontend',
        account_id: accounts.data[0].id,
        category_id: categories.data[0].id,
        payment_method: 'cash',
        origin: 'manual'
      });

      console.log('✅ Transação financeira criada via API!');
      console.log('   ID:', transactionResponse.id);
      console.log('   Valor: R$', transactionResponse.value);
      console.log('   Descrição:', transactionResponse.description);
    } catch (error) {
      console.log('❌ Erro ao criar transação financeira:', error.message);
    }

    // 6. Criar cliente via API
    console.log('\n👤 Criando cliente via API...');
    try {
      const clientResponse = await apiRequest('/clients', 'POST', {
        email: 'cliente.api@teste.com',
        full_name: 'Cliente API Teste',
        phone: '(11) 96666-5555',
        cpf_cnpj: '555.444.333-00',
        address: 'Rua do Cliente, 789',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567'
      });

      console.log('✅ Cliente criado via API!');
      console.log('   ID:', clientResponse.id);
      console.log('   Nome:', clientResponse.full_name);
      console.log('   Email:', clientResponse.email);
    } catch (error) {
      console.log('❌ Erro ao criar cliente:', error.message);
    }

    // 7. Verificar dados criados no banco
    console.log('\n📊 Verificando dados criados via API...');
    try {
      const services = await apiRequest('/services');
      const professionals = await apiRequest('/professionals');
      const suppliers = await apiRequest('/suppliers');
      const transactions = await apiRequest('/financial/transactions');
      const clients = await apiRequest('/clients');

      console.log('📈 Resumo dos dados via API:');
      console.log(`   Serviços: ${services.data.length} registros`);
      console.log(`   Profissionais: ${professionals.data.length} registros`);
      console.log(`   Fornecedores: ${suppliers.data.length} registros`);
      console.log(`   Transações: ${transactions.data.length} registros`);
      console.log(`   Clientes: ${clients.data.length} registros`);

      // Mostrar últimos registros criados via API
      if (services.data.length > 0) {
        const latest = services.data[services.data.length - 1];
        if (latest.name.includes('API')) {
          console.log(`   ✅ Último serviço via API: ${latest.name} (R$ ${latest.price})`);
        }
      }

      if (suppliers.data.length > 0) {
        const latest = suppliers.data[suppliers.data.length - 1];
        if (latest.name.includes('API')) {
          console.log(`   ✅ Último fornecedor via API: ${latest.name}`);
        }
      }

      if (transactions.data.length > 0) {
        const latest = transactions.data[transactions.data.length - 1];
        if (latest.description.includes('API')) {
          console.log(`   ✅ Última transação via API: R$ ${latest.value} - ${latest.description}`);
        }
      }

    } catch (error) {
      console.log('❌ Erro ao verificar dados:', error.message);
    }

    console.log('\n🎉 Teste via API concluído! Verificando no banco...');

    // 8. Verificação final no banco de dados
    console.log('\n🔍 Verificação final no PostgreSQL...');
    const { exec } = require('child_process');
    
    exec('docker exec agendamento_dev_db psql -U agendamento -d agendamento_db -c "SELECT COUNT(*) as total FROM suppliers WHERE name LIKE \\'%API%\\';"', (error, stdout, stderr) => {
      if (!error) {
        console.log('   Fornecedores criados via API:', stdout.trim());
      }
    });

    exec('docker exec agendamento_dev_db psql -U agendamento -d agendamento_db -c "SELECT COUNT(*) as total FROM services WHERE name LIKE \\'%API%\\';"', (error, stdout, stderr) => {
      if (!error) {
        console.log('   Serviços criados via API:', stdout.trim());
      }
    });

    exec('docker exec agendamento_dev_db psql -U agendamento -d agendamento_db -c "SELECT COUNT(*) as total FROM financial_transactions WHERE description LIKE \\'%API%\\';"', (error, stdout, stderr) => {
      if (!error) {
        console.log('   Transações criadas via API:', stdout.trim());
      }
    });

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testFrontendCreation();
