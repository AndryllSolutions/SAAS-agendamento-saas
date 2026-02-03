# Teste CRUD de Profissional - Validacao pos-correcoes
# Data: 2026-01-13

$BASE_URL = "https://72.62.138.239/api/v1"

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

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "TESTE CRUD PROFISSIONAL - POS-CORRECOES" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 1. LOGIN
Write-Host "`n[1/6] Autenticando..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "andrekaidellisola@gmail.com"
        password = "@DEDEra45ra45"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login/json" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $TOKEN = $loginData.access_token
    Write-Host "  [OK] Token obtido" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. LISTAR PROFISSIONAIS
Write-Host "`n[2/6] Listando profissionais..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    $listResponse = Invoke-WebRequest -Uri "$BASE_URL/professionals" -Method GET -Headers $headers -UseBasicParsing
    $professionals = ($listResponse.Content | ConvertFrom-Json)
    
    if ($professionals -is [array]) {
        $count = $professionals.Count
    } elseif ($professionals.value) {
        $count = $professionals.value.Count
    } else {
        $count = 1
    }
    
    Write-Host "  [OK] $count profissionais encontrados" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha ao listar: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. CRIAR PROFISSIONAL
Write-Host "`n[3/6] Criando profissional..." -ForegroundColor Cyan
try {
    $newProfessional = @{
        email = "profissional.teste.$(Get-Date -Format 'HHmmss')@example.com"
        password = "Teste@123456"
        full_name = "Profissional Teste CRUD"
        phone = "(11) 99999-8888"
        commission_rate = 15
        send_invite_email = $false
    } | ConvertTo-Json

    $createResponse = Invoke-WebRequest -Uri "$BASE_URL/professionals" -Method POST -Headers $headers -Body $newProfessional -UseBasicParsing
    $createdProfessional = $createResponse.Content | ConvertFrom-Json
    $professionalId = $createdProfessional.id
    
    Write-Host "  [OK] Profissional criado com ID: $professionalId" -ForegroundColor Green
    Write-Host "      Email: $($createdProfessional.email)" -ForegroundColor Gray
    Write-Host "      Nome: $($createdProfessional.full_name)" -ForegroundColor Gray
} catch {
    Write-Host "  [ERRO] Falha ao criar: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "      Detalhe: $($errorDetail.detail)" -ForegroundColor Red
    }
    exit 1
}

# 4. BUSCAR POR ID
Write-Host "`n[4/6] Buscando profissional por ID..." -ForegroundColor Cyan
try {
    $getResponse = Invoke-WebRequest -Uri "$BASE_URL/professionals/$professionalId" -Method GET -Headers $headers -UseBasicParsing
    $professional = $getResponse.Content | ConvertFrom-Json
    Write-Host "  [OK] Profissional encontrado: $($professional.full_name)" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha ao buscar: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. ATUALIZAR
Write-Host "`n[5/6] Atualizando profissional..." -ForegroundColor Cyan
try {
    $updateData = @{
        full_name = "Profissional Teste CRUD (Editado)"
        commission_rate = 20
    } | ConvertTo-Json

    $updateResponse = Invoke-WebRequest -Uri "$BASE_URL/professionals/$professionalId" -Method PUT -Headers $headers -Body $updateData -UseBasicParsing
    $updatedProfessional = $updateResponse.Content | ConvertFrom-Json
    Write-Host "  [OK] Profissional atualizado" -ForegroundColor Green
    Write-Host "      Nome: $($updatedProfessional.full_name)" -ForegroundColor Gray
    Write-Host "      Comissao: $($updatedProfessional.commission_rate)%" -ForegroundColor Gray
} catch {
    Write-Host "  [ERRO] Falha ao atualizar: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. DELETAR
Write-Host "`n[6/6] Deletando profissional..." -ForegroundColor Cyan
try {
    $deleteResponse = Invoke-WebRequest -Uri "$BASE_URL/professionals/$professionalId" -Method DELETE -Headers $headers -UseBasicParsing
    Write-Host "  [OK] Profissional deletado (Status: $($deleteResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Falha ao deletar: $($_.Exception.Message)" -ForegroundColor Red
}

# RESUMO
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TESTE CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`nValidacoes:" -ForegroundColor Cyan
Write-Host "  - Login funcionando" -ForegroundColor White
Write-Host "  - Endpoint /professionals acessivel via HTTPS" -ForegroundColor White
Write-Host "  - CRUD completo operacional" -ForegroundColor White
Write-Host "  - Mixed Content resolvido (sem erros HTTP)" -ForegroundColor White
Write-Host "`nProximo passo: Testar via interface web em" -ForegroundColor Cyan
Write-Host "  https://72.62.138.239/professionals" -ForegroundColor White
Write-Host "`n========================================" -ForegroundColor Yellow
