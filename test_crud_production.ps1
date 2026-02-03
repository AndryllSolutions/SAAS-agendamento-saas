# Script de teste CRUD em producao - SaaS Agendamento
# Data: 2026-01-13
# Ambiente: Producao (VPS 72.62.138.239)

$BASE_URL = "https://72.62.138.239/api/v1"
$RESULTS_FILE = "test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

# Ignorar erros de certificado SSL self-signed
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
Add-Type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint sPoint, X509Certificate cert,
            WebRequest wRequest, int certProb) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$results = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $url = "$BASE_URL$Endpoint"
    
    Write-Host "`n[TEST] $Description" -ForegroundColor Cyan
    Write-Host "  Method: $Method" -ForegroundColor Gray
    Write-Host "  URL: $url" -ForegroundColor Gray
    
    $testResult = @{
        description = $Description
        method = $Method
        endpoint = $Endpoint
        timestamp = Get-Date -Format "HH:mm:ss"
        success = $false
        status_code = $null
        response = $null
        error = $null
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "  Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        $testResult.status_code = $response.StatusCode
        $testResult.response = $response.Content | ConvertFrom-Json
        $testResult.success = $true
        
        Write-Host "  [OK] Status: $($response.StatusCode)" -ForegroundColor Green
        
        return $testResult
    }
    catch {
        $testResult.status_code = $_.Exception.Response.StatusCode.value__
        $testResult.error = $_.Exception.Message
        
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $testResult.response = $errorBody
        } catch {
            $testResult.response = $_.ErrorDetails.Message
        }
        
        Write-Host "  [FAIL] Status: $($testResult.status_code)" -ForegroundColor Red
        Write-Host "  Error: $($testResult.error)" -ForegroundColor Red
        
        return $testResult
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "TESTE CRUD - MODULO DE CADASTROS" -ForegroundColor Yellow
Write-Host "Ambiente: Producao (72.62.138.239)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 1. AUTENTICACAO
Write-Host "`n=== 1. AUTENTICACAO ===" -ForegroundColor Yellow

$loginResult = Test-Endpoint -Method "POST" -Endpoint "/auth/login/json" -Description "Login de usuario" -Body @{
    email = "andrekaidellisola@gmail.com"
    password = "@DEDEra45ra45"
}

if (-not $loginResult.success) {
    Write-Host "`n[ERRO] Nao foi possivel autenticar. Tentando criar usuario..." -ForegroundColor Red
    
    # Tentar registrar novo usuario
    $registerResult = Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Description "Registrar novo usuario" -Body @{
        email = "teste@agendamento.com"
        password = "Teste@123"
        full_name = "Usuario Teste"
        company_name = "Empresa Teste"
    }
    
    if ($registerResult.success) {
        $TOKEN = $registerResult.response.access_token
        Write-Host "`n[OK] Usuario criado e autenticado!" -ForegroundColor Green
    } else {
        Write-Host "`n[ERRO CRITICO] Nao foi possivel autenticar ou criar usuario. Abortando testes." -ForegroundColor Red
        exit 1
    }
} else {
    $TOKEN = $loginResult.response.access_token
    Write-Host "`n[OK] Token obtido com sucesso!" -ForegroundColor Green
}

$results.tests += $loginResult

# 2. TESTE HEALTH CHECK
Write-Host "`n=== 2. HEALTH CHECK ===" -ForegroundColor Yellow
# Health check nao usa prefixo /api/v1
$healthUrl = "https://72.62.138.239/health"
try {
    $healthResponse = Invoke-WebRequest -Uri $healthUrl -Method GET -UseBasicParsing
    Write-Host "[OK] Health check: Status $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Health check nao acessivel externamente (esperado)" -ForegroundColor Yellow
}

# 3. CLIENTES
Write-Host "`n=== 3. CLIENTES ===" -ForegroundColor Yellow

# 3.1 Listar clientes
$clientsListResult = Test-Endpoint -Method "GET" -Endpoint "/clients" -Description "Listar clientes" -Token $TOKEN
$results.tests += $clientsListResult

