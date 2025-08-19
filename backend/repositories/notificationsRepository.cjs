// Repositório para acesso à tabela 'notifications' no PostgreSQL local
const db = require('../postgresClient.cjs');

async function listAll() {
  const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
  return result.rows;
}

module.exports = {
  listAll,
};
