# 📡 Exemplos de Uso da API

## 🔐 Autenticação

### Registrar Novo Usuário

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "password": "Senha123",
    "full_name": "Novo Usuário",
    "phone": "(11) 99999-9999",
    "role": "client",
    "company_id": 1
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@belezatotal.com&password=admin123"
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Obter Usuário Atual

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## 📅 Agendamentos

### Listar Agendamentos

```bash
curl -X GET "http://localhost:8000/api/v1/appointments?skip=0&limit=10" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Criar Agendamento

```bash
curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "professional_id": 2,
    "start_time": "2025-10-01T14:00:00",
    "client_notes": "Primeira vez no salão"
  }'
```

### Cancelar Agendamento

```bash
curl -X POST "http://localhost:8000/api/v1/appointments/1/cancel" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellation_reason": "Imprevisto"
  }'
```

### Check-in com QR Code

```bash
curl -X POST "http://localhost:8000/api/v1/appointments/1/check-in" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "check_in_code": "ABC123XYZ"
  }'
```

## 🛎️ Serviços

### Listar Serviços

```bash
curl -X GET "http://localhost:8000/api/v1/services" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Criar Serviço

```bash
curl -X POST "http://localhost:8000/api/v1/services" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corte Masculino Premium",
    "description": "Corte com lavagem e finalização",
    "price": 60.00,
    "duration_minutes": 45,
    "category_id": 1,
    "currency": "BRL",
    "requires_professional": true,
    "commission_rate": 40
  }'
```

### Atualizar Serviço

```bash
curl -X PUT "http://localhost:8000/api/v1/services/1" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 65.00,
    "description": "Corte premium com lavagem, finalização e massagem"
  }'
```

## 💳 Pagamentos

### Criar Pagamento

```bash
curl -X POST "http://localhost:8000/api/v1/payments" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "user_id": 5,
    "amount": 50.00,
    "payment_method": "pix",
    "currency": "BRL",
    "gateway": "mercadopago"
  }'
```

### Listar Pagamentos

```bash
curl -X GET "http://localhost:8000/api/v1/payments?skip=0&limit=10" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Webhook de Pagamento

```bash
curl -X POST "http://localhost:8000/api/v1/payments/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "mercadopago",
    "transaction_id": "12345678",
    "status": "approved",
    "data": {
      "payment_id": "123456",
      "amount": 50.00
    }
  }'
```

## 👥 Usuários

### Listar Usuários (Manager/Admin)

```bash
curl -X GET "http://localhost:8000/api/v1/users?role=professional" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Atualizar Perfil

```bash
curl -X PUT "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "João Silva Santos",
    "phone": "(11) 98888-8888",
    "bio": "Barbeiro profissional com 10 anos de experiência"
  }'
```

### Listar Profissionais Disponíveis

```bash
curl -X GET "http://localhost:8000/api/v1/users/professionals/available" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## ⭐ Avaliações

### Criar Avaliação

```bash
curl -X POST "http://localhost:8000/api/v1/reviews" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 1,
    "rating": 5,
    "comment": "Excelente atendimento! Muito profissional."
  }'
```

### Listar Avaliações de um Profissional

```bash
curl -X GET "http://localhost:8000/api/v1/reviews?professional_id=2" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Estatísticas de Avaliações

```bash
curl -X GET "http://localhost:8000/api/v1/reviews/professional/2/stats" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Resposta:**
```json
{
  "total_reviews": 45,
  "average_rating": 4.7,
  "rating_distribution": {
    "5": 30,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  }
}
```

### Responder Avaliação (Profissional)

```bash
curl -X POST "http://localhost:8000/api/v1/reviews/1/response" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Obrigado pelo feedback! Foi um prazer atendê-lo."
  }'
