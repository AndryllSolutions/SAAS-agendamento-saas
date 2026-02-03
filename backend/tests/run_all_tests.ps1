# Script PowerShell para rodar todos os testes

Write-Host "Running all tests..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Running database tests..." -ForegroundColor Yellow
docker-compose exec backend pytest tests/test_database.py -v -m database

Write-Host ""
Write-Host "Running authentication tests..." -ForegroundColor Yellow
docker-compose exec backend pytest tests/test_auth.py -v -m auth

Write-Host ""
Write-Host "Running CRUD tests..." -ForegroundColor Yellow
docker-compose exec backend pytest tests/test_crud_complete.py -v -m crud

Write-Host ""
Write-Host "Running synergy tests..." -ForegroundColor Yellow
docker-compose exec backend pytest tests/test_synergy.py -v -m integration

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green

