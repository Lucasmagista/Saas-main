// Repositório para acesso à tabela 'billing' no PostgreSQL local
// Repositório para acesso à tabela 'billing' no PostgreSQL local
const db = require('../postgresClient.cjs');

async function listAll() {
  const result = await db.query('SELECT * FROM billing');
  return result.rows;
}

async function insert(payload) {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const params = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO billing (${keys.join(', ')}) VALUES (${params}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
}

async function update(id, updatedFields) {
  const keys = Object.keys(updatedFields);
  const values = Object.values(updatedFields);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const query = `UPDATE billing SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM billing WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  listAll,
  insert,
  update,
  remove,
};
