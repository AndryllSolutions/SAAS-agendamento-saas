// Script de teste completo usando os campos exatos do frontend
const API_BASE = 'http://localhost:8000/api/v1';

async function testCompleteFlow() {
  console.log('🚀 Iniciando teste completo com campos corretos do frontend...\n');

  try {
    // 1. Criar empresa e usuário via auth/register (campos exatos do frontend)
    console.log('📋 1. Criando empresa e usuário via auth/register...');
    const registerData = {
      name: 'Administrador Teste Dashboard',
      email: 'admin@empresa-teste.com',
      phone: '11999999999',
      password: 'Senha123@',
      company_name: 'Empresa Teste Dashboard',
      business_type: 'salao_de_beleza',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      team_size: '2-5',
      slug: 'empresa-teste-dashboard',
      plan_type: 'FREE',
      trial_end_date: null,
      referral_code: null,
      coupon_code: null,
    };

    console.log('📤 Enviando dados:', JSON.stringify(registerData, null, 2));

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.status !== 201) {
      const error = await registerResponse.json();
      console.log('❌ Erro no registro:', error);
      console.log('Status:', registerResponse.status);
      return;
    }

    const userData = await registerResponse.json();
    console.log('✅ Usuário criado:', { id: userData.id, email: userData.email, company_id: userData.company_id });

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
      console.log('✅ Empresa encontrada:', { id: company.id, name: company.name, slug: company.slug });
      
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

                // 9. Finalizar comanda
                console.log('\n💰 9. Finalizando comanda...');
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

                if (updateCommandResponse.status === 200) {
                  const updatedCommand = await updateCommandResponse.json();
                  console.log('✅ Comanda finalizada:', { id: updatedCommand.id, status: updatedCommand.status });

                  // 10. Finalizar agendamento
                  console.log('\n✅ 10. Finalizando agendamento...');
                  const updateAppointmentResponse = await fetch(`${API_BASE}/appointments/${appointment.id}`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      status: 'completed'
                    })
                  });

                  if (updateAppointmentResponse.status === 200) {
                    const updatedAppointment = await updateAppointmentResponse.json();
                    console.log('✅ Agendamento finalizado:', { id: updatedAppointment.id, status: updatedAppointment.status });

                    // 11. Testar dashboard com dados reais
                    console.log('\n📊 11. Testando dashboard com dados reais...');
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

                      const commandsStatsResponse = await fetch(`${API_BASE}/dashboard/commands-stats`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      });

                      if (commandsStatsResponse.status === 200) {
                        const commandsStats = await commandsStatsResponse.json();
                        console.log('✅ Commands Stats:', {
                          total_commands: commandsStats.total_commands,
                          conversion_rate: commandsStats.conversion_rate
                        });

                        console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!');
                        console.log('\n📊 Resumo dos dados criados:');
                        console.log(`  🏢 Empresa: ${company.name} (ID: ${company.id})`);
                        console.log(`  👤 Admin: ${userData.full_name} (ID: ${userData.id})`);
                        console.log(`  💇 Profissional: ${professional.full_name} (ID: ${professional.id})`);
                        console.log(`  ✂️ Serviço: ${service.name} (ID: ${service.id})`);
                        console.log(`  👥 Cliente: ${client.full_name} (ID: ${client.id})`);
                        console.log(`  📅 Agendamento: Status ${updatedAppointment.status} (ID: ${appointment.id})`);
                        console.log(`  🧾 Comanda: Status ${updatedCommand.status} (ID: ${command.id})`);
                        console.log(`  💰 Valor total: R$ ${service.price.toFixed(2)}`);

                        console.log('\n🌐 Para testar o frontend:');
                        console.log(`  1. Login: ${registerData.email} / ${registerData.password}`);
                        console.log(`  2. Acesse: http://localhost:3000/dashboard`);
                        console.log(`  3. Você verá todos os dados reais no dashboard!`);

                        console.log('\n📈 Métricas do Dashboard:');
                        console.log(`  • Total de Agendamentos: ${dashboard.appointments.total}`);
                        console.log(`  • Receita Total: R$ ${dashboard.revenue.total.toFixed(2)}`);
                        console.log(`  • Total de Clientes: ${dashboard.clients.total}`);
                        console.log(`  • Total de Comandas: ${commandsStats.total_commands}`);
                        console.log(`  • Taxa de Conversão: ${commandsStats.conversion_rate.toFixed(1)}%`);

                      } else {
                        console.log('❌ Erro ao buscar commands stats:', await commandsStatsResponse.json());
                      }
                    } else {
                      console.log('❌ Erro ao acessar dashboard:', await dashboardResponse.json());
                    }
                  } else {
                    console.log('❌ Erro ao finalizar agendamento:', await updateAppointmentResponse.json());
                  }
                } else {
                  console.log('❌ Erro ao finalizar comanda:', await updateCommandResponse.json());
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
    console.error('Stack trace:', error.stack);
  }
}

// Executar teste completo
testCompleteFlow();
