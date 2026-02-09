// Teste de autenticação e endpoints públicos
const API_BASE = 'http://localhost:8000/api/v1';

async function testAuthAndPublicEndpoints() {
  console.log('🔐 Testando autenticação e endpoints públicos...\n');

  try {
    // 1. Tentar registrar um usuário
    console.log('📝 Tentando registrar usuário...');
    const registerData = {
      email: 'teste@exemplo.com',
      password: 'Senha123@',
      full_name: 'Usuário Teste',
      name: 'Teste Company',
      company_name: 'Empresa Teste',
      business_type: 'salao_beleza',
      team_size: '2-5',
      slug: 'empresa-teste',
      plan_type: 'ESSENCIAL'
    };

    try {
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      if (registerResponse.ok) {
        const result = await registerResponse.json();
        console.log('✅ Usuário registrado com sucesso!');
        console.log('   Email:', result.user?.email || registerData.email);
        
        // 2. Tentar login
        console.log('\n🔑 Tentando fazer login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password
          })
        });

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          console.log('✅ Login realizado com sucesso!');
          console.log('   Token obtido');

          // 3. Usar token para testar criação
          const token = loginResult.access_token;
          const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          };

          console.log('\n🧪 Testando criação com autenticação...');

          // Criar serviço
          console.log('📦 Criando serviço...');
          const serviceResponse = await fetch(`${API_BASE}/services`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: 'Corte Teste',
              description: 'Descrição do serviço teste',
              price: 50.00,
              duration_minutes: 30,
              currency: 'BRL'
            })
          });

          if (serviceResponse.ok) {
            const service = await serviceResponse.json();
            console.log('✅ Serviço criado:', service.name);
            console.log('   ID:', service.id);
          } else {
            console.log('❌ Erro ao criar serviço:', serviceResponse.status);
          }

          // Criar profissional
          console.log('👨‍💼 Criando profissional...');
          const profResponse = await fetch(`${API_BASE}/professionals`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              email: 'profissional@teste.com',
              password: 'Senha123@',
              full_name: 'Profissional Teste',
              phone: '(11) 99999-8888',
              specialties: ['Corte'],
              commission_rate: 10
            })
          });

          if (profResponse.ok) {
            const professional = await profResponse.json();
            console.log('✅ Profissional criado:', professional.full_name);
            console.log('   ID:', professional.id);
          } else {
            console.log('❌ Erro ao criar profissional:', profResponse.status);
          }

        } else {
          console.log('❌ Erro no login:', loginResponse.status);
        }

      } else {
        console.log('❌ Erro no registro:', registerResponse.status);
        const errorText = await registerResponse.text();
        console.log('   Detalhes:', errorText);
      }

    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
    }

    // 4. Verificar endpoints públicos
    console.log('\n🌐 Verificando endpoints públicos...');
    const publicEndpoints = [
      '/auth/register',
      '/auth/login',
      '/health',
      '/docs'
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        console.log(`${endpoint}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`${endpoint}: ❌ Erro - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAuthAndPublicEndpoints();
