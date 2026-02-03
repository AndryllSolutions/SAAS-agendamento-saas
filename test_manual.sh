#!/bin/bash
# Teste manual de criacao de fornecedor e marca

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwiZXhwIjoxNzY4MzQ3ODgwLCJ0eXBlIjoiYWNjZXNzIiwic2NvcGUiOiJjb21wYW55IiwiY29tcGFueV9pZCI6NCwiY29tcGFueV9yb2xlIjoiQ09NUEFOWV9PV05FUiJ9.RPhIoXNae5WpSmb1h1GdFTiTYkpY3jkEs-imtwxON08"

echo "=== Teste Fornecedor ==="
curl -X POST http://localhost:8000/api/v1/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Fornecedor"}' \
  -v

echo -e "\n\n=== Teste Marca ==="
curl -X POST http://localhost:8000/api/v1/products/brands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Marca"}' \
  -v