# 3.2 Criar cliente
$newClient = @{
    full_name = "Cliente Teste CRUD"
    email = "cliente.teste@example.com"
    phone = "(11) 98765-4321"
    cellphone = "(11) 91234-5678"
    cpf = "123.456.789-00"
    notes = "Cliente criado via teste automatizado"
}

$clientCreateResult = Test-Endpoint -Method "POST" -Endpoint "/clients" -Description "Criar cliente" -Body $newClient -Token $TOKEN
$results.tests += $clientCreateResult

if ($clientCreateResult.success) {
    $clientId = $clientCreateResult.response.id
    Write-Host "  Cliente criado com ID: $clientId" -ForegroundColor Green
    
    # 3.3 Buscar cliente por ID
    $clientGetResult = Test-Endpoint -Method "GET" -Endpoint "/clients/$clientId" -Description "Buscar cliente por ID" -Token $TOKEN
    $results.tests += $clientGetResult
    
    # 3.4 Atualizar cliente
    $updateClient = @{
        full_name = "Cliente Teste CRUD (Editado)"
        notes = "Cliente editado via teste automatizado"
    }
    
    $clientUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/clients/$clientId" -Description "Atualizar cliente" -Body $updateClient -Token $TOKEN
    $results.tests += $clientUpdateResult
    
    # 3.5 Deletar cliente
    $clientDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/clients/$clientId" -Description "Deletar cliente" -Token $TOKEN
    $results.tests += $clientDeleteResult
}

# 4. CATEGORIAS DE SERVICO
Write-Host "`n=== 4. CATEGORIAS DE SERVICO ===" -ForegroundColor Yellow

# 4.1 Listar categorias
$categoriesListResult = Test-Endpoint -Method "GET" -Endpoint "/services/categories" -Description "Listar categorias de servico" -Token $TOKEN
$results.tests += $categoriesListResult

# 4.2 Criar categoria
$newCategory = @{
    name = "Categoria Teste"
    description = "Categoria criada via teste automatizado"
    color = "#FF5733"
}

$categoryCreateResult = Test-Endpoint -Method "POST" -Endpoint "/services/categories" -Description "Criar categoria de servico" -Body $newCategory -Token $TOKEN
$results.tests += $categoryCreateResult

if ($categoryCreateResult.success) {
    $categoryId = $categoryCreateResult.response.id
    Write-Host "  Categoria criada com ID: $categoryId" -ForegroundColor Green
    
    # 4.3 Buscar categoria por ID (NOVO ENDPOINT)
    $categoryGetResult = Test-Endpoint -Method "GET" -Endpoint "/services/categories/$categoryId" -Description "Buscar categoria por ID" -Token $TOKEN
    $results.tests += $categoryGetResult
    
    # 4.4 Atualizar categoria
    $updateCategory = @{
        name = "Categoria Teste (Editada)"
        description = "Categoria editada via teste automatizado"
    }
    
    $categoryUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/services/categories/$categoryId" -Description "Atualizar categoria" -Body $updateCategory -Token $TOKEN
    $results.tests += $categoryUpdateResult
    
    # 4.5 Deletar categoria (NOVO ENDPOINT)
    $categoryDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/services/categories/$categoryId" -Description "Deletar categoria" -Token $TOKEN
    $results.tests += $categoryDeleteResult
}

# 5. FORNECEDORES (NOVO ENDPOINT /suppliers)
Write-Host "`n=== 5. FORNECEDORES ===" -ForegroundColor Yellow

# 5.1 Listar fornecedores
$suppliersListResult = Test-Endpoint -Method "GET" -Endpoint "/suppliers" -Description "Listar fornecedores" -Token $TOKEN
$results.tests += $suppliersListResult

# 5.2 Criar fornecedor
$newSupplier = @{
    name = "Fornecedor Teste CRUD"
    email = "fornecedor.teste@example.com"
    phone = "(11) 3333-4444"
    cnpj = "12.345.678/0001-99"
    address = "Rua Teste, 123"
    city = "Sao Paulo"
    state = "SP"
    notes = "Fornecedor criado via teste automatizado"
}

$supplierCreateResult = Test-Endpoint -Method "POST" -Endpoint "/suppliers" -Description "Criar fornecedor" -Body $newSupplier -Token $TOKEN
$results.tests += $supplierCreateResult

