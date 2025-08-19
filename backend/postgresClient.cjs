// Cliente de conexão PostgreSQL para uso no backend
const { Pool } = require('pg');
const config = require('./config.cjs');
const logger = require('./logger.cjs');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL environment variable must be set for PostgreSQL connection.');
}

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.databasePoolSize, // Máximo de conexões no pool
  idleTimeoutMillis: config.databaseIdleTimeout, // Tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 10000, // Tempo máximo para estabelecer conexão
  statement_timeout: 15000,
  query_timeout: 20000,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Event listeners para monitoramento do pool
pool.on('connect', (client) => {
  logger.info('Nova conexão PostgreSQL estabelecida');
});

pool.on('error', (err, client) => {
  logger.error('Erro inesperado no cliente PostgreSQL', { error: err.message });
});

pool.on('remove', (client) => {
  logger.info('Cliente PostgreSQL removido do pool');
});

// Função para testar a conexão
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Conexão PostgreSQL testada com sucesso', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Erro ao testar conexão PostgreSQL', { error: error.message });
    return false;
  }
}

// Função para executar queries com retry
async function queryWithRetry(text, params, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      logger.warn(`Tentativa ${attempt} falhou`, { 
        error: error.message, 
        query: text.substring(0, 100) + '...' 
      });
      
      // Se não for a última tentativa, aguarda antes de tentar novamente
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

// Função para executar transações
async function transaction(callback) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para fechar o pool (útil para testes e shutdown)
async function closePool() {
  await pool.end();
  logger.info('Pool PostgreSQL fechado');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  queryWithRetry,
  transaction,
  testConnection,
  closePool,
  pool
};
