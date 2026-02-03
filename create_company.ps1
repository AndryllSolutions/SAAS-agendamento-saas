# Script para criar empresa de teste no PostgreSQL
$companyName = "Empresa Teste Demo"
$companySlug = "empresa-teste-demo"
$companyEmail = "contato@empresa-teste.com"
$companyPhone = "+5511999998888"
$timezone = "America/Sao_Paulo"
$currency = "BRL"
$businessType = "services"
$teamSize = "small"
$subscriptionPlan = "BASIC"

$sql = @"
INSERT INTO companies (name, slug, email, phone, timezone, currency, business_type, team_size, subscription_plan, created_at, updated_at) 
VALUES (
    '$companyName',
    '$companySlug',
    '$companyEmail',
    '$companyPhone',
    '$timezone',
    '$currency',
    '$businessType',
    '$teamSize',
    '$subscriptionPlan',
    NOW(),
    NOW()
) RETURNING id;
"@

Write-Host "72.62.138.239"
Invoke-Command -ScriptBlock {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Password
    )
    
    # Criar arquivo SQL temporário
    $sql | Out-File -FilePath "/tmp/create_company.sql" -Encoding UTF8
    
    # Executar no PostgreSQL
    $result = docker exec agendamento_db_prod psql -U agendamento_app -d agendamento -f /tmp/create_company.sql
    
    Write-Host "Empresa criada com ID: $result"
} -ArgumentList $Password
