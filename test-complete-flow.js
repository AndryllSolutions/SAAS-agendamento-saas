// Script completo para testar o fluxo completo do sistema SaaS
const API_BASE = 'http://localhost:8000/api/v1';

// Dados de teste
const testCompany = {
  name: "Empresa Teste Dashboard",
  slug: "empresa-teste-dashboard",
  email: "empresa@teste.com",
  phone: "11999999999",
  description: "Empresa criada para testar o dashboard completo",
  timezone: "America/Sao_Paulo",
  currency: "BRL"
};

const testUser = {
  email: "admin@empresa-teste.com",
  full_name: "Administrador Teste",
  password: "Senha123@",
  role: "COMPANY_OWNER"
};

const testProfessional = {
  email: "profissional@empresa-teste.com",
  full_name: "Profissional Teste",
  password: "Senha123@",
  role: "COMPANY_PROFESSIONAL"
};

const testService = {
  name: "Corte de Cabelo Masculino",
  description: "Corte completo com lavagem e finalização",
  price: 50.00,
  duration_minutes: 30,
  category: "cabelo"
};

const testClient = {
  full_name: "Cliente Teste",
  email: "cliente@teste.com",
  phone: "11988888888",
  cpf: "12345678901"
};

let authToken = null;
let companyId = null;
let userId = null;
let professionalId = null;
let serviceId = null;
let clientId = null;
let appointmentId = null;
let commandId = null;

