// Script para testar autenticação
const fetch = require('node-fetch');
const fs = require('fs');

const API_BASE = 'http://localhost:3002/api';

async function testAuthFlow() {
  console.log('🔧 Iniciando teste de autenticação...\n');

  try {
    // Teste 1: Login
    console.log('1. Testando login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@exemplo.com', // Ajuste para seu email de admin
        password: 'senha123'         // Ajuste para sua senha
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginData.success,
      hasAccessToken: !!loginData.accessToken,
      hasRefreshToken: !!loginData.refreshToken,
      userRole: loginData.user?.role
    });

    if (!loginData.success) {
      console.error('❌ Falha no login:', loginData.error);
      return;
    }

    const { accessToken, refreshToken } = loginData;

    // Teste 2: Verificar endpoint /me
    console.log('\n2. Testando endpoint /auth/me...');
    const meResponse = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const meData = await meResponse.json();
    console.log('Me response:', {
      status: meResponse.status,
      success: meData.success,
      userData: meData.data
    });

    // Teste 3: Testar refresh token
    console.log('\n3. Testando refresh token...');
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      }),
    });

    const refreshData = await refreshResponse.json();
    console.log('Refresh response:', {
      status: refreshResponse.status,
      success: refreshData.success,
      hasNewAccessToken: !!refreshData.accessToken
    });

    console.log('\n✅ Testes concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };
