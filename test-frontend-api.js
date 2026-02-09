// Teste completo de criação via API como se fosse do frontend
const API_BASE = 'http://localhost:8000/api/v1';

let authToken = null;

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
    // 1. Tentar fazer login com um usuário existente
    console.log('🔑 Tentando fazer login...');
    try {
      const loginResponse = await apiRequest('/auth/login', 'POST', {
        username: 'admin@empresa-teste.com',
        password: 'admin123'
      }, false);

      authToken = loginResponse.access_token;
      console.log('✅ Login realizado com sucesso!');
      console.log('   Token obtido:', authToken.substring(0, 20) + '...');
    } catch (error) {
      console.log('❌ Erro no login:', error.message);
      
      // Se login falhar, tentar criar usuário
      console.log('\n📝 Tentando criar usuário...');
      try {
        const registerResponse = await apiRequest('/auth/register', 'POST', {
          email: 'testefrontend@exemplo.com',
          password: 'Senha123@',
          full_name: 'Teste Frontend',
          name: 'Teste Frontend Company',
          company_name: 'Empresa Teste Frontend',
          business_type: 'salao_beleza',
          team_size: '2-5',
          slug: 'empresa-teste-frontend',
          plan_type: 'ESSENCIAL'
        }, false);

        console.log('✅ Usuário criado:', registerResponse.user?.email);
        
        // Tentar login novamente
        const loginResponse = await apiRequest('/auth/login', 'POST', {
          username: 'testefrontend@exemplo.com',
          password: 'Senha123@'
        }, false);

        authToken = loginResponse.access_token;
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
        name: 'Corte Teste Frontend',
        description: 'Serviço criado via API simulando frontend',
        price: 75.50,
        duration_minutes: 45,
        currency: 'BRL',
        category: 'Cabelo'
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
        email: 'profissional.frontend@teste.com',
        password: 'Prof123@',
        full_name: 'Profissional Frontend Teste',
        phone: '(11) 97777-6666',
        cpf_cnpj: '123.456.789-00',
        bio: 'Profissional criado via API',
        specialties: ['Corte', 'Barba', 'Coloração'],
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
        name: 'Fornecedor Frontend API',
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
      }

      if (accountsResponse.data.length === 0) {
        // Criar conta se não existir
        await apiRequest('/financial/accounts', 'POST', {
          name: 'Caixa API',
          account_type: 'cash',
          balance: 1000.00
        });
      }

      // Buscar novamente para obter IDs
      const categories = await apiRequest('/financial/categories');
      const accounts = await apiRequest('/financial/accounts');

      const transactionResponse = await apiRequest('/financial/transactions', 'POST', {
        type: 'income',
        value: 200.00,
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

    // 6. Verificar dados criados
    console.log('\n📊 Verificando dados criados...');
    try {
      const services = await apiRequest('/services');
      const professionals = await apiRequest('/professionals');
      const suppliers = await apiRequest('/suppliers');
      const transactions = await apiRequest('/financial/transactions');

      console.log('📈 Resumo dos dados via API:');
      console.log(`   Serviços: ${services.data.length} registros`);
      console.log(`   Profissionais: ${professionals.data.length} registros`);
      console.log(`   Fornecedores: ${suppliers.data.length} registros`);
      console.log(`   Transações: ${transactions.data.length} registros`);

      // Mostrar últimos registros
      if (services.data.length > 0) {
        const latest = services.data[services.data.length - 1];
        console.log(`   Último serviço: ${latest.name} (R$ ${latest.price})`);
      }

      if (suppliers.data.length > 0) {
        const latest = suppliers.data[suppliers.data.length - 1];
        console.log(`   Último fornecedor: ${latest.name}`);
      }

    } catch (error) {
      console.log('❌ Erro ao verificar dados:', error.message);
    }

    console.log('\n🎉 Teste via API concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testFrontendCreation();
