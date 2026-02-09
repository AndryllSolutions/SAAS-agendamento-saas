// Teste específico para sistema de comissões
const API_BASE = 'http://localhost:8000/api/v1';

async function testCommissionSystem() {
  console.log('🔍 TESTE DO SISTEMA DE COMISSÕES\n');

  try {
    // 1. Login
    console.log('📋 1. Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin-final-1770477247636@teste.com',
        password: 'Senha123@'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Erro no login:', await loginResponse.json());
      return;
    }

    const loginResult = await loginResponse.json();
    const token = loginResult.access_token;
    console.log('✅ Login realizado com sucesso');

    // 2. Obter dados existentes
    console.log('\n📊 2. Obtendo dados existentes...');
    
    const servicesResponse = await fetch(`${API_BASE}/services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const services = await servicesResponse.json();
    const service = services[0];
    console.log(`✅ Serviço encontrado: ${service.name} (R$ ${service.price})`);

    const professionalsResponse = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const professionals = await professionalsResponse.json();
    const activeProfessional = professionals.find(u => u.role === 'PROFESSIONAL' && u.is_active);
    console.log(`✅ Profissional encontrado: ${activeProfessional.full_name}`);

    const clientsResponse = await fetch(`${API_BASE}/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clients = await clientsResponse.json();
    const client = clients[clients.length - 1];
    console.log(`✅ Cliente encontrado: ${client.full_name}`);

    // 3. Criar comanda COM comissão
    console.log('\n🧾 3. Criando comanda COM comissão (20%)...');
    const commandResponse = await fetch(`${API_BASE}/commands`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_crm_id: client.id,
        professional_id: activeProfessional.id,
        date: new Date().toISOString(),
        items: [{
          item_type: 'service',
          service_id: service.id,
          quantity: 1,
          unit_value: service.price,
          commission_percentage: 20  // 🔥 20% de comissão!
        }]
      })
    });

    if (commandResponse.status !== 201) {
      console.log('❌ Erro ao criar comanda:', await commandResponse.json());
      return;
    }

    const command = await commandResponse.json();
    console.log('✅ Comanda criada:', { id: command.id, total_value: command.total_value });

    // 4. Finalizar comanda
    console.log('\n💰 4. Finalizando comanda...');
    const updateCommandResponse = await fetch(`${API_BASE}/commands/${command.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'finished',
        payment_method: 'cash'
      })
    });

    if (updateCommandResponse.status !== 200) {
      console.log('❌ Erro ao finalizar comanda:', await updateCommandResponse.json());
      return;
    }

    const updatedCommand = await updateCommandResponse.json();
    console.log('✅ Comanda finalizada:', { id: updatedCommand.id, status: updatedCommand.status });

    // 5. Verificar comissões criadas
    console.log('\n💵 5. Verificando comissões criadas...');
    const commissionsResponse = await fetch(`${API_BASE}/commissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (commissionsResponse.status !== 200) {
      console.log('❌ Erro ao buscar comissões:', await commissionsResponse.json());
      return;
    }

    const commissions = await commissionsResponse.json();
    console.log(`✅ Comissões encontradas: ${commissions.length}`);

    if (commissions.length > 0) {
      const commission = commissions[0];
      console.log('\n📋 Detalhes da comissão:');
      console.log(`  - ID: ${commission.id}`);
      console.log(`  - Profissional: ${commission.professional?.full_name}`);
      console.log(`  - Valor Base: R$ ${commission.base_value}`);
      console.log(`  - Percentual: ${commission.commission_percentage}%`);
      console.log(`  - Valor Comissão: R$ ${commission.commission_value}`);
      console.log(`  - Status: ${commission.status}`);
      
      // Cálculo esperado
      const expectedCommission = (parseFloat(service.price) * 20) / 100;
      const actualCommission = parseFloat(commission.commission_value);
      
      console.log('\n🧮 Verificação do cálculo:');
      console.log(`  - Valor do serviço: R$ ${service.price}`);
      console.log(`  - Percentual: 20%`);
      console.log(`  - Comissão esperada: R$ ${expectedCommission.toFixed(2)}`);
      console.log(`  - Comissão real: R$ ${actualCommission.toFixed(2)}`);
      console.log(`  - ✅ Cálculo correto: ${expectedCommission === actualCommission}`);
      
      console.log('\n🎉 SISTEMA DE COMISSÕES FUNCIONANDO PERFEITAMENTE!');
    } else {
      console.log('❌ Nenhuma comissão foi criada - PROBLEMA NO SISTEMA!');
    }

    // 6. Testar resumo de comissões
    console.log('\n📊 6. Testando resumo de comissões...');
    const summaryResponse = await fetch(`${API_BASE}/commissions/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (summaryResponse.status === 200) {
      const summary = await summaryResponse.json();
      console.log('✅ Resumo de comissões:', summary);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste de comissões
testCommissionSystem();
