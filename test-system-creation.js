// Teste completo de criação de registros no sistema
const API_BASE = 'http://localhost:8000/api/v1';

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

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

async function testSystemCreation() {
  console.log('🧪 Testando criação de registros no sistema...\n');

  try {
    // 1. Testar criação de serviço
    console.log('📦 Criando novo serviço...');
    const serviceData = {
      name: 'Corte Masculino Premium',
      description: 'Corte de cabelo masculino com lavagem e finalização',
      price: 50.00,
      duration_minutes: 30,
      currency: 'BRL',
      category: 'Cabelo'
    };

    try {
      const service = await apiRequest('/services', 'POST', serviceData);
      console.log('✅ Serviço criado com sucesso:', service.name);
      console.log('   ID:', service.id);
    } catch (error) {
      console.log('❌ Erro ao criar serviço:', error.message);
    }

    // 2. Testar criação de fornecedor
    console.log('\n🏭 Criando novo fornecedor...');
    const supplierData = {
      name: 'Fornecedor de Beleza LTDA',
      email: 'contato@fornecedor.com',
      phone: '(11) 99999-8888',
      cnpj: '12.345.678/0001-90',
      address: 'Rua do Comércio, 123',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01234-567'
    };

    try {
      const supplier = await apiRequest('/suppliers', 'POST', supplierData);
      console.log('✅ Fornecedor criado com sucesso:', supplier.name);
      console.log('   ID:', supplier.id);
    } catch (error) {
      console.log('❌ Erro ao criar fornecedor:', error.message);
    }

    // 3. Testar criação de profissional
    console.log('\n👨‍💼 Criando novo profissional...');
    const professionalData = {
      email: 'novo.profissional@teste.com',
      password: 'Senha123@',
      full_name: 'João Silva Teste',
      phone: '(11) 97777-6666',
      cpf_cnpj: '123.456.789-00',
      bio: 'Profissional especializado em cortes masculinos',
      specialties: ['Corte', 'Barba', 'Finalização'],
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
    };

    try {
      const professional = await apiRequest('/professionals', 'POST', professionalData);
      console.log('✅ Profissional criado com sucesso:', professional.full_name);
      console.log('   ID:', professional.id);
    } catch (error) {
      console.log('❌ Erro ao criar profissional:', error.message);
    }

    // 4. Testar criação de cliente
    console.log('\n👤 Criando novo cliente...');
    const clientData = {
      email: 'cliente.teste@email.com',
      full_name: 'Maria Cliente Teste',
      phone: '(11) 95555-4444',
      cpf_cnpj: '987.654.321-00',
      address: 'Rua do Cliente, 456',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '04567-890'
    };

    try {
      const client = await apiRequest('/clients', 'POST', clientData);
      console.log('✅ Cliente criado com sucesso:', client.full_name);
      console.log('   ID:', client.id);
    } catch (error) {
      console.log('❌ Erro ao criar cliente:', error.message);
    }

    // 5. Testar criação de agendamento (precisa de IDs válidos)
    console.log('\n📅 Testando criação de agendamento...');
    const appointmentData = {
      service_id: 1, // Supondo que exista um serviço com ID 1
      professional_id: 1, // Supondo que exista um profissional com ID 1
      client_id: 1, // Supondo que exista um cliente com ID 1
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      notes: 'Agendamento de teste'
    };

    try {
      const appointment = await apiRequest('/appointments', 'POST', appointmentData);
      console.log('✅ Agendamento criado com sucesso');
      console.log('   ID:', appointment.id);
    } catch (error) {
      console.log('❌ Erro ao criar agendamento:', error.message);
      console.log('   (Pode precisar de IDs válidos de serviço/profissional/cliente)');
    }

    // 6. Testar criação de transação financeira
    console.log('\n💰 Testando criação de transação financeira...');
    const transactionData = {
      company_id: 1,
      type: 'income',
      value: 100.00,
      date: new Date().toISOString(),
      description: 'Pagamento de serviço teste',
      account_id: 1,
      category_id: 1,
      payment_method: 'cash',
      origin: 'manual'
    };

    try {
      const transaction = await apiRequest('/financial/transactions', 'POST', transactionData);
      console.log('✅ Transação criada com sucesso');
      console.log('   ID:', transaction.id);
    } catch (error) {
      console.log('❌ Erro ao criar transação:', error.message);
      console.log('   (Pode precisar de IDs válidos de conta/categoria)');
    }

    console.log('\n🎉 Testes concluídos! Verifique os resultados acima.');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
}

testSystemCreation();
