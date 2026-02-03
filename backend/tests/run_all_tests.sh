#!/bin/bash
# Script to run all tests

echo "🧪 Running all tests..."

echo ""
echo "📦 Running database tests..."
pytest tests/test_database.py -v -m database

echo ""
echo "🔐 Running authentication tests..."
pytest tests/test_auth.py -v -m auth

echo ""
echo "📝 Running CRUD tests..."
pytest tests/test_crud_complete.py -v -m crud

echo ""
echo "🔄 Running synergy tests..."
pytest tests/test_synergy.py -v -m integration

echo ""
echo "✅ All tests completed!"

