// Repositório para acesso à tabela 'bot_logs' no PostgreSQL local
// Repositório para acesso à tabela 'bot_logs' no PostgreSQL local
const db = require('../postgresClient.cjs');

async function insert(log) {
  const keys = Object.keys(log);
  const values = Object.values(log);
  const params = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO bot_logs (${keys.join(', ')}) VALUES (${params})`;
  await db.query(query, values);
  return { success: true };
}

async function listByBotId(botId, limit = 50) {
  const result = await db.query('SELECT * FROM bot_logs WHERE bot_id = $1 ORDER BY created_at DESC LIMIT $2', [botId, limit]);
  return result.rows;
}

module.exports = {
  insert,
  listByBotId,
};
