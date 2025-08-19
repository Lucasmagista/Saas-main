/*
 * Centraliza o carregamento e validação de variáveis de ambiente da aplicação.
 * Utiliza dotenv para carregar valores de .env e valida chaves obrigatórias.
 * Caso alguma variável essencial esteja ausente, a aplicação lançará um erro
 * durante o bootstrap, evitando comportamentos inesperados em produção.
 */

const dotenv = require('dotenv');
const fs = require('fs');

// Carrega variáveis de ambiente do arquivo .env, se existir
dotenv.config();

// Lista de variáveis obrigatórias. Adicione novas chaves conforme necessário.
const REQUIRED_VARS = [
  'JWT_SECRET',
  'WPP_PORT',
  'DATABASE_URL', // Adicionado para PostgreSQL local
];

// Valida presença das variáveis obrigatórias
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}. Verifique seu arquivo .env`);
}

// Validações adicionais
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres para segurança');
}

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
  throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida');
}

/**
 * Exporta todas as variáveis de ambiente relevantes para o restante da aplicação.
 * Campos adicionais podem ser adicionados livremente. Para valores opcionais,
 * utilize operador || para definir defaults ou deixe undefined.
 */
module.exports = {
  // JWT e Autenticação
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // WhatsApp
  wppPort: process.env.WPP_PORT,
  
  // Ambiente
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  
  // Banco de dados
  databaseUrl: process.env.DATABASE_URL,
  databasePoolSize: parseInt(process.env.DATABASE_POOL_SIZE) || 10,
  databaseIdleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT) || 30000,
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : process.env.CORS_ORIGIN === '*' 
    ? true
    : process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
  
  // Redis (opcional)
  redisHost: process.env.REDIS_HOST || '',
  redisPort: process.env.REDIS_PORT || '',
  redisPassword: process.env.REDIS_PASSWORD || '',
  
  // Logs
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  
  // Uploads
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  
  // Webhooks
  webhookTimeout: parseInt(process.env.WEBHOOK_TIMEOUT) || 10000,
  webhookRetries: parseInt(process.env.WEBHOOK_RETRIES) || 3,
  
  // Segurança
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000, // 24h
};
