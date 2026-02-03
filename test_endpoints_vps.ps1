# Script para testar endpoints CRUD na VPS
# Usar: .\test_endpoints_vps.ps1

$VPS_IP = "72.62.138.239"
$BASE_URL = "http://$VPS_IP/api/api/v1"

Write-Host "=== TESTE DE ENDPOINTS VPS ===" -ForegroundColor Cyan
Write-Host "VPS: $VPS_IP" -ForegroundColor Yellow
Write-Host "Base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# Função para fazer requisições SSH
function Invoke-VPSRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = "",
        [string]$Token = ""
    )
    
    $headers = if ($Token) { 
        '"Content-Type: application/json" -H "Authorization: Bearer ' + $Token + '"'
    } else { 
        '"Content-Type: application/json"'
    }
    
    $bodyParam = if ($Body) { "-d '$Body'" } else { "" }
    
    $curlCommand = "curl -s -X $Method `"http://localhost:8000$Endpoint`" -H $headers $bodyParam"
    
    Write-Host "Executando: $Method $Endpoint" -ForegroundColor Green
    
    # Usar o comando via SSH para executar dentro do container
    $sshCommand = "ssh root@$VPS_IP `"docker exec agendamento_backend_prod $curlCommand`""
    
    try {
        $result = Invoke-Expression $sshCommand
        Write-Host "Resposta: $result" -ForegroundColor White
        return $result
    } catch {
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Testar Health Check
Write-Host "`n=== 1. TESTE HEALTH CHECK ===" -ForegroundColor Magenta
$healthResult = Invoke-VPSRequest -Method "GET" -Endpoint "/health"

# 2. Testar Registro de Usuário (criar empresa de teste)
Write-Host "`n=== 2. TESTE REGISTRO ===" -ForegroundColor Magenta
$registerBody = @{
    full_name = "Admin Teste Endpoints"
    email = "admin@testendpoints$(Get-Random -Maximum 999).com"
    password = "Admin123!@#"
    company_name = "Empresa Teste Endpoints $(Get-Date -Format 'MMdd-HHmm')"
    business_type = "clinic"
} | ConvertTo-Json -Compress

$registerResult = Invoke-VPSRequest -Method "POST" -Endpoint "/api/v1/auth/register" -Body $registerBody

# 3. Fazer Login para obter token
Write-Host "`n=== 3. TESTE LOGIN ===" -ForegroundColor Magenta
if ($registerResult) {
    $loginBody = @{
        username = ($registerBody | ConvertFrom-Json).email
        password = "Admin123!@#"
    } | ConvertTo-Json -Compress
    
    $loginResult = Invoke-VPSRequest -Method "POST" -Endpoint "/api/v1/auth/login" -Body $loginBody
    
    if ($loginResult) {
        try {
            $loginData = $loginResult | ConvertFrom-Json
            $token = $loginData.access_token
            Write-Host "Token obtido: $($token.Substring(0,50))..." -ForegroundColor Green
            
            # 4. Testar CRUD de Clientes
            Write-Host "`n=== 4. TESTE CRUD CLIENTES ===" -ForegroundColor Magenta
            
            # CREATE Client
            $clientBody = @{
                full_name = "Cliente Teste"
                email = "cliente@teste.com"
                phone = "(11) 99999-9999"
                cpf = "123.456.789-01"
            } | ConvertTo-Json -Compress
            
            $createClientResult = Invoke-VPSRequest -Method "POST" -Endpoint "/api/v1/clients" -Body $clientBody -Token $token
            
            # READ Clients
            $listClientsResult = Invoke-VPSRequest -Method "GET" -Endpoint "/api/v1/clients" -Token $token
            
            # 5. Testar CRUD de Serviços
            Write-Host "`n=== 5. TESTE CRUD SERVIÇOS ===" -ForegroundColor Magenta
            
            # CREATE Service
            $serviceBody = @{
                name = "Serviço Teste"
                description = "Descrição do serviço teste"
                price = 100.00
                duration_minutes = 60
                currency = "BRL"
            } | ConvertTo-Json -Compress
            
            $createServiceResult = Invoke-VPSRequest -Method "POST" -Endpoint "/api/v1/services" -Body $serviceBody -Token $token
            
            # READ Services
            $listServicesResult = Invoke-VPSRequest -Method "GET" -Endpoint "/api/v1/services" -Token $token
            
            # 6. Testar CRUD de Profissionais
            Write-Host "`n=== 6. TESTE CRUD PROFISSIONAIS ===" -ForegroundColor Magenta
            
            # CREATE Professional
            $professionalBody = @{
                full_name = "Profissional Teste"
                email = "profissional@teste.com"
                password = "Prof123!@#"
                phone = "(11) 88888-8888"
                commission_rate = 20
            } | ConvertTo-Json -Compress
            
            $createProfessionalResult = Invoke-VPSRequest -Method "POST" -Endpoint "/api/v1/professionals" -Body $professionalBody -Token $token
            
            # READ Professionals
            $listProfessionalsResult = Invoke-VPSRequest -Method "GET" -Endpoint "/api/v1/professionals" -Token $token
            
            # 7. Testar CRUD de Usuários
            Write-Host "`n=== 7. TESTE CRUD USUÁRIOS ===" -ForegroundColor Magenta
            
            # READ Users
            $listUsersResult = Invoke-VPSRequest -Method "GET" -Endpoint "/api/v1/users" -Token $token
            
            # GET Current User
            $currentUserResult = Invoke-VPSRequest -Method "GET" -Endpoint "/api/v1/users/me" -Token $token
            
        } catch {
            Write-Host "Erro ao processar token: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== TESTE CONCLUÍDO ===" -ForegroundColor Cyan
Write-Host "Verifique os resultados acima para validar se os endpoints estão funcionando." -ForegroundColor Yellow
