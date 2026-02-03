#!/bin/bash
# Script para rodar testes dentro do Docker

echo "Running all tests in Docker..."

echo ""
echo "Running database tests..."
docker-compose exec backend pytest tests/test_database.py -v -m database

echo ""
echo "Running authentication tests..."
docker-compose exec backend pytest tests/test_auth.py -v -m auth

echo ""
echo "Running CRUD tests..."
docker-compose exec backend pytest tests/test_crud_complete.py -v -m crud

echo ""
echo "Running synergy tests..."
docker-compose exec backend pytest tests/test_synergy.py -v -m integration

echo ""
echo "All tests completed!"

