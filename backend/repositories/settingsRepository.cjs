// Repositório para acesso à tabela 'settings' no PostgreSQL local
const db = require('../postgresClient.cjs');

async function getSettings() {
  const result = await db.query('SELECT * FROM settings LIMIT 1');
  return result.rows[0] || null;
}

async function updateSettings(id, updatedFields) {
  const keys = Object.keys(updatedFields);
  const values = Object.values(updatedFields);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const query = `UPDATE settings SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
}

module.exports = {
  getSettings,
  updateSettings,
};
