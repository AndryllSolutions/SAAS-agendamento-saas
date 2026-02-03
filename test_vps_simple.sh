#!/bin/bash
# Script simples para testar endpoints na VPS
# Executar via SSH

echo "=== TESTE ENDPOINTS VPS ==="

# 1. Health Check
echo -e "\n=== 1. HEALTH CHECK ==="
curl -s "http://localhost:8000/health"

# 2. Registro de usuário e empresa
echo -e "\n=== 2. REGISTRO ==="
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Admin Teste Endpoints",
    "email": "admin@testeendpoints2026.com",
    "password": "Admin123!@#",
    "company_name": "Empresa Teste Endpoints 2026",
    "business_type": "clinic"
  }')
echo "$REGISTER_RESPONSE"

# 3. Login para obter token
echo -e "\n=== 3. LOGIN ==="
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@testeendpoints2026.com",
    "password": "Admin123!@#"
  }')
echo "$LOGIN_RESPONSE"

# Extrair token (assumindo que o JSON retorna access_token)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')

if [ -n "$TOKEN" ]; then
  echo "Token obtido: ${TOKEN:0:50}..."
  
  # 4. Testar CRUD Clientes
  echo -e "\n=== 4. TESTE CLIENTES ==="
  
  # CREATE Cliente
  echo "CREATE Cliente:"
  curl -s -X POST "http://localhost:8000/api/v1/clients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "full_name": "Cliente Teste VPS",
      "email": "cliente@testevps.com",
      "phone": "(11) 99999-9999",
      "cpf": "123.456.789-01"
    }'
  
  echo -e "\nREAD Clientes:"
  curl -s -X GET "http://localhost:8000/api/v1/clients" \
    -H "Authorization: Bearer $TOKEN"
  
  # 5. Testar CRUD Serviços
  echo -e "\n=== 5. TESTE SERVIÇOS ==="
  
  # CREATE Serviço
  echo "CREATE Serviço:"
  curl -s -X POST "http://localhost:8000/api/v1/services" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "name": "Serviço Teste VPS",
      "description": "Descrição do serviço teste",
      "price": 150.00,
      "duration_minutes": 90,
      "currency": "BRL"
    }'
  
  echo -e "\nREAD Serviços:"
  curl -s -X GET "http://localhost:8000/api/v1/services" \
    -H "Authorization: Bearer $TOKEN"
  
  # 6. Testar CRUD Profissionais
  echo -e "\n=== 6. TESTE PROFISSIONAIS ==="
  
  # CREATE Profissional
  echo "CREATE Profissional:"
  curl -s -X POST "http://localhost:8000/api/v1/professionals" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "full_name": "Profissional Teste VPS",
      "email": "prof@testevps.com",
      "password": "Prof123!@#",
      "phone": "(11) 88888-8888",
      "commission_rate": 25
    }'
  
  echo -e "\nREAD Profissionais:"
  curl -s -X GET "http://localhost:8000/api/v1/professionals" \
    -H "Authorization: Bearer $TOKEN"
  
  # 7. Testar CRUD Usuários
  echo -e "\n=== 7. TESTE USUÁRIOS ==="
  
  echo "READ Usuários:"
  curl -s -X GET "http://localhost:8000/api/v1/users" \
    -H "Authorization: Bearer $TOKEN"
  
  echo -e "\nGET Current User:"
  curl -s -X GET "http://localhost:8000/api/v1/users/me" \
    -H "Authorization: Bearer $TOKEN"
  
else
  echo "ERRO: Não foi possível obter token de autenticação"
fi

echo -e "\n=== TESTE CONCLUÍDO ==="
