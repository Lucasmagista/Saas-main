// Cliente de conexão PostgreSQL para uso no backend
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set for PostgreSQL connection.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Outras configs podem ser adicionadas aqui
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
