# Script para testar CORS no Windows
Write-Host "Testando configuracao CORS..." -ForegroundColor Cyan

# Testa se o servidor está rodando
Write-Host "Verificando se o servidor esta rodando na porta 3002..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method GET -ErrorAction Stop
    Write-Host "Servidor esta rodando na porta 3002" -ForegroundColor Green
} catch {
    Write-Host "Servidor nao esta rodando na porta 3002" -ForegroundColor Red
    Write-Host "Execute: cd backend && node index.cjs" -ForegroundColor Blue
    exit 1
}

# Testa OPTIONS request (preflight)
Write-Host "Testando preflight request..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:8080"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method OPTIONS -Headers $headers -ErrorAction Stop
    Write-Host "Preflight request OK" -ForegroundColor Green
    Write-Host "Response Headers:" -ForegroundColor Blue
    $response.Headers | Format-Table
} catch {
    Write-Host "Erro no preflight request: $($_.Exception.Message)" -ForegroundColor Red
}

# Testa POST request
Write-Host "Testando POST request..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:8080"
        "Content-Type" = "application/json"
    }
    $body = '{"email":"test@test.com","password":"test"}'
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/login" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "POST request enviado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "POST request retornou erro (esperado para credenciais invalidas): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Teste de CORS concluido!" -ForegroundColor Green
Write-Host "Se ainda houver problemas, reinicie o servidor backend" -ForegroundColor Blue
