// Teste alternativo focado no fluxo que funciona
const API_BASE = 'http://localhost:8000/api/v1';

async function testAlternativeFlow() {
  console.log('🔄 Testando fluxo alternativo...\n');

  try {
    // 1. Criar empresa e usuário via auth/register (que funciona)
    console.log('📋 1. Criando empresa e usuário via auth/register...');
    const registerData = {
      email: 'admin@empresa-teste.com',
      password: 'Senha123@',
      full_name: 'Administrador Teste',
      name: 'Administrador Teste',
      company_name: 'Empresa Teste Dashboard',
      business_type: 'salao_beleza',
      team_size: '2-5',
      slug: 'empresa-teste-dashboard',
      plan_type: 'ESSENCIAL'
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.status !== 201) {
      const error = await registerResponse.json();
      console.log('❌ Erro no registro:', error);
      return;
    }

    const userData = await registerResponse.json();
    console.log('✅ Usuário criado:', { id: userData.id, email: userData.email });

    // 2. Login
    console.log('\n🔐 2. Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.email,
        password: registerData.password
      })
    });

    if (loginResponse.status !== 200) {
      const error = await loginResponse.json();
      console.log('❌ Erro no login:', error);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login realizado com sucesso');

    // 3. Verificar empresa do usuário
    console.log('\n🏢 3. Verificando empresa do usuário...');
    const companyResponse = await fetch(`${API_BASE}/companies/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (companyResponse.status === 200) {
      const company = await companyResponse.json();
      console.log('✅ Empresa encontrada:', { id: company.id, name: company.name });
      
      // 4. Criar serviço
      console.log('\n✂️ 4. Criando serviço...');
      const serviceResponse = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Corte de Cabelo Masculino',
          description: 'Corte completo com lavagem e finalização',
          price: 50.00,
          duration_minutes: 30,
          category: 'cabelo'
        })
      });

      if (serviceResponse.status === 201) {
        const service = await serviceResponse.json();
        console.log('✅ Serviço criado:', { id: service.id, name: service.name, price: service.price });

        // 5. Criar cliente
        console.log('\n👥 5. Criando cliente...');
        const clientResponse = await fetch(`${API_BASE}/clients`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: 'Cliente Teste',
            email: 'cliente@teste.com',
            phone: '11988888888'
          })
        });

        if (clientResponse.status === 201) {
          const client = await clientResponse.json();
          console.log('✅ Cliente criado:', { id: client.id, name: client.full_name });

          // 6. Criar profissional
          console.log('\n💇 6. Criando profissional...');
          const professionalResponse = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: 'profissional@empresa-teste.com',
              full_name: 'Profissional Teste',
              password: 'Senha123@',
              role: 'COMPANY_PROFESSIONAL'
            })
          });

          if (professionalResponse.status === 201) {
            const professional = await professionalResponse.json();
            console.log('✅ Profissional criado:', { id: professional.id, name: professional.full_name });

            // 7. Criar agendamento
            console.log('\n📅 7. Criando agendamento...');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);

            const appointmentResponse = await fetch(`${API_BASE}/appointments`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                client_id: client.id,
                professional_id: professional.id,
                service_id: service.id,
                start_time: tomorrow.toISOString(),
                status: 'confirmed'
              })
            });

            if (appointmentResponse.status === 201) {
              const appointment = await appointmentResponse.json();
              console.log('✅ Agendamento criado:', { id: appointment.id, status: appointment.status });

              // 8. Criar comanda
              console.log('\n🧾 8. Criando comanda...');
              const commandResponse = await fetch(`${API_BASE}/commands`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  client_id: client.id,
                  professional_id: professional.id,
                  items: [{
                    service_id: service.id,
                    quantity: 1,
                    unit_price: service.price
                  }],
                  total_value: service.price,
                  net_value: service.price,
                  date: new Date().toISOString(),
                  status: 'pending'
                })
              });

              if (commandResponse.status === 201) {
                const command = await commandResponse.json();
                console.log('✅ Comanda criada:', { id: command.id, total_value: command.total_value });

                // 9. Testar dashboard
                console.log('\n📊 9. Testando dashboard...');
                const dashboardResponse = await fetch(`${API_BASE}/dashboard/overview`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (dashboardResponse.status === 200) {
                  const dashboard = await dashboardResponse.json();
                  console.log('✅ Dashboard Overview:', {
                    total_appointments: dashboard.appointments.total,
                    total_revenue: dashboard.revenue.total,
                    total_clients: dashboard.clients.total
                  });

                  console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!');
                  console.log('\n📊 Resumo dos dados criados:');
                  console.log(`  🏢 Empresa: ${company.name} (ID: ${company.id})`);
                  console.log(`  👤 Admin: ${userData.full_name} (ID: ${userData.id})`);
                  console.log(`  💇 Profissional: ${professional.full_name} (ID: ${professional.id})`);
                  console.log(`  ✂️ Serviço: ${service.name} (ID: ${service.id})`);
                  console.log(`  👥 Cliente: ${client.full_name} (ID: ${client.id})`);
                  console.log(`  📅 Agendamento: Status ${appointment.status} (ID: ${appointment.id})`);
                  console.log(`  🧾 Comanda: Status ${command.status} (ID: ${command.id})`);
                  console.log(`  💰 Valor total: R$ ${service.price.toFixed(2)}`);

                  console.log('\n🌐 Para testar o frontend:');
                  console.log(`  1. Login: ${registerData.email} / ${registerData.password}`);
                  console.log(`  2. Acesse: http://localhost:3000/dashboard`);
                  console.log(`  3. Você verá todos os dados reais no dashboard!`);

                } else {
                  console.log('❌ Erro ao acessar dashboard:', await dashboardResponse.json());
                }
              } else {
                console.log('❌ Erro ao criar comanda:', await commandResponse.json());
              }
            } else {
              console.log('❌ Erro ao criar agendamento:', await appointmentResponse.json());
            }
          } else {
            console.log('❌ Erro ao criar profissional:', await professionalResponse.json());
          }
        } else {
          console.log('❌ Erro ao criar cliente:', await clientResponse.json());
        }
      } else {
        console.log('❌ Erro ao criar serviço:', await serviceResponse.json());
      }
    } else {
      console.log('❌ Erro ao buscar empresa:', await companyResponse.json());
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAlternativeFlow();
