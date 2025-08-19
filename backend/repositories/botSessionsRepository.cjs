// Repositório para persistência de sessões de bots no PostgreSQL local
const db = require('../postgresClient.cjs');
const TABLE = 'bot_sessions';

async function insert(session) {
  const keys = Object.keys(session);
  const values = Object.values(session);
  const params = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO ${TABLE} (${keys.join(', ')}) VALUES (${params}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
}

async function update(sessionId, updates) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const query = `UPDATE ${TABLE} SET ${setString} WHERE session_id = $${keys.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, sessionId]);
  return result.rows[0];
}

async function getById(sessionId) {
  const result = await db.query(`SELECT * FROM ${TABLE} WHERE session_id = $1`, [sessionId]);
  return result.rows[0];
}

async function getAll() {
  const result = await db.query(`SELECT * FROM ${TABLE}`);
  return result.rows;
}

async function deleteSession(sessionId) {
  const result = await db.query(`DELETE FROM ${TABLE} WHERE session_id = $1`, [sessionId]);
  return { success: true };
}

module.exports = { insert, update, getById, getAll, delete: deleteSession };
