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
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'JWT_SECRET',
  'WPP_PORT',
];

// Valida presença das variáveis obrigatórias
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}. Verifique seu arquivo .env`);
}

/**
 * Exporta todas as variáveis de ambiente relevantes para o restante da aplicação.
 * Campos adicionais podem ser adicionados livremente. Para valores opcionais,
 * utilize operador || para definir defaults ou deixe undefined.
 */
module.exports = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  wppPort: process.env.WPP_PORT,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Lista de domínios permitidos para CORS. Valores separados por vírgula em ALLOWED_ORIGINS ou CORS_ORIGIN
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : process.env.CORS_ORIGIN === '*' 
    ? true
    : process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
  // Configurações opcionais para Redis quando habilitar cluster Socket.IO. Se não definidos,
  // o Redis não será utilizado. Definidos em .env como REDIS_HOST e REDIS_PORT.
  redisHost: process.env.REDIS_HOST || '',
  redisPort: process.env.REDIS_PORT || '',
};
