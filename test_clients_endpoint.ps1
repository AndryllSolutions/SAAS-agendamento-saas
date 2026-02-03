# Teste endpoint de clientes
$BASE_URL = "https://72.62.138.239/api/v1"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Write-Host "=== TESTE ENDPOINT DE CLIENTES ===" -ForegroundColor Yellow

# Login
Write-Host "`n[1] Autenticando..." -ForegroundColor Cyan
$loginBody = @{
    email = "andrekaidellisola@gmail.com"
    password = "@DEDEra45ra45"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login/json" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$TOKEN = $loginData.access_token
Write-Host "  [OK] Token obtido" -ForegroundColor Green

# Testar endpoint de clientes
Write-Host "`n[2] Testando GET /clients..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

try {
    $clientsResponse = Invoke-WebRequest -Uri "$BASE_URL/clients" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "  [OK] Status: $($clientsResponse.StatusCode)" -ForegroundColor Green
    
    $clients = $clientsResponse.Content | ConvertFrom-Json
    
    if ($clients -is [array]) {
        Write-Host "  [OK] Retornou array com $($clients.Count) clientes" -ForegroundColor Green
    } elseif ($clients.value) {
        Write-Host "  [OK] Retornou objeto com $($clients.value.Count) clientes" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Estrutura da resposta:" -ForegroundColor Yellow
        Write-Host ($clients | ConvertTo-Json -Depth 2)
    }
    
} catch {
    Write-Host "  [ERRO] Falha ao listar clientes" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Detalhe: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== FIM DO TESTE ===" -ForegroundColor Yellow
