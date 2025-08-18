#!/usr/bin/env node

/**
 * Script de teste para verificar as melhorias do WebSocket
 * Simula múltiplas conexões para testar rate limiting e estabilidade
 */

const io = require('socket.io-client');

// Configurações do teste
const SERVER_URL = 'http://localhost:3002';
const TOKEN = 'seu_token_jwt_aqui'; // Substitua por um token válido
const NUM_CONNECTIONS = 15; // Mais que o limit de 10 para testar rate limiting
const DELAY_BETWEEN_CONNECTIONS = 100; // ms

console.log('🧪 Iniciando teste de melhorias WebSocket...\n');

async function testConnections() {
  const connections = [];
  let successfulConnections = 0;
  let rateLimitedConnections = 0;
  let errors = 0;

  console.log(`📡 Tentando criar ${NUM_CONNECTIONS} conexões...`);
  
  for (let i = 0; i < NUM_CONNECTIONS; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CONNECTIONS));
      
      const socket = io(SERVER_URL, {
        auth: { token: TOKEN },
        transports: ['websocket', 'polling'],
        timeout: 20000
      });

      socket.on('connect', () => {
        successfulConnections++;
        console.log(`✅ Conexão ${i + 1} estabelecida: ${socket.id}`);
      });

      socket.on('connect_error', (err) => {
        if (err.message.includes('Rate limit')) {
          rateLimitedConnections++;
          console.log(`⛔ Conexão ${i + 1} bloqueada por rate limit: ${err.message}`);
        } else {
          errors++;
          console.log(`❌ Erro na conexão ${i + 1}: ${err.message}`);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log(`🔌 Conexão ${i + 1} desconectada: ${reason}`);
      });

      connections.push(socket);
    } catch (err) {
      errors++;
      console.log(`💥 Erro fatal na conexão ${i + 1}: ${err.message}`);
    }
  }

  // Aguarda um tempo para todas as conexões tentarem se estabelecer
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n📊 Resultados do teste:');
  console.log(`✅ Conexões bem-sucedidas: ${successfulConnections}`);
  console.log(`⛔ Conexões bloqueadas (rate limit): ${rateLimitedConnections}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`🎯 Total de tentativas: ${NUM_CONNECTIONS}`);

  // Verifica se o rate limiting está funcionando
  if (rateLimitedConnections > 0) {
    console.log('\n🎉 Rate limiting está funcionando corretamente!');
  } else {
    console.log('\n⚠️  Rate limiting pode não estar ativo ou token inválido');
  }

  // Testa reconexão
  console.log('\n🔄 Testando reconexão automática...');
  if (connections.length > 0 && connections[0].connected) {
    console.log('🔌 Forçando desconexão da primeira conexão...');
    connections[0].disconnect();
    
    // Aguarda para ver se reconecta
    setTimeout(() => {
      if (connections[0].connected) {
        console.log('✅ Reconexão automática funcionou!');
      } else {
        console.log('⚠️  Reconexão automática pode estar desabilitada (esperado)');
      }
    }, 3000);
  }

  // Limpa conexões após 10 segundos
  setTimeout(() => {
    console.log('\n🧹 Fechando todas as conexões...');
    connections.forEach((socket, index) => {
      if (socket.connected) {
        socket.disconnect();
        console.log(`🔌 Conexão ${index + 1} fechada`);
      }
    });
    console.log('\n✨ Teste concluído!');
    process.exit(0);
  }, 10000);
}

// Executa o teste
testConnections().catch(console.error);

console.log(`
📋 Instruções para usar este teste:

1. Certifique-se de que o servidor backend está rodando na porta 3002
2. Substitua TOKEN por um JWT válido do seu usuário
3. Execute: node test-websocket-improvements.js
4. Observe os logs para verificar:
   - ✅ Rate limiting funcionando (algumas conexões bloqueadas)
   - ✅ Conexões estabelecidas corretamente  
   - ✅ Logs de desconexão organizados
   - ✅ Configurações de timeout respeitadas

⚠️  NOTA: Este teste pode gerar muitos logs. Use apenas para desenvolvimento!
`);
