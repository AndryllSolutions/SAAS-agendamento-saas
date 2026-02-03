# Script de teste CRUD completo - Todos os modulos
# Data: 2026-01-13
# Ambiente: Producao (VPS 72.62.138.239)

$BASE_URL = "https://72.62.138.239/api/v1"
$RESULTS_FILE = "test_all_modules_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

# Ignorar erros de certificado SSL
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
    Write-Host "  $Method $url" -ForegroundColor Gray
    
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
        
        return $testResult
    }
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "TESTE CRUD COMPLETO - TODOS OS MODULOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# LOGIN
Write-Host "`n=== AUTENTICACAO ===" -ForegroundColor Yellow
$loginResult = Test-Endpoint -Method "POST" -Endpoint "/auth/login/json" -Description "Login" -Body @{
    email = "andrekaidellisola@gmail.com"
    password = "@DEDEra45ra45"
}

if (-not $loginResult.success) {
    Write-Host "`n[ERRO CRITICO] Falha na autenticacao" -ForegroundColor Red
    exit 1
}

$TOKEN = $loginResult.response.access_token
$USER_ID = $loginResult.response.user.id
$COMPANY_ID = $loginResult.response.user.company_id
Write-Host "User ID: $USER_ID, Company ID: $COMPANY_ID" -ForegroundColor Green
$results.tests += $loginResult

# ========== MODULO CADASTROS ==========

# SERVICOS
Write-Host "`n=== SERVICOS ===" -ForegroundColor Yellow
$servicesListResult = Test-Endpoint -Method "GET" -Endpoint "/services" -Description "Listar servicos" -Token $TOKEN
$results.tests += $servicesListResult

$newService = @{
    name = "Servico Teste CRUD"
    description = "Servico criado via teste automatizado"
    price = 150.00
    duration = 60
    requires_professional = $true
}

$serviceCreateResult = Test-Endpoint -Method "POST" -Endpoint "/services" -Description "Criar servico" -Body $newService -Token $TOKEN
$results.tests += $serviceCreateResult

if ($serviceCreateResult.success) {
    $serviceId = $serviceCreateResult.response.id
    Write-Host "  Servico criado com ID: $serviceId" -ForegroundColor Green
    
    $serviceGetResult = Test-Endpoint -Method "GET" -Endpoint "/services/$serviceId" -Description "Buscar servico por ID" -Token $TOKEN
    $results.tests += $serviceGetResult
    
    $updateService = @{
        name = "Servico Teste CRUD (Editado)"
        price = 200.00
    }
    
    $serviceUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/services/$serviceId" -Description "Atualizar servico" -Body $updateService -Token $TOKEN
    $results.tests += $serviceUpdateResult
    
    $serviceDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/services/$serviceId" -Description "Deletar servico" -Token $TOKEN
    $results.tests += $serviceDeleteResult
}

# PRODUTOS
Write-Host "`n=== PRODUTOS ===" -ForegroundColor Yellow
$productsListResult = Test-Endpoint -Method "GET" -Endpoint "/products" -Description "Listar produtos" -Token $TOKEN
$results.tests += $productsListResult

$newProduct = @{
    name = "Produto Teste CRUD"
    description = "Produto criado via teste"
    stock_current = 100
    stock_minimum = 10
    cost_price = 50.00
    sale_price = 100.00
}

$productCreateResult = Test-Endpoint -Method "POST" -Endpoint "/products" -Description "Criar produto" -Body $newProduct -Token $TOKEN
$results.tests += $productCreateResult

if ($productCreateResult.success) {
    $productId = $productCreateResult.response.id
    Write-Host "  Produto criado com ID: $productId" -ForegroundColor Green
    
    $productGetResult = Test-Endpoint -Method "GET" -Endpoint "/products/$productId" -Description "Buscar produto por ID" -Token $TOKEN
    $results.tests += $productGetResult
    
    $updateProduct = @{
        name = "Produto Teste CRUD (Editado)"
        sale_price = 120.00
    }
    
    $productUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/products/$productId" -Description "Atualizar produto" -Body $updateProduct -Token $TOKEN
    $results.tests += $productUpdateResult
    
    $productDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/products/$productId" -Description "Deletar produto" -Token $TOKEN
    $results.tests += $productDeleteResult
}

# PROFISSIONAIS
Write-Host "`n=== PROFISSIONAIS ===" -ForegroundColor Yellow
$professionalsListResult = Test-Endpoint -Method "GET" -Endpoint "/professionals" -Description "Listar profissionais" -Token $TOKEN
$results.tests += $professionalsListResult

$newProfessional = @{
    email = "profissional.teste@example.com"
    password = "Teste@123"
    full_name = "Profissional Teste CRUD"
    phone = "(11) 99999-8888"
    send_invite_email = $false
}

$professionalCreateResult = Test-Endpoint -Method "POST" -Endpoint "/professionals" -Description "Criar profissional" -Body $newProfessional -Token $TOKEN
$results.tests += $professionalCreateResult

if ($professionalCreateResult.success) {
    $professionalId = $professionalCreateResult.response.id
    Write-Host "  Profissional criado com ID: $professionalId" -ForegroundColor Green
    
    $professionalGetResult = Test-Endpoint -Method "GET" -Endpoint "/professionals/$professionalId" -Description "Buscar profissional por ID" -Token $TOKEN
    $results.tests += $professionalGetResult
    
    $updateProfessional = @{
        full_name = "Profissional Teste CRUD (Editado)"
    }
    
    $professionalUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/professionals/$professionalId" -Description "Atualizar profissional" -Body $updateProfessional -Token $TOKEN
    $results.tests += $professionalUpdateResult
    
    $professionalDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/professionals/$professionalId" -Description "Deletar profissional" -Token $TOKEN
    $results.tests += $professionalDeleteResult
}

# CATEGORIAS DE PRODUTO
Write-Host "`n=== CATEGORIAS DE PRODUTO ===" -ForegroundColor Yellow
$productCategoriesListResult = Test-Endpoint -Method "GET" -Endpoint "/products/categories" -Description "Listar categorias de produto" -Token $TOKEN
$results.tests += $productCategoriesListResult

$newProductCategory = @{
    name = "Categoria Produto Teste"
    description = "Categoria criada via teste"
}

$productCategoryCreateResult = Test-Endpoint -Method "POST" -Endpoint "/products/categories" -Description "Criar categoria de produto" -Body $newProductCategory -Token $TOKEN
$results.tests += $productCategoryCreateResult

if ($productCategoryCreateResult.success) {
    $productCategoryId = $productCategoryCreateResult.response.id
    Write-Host "  Categoria criada com ID: $productCategoryId" -ForegroundColor Green
    
    $productCategoryGetResult = Test-Endpoint -Method "GET" -Endpoint "/products/categories/$productCategoryId" -Description "Buscar categoria por ID" -Token $TOKEN
    $results.tests += $productCategoryGetResult
    
    $updateProductCategory = @{
        name = "Categoria Produto Teste (Editada)"
    }
    
    $productCategoryUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/products/categories/$productCategoryId" -Description "Atualizar categoria" -Body $updateProductCategory -Token $TOKEN
    $results.tests += $productCategoryUpdateResult
    
    $productCategoryDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/products/categories/$productCategoryId" -Description "Deletar categoria" -Token $TOKEN
    $results.tests += $productCategoryDeleteResult
}

# ========== MODULO PRINCIPAL ==========

# AGENDAMENTOS
Write-Host "`n=== AGENDAMENTOS ===" -ForegroundColor Yellow
$appointmentsListResult = Test-Endpoint -Method "GET" -Endpoint "/appointments" -Description "Listar agendamentos" -Token $TOKEN
$results.tests += $appointmentsListResult

# Criar agendamento para amanha as 14h
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT14:00:00")
$newAppointment = @{
    client_id = $USER_ID
    start_time = $tomorrow
    client_notes = "Agendamento criado via teste automatizado"
}

$appointmentCreateResult = Test-Endpoint -Method "POST" -Endpoint "/appointments" -Description "Criar agendamento" -Body $newAppointment -Token $TOKEN
$results.tests += $appointmentCreateResult

if ($appointmentCreateResult.success) {
    $appointmentId = $appointmentCreateResult.response.id
    Write-Host "  Agendamento criado com ID: $appointmentId" -ForegroundColor Green
    
    $appointmentGetResult = Test-Endpoint -Method "GET" -Endpoint "/appointments/$appointmentId" -Description "Buscar agendamento por ID" -Token $TOKEN
    $results.tests += $appointmentGetResult
    
    # Verificar se aparece na agenda
    $agendaResult = Test-Endpoint -Method "GET" -Endpoint "/appointments?start_date=$tomorrow" -Description "Verificar agendamento na agenda" -Token $TOKEN
    $results.tests += $agendaResult
    
    $updateAppointment = @{
        client_notes = "Agendamento editado via teste"
    }
    
    $appointmentUpdateResult = Test-Endpoint -Method "PUT" -Endpoint "/appointments/$appointmentId" -Description "Atualizar agendamento" -Body $updateAppointment -Token $TOKEN
    $results.tests += $appointmentUpdateResult
    
    $appointmentDeleteResult = Test-Endpoint -Method "DELETE" -Endpoint "/appointments/$appointmentId" -Description "Deletar agendamento" -Token $TOKEN
    $results.tests += $appointmentDeleteResult
}

# COMANDAS
Write-Host "`n=== COMANDAS ===" -ForegroundColor Yellow
$commandsListResult = Test-Endpoint -Method "GET" -Endpoint "/commands" -Description "Listar comandas" -Token $TOKEN
$results.tests += $commandsListResult

# PACOTES PREDEFINIDOS
Write-Host "`n=== PACOTES PREDEFINIDOS ===" -ForegroundColor Yellow
$predefinedPackagesListResult = Test-Endpoint -Method "GET" -Endpoint "/packages/predefined" -Description "Listar pacotes predefinidos" -Token $TOKEN
$results.tests += $predefinedPackagesListResult

# PACOTES
Write-Host "`n=== PACOTES ===" -ForegroundColor Yellow
$packagesListResult = Test-Endpoint -Method "GET" -Endpoint "/packages" -Description "Listar pacotes" -Token $TOKEN
$results.tests += $packagesListResult

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

# Salvar resultados
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $RESULTS_FILE -Encoding UTF8
Write-Host "`nResultados salvos em: $RESULTS_FILE" -ForegroundColor Cyan

# Mostrar falhas
if ($failedTests -gt 0) {
    Write-Host "`n=== TESTES QUE FALHARAM ===" -ForegroundColor Red
    $results.tests | Where-Object { $_.success -eq $false } | ForEach-Object {
        Write-Host "`n- $($_.description)" -ForegroundColor Red
        Write-Host "  Endpoint: $($_.endpoint)" -ForegroundColor Gray
        Write-Host "  Status: $($_.status_code)" -ForegroundColor Gray
        if ($_.response.detail) {
            Write-Host "  Detalhe: $($_.response.detail)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
