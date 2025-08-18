#!/bin/bash

echo "🔧 Testando configuração CORS..."

# Testa se o servidor está rodando
echo "📡 Verificando se o servidor está rodando na porta 3002..."
curl -s http://localhost:3002/api/auth/login > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Servidor está rodando na porta 3002"
else
    echo "❌ Servidor não está rodando na porta 3002"
    echo "💡 Execute: cd backend && node index.cjs"
    exit 1
fi

# Testa OPTIONS request (preflight)
echo "🔍 Testando preflight request..."
curl -X OPTIONS \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v http://localhost:3002/api/auth/login 2>&1 | grep -i "access-control"

# Testa POST request
echo "🧪 Testando POST request..."
curl -X POST \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -v http://localhost:3002/api/auth/login 2>&1 | grep -i "access-control"

echo "✅ Teste de CORS concluído!"