// Funções auxiliares
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  console.log(`📡 ${options.method || 'GET'} ${url}`);
  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.detail || data.message || 'Erro desconhecido'}`);
  }

  return data;
}

async function post(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

async function put(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Fluxo de teste
async function runCompleteTest() {
  console.log('🚀 Iniciando teste completo do sistema SaaS...\n');

  try {
    // 1. Criar empresa
    console.log('📋 1. Criando empresa...');
    const company = await post('/companies', testCompany);
    companyId = company.id;
    console.log('✅ Empresa criada:', { id: company.id, name: company.name, slug: company.slug });

    // 2. Criar usuário administrador
    console.log('\n👤 2. Criando usuário administrador...');
    const adminUser = await post('/auth/register', {
      ...testUser,
      company_id: companyId
    });
    userId = adminUser.id;
    console.log('✅ Usuário administrador criado:', { id: adminUser.id, email: adminUser.email });

    // 3. Login do administrador
    console.log('\n🔐 3. Fazendo login do administrador...');
    const loginResponse = await post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginResponse.access_token;
    console.log('✅ Login realizado com sucesso');

    // 4. Verificar empresa do usuário
    console.log('\n🏢 4. Verificando empresa do usuário...');
    const userCompany = await get('/companies/me');
    console.log('✅ Empresa do usuário:', { id: userCompany.id, name: userCompany.name });

    // 5. Criar profissional
    console.log('\n💇 5. Criando profissional...');
    const professional = await post('/auth/register', {
      ...testProfessional,
      company_id: companyId
    });
    professionalId = professional.id;
    console.log('✅ Profissional criado:', { id: professional.id, name: professional.full_name });

    // 6. Criar serviço
    console.log('\n✂️ 6. Criando serviço...');
    const service = await post('/services', {
      ...testService,
      company_id: companyId
    });
    serviceId = service.id;
    console.log('✅ Serviço criado:', { id: service.id, name: service.name, price: service.price });

    // 7. Criar cliente
    console.log('\n👥 7. Criando cliente...');
    const client = await post('/clients', {
      ...testClient,
      company_id: companyId
    });
    clientId = client.id;
    console.log('✅ Cliente criado:', { id: client.id, name: client.full_name });

    // 8. Criar agendamento
    console.log('\n📅 8. Criando agendamento...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointment = await post('/appointments', {
      client_id: clientId,
      professional_id: professionalId,
      service_id: serviceId,
      start_time: tomorrow.toISOString(),
      status: 'confirmed'
    });
    appointmentId = appointment.id;
    console.log('✅ Agendamento criado:', { 
      id: appointment.id, 
      status: appointment.status,
      start_time: appointment.start_time
    });

    // 9. Criar comanda
    console.log('\n🧾 9. Criando comanda...');
    const command = await post('/commands', {
      client_id: clientId,
      professional_id: professionalId,
      items: [{
        service_id: serviceId,
        quantity: 1,
        unit_price: service.price
      }],
      total_value: service.price,
      net_value: service.price,
      date: new Date().toISOString(),
      status: 'pending'
    });
    commandId = command.id;
    console.log('✅ Comanda criada:', { 
      id: command.id, 
      total_value: command.total_value,
      status: command.status
    });

    // 10. Finalizar comanda
    console.log('\n💰 10. Finalizando comanda...');
    const updatedCommand = await put(`/commands/${commandId}`, {
      status: 'finished',
      payment_method: 'cash'
    });
    console.log('✅ Comanda finalizada:', { id: updatedCommand.id, status: updatedCommand.status });

    // 11. Finalizar agendamento
    console.log('\n✅ 11. Finalizando agendamento...');
    const updatedAppointment = await put(`/appointments/${appointmentId}`, {
      status: 'completed'
    });
    console.log('✅ Agendamento finalizado:', { id: updatedAppointment.id, status: updatedAppointment.status });

    // 12. Testar dashboard com dados reais
    console.log('\n📊 12. Testando dashboard com dados reais...');
    const dashboardData = await get('/dashboard/overview');
    console.log('✅ Dashboard Overview:', {
      total_appointments: dashboardData.appointments.total,
      total_revenue: dashboardData.revenue.total,
      total_clients: dashboardData.clients.total
    });

    const commandsStats = await get('/dashboard/commands-stats');
    console.log('✅ Commands Stats:', {
      total_commands: commandsStats.total_commands,
      conversion_rate: commandsStats.conversion_rate
    });

    const appointmentsByStatus = await get('/dashboard/appointments-by-status');
    console.log('✅ Appointments by Status:', appointmentsByStatus.by_status);

    // 13. Listar todos os recursos criados
    console.log('\n📋 13. Listando recursos criados...');
    
    const services = await get('/services');
    console.log('📝 Serviços:', services.map(s => ({ id: s.id, name: s.name, price: s.price })));

    const professionals = await get('/users');
    console.log('👥 Profissionais:', professionals.filter(u => u.role === 'COMPANY_PROFESSIONAL').map(p => ({ id: p.id, name: p.full_name })));

    const clients = await get('/clients');
    console.log('👥 Clientes:', clients.map(c => ({ id: c.id, name: c.full_name })));

    const appointments = await get('/appointments');
    console.log('📅 Agendamentos:', appointments.map(a => ({ id: a.id, status: a.status, client: a.client?.full_name })));

    const commands = await get('/commands');
    console.log('🧾 Comandas:', commands.map(c => ({ id: c.id, status: c.status, total: c.total_value })));

    console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!');
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`  🏢 Empresa: ${company.name} (ID: ${companyId})`);
    console.log(`  👤 Admin: ${adminUser.full_name} (ID: ${userId})`);
    console.log(`  💇 Profissional: ${professional.full_name} (ID: ${professionalId})`);
    console.log(`  ✂️ Serviço: ${service.name} (ID: ${serviceId})`);
    console.log(`  👥 Cliente: ${client.full_name} (ID: ${clientId})`);
    console.log(`  📅 Agendamento: Status ${updatedAppointment.status} (ID: ${appointmentId})`);
    console.log(`  🧾 Comanda: Status ${updatedCommand.status} (ID: ${commandId})`);
    console.log(`  💰 Valor total: R$ ${service.price.toFixed(2)}`);

    console.log('\n🌐 Para testar o frontend:');
    console.log(`  1. Login: ${testUser.email} / ${testUser.password}`);
    console.log(`  2. Acesse: http://localhost:3000/dashboard`);
    console.log(`  3. Você verá todos os dados reais no dashboard!`);

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar teste completo
runCompleteTest();