```

## 📊 Dashboard

### Visão Geral

```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/overview?start_date=2025-09-01T00:00:00&end_date=2025-09-30T23:59:59" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Resposta:**
```json
{
  "period": {
    "start_date": "2025-09-01T00:00:00",
    "end_date": "2025-09-30T23:59:59"
  },
  "appointments": {
    "total": 150,
    "completed": 135,
    "cancelled": 10,
    "completion_rate": 90.0
  },
  "revenue": {
    "total": 7500.00,
    "pending": 500.00,
    "average_per_appointment": 55.56
  },
  "clients": {
    "total": 85
  },
  "satisfaction": {
    "average_rating": 4.7
  }
}
```

### Top Serviços

```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/top-services?limit=5" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Top Profissionais

```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/top-professionals?limit=5" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Gráfico de Receita

```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/revenue-chart?period=daily" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Taxa de Ocupação

```bash
curl -X GET "http://localhost:8000/api/v1/dashboard/occupancy-rate" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## 🔔 Notificações

### Listar Notificações

```bash
curl -X GET "http://localhost:8000/api/v1/notifications?skip=0&limit=20" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Contar Não Lidas

```bash
curl -X GET "http://localhost:8000/api/v1/notifications/unread/count" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Resposta:**
```json
{
  "count": 5
}
```

### Marcar como Lida

```bash
curl -X POST "http://localhost:8000/api/v1/notifications/1/read" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Marcar Todas como Lidas

```bash
curl -X POST "http://localhost:8000/api/v1/notifications/read-all" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## 🏢 Empresas

### Obter Empresa Atual

```bash
curl -X GET "http://localhost:8000/api/v1/companies/me" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Atualizar Empresa (Admin)

```bash
curl -X PUT "http://localhost:8000/api/v1/companies/me" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salão Beleza Total Premium",
    "description": "O melhor salão da região",
    "phone": "(11) 3333-3333",
    "primary_color": "#FF5733",
    "business_hours": {
      "monday": {"start": "08:00", "end": "20:00"},
      "tuesday": {"start": "08:00", "end": "20:00"}
    }
  }'
```

## 🏗️ Recursos

### Listar Recursos

```bash
curl -X GET "http://localhost:8000/api/v1/resources" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Criar Recurso

```bash
curl -X POST "http://localhost:8000/api/v1/resources" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sala 1",
    "description": "Sala para atendimentos",
    "resource_type": "room",
    "location": "Primeiro andar",
    "capacity": 1
  }'
```

## 🐍 Exemplos em Python

### Cliente Python Completo

```python
import requests

class AgendamentoClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            data={"username": email, "password": password}
        )
        data = response.json()
        self.token = data["access_token"]
        return data
    
    def get_headers(self):
        return {"Authorization": f"Bearer {self.token}"}
    
    def list_appointments(self):
        response = requests.get(
            f"{self.base_url}/api/v1/appointments",
            headers=self.get_headers()
        )
        return response.json()
    
    def create_appointment(self, service_id, professional_id, start_time):
        response = requests.post(
            f"{self.base_url}/api/v1/appointments",
            headers=self.get_headers(),
            json={
                "service_id": service_id,
                "professional_id": professional_id,
                "start_time": start_time
            }
        )
        return response.json()

# Uso
client = AgendamentoClient()
client.login("admin@belezatotal.com", "admin123")
appointments = client.list_appointments()
print(appointments)
```

## 🔄 JavaScript/TypeScript

### Cliente Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', 
    new URLSearchParams({ username: email, password })
  );
  localStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

// Listar agendamentos
const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

// Criar agendamento
const createAppointment = async (data: any) => {
  const response = await api.post('/appointments', data);
  return response.data;
};
```

## 📝 Notas Importantes

### Rate Limiting
- Limite padrão: 60 requisições por minuto
- Headers de resposta incluem: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### Paginação
- Parâmetros: `skip` (offset) e `limit` (quantidade)
- Padrão: `skip=0`, `limit=100`
- Máximo: `limit=1000`

### Datas
- Formato: ISO 8601 (`2025-10-01T14:00:00`)
- Timezone: UTC (converter no cliente)

### Erros
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido/expirado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `422` - Validation Error (erro de validação)
- `500` - Internal Server Error

---

**Documentação Interativa**: http://localhost:8000/docs
