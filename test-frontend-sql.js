// Teste completo de criação via API como se fosse do frontend (COM NOVO USUÁRIO)
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
    // 1. Fazer login com novo usuário criado via SQL
    console.log('🔑 Tentando fazer login com usuário criado via SQL...');
    try {
      const loginResponse = await apiRequest('/auth/login-json', 'POST', {
        email: 'testefrontend2@exemplo.com',
        password: 'Senha123@'
      }, false);

      authToken = loginResponse.access_token;
      console.log('✅ Login realizado com sucesso!');
      console.log('   Token obtido:', authToken.substring(0, 20) + '...');
      
      if (loginResponse.user?.company_id) {
        companyId = loginResponse.user.company_id;
      }
    } catch (error) {
      console.log('❌ Erro no login:', error.message);
      return;
    }

    // 2. Criar serviço via API
    console.log('\n💇 Criando serviço via API...');
    try {
      const serviceResponse = await apiRequest('/services', 'POST', {
        name: 'Corte Teste Frontend API',
        description: 'Serviço criado via API simulando frontend',
        price: 95.50,
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
        email: 'profissional.frontend.api@teste.com',
        password: 'Prof123@',
        full_name: 'Profissional Frontend API',
        phone: '(11) 97777-6666',
        cpf_cnpj: '123.456.789-00',
        bio: 'Profissional criado via API',
        specialties: ['Corte', 'Barba', 'Coloração'],
        commission_rate: 20,
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
        name: 'Fornecedor Frontend API Teste',
        email: 'fornecedor.frontend.api@teste.com',
        phone: '(11) 98888-7777',
        cnpj: '98.765.432/0001-00',
        address: 'Rua da API Frontend, 456',
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
          name: 'Receitas Frontend API',
          description: 'Categoria criada via API Frontend',
          type: 'income'
        });
        console.log('✅ Categoria financeira criada');
      }

      if (accountsResponse.data.length === 0) {
        // Criar conta se não existir
        await apiRequest('/financial/accounts', 'POST', {
          name: 'Caixa Frontend API',
          account_type: 'cash',
          balance: 2000.00
        });
        console.log('✅ Conta financeira criada');
      }

      // Buscar novamente para obter IDs
      const categories = await apiRequest('/financial/categories');
      const accounts = await apiRequest('/financial/accounts');

      const transactionResponse = await apiRequest('/financial/transactions', 'POST', {
        type: 'income',
        value: 350.00,
        date: new Date().toISOString(),
        description: 'Receita criada via API Frontend Teste',
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
        email: 'cliente.frontend.api@teste.com',
        full_name: 'Cliente Frontend API Teste',
        phone: '(11) 96666-5555',
        cpf_cnpj: '555.444.333-00',
        address: 'Rua do Cliente Frontend, 789',
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

    console.log('\n🎉 Teste via API concluído! Verificando no banco...');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

testFrontendCreation();