if ($supplierCreateResult.success) {
    $supplierId = $supplierCreateResult.response.id
    Write-Host "  Fornecedor criado com ID: $supplierId" -ForegroundColor Green
    
    # 5.3 Buscar fornecedor por ID
    $supplierGetResult = Test-Endpoint -Method "GET" -Endpoint "/suppliers/$supplierId" -Description "Buscar fornecedor por ID" -Token $TOKEN
    $results.tests += $supplierGetResult
    
    # 5.4 Atualizar fornecedor
    $updateSupplier = @{
        name = "Fornecedor Teste CRUD (Editado)"
        notes = "Fornecedor editado via teste automatizado"
    }
    
    $supplierUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/suppliers/$supplierId" -Description "Atualizar fornecedor" -Body $updateSupplier -Token $TOKEN
    $results.tests += $supplierUpdateResult
    
    # 5.5 Deletar fornecedor
    $supplierDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/suppliers/$supplierId" -Description "Deletar fornecedor" -Token $TOKEN
    $results.tests += $supplierDeleteResult
}

# 6. MARCAS
Write-Host "`n=== 6. MARCAS ===" -ForegroundColor Yellow

# 6.1 Listar marcas
$brandsListResult = Test-Endpoint -Method "GET" -Endpoint "/products/brands" -Description "Listar marcas" -Token $TOKEN
$results.tests += $brandsListResult

# 6.2 Criar marca
$newBrand = @{
    name = "Marca Teste"
    notes = "Marca criada via teste automatizado"
}

$brandCreateResult = Test-Endpoint -Method "POST" -Endpoint "/products/brands" -Description "Criar marca" -Body $newBrand -Token $TOKEN
$results.tests += $brandCreateResult

if ($brandCreateResult.success) {
    $brandId = $brandCreateResult.response.id
    Write-Host "  Marca criada com ID: $brandId" -ForegroundColor Green
    
    # 6.3 Buscar marca por ID
    $brandGetResult = Test-Endpoint -Method "GET" -Endpoint "/products/brands/$brandId" -Description "Buscar marca por ID" -Token $TOKEN
    $results.tests += $brandGetResult
    
    # 6.4 Atualizar marca
    $updateBrand = @{
        name = "Marca Teste (Editada)"
        notes = "Marca editada via teste automatizado"
    }
    
    $brandUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/products/brands/$brandId" -Description "Atualizar marca" -Body $updateBrand -Token $TOKEN
    $results.tests += $brandUpdateResult
    
    # 6.5 Deletar marca
    $brandDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/products/brands/$brandId" -Description "Deletar marca" -Token $TOKEN
    $results.tests += $brandDeleteResult
}

# RESUMO FINAL
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "RESUMO DOS TESTES" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$totalTests = $results.tests.Count
$successTests = ($results.tests | Where-Object { $_.success -eq $true }).Count
$failedTests = $totalTests - $successTests

Write-Host "`nTotal de testes: $totalTests" -ForegroundColor White
Write-Host "Sucessos: $successTests" -ForegroundColor Green
Write-Host "Falhas: $failedTests" -ForegroundColor Red
Write-Host "Taxa de sucesso: $([math]::Round(($successTests / $totalTests) * 100, 2))%" -ForegroundColor Cyan

# Salvar resultados em arquivo JSON
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $RESULTS_FILE -Encoding UTF8
Write-Host "`nResultados salvos em: $RESULTS_FILE" -ForegroundColor Cyan

# Mostrar testes que falharam
if ($failedTests -gt 0) {
    Write-Host "`n=== TESTES QUE FALHARAM ===" -ForegroundColor Red
    $results.tests | Where-Object { $_.success -eq $false } | ForEach-Object {
        Write-Host "`n- $($_.description)" -ForegroundColor Red
        Write-Host "  Endpoint: $($_.endpoint)" -ForegroundColor Gray
        Write-Host "  Status: $($_.status_code)" -ForegroundColor Gray
        Write-Host "  Erro: $($_.error)" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TESTES CONCLUIDOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
